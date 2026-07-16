from datetime import datetime

from pydantic import BaseModel, Field


class PreguntaOut(BaseModel):
    id: int
    pregunta: str
    opciones: list[str]


class RespuestaIn(BaseModel):
    pregunta_id: int
    opcion: int = Field(..., ge=0, le=3)


class EnviarExamenIn(BaseModel):
    nivel: int = Field(..., ge=1, le=3)
    respuestas: list[RespuestaIn]


class DetalleRespuesta(BaseModel):
    pregunta_id: int
    opcion_elegida: int
    correcta: bool
    opcion_correcta: int


class ResultadoOut(BaseModel):
    puntaje: int
    total: int
    aprobado: bool
    medalla: str  # "bronce" | "plata" | "oro"
    promovido: bool
    nuevo_rol: str | None = None
    detalle: list[DetalleRespuesta]


class NivelProgreso(BaseModel):
    nivel: int
    aprobado: bool
    puntaje: int
    total: int
    medalla: str
    completado_at: datetime


class ProgresoOut(BaseModel):
    niveles: list[NivelProgreso]
    es_experto: bool
