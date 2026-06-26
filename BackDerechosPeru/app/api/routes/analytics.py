"""Panel de analítica (Sprint 5): métricas para admin/editor sobre datos ya capturados."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.database import get_db
from app.schemas.analytics import AnalyticsOut
from app.services.analytics_service import reporte

router = APIRouter(
    prefix="/admin/analytics",
    tags=["analytics"],
    dependencies=[Depends(require_role("admin", "editor"))],
)


@router.get("", response_model=AnalyticsOut)
async def analytics(db: AsyncSession = Depends(get_db)):
    return await reporte(db)
