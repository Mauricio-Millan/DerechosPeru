"""Estructura jerárquica: títulos, capítulos y estadísticas (contrato del front)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import selectinload

from app.api.helpers import articulo_to_out, roman_to_int
from app.core.database import get_db
from app.models import Articulo, Capitulo, ConstitutionVersion, Titulo
from app.schemas.constitution import ArticuloOut, CapituloOut, Estadisticas, TituloOut

router = APIRouter(tags=["estructura"])


async def _current_version_id(db: AsyncSession) -> int | None:
    return (
        await db.execute(
            select(ConstitutionVersion.id).where(ConstitutionVersion.is_current.is_(True))
        )
    ).scalar_one_or_none()


async def _counts_por_capitulo(db: AsyncSession, version_id: int) -> dict[int, int]:
    rows = (
        await db.execute(
            select(Articulo.capitulo_id, func.count(Articulo.id))
            .where(Articulo.version_id == version_id, Articulo.is_published.is_(True))
            .group_by(Articulo.capitulo_id)
        )
    ).all()
    return {cap_id: n for cap_id, n in rows if cap_id is not None}


async def _counts_por_titulo(db: AsyncSession, version_id: int) -> dict[int, int]:
    rows = (
        await db.execute(
            select(Articulo.titulo_id, func.count(Articulo.id))
            .where(Articulo.version_id == version_id, Articulo.is_published.is_(True))
            .group_by(Articulo.titulo_id)
        )
    ).all()
    return {tit_id: n for tit_id, n in rows if tit_id is not None}


def _capitulo_out(c: Capitulo, total: int) -> CapituloOut:
    return CapituloOut(
        id=c.id,
        numero=roman_to_int(c.numero_romano),
        nombre=c.denominacion,
        tituloId=c.titulo_id,
        totalArticulos=total,
    )


@router.get("/titulos", response_model=list[TituloOut])
async def get_titulos(db: AsyncSession = Depends(get_db)):
    """Títulos con sus capítulos y conteos (el front evita llamadas extra)."""
    version_id = await _current_version_id(db)
    counts_cap = await _counts_por_capitulo(db, version_id)
    counts_tit = await _counts_por_titulo(db, version_id)

    titulos = (
        await db.execute(
            select(Titulo).where(Titulo.version_id == version_id).order_by(Titulo.display_order, Titulo.id)
        )
    ).scalars().all()

    result: list[TituloOut] = []
    for t in titulos:
        caps = (
            await db.execute(
                select(Capitulo).where(Capitulo.titulo_id == t.id).order_by(Capitulo.display_order, Capitulo.id)
            )
        ).scalars().all()
        caps_out = [_capitulo_out(c, counts_cap.get(c.id, 0)) for c in caps]
        result.append(
            TituloOut(
                id=t.id,
                numero=roman_to_int(t.numero_romano),
                nombre=t.denominacion,
                totalCapitulos=len(caps_out),
                totalArticulos=counts_tit.get(t.id, 0),
                capitulos=caps_out,
            )
        )
    return result


@router.get("/titulos/{titulo_id}/articulos", response_model=list[ArticuloOut])
async def articulos_por_titulo(titulo_id: int, db: AsyncSession = Depends(get_db)):
    """Artículos directos de un título (útil para títulos sin capítulos, p. ej. V y VI)."""
    arts = (
        await db.execute(
            select(Articulo)
            .options(selectinload(Articulo.category), selectinload(Articulo.capitulo))
            .where(Articulo.titulo_id == titulo_id, Articulo.is_published.is_(True))
            .order_by(Articulo.numero)
        )
    ).scalars().all()
    return [articulo_to_out(a) for a in arts]


@router.get("/titulos/{titulo_id}/capitulos", response_model=list[CapituloOut])
async def get_capitulos(titulo_id: int, db: AsyncSession = Depends(get_db)):
    version_id = await _current_version_id(db)
    counts = await _counts_por_capitulo(db, version_id)
    caps = (
        await db.execute(
            select(Capitulo).where(Capitulo.titulo_id == titulo_id).order_by(Capitulo.display_order, Capitulo.id)
        )
    ).scalars().all()
    if not caps:
        raise HTTPException(status_code=404, detail="Título sin capítulos")
    return [_capitulo_out(c, counts.get(c.id, 0)) for c in caps]


@router.get("/estadisticas", response_model=Estadisticas)
async def get_estadisticas(db: AsyncSession = Depends(get_db)):
    version_id = await _current_version_id(db)
    where = lambda m: m.version_id == version_id  # noqa: E731
    return Estadisticas(
        totalTitulos=await db.scalar(select(func.count()).select_from(Titulo).where(where(Titulo))),
        totalCapitulos=await db.scalar(select(func.count()).select_from(Capitulo).where(where(Capitulo))),
        totalArticulos=await db.scalar(
            select(func.count()).select_from(Articulo).where(where(Articulo), Articulo.is_published.is_(True))
        ),
    )
