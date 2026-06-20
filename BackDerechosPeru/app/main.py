"""Punto de entrada de la API del Portal Constitucional."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import articulos, consulta, estructura
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


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
