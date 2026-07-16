"""Punto de entrada de la API del Portal Constitucional."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    admin,
    analytics,
    annotations,
    articulos,
    bookmarks,
    comparador,
    consulta,
    cuenta,
    estructura,
    examen,
    forum,
    ingesta,
)
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="API de Gestión del Conocimiento sobre la Constitución Política del Perú",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(estructura.router, prefix=settings.API_PREFIX)
app.include_router(articulos.router, prefix=settings.API_PREFIX)
app.include_router(consulta.router, prefix=settings.API_PREFIX)
app.include_router(bookmarks.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(cuenta.router, prefix=settings.API_PREFIX)
app.include_router(forum.router, prefix=settings.API_PREFIX)
app.include_router(annotations.router, prefix=settings.API_PREFIX)
app.include_router(ingesta.router, prefix=settings.API_PREFIX)
app.include_router(comparador.router, prefix=settings.API_PREFIX)
app.include_router(examen.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
