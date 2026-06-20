"""Vista 'Buscar / Filtrar' (RF-02, RF-03) y detalle de artículo."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models import Articulo, Category, ConstitutionVersion
from app.schemas.constitution import ArticuloListOut, ArticuloOut, CategoryOut

router = APIRouter(tags=["articulos"])


async def _current_version_id(db: AsyncSession) -> int | None:
    stmt = select(ConstitutionVersion.id).where(ConstitutionVersion.is_current.is_(True))
    return (await db.execute(stmt)).scalar_one_or_none()


@router.get("/categorias", response_model=list[CategoryOut])
async def list_categorias(db: AsyncSession = Depends(get_db)):
    cats = (
        await db.execute(select(Category).order_by(Category.display_order, Category.id))
    ).scalars().all()
    return cats


@router.get("/articulos", response_model=list[ArticuloListOut])
async def buscar_articulos(
    q: str | None = Query(None, description="Texto o número de artículo"),
    categoria: str | None = Query(None, description="slug de categoría"),
    limit: int = Query(50, le=206),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Búsqueda directa (full-text en español) + filtro por categoría."""
    version_id = await _current_version_id(db)

    stmt = (
        select(Articulo)
        .options(selectinload(Articulo.category))
        .where(Articulo.version_id == version_id, Articulo.is_published.is_(True))
    )

    if categoria:
        stmt = stmt.join(Category).where(Category.slug == categoria)

    if q:
        q = q.strip()
        if q.isdigit():
            stmt = stmt.where(Articulo.numero == int(q))
        else:
            # Full-text en español sobre la columna generada search_tsv
            ts_query = func.plainto_tsquery("spanish", q)
            stmt = stmt.where(text("search_tsv @@ plainto_tsquery('spanish', :q)")).params(q=q)
            stmt = stmt.order_by(func.ts_rank(text("search_tsv"), ts_query).desc())

    stmt = stmt.order_by(Articulo.numero).limit(limit).offset(offset)
    arts = (await db.execute(stmt)).scalars().all()
    return arts


@router.get("/articulos/{numero}", response_model=ArticuloOut)
async def get_articulo(numero: int, db: AsyncSession = Depends(get_db)):
    version_id = await _current_version_id(db)
    art = (
        await db.execute(
            select(Articulo)
            .options(selectinload(Articulo.category))
            .where(
                Articulo.version_id == version_id,
                Articulo.numero == numero,
                Articulo.is_published.is_(True),
            )
        )
    ).scalar_one_or_none()
    if art is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return art
