"""Administración mínima de usuarios (Sprint 2). Solo rol 'admin'.

Permite asignar roles antes de que exista el panel admin completo (Sprint 5).
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.database import get_db
from app.models import Profile
from app.schemas.auth import RolUpdate, UsuarioOut

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role("admin"))])


@router.get("/usuarios", response_model=list[UsuarioOut])
async def listar_usuarios(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Profile).order_by(Profile.created_at))).scalars().all()
    return [UsuarioOut(id=p.id, display_name=p.display_name, role=p.role) for p in rows]


@router.patch("/usuarios/{user_id}/rol", response_model=UsuarioOut)
async def cambiar_rol(user_id: uuid.UUID, payload: RolUpdate, db: AsyncSession = Depends(get_db)):
    p = await db.get(Profile, user_id)
    if p is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
    p.role = payload.role
    await db.commit()
    return UsuarioOut(id=p.id, display_name=p.display_name, role=p.role)
