"""Datos de la cuenta del usuario autenticado."""
from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user
from app.schemas.auth import UsuarioOut

router = APIRouter(tags=["cuenta"])


@router.get("/me", response_model=UsuarioOut)
async def me(user: CurrentUser = Depends(get_current_user)):
    """Devuelve id y rol del usuario actual (fuente de verdad: profile)."""
    return UsuarioOut(id=user.id, display_name=None, role=user.role)
