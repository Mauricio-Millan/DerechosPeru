"""Configuración central de la aplicación (cargada desde variables de entorno)."""
import json
from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- App ---
    APP_NAME: str = "Portal Constitucional - API"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    # --- Base de datos (Supabase / Postgres) ---
    # Cadena de conexión directa (Connection Pooler) de Supabase.
    # Formato asyncpg: postgresql+asyncpg://USER:PASSWORD@HOST:6543/postgres
    DATABASE_URL: str

    # --- CORS (frontend Angular) ---
    # NoDecode: evita que pydantic intente json.loads automático del env var.
    # Acepta lista separada por comas ("https://a,https://b") o JSON.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:4200"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v):
        if isinstance(v, str):
            s = v.strip()
            if s.startswith("["):
                return json.loads(s)
            return [o.strip() for o in s.split(",") if o.strip()]
        return v

    # --- Embeddings ---
    # Proveedor: "local" (gratis, offline) | "openai" (Azure OpenAI) | "fake"
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_DIM: int = 384

    # OpenAI / Azure OpenAI (la lib openai detecta Azure por estas vars)
    OPENAI_API_KEY: str | None = None
    OPENAI_BASE_URL: str | None = None          # Azure: https://<recurso>.openai.azure.com/...
    AZURE_OPENAI_API_VERSION: str | None = None  # p. ej. 2024-02-01

    # --- Consulta guiada ---
    GUIDED_MATCH_COUNT: int = 5
    GUIDED_MIN_SIMILARITY: float = 0.25


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
