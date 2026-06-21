"""Esquemas Pydantic para el foro (Sprint 3 — M5)."""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ThreadCreate(BaseModel):
    titulo: str = Field(..., min_length=5, max_length=200)
    contenido: str = Field(..., min_length=5)
    articulo_id: int | None = None
    category_id: int | None = None


class ThreadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    contenido: str
    articulo_id: int | None
    category_id: int | None
    author_id: uuid.UUID
    author_name: str | None = None
    is_closed: bool
    best_post_id: int | None
    total_respuestas: int
    created_at: datetime


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    thread_id: int
    contenido: str
    author_id: uuid.UUID
    author_name: str | None = None
    is_verified: bool
    votos: int = 0
    mi_voto: int = 0
    created_at: datetime


class ThreadDetailOut(ThreadOut):
    respuestas: list[PostOut] = []


class PostCreate(BaseModel):
    contenido: str = Field(..., min_length=1)


class VoteIn(BaseModel):
    value: int

    @field_validator("value")
    @classmethod
    def _valid_value(cls, v: int) -> int:
        if v not in (-1, 1):
            raise ValueError("value debe ser -1 o 1")
        return v


class MejorRespuestaIn(BaseModel):
    post_id: int


class AnnotationCreate(BaseModel):
    contenido: str = Field(..., min_length=5)


class AnnotationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    articulo_id: int
    contenido: str
    author_id: uuid.UUID
    author_name: str | None = None
    created_at: datetime
