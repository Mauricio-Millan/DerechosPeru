"""Esquemas Pydantic (contratos de la API, alineados al front Angular)."""
from pydantic import BaseModel, ConfigDict, Field


# --- Estructura (front: Titulo / Capitulo / Articulo) ---
class CapituloOut(BaseModel):
    id: int
    numero: int
    nombre: str
    tituloId: int
    totalArticulos: int = 0


class TituloOut(BaseModel):
    id: int
    numero: int
    nombre: str
    totalCapitulos: int = 0
    totalArticulos: int = 0
    capitulos: list[CapituloOut] = []


class ArticuloOut(BaseModel):
    id: int
    numero: int
    titulo: str
    contenido: str
    categoria: str
    capituloId: int | None = None
    tituloId: int | None = None


class ArticulosResponse(BaseModel):
    data: list[ArticuloOut]
    total: int


class Estadisticas(BaseModel):
    totalTitulos: int
    totalCapitulos: int
    totalArticulos: int


# --- Consulta guiada (RF-04) ---
class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    name: str
    color: str | None = None


class ConsultaRequest(BaseModel):
    texto: str = Field(..., min_length=5, max_length=1000)


class ArticuloMatch(BaseModel):
    id: int
    numero: int
    titulo: str
    contenido: str
    categoria: str
    similarity: float


class ConsultaResponse(BaseModel):
    query: str
    resultados: list[ArticuloMatch]
    aviso_legal: str = (
        "Esta orientación es referencial y no constituye asesoría legal. "
        "Para un caso concreto, consulte a un abogado."
    )
