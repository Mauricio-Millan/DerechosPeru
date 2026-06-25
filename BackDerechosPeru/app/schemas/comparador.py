"""Contratos del Comparador de versiones (Sprint 4)."""
from __future__ import annotations

from datetime import date

from pydantic import BaseModel


class VersionPublicaOut(BaseModel):
    id: int
    label: str
    year: int
    promulgated_on: date | None = None


class ArtLado(BaseModel):
    id: int
    numero: int
    sumilla: str | None = None
    contenido: str


class FilaComparacion(BaseModel):
    base: ArtLado | None
    target: ArtLado | None
    similarity: float  # 0..1
    estado: str  # identico | modificado | sin_equivalente | nuevo


class ResumenComparacion(BaseModel):
    identicos: int
    modificados: int
    sin_equivalente: int
    nuevos: int


class ComparacionOut(BaseModel):
    base: VersionPublicaOut
    target: VersionPublicaOut
    filas: list[FilaComparacion]
    resumen: ResumenComparacion
