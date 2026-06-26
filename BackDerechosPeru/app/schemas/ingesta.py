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


# --- Revisión de estructura (títulos/capítulos y vinculación) ---

class TituloDraft(BaseModel):
    id: int
    numero_romano: str
    denominacion: str
    display_order: int | None = None
    total_capitulos: int = 0
    total_articulos: int = 0


class CapituloDraft(BaseModel):
    id: int
    titulo_id: int
    numero_romano: str
    denominacion: str
    display_order: int | None = None
    total_articulos: int = 0


class ArticuloEstructura(BaseModel):
    id: int
    numero: int
    sumilla: str | None = None
    titulo_id: int | None = None
    capitulo_id: int | None = None
    review_status: str


class EstructuraOut(BaseModel):
    titulos: list[TituloDraft]
    capitulos: list[CapituloDraft]
    articulos: list[ArticuloEstructura]


class TituloIn(BaseModel):
    numero_romano: str | None = None
    denominacion: str | None = None


class CapituloIn(BaseModel):
    numero_romano: str | None = None
    denominacion: str | None = None
    titulo_id: int | None = None


class AsignarArticulosIn(BaseModel):
    articulo_ids: list[int] = Field(default_factory=list)


class AsignarCapitulosIn(BaseModel):
    capitulo_ids: list[int] = Field(default_factory=list)
