"""Esquemas Pydantic para la ingesta de constituciones (Sprint 6 — M8)."""
from datetime import date, datetime

from pydantic import BaseModel, Field


class QAReport(BaseModel):
    ok: bool
    errors: list[str] = []
    counts: dict[str, int] = {}


class IngestResult(BaseModel):
    version_id: int
    label: str
    year: int
    stats: dict[str, int]
    qa: QAReport


class VersionOut(BaseModel):
    id: int
    label: str
    year: int
    status: str
    is_current: bool
    promulgated_on: date | None = None
    total_articulos: int = 0
    verificados: int = 0


class DraftArticuloOut(BaseModel):
    id: int
    numero: int
    sumilla: str | None = None
    contenido: str
    review_status: str
    titulo: str | None = None
    capitulo: str | None = None


class ReviewIn(BaseModel):
    review_status: str = Field(..., pattern="^(pendiente|verificado|observado)$")
    contenido: str | None = None


class ProgressOut(BaseModel):
    total: int
    verificados: int
    observados: int
    pendientes: int
    pct: int


class SignedUrlOut(BaseModel):
    url: str
