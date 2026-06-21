"""Marcadores persistentes por usuario (RF-05). Requiere sesión."""
from fastapi import APIRouter, Depends, status
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.helpers import articulo_to_out
from app.core.auth import CurrentUser, get_current_user
from app.core.database import get_db
from app.models import Articulo, Bookmark
from app.schemas.auth import BookmarkCreate
from app.schemas.constitution import ArticuloOut

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("", response_model=list[ArticuloOut])
async def listar(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # El backend usa service_role (ignora RLS): filtramos por user_id en código.
    arts = (
        await db.execute(
            select(Articulo)
            .join(Bookmark, Bookmark.articulo_id == Articulo.id)
            .where(Bookmark.user_id == user.id)
            .options(selectinload(Articulo.category), selectinload(Articulo.capitulo))
            .order_by(Bookmark.created_at.desc())
        )
    ).scalars().all()
    return [articulo_to_out(a) for a in arts]


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
async def agregar(
    payload: BookmarkCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Idempotente: unique(user_id, articulo_id) + on conflict do nothing.
    await db.execute(
        pg_insert(Bookmark)
        .values(user_id=user.id, articulo_id=payload.articulo_id)
        .on_conflict_do_nothing(index_elements=["user_id", "articulo_id"])
    )
    await db.commit()


@router.delete("/{articulo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def quitar(
    articulo_id: int,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Bookmark).where(
            Bookmark.user_id == user.id, Bookmark.articulo_id == articulo_id
        )
    )
    await db.commit()
