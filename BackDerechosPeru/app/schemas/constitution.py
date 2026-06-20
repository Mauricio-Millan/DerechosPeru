"""Esquemas Pydantic (contratos de la API)."""
from pydantic import BaseModel, ConfigDict, Field


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    name: str
    color: str | None = None


class ArticuloOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: int
    sumilla: str | None = None
    contenido: str
    category: CategoryOut | None = None


class ArticuloListOut(BaseModel):
    """Versión liviana para listados/búsqueda."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: int
    sumilla: str | None = None
    contenido: str
    category: CategoryOut | None = None


class CapituloOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero_romano: str
    denominacion: str
    articulos_count: int = 0


class TituloOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero_romano: str
    denominacion: str
    capitulos: list[CapituloOut] = []


# --- Consulta guiada (RF-04) ---
class ConsultaRequest(BaseModel):
    texto: str = Field(..., min_length=5, max_length=1000,
                       description="Descripción del problema en lenguaje natural")


class ArticuloMatch(BaseModel):
    id: int
    numero: int
    sumilla: str | None = None
    contenido: str
    category: CategoryOut | None = None
    similarity: float = Field(..., description="Similitud coseno 0..1")


class ConsultaResponse(BaseModel):
    query: str
    resultados: list[ArticuloMatch]
    aviso_legal: str = (
        "Esta orientación es referencial y no constituye asesoría legal. "
        "Para un caso concreto, consulte a un abogado."
    )
