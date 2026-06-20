"""Carga inicial de la Constitución de 1993 en Supabase.

Lee ../constitucion.json, crea la versión vigente, las categorías,
títulos, capítulos y artículos, y genera los embeddings para la
Consulta Guiada (RF-04).

Uso:
    python -m scripts.seed_constitucion            # carga + embeddings
    python -m scripts.seed_constitucion --no-embed # solo estructura
    python -m scripts.seed_constitucion --reset    # borra y recarga
"""
from __future__ import annotations

import argparse
import asyncio
import json
from datetime import date
from pathlib import Path

from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.models import (
    Articulo,
    Capitulo,
    Category,
    ConstitutionVersion,
    Titulo,
)
from app.services.embeddings import embed_texts

# constitucion.json está en la raíz del repo (un nivel arriba de BackDerechosPeru)
JSON_PATH = Path(__file__).resolve().parents[2] / "constitucion.json"

# --- Taxonomía (chips de la pantalla "Buscar / Filtrar") ---
CATEGORIES = [
    ("derechos-fundamentales", "Derechos Fundamentales", "#b23a48"),
    ("estado-nacion", "Estado y Nación", "#c08a3e"),
    ("economia", "Economía", "#3e8c6e"),
    ("regimen-politico", "Régimen Político", "#6c5ce7"),
    ("poder-legislativo", "Poder Legislativo", "#2b4a7e"),
    ("poder-ejecutivo", "Poder Ejecutivo", "#caa23a"),
    ("poder-judicial", "Poder Judicial", "#7a4ea3"),
    ("descentralizacion", "Descentralización", "#3e8c6e"),
    ("garantias-constitucionales", "Garantías Constitucionales", "#b23a48"),
    ("reforma-constitucional", "Reforma Constitucional", "#c08a3e"),
]

# --- Mapeo Título -> categoría por defecto (curaduría inicial, RF-12/13) ---
# Se afina luego por capítulo; ver category_for_articulo().
TITULO_CATEGORY = {
    "I": "derechos-fundamentales",
    "II": "estado-nacion",
    "III": "economia",
    "IV": "regimen-politico",
    "V": "garantias-constitucionales",
    "VI": "reforma-constitucional",
}

# Override por palabra clave en la denominación del capítulo
CAPITULO_KEYWORDS = [
    ("LEGISLATIV", "poder-legislativo"),
    ("CONGRESO", "poder-legislativo"),
    ("EJECUTIV", "poder-ejecutivo"),
    ("CONSEJO DE MINISTROS", "poder-ejecutivo"),
    ("PRESIDEN", "poder-ejecutivo"),
    ("JUDICIAL", "poder-judicial"),
    ("MAGISTRATURA", "poder-judicial"),
    ("MINISTERIO PUBLICO", "poder-judicial"),
    ("DESCENTRALIZ", "descentralizacion"),
    ("REGIONAL", "descentralizacion"),
    ("MUNICIPAL", "descentralizacion"),
    ("GARANTIAS", "garantias-constitucionales"),
]


def category_for_articulo(titulo_romano: str, cap_denom: str) -> str:
    denom = (cap_denom or "").upper()
    for kw, slug in CAPITULO_KEYWORDS:
        if kw in denom:
            return slug
    return TITULO_CATEGORY.get(titulo_romano, "estado-nacion")


def build_embedding_text(numero: int, sumilla: str | None, contenido: str) -> str:
    """Texto que se vectoriza por artículo."""
    head = f"Artículo {numero}. {sumilla or ''}".strip()
    return f"{head}\n{contenido}"


async def reset(session) -> None:
    for model in (Articulo, Capitulo, Titulo, Category, ConstitutionVersion):
        await session.execute(delete(model))
    await session.commit()
    print("Tablas vaciadas.")


async def seed(do_embed: bool, do_reset: bool) -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    async with AsyncSessionLocal() as session:
        if do_reset:
            await reset(session)

        # Evitar duplicar si ya existe la versión 1993
        existing = (
            await session.execute(
                select(ConstitutionVersion).where(ConstitutionVersion.year == 1993)
            )
        ).scalar_one_or_none()
        if existing:
            print("La versión 1993 ya existe. Usa --reset para recargar.")
            return

        # 1) Categorías
        cat_by_slug: dict[str, Category] = {}
        for order, (slug, name, color) in enumerate(CATEGORIES):
            c = Category(slug=slug, name=name, color=color, display_order=order)
            session.add(c)
            cat_by_slug[slug] = c
        await session.flush()

        # 2) Versión vigente
        version = ConstitutionVersion(
            label="Constitución Política del Perú de 1993",
            year=1993,
            promulgated_on=date(1993, 12, 29),
            is_current=True,
            notes="Versión vigente. Carga inicial del portal.",
        )
        session.add(version)
        await session.flush()

        # 3) Títulos
        titulo_by_romano: dict[str, Titulo] = {}
        for order, t in enumerate(data["titulos"]):
            obj = Titulo(
                version_id=version.id,
                numero_romano=t["numero_romano"],
                denominacion=t["denominacion"],
                display_order=order,
            )
            session.add(obj)
            titulo_by_romano[t["numero_romano"]] = obj
        await session.flush()

        # 4) Capítulos (clave: titulo_romano + numero_romano)
        cap_by_key: dict[tuple[str, str], Capitulo] = {}
        cap_denom_by_key: dict[tuple[str, str], str] = {}
        for order, c in enumerate(data["capitulos"]):
            t = titulo_by_romano.get(c["titulo_romano"])
            if not t:
                continue
            obj = Capitulo(
                version_id=version.id,
                titulo_id=t.id,
                numero_romano=c["numero_romano"],
                denominacion=c["denominacion"],
                display_order=order,
            )
            session.add(obj)
            key = (c["titulo_romano"], c["numero_romano"])
            cap_by_key[key] = obj
            cap_denom_by_key[key] = c["denominacion"]
        await session.flush()

        # 5) Artículos
        articulos = data["articulos"]
        objs: list[Articulo] = []
        for a in articulos:
            key = (a["titulo_romano"], a.get("capitulo_romano"))
            cap = cap_by_key.get(key)
            cap_denom = cap_denom_by_key.get(key, "")
            slug = category_for_articulo(a["titulo_romano"], cap_denom)
            obj = Articulo(
                version_id=version.id,
                capitulo_id=cap.id if cap else None,
                category_id=cat_by_slug[slug].id,
                numero=a["numero"],
                sumilla=a.get("sumilla"),
                contenido=a["contenido"],
                is_published=True,
            )
            objs.append(obj)
            session.add(obj)
        await session.flush()
        print(f"Insertados {len(objs)} artículos.")

        # 6) Embeddings por lotes
        if do_embed:
            BATCH = 64
            for i in range(0, len(objs), BATCH):
                chunk = objs[i : i + BATCH]
                texts = [
                    build_embedding_text(o.numero, o.sumilla, o.contenido) for o in chunk
                ]
                vectors = embed_texts(texts)
                for o, v in zip(chunk, vectors):
                    o.embedding = v
                await session.flush()
                print(f"  embeddings {i + len(chunk)}/{len(objs)}")

        await session.commit()
        print("Carga completada.")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--no-embed", action="store_true", help="No generar embeddings")
    p.add_argument("--reset", action="store_true", help="Vaciar tablas antes de cargar")
    args = p.parse_args()
    asyncio.run(seed(do_embed=not args.no_embed, do_reset=args.reset))


if __name__ == "__main__":
    main()
