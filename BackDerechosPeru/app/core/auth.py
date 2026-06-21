"""Autenticación y RBAC.

Supabase Auth emite y firma el JWT; aquí solo se VERIFICA la firma y se carga
el rol desde `profile`. Soporta ES256 (JWKS, algoritmo actual de Supabase) y
HS256 (legacy con JWT Secret). No se emiten tokens ni se manejan contraseñas.

Dependencies reutilizables por todos los sprints:
- get_current_user  -> exige sesión válida (401 si falta/!válido)
- get_optional_user -> usuario o None (endpoints mixtos)
- require_role(...)  -> exige uno de los roles (403 si no)
"""
import json
import urllib.request
import uuid
from dataclasses import dataclass
from functools import lru_cache

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models import Profile


@dataclass(frozen=True)
class CurrentUser:
    id: uuid.UUID
    role: str
    email: str | None = None


@lru_cache(maxsize=1)
def _fetch_jwks() -> tuple[dict, ...]:
    """Descarga las claves públicas de Supabase (cacheado por proceso)."""
    url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    with urllib.request.urlopen(url, timeout=10) as r:  # noqa: S310
        return tuple(json.loads(r.read())["keys"])


def _decode(token: str) -> dict:
    header = jwt.get_unverified_header(token)
    alg = header.get("alg", "HS256")

    if alg == "ES256":
        kid = header.get("kid")
        key = next((k for k in _fetch_jwks() if k.get("kid") == kid), None)
        if key is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Clave JWT no encontrada en JWKS")
        try:
            return jwt.decode(token, key, algorithms=["ES256"], audience=settings.JWT_AUDIENCE)
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token inválido: {e}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # HS256 — legacy
    if not settings.SUPABASE_JWT_SECRET:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "SUPABASE_JWT_SECRET no configurado")
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=settings.JWT_AUDIENCE,
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _extract_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return token


async def _load_user(token: str, db: AsyncSession) -> CurrentUser:
    payload = _decode(token)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token sin 'sub'")
    user_id = uuid.UUID(sub)
    # El rol vive en profile (no en el JWT) para que un cambio de rol surta efecto
    # sin re-loguear. El trigger handle_new_user garantiza que la fila exista.
    role = await db.scalar(select(Profile.role).where(Profile.id == user_id))
    return CurrentUser(id=user_id, role=role or "ciudadano", email=payload.get("email"))


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el token Bearer",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await _load_user(token, db)


async def get_optional_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser | None:
    token = _extract_token(authorization)
    if not token:
        return None
    return await _load_user(token, db)


def require_role(*roles: str):
    """Factory de dependency: exige que el usuario tenga uno de `roles`."""

    async def _guard(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requiere rol: {', '.join(roles)}",
            )
        return user

    return _guard
