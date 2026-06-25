"""Comparador de versiones: empareja artículos por similitud semántica (Sprint 4).

Para cada artículo de la versión base se busca su equivalente más parecido en la
versión target usando los embeddings ya almacenados (pgvector 384-dim). Esto maneja
la renumeración entre constituciones distintas. Los artículos del target que nadie
emparejó por encima del umbral se reportan como 'nuevo'.
"""
from __future__ import annotations

import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import Articulo, ConstitutionVersion
from app.schemas.comparador import (
    ArtLado,
    ComparacionOut,
    FilaComparacion,
    ResumenComparacion,
    VersionPublicaOut,
)


def _norm_text(s: str) -> str:
    return " ".join((s or "").split())


def clasificar(sim: float, texto_a: str, texto_b: str, umbral: float) -> str:
    """Clasifica un par (función pura, testeable)."""
    if sim < umbral:
        return "sin_equivalente"
    if _norm_text(texto_a) == _norm_text(texto_b):
        return "identico"
    return "modificado"


def _lado(a: Articulo) -> ArtLado:
    return ArtLado(id=a.id, numero=a.numero, sumilla=a.sumilla, contenido=a.contenido)


async def _articulos_con_embedding(db: AsyncSession, version_id: int) -> list[Articulo]:
    return list(
        (
            await db.execute(
                select(Articulo)
                .where(
                    Articulo.version_id == version_id,
                    Articulo.is_published.is_(True),
                    Articulo.embedding.is_not(None),
                )
                .order_by(Articulo.numero)
            )
        )
        .scalars()
        .all()
    )


def _matriz_similitud(base: list[Articulo], target: list[Articulo]) -> np.ndarray:
    """Matriz coseno (n×m). Los embeddings locales ya vienen normalizados, pero
    re-normalizamos por si el proveedor cambia."""
    b = np.asarray([a.embedding for a in base], dtype=np.float32)
    t = np.asarray([a.embedding for a in target], dtype=np.float32)
    b /= np.linalg.norm(b, axis=1, keepdims=True).clip(min=1e-9)
    t /= np.linalg.norm(t, axis=1, keepdims=True).clip(min=1e-9)
    return b @ t.T


async def comparar(db: AsyncSession, base_id: int, target_id: int) -> ComparacionOut:
    base_v = await db.get(ConstitutionVersion, base_id)
    target_v = await db.get(ConstitutionVersion, target_id)
    base_arts = await _articulos_con_embedding(db, base_id)
    target_arts = await _articulos_con_embedding(db, target_id)

    umbral = settings.COMPARE_MIN_SIMILARITY
    filas: list[FilaComparacion] = []
    target_usado = [False] * len(target_arts)
    cont = {"identico": 0, "modificado": 0, "sin_equivalente": 0, "nuevo": 0}

    sims = _matriz_similitud(base_arts, target_arts) if base_arts and target_arts else None

    for i, a in enumerate(base_arts):
        if sims is not None:
            j = int(np.argmax(sims[i]))
            sim = max(0.0, float(sims[i, j]))
        else:
            j, sim = -1, 0.0
        estado = clasificar(sim, a.contenido, target_arts[j].contenido if j >= 0 else "", umbral)
        if estado == "sin_equivalente":
            filas.append(FilaComparacion(base=_lado(a), target=None, similarity=round(sim, 4), estado=estado))
        else:
            target_usado[j] = True
            filas.append(
                FilaComparacion(
                    base=_lado(a), target=_lado(target_arts[j]), similarity=round(sim, 4), estado=estado
                )
            )
        cont[estado] += 1

    # Artículos del target que nadie emparejó -> nuevos en esa versión.
    for j, used in enumerate(target_usado):
        if not used:
            filas.append(
                FilaComparacion(base=None, target=_lado(target_arts[j]), similarity=0.0, estado="nuevo")
            )
            cont["nuevo"] += 1

    return ComparacionOut(
        base=VersionPublicaOut.model_validate(base_v, from_attributes=True),
        target=VersionPublicaOut.model_validate(target_v, from_attributes=True),
        filas=filas,
        resumen=ResumenComparacion(
            identicos=cont["identico"],
            modificados=cont["modificado"],
            sin_equivalente=cont["sin_equivalente"],
            nuevos=cont["nuevo"],
        ),
    )
