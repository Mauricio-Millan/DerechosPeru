"""Lógica de la Consulta Guiada (RF-04): texto del usuario -> artículos relevantes."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models import Articulo, ConsultaLog
from app.schemas.constitution import ArticuloMatch
from app.services.embeddings import embed_query


async def consultar(db: AsyncSession, texto: str) -> list[ArticuloMatch]:
    """Busca por similitud semántica los artículos que orientan el problema."""
    query_vec = embed_query(texto)

    # Distancia coseno con pgvector: el operador <=> está expuesto por
    # Vector.cosine_distance(). similarity = 1 - distancia.
    distance = Articulo.embedding.cosine_distance(query_vec)
    stmt = (
        select(Articulo, distance.label("distance"))
        .options(selectinload(Articulo.category))
        .where(Articulo.is_published.is_(True))
        .where(Articulo.embedding.is_not(None))
        .order_by(distance)
        .limit(settings.GUIDED_MATCH_COUNT)
    )
    rows = (await db.execute(stmt)).all()

    resultados: list[ArticuloMatch] = []
    for art, dist in rows:
        similarity = 1.0 - float(dist)
        if similarity < settings.GUIDED_MIN_SIMILARITY:
            continue
        resultados.append(
            ArticuloMatch(
                id=art.id,
                numero=art.numero,
                titulo=art.sumilla or f"Artículo {art.numero}",
                contenido=art.contenido,
                categoria=art.category.name if art.category else "",
                similarity=round(similarity, 4),
            )
        )

    # Bitácora para Gap Analysis (RF-16)
    db.add(
        ConsultaLog(
            query_text=texto,
            matched_article_ids=[r.id for r in resultados],
            top_score=resultados[0].similarity if resultados else None,
            result_count=len(resultados),
        )
    )
    await db.commit()

    return resultados
