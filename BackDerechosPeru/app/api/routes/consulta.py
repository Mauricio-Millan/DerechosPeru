"""Vista 'Consulta guiada' (RF-04): orientación con IA semántica."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.schemas.constitution import ConsultaRequest, ConsultaResponse
from app.services.consulta_service import consultar
from app.services.chat_service import chat

router = APIRouter(prefix="/consulta", tags=["consulta"])


@router.post("", response_model=ConsultaResponse)
async def consulta_guiada(payload: ConsultaRequest, db: AsyncSession = Depends(get_db)):
    """Recibe el problema del ciudadano y devuelve artículos que lo protegen."""
    resultados = await consultar(db, payload.texto)
    return ConsultaResponse(query=payload.texto, resultados=resultados)


class MensajeHistorial(BaseModel):
    rol: str  # "user" | "bot"
    texto: str


class ChatRequest(BaseModel):
    mensaje: str
    historial: list[MensajeHistorial] = []
    articulos_ids: list[int] | None = None  # None = primera llamada (RAG + log)


class FuenteChat(BaseModel):
    id: int
    numero: int
    sumilla: str
    contenido: str
    similarity: float


class ChatResponse(BaseModel):
    respuesta: str
    fuentes: list[FuenteChat]


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(get_current_user)])
async def chat_constitucional(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Chat con IA sobre la Constitución vigente. Primera llamada hace RAG+log; las demás reusan el contexto."""
    try:
        result = await chat(
            db,
            mensaje=payload.mensaje,
            historial=[m.model_dump() for m in payload.historial],
            articulos_ids=payload.articulos_ids,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return result
