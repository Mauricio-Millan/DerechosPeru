"""Contratos del panel de analítica (Sprint 5)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ResumenOut(BaseModel):
    total_usuarios: int
    total_consultas: int
    consultas_fallidas: int
    total_hilos: int
    respuestas_verificadas: int
    total_guardados: int


class RolCount(BaseModel):
    rol: str
    total: int


class TopArticulo(BaseModel):
    id: int
    numero: int
    sumilla: str | None
    consultas: int


class BusquedaFallida(BaseModel):
    query_text: str
    created_at: datetime


class ForoStats(BaseModel):
    hilos: int
    respuestas: int
    verificadas: int


class AnalyticsOut(BaseModel):
    resumen: ResumenOut
    usuarios_por_rol: list[RolCount]
    top_articulos: list[TopArticulo]
    busquedas_fallidas: list[BusquedaFallida]
    total_fallidas: int
    foro: ForoStats
