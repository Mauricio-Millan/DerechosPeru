"""Vista 'Consulta guiada' (RF-04): orientación con IA semántica."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.constitution import ConsultaRequest, ConsultaResponse
from app.services.consulta_service import consultar

router = APIRouter(prefix="/consulta", tags=["consulta"])


@router.post("", response_model=ConsultaResponse)
async def consulta_guiada(payload: ConsultaRequest, db: AsyncSession = Depends(get_db)):
    """Recibe el problema del ciudadano y devuelve artículos que lo protegen."""
    resultados = await consultar(db, payload.texto)
    return ConsultaResponse(query=payload.texto, resultados=resultados)
