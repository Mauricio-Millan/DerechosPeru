"""Vista 'Por estructura' (RF-01): árbol Título -> Capítulo -> Artículo."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Articulo, Capitulo, ConstitutionVersion, Titulo
from app.schemas.constitution import CapituloOut, TituloOut

router = APIRouter(prefix="/estructura", tags=["estructura"])


async def _current_version_id(db: AsyncSession) -> int | None:
    stmt = select(ConstitutionVersion.id).where(ConstitutionVersion.is_current.is_(True))
    return (await db.execute(stmt)).scalar_one_or_none()


@router.get("", response_model=list[TituloOut])
async def get_estructura(db: AsyncSession = Depends(get_db)):
    """Devuelve los títulos con sus capítulos y el conteo de artículos."""
    version_id = await _current_version_id(db)

    titulos = (
        await db.execute(
            select(Titulo)
            .where(Titulo.version_id == version_id)
            .order_by(Titulo.display_order, Titulo.id)
        )
    ).scalars().all()

    # Conteo de artículos por capítulo
    counts = dict(
        (
            await db.execute(
                select(Articulo.capitulo_id, func.count(Articulo.id))
                .where(Articulo.version_id == version_id, Articulo.is_published.is_(True))
                .group_by(Articulo.capitulo_id)
            )
        ).all()
    )

    result: list[TituloOut] = []
    for t in titulos:
        caps = (
            await db.execute(
                select(Capitulo)
                .where(Capitulo.titulo_id == t.id)
                .order_by(Capitulo.display_order, Capitulo.id)
            )
        ).scalars().all()
        result.append(
            TituloOut(
                id=t.id,
                numero_romano=t.numero_romano,
                denominacion=t.denominacion,
                capitulos=[
                    CapituloOut(
                        id=c.id,
                        numero_romano=c.numero_romano,
                        denominacion=c.denominacion,
                        articulos_count=counts.get(c.id, 0),
                    )
                    for c in caps
                ],
            )
        )
    return result
