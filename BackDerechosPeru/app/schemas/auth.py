"""Esquemas de identidad, marcadores y administración (Sprint 2)."""
import uuid

from pydantic import BaseModel, field_validator

from app.models import ROLES


class BookmarkCreate(BaseModel):
    articulo_id: int


class UsuarioOut(BaseModel):
    id: uuid.UUID
    display_name: str | None = None
    role: str


class RolUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def _valid_role(cls, v: str) -> str:
        if v not in ROLES:
            raise ValueError(f"role inválido; usar uno de: {', '.join(ROLES)}")
        return v
