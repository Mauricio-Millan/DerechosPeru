"""Artículos: por capítulo, búsqueda/filtro y por ids (contrato del front)."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.helpers import articulo_to_out
from app.core.database import get_db
from app.models import Articulo, Category, ConstitutionVersion
from app.schemas.constitution import ArticuloOut, ArticulosResponse

router = APIRouter(tags=["articulos"])


async def _current_version_id(db: AsyncSession) -> int | None:
    return (
        await db.execute(
            select(ConstitutionVersion.id).where(ConstitutionVersion.is_current.is_(True))
        )
    ).scalar_one_or_none()


def _base_query():
    return select(Articulo).options(
        selectinload(Articulo.category), selectinload(Articulo.capitulo)
    )


@router.get("/capitulos/{capitulo_id}/articulos", response_model=list[ArticuloOut])
async def articulos_por_capitulo(capitulo_id: int, db: AsyncSession = Depends(get_db)):
    arts = (
        await db.execute(
            _base_query()
            .where(Articulo.capitulo_id == capitulo_id, Articulo.is_published.is_(True))
            .order_by(Articulo.numero)
        )
    ).scalars().all()
    return [articulo_to_out(a) for a in arts]


# response_model=None: este endpoint devuelve list[ArticuloOut] cuando se pasan ids
# (vista Guardados) y ArticulosResponse cuando se busca/filtra (vista Buscar).
@router.get("/articulos", response_model=None)
async def articulos(
    ids: str | None = Query(None, description="IDs separados por coma (vista Guardados)"),
    query: str | None = Query(None),
    categoria: str | None = Query(None, description="nombre de la categoría"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[ArticuloOut] | ArticulosResponse:
    version_id = await _current_version_id(db)

    if ids:
        id_list = [int(x) for x in ids.split(",") if x.strip().isdigit()]
        if not id_list:
            return []
        arts = (
            await db.execute(_base_query().where(Articulo.id.in_(id_list)))
        ).scalars().all()
        orden = {aid: i for i, aid in enumerate(id_list)}
        arts.sort(key=lambda a: orden.get(a.id, 0))
        return [articulo_to_out(a) for a in arts]

    # Filtros comunes para conteo y página
    filters = [Articulo.version_id == version_id, Articulo.is_published.is_(True)]
    join_cat = bool(categoria)
    ts_param: str | None = None
    rank_order = None
    if categoria:
        filters.append(Category.name == categoria)
    if query:
        q = query.strip()
        if q.isdigit():
            filters.append(Articulo.numero == int(q))
        else:
            ts_param = q
            filters.append(text("search_tsv @@ plainto_tsquery('spanish', :q)"))
            rank_order = func.ts_rank(text("search_tsv"), func.plainto_tsquery("spanish", q)).desc()

    count_stmt = select(func.count(Articulo.id))
    if join_cat:
        count_stmt = count_stmt.join(Category)
    count_stmt = count_stmt.where(*filters)
    if ts_param is not None:
        count_stmt = count_stmt.params(q=ts_param)
    total = await db.scalar(count_stmt)

    page_stmt = _base_query()
    if join_cat:
        page_stmt = page_stmt.join(Category)
    page_stmt = page_stmt.where(*filters)
    if ts_param is not None:
        page_stmt = page_stmt.params(q=ts_param)
    page_stmt = page_stmt.order_by(rank_order if rank_order is not None else Articulo.numero)
    page_stmt = page_stmt.limit(limit).offset(offset)

    arts = (await db.execute(page_stmt)).scalars().all()
    return ArticulosResponse(data=[articulo_to_out(a) for a in arts], total=total or 0)
