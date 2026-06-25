"""Comparador público de versiones de la Constitución (Sprint 4).

  GET /api/versions             -> versiones publicadas (para los selectores)
  GET /api/compare?base&target  -> comparación artículo a artículo por similitud
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import ConstitutionVersion
from app.schemas.comparador import ComparacionOut, VersionPublicaOut
from app.services.comparador_service import comparar

router = APIRouter(tags=["comparador"])


async def _es_publicada(db: AsyncSession, version_id: int) -> bool:
    estado = (
        await db.execute(
            select(ConstitutionVersion.status).where(ConstitutionVersion.id == version_id)
        )
    ).scalar_one_or_none()
    return estado == "publicada"


@router.get("/versions", response_model=list[VersionPublicaOut])
async def versiones_publicadas(db: AsyncSession = Depends(get_db)):
    versiones = (
        await db.execute(
            select(ConstitutionVersion)
            .where(ConstitutionVersion.status == "publicada")
            .order_by(ConstitutionVersion.year)
        )
    ).scalars().all()
    return versiones


@router.get("/compare", response_model=ComparacionOut)
async def comparar_versiones(
    base: int = Query(...),
    target: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if base == target:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Elige dos versiones distintas")
    if not await _es_publicada(db, base) or not await _es_publicada(db, target):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Versión no encontrada o no publicada")
    return await comparar(db, base, target)
