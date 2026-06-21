"""Endpoints de anotaciones de expertos (Sprint 3 — M5)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, get_current_user, require_role
from app.core.database import get_db
from app.models import ExpertAnnotation, Profile
from app.schemas.forum import AnnotationCreate, AnnotationOut

router = APIRouter(tags=["anotaciones"])


@router.get("/articulos/{articulo_id}/anotaciones", response_model=list[AnnotationOut])
async def listar_anotaciones(
    articulo_id: int,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ExpertAnnotation, Profile.display_name)
        .outerjoin(Profile, ExpertAnnotation.author_id == Profile.id)
        .where(ExpertAnnotation.articulo_id == articulo_id)
        .order_by(ExpertAnnotation.created_at.desc())
    )
    result = await db.execute(query)

    annotations = []
    for annotation, display_name in result:
        annotations.append(
            AnnotationOut(
                id=annotation.id,
                articulo_id=annotation.articulo_id,
                contenido=annotation.contenido,
                author_id=annotation.author_id,
                author_name=display_name,
                created_at=annotation.created_at,
            )
        )
    return annotations


@router.post("/articulos/{articulo_id}/anotaciones", response_model=AnnotationOut)
async def crear_anotacion(
    articulo_id: int,
    payload: AnnotationCreate,
    user: CurrentUser = Depends(require_role("experto", "editor", "admin")),
    db: AsyncSession = Depends(get_db),
):
    display_name = await db.scalar(select(Profile.display_name).where(Profile.id == user.id))

    annotation = ExpertAnnotation(
        articulo_id=articulo_id,
        author_id=user.id,
        contenido=payload.contenido,
    )
    db.add(annotation)
    await db.commit()
    await db.refresh(annotation)

    return AnnotationOut(
        id=annotation.id,
        articulo_id=annotation.articulo_id,
        contenido=annotation.contenido,
        author_id=annotation.author_id,
        author_name=display_name,
        created_at=annotation.created_at,
    )


@router.delete("/anotaciones/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_anotacion(
    id: int,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    annotation = await db.get(ExpertAnnotation, id)
    if not annotation:
        raise HTTPException(status_code=404, detail="Anotación no encontrada")
    if annotation.author_id != user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta anotación")

    await db.delete(annotation)
    await db.commit()
