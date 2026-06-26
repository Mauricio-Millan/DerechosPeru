"""Analítica para el panel admin (Sprint 5).

Todo sobre tablas existentes: ConsultaLog (consultas + búsquedas sin éxito),
Profile, ForumThread/Post, Bookmark. Sin captura nueva ni infra nueva.
"""
from __future__ import annotations

from collections import Counter

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import (
    Articulo,
    Bookmark,
    ConsultaLog,
    ForumPost,
    ForumThread,
    Profile,
)
from app.schemas.analytics import (
    AnalyticsOut,
    BusquedaFallida,
    ForoStats,
    ResumenOut,
    RolCount,
    TopArticulo,
)


def contar_apariciones(listas: list[list[int] | None]) -> list[tuple[int, int]]:
    """Cuenta cuántas veces aparece cada artículo en los matched_article_ids.
    Función pura (testeable). Ordena por frecuencia desc, luego id asc."""
    contador: Counter[int] = Counter()
    for ids in listas:
        if ids:
            contador.update(ids)
    return sorted(contador.items(), key=lambda kv: (-kv[1], kv[0]))


def es_fallida(result_count: int, top_score: float | None, umbral: float) -> bool:
    """Una búsqueda 'sin éxito' (vacío de conocimiento): sin resultados o
    con la mejor coincidencia por debajo del umbral de relevancia."""
    return result_count == 0 or top_score is None or top_score < umbral


async def reporte(db: AsyncSession) -> AnalyticsOut:
    umbral = settings.GUIDED_MIN_SIMILARITY

    # --- Resumen + foro (counts simples) ---
    total_usuarios = await db.scalar(select(func.count()).select_from(Profile)) or 0
    total_consultas = await db.scalar(select(func.count()).select_from(ConsultaLog)) or 0
    total_hilos = await db.scalar(select(func.count()).select_from(ForumThread)) or 0
    total_respuestas = await db.scalar(select(func.count()).select_from(ForumPost)) or 0
    respuestas_verificadas = await db.scalar(
        select(func.count()).select_from(ForumPost).where(ForumPost.is_verified.is_(True))
    ) or 0
    total_guardados = await db.scalar(select(func.count()).select_from(Bookmark)) or 0

    # --- Usuarios por rol ---
    rol_rows = (await db.execute(select(Profile.role, func.count()).group_by(Profile.role))).all()
    usuarios_por_rol = [RolCount(rol=r, total=n) for r, n in rol_rows]

    # --- Top artículos consultados (proxy de demanda vía matched_article_ids) ---
    matched = (await db.execute(select(ConsultaLog.matched_article_ids))).scalars().all()
    top = contar_apariciones(list(matched))[:10]
    top_articulos: list[TopArticulo] = []
    if top:
        ids = [aid for aid, _ in top]
        arts = (
            await db.execute(select(Articulo).where(Articulo.id.in_(ids)))
        ).scalars().all()
        by_id = {a.id: a for a in arts}
        for aid, n in top:
            a = by_id.get(aid)
            if a:
                top_articulos.append(
                    TopArticulo(id=a.id, numero=a.numero, sumilla=a.sumilla, consultas=n)
                )

    # --- Búsquedas sin éxito (gap analysis) ---
    fallida_filter = (ConsultaLog.result_count == 0) | (ConsultaLog.top_score < umbral) | (
        ConsultaLog.top_score.is_(None)
    )
    total_fallidas = await db.scalar(
        select(func.count()).select_from(ConsultaLog).where(fallida_filter)
    ) or 0
    fallidas_rows = (
        await db.execute(
            select(ConsultaLog.query_text, ConsultaLog.created_at)
            .where(fallida_filter)
            .order_by(ConsultaLog.created_at.desc())
            .limit(50)
        )
    ).all()
    busquedas_fallidas = [BusquedaFallida(query_text=q, created_at=c) for q, c in fallidas_rows]

    return AnalyticsOut(
        resumen=ResumenOut(
            total_usuarios=total_usuarios,
            total_consultas=total_consultas,
            consultas_fallidas=total_fallidas,
            total_hilos=total_hilos,
            respuestas_verificadas=respuestas_verificadas,
            total_guardados=total_guardados,
        ),
        usuarios_por_rol=usuarios_por_rol,
        top_articulos=top_articulos,
        busquedas_fallidas=busquedas_fallidas,
        total_fallidas=total_fallidas,
        foro=ForoStats(hilos=total_hilos, respuestas=total_respuestas, verificadas=respuestas_verificadas),
    )
