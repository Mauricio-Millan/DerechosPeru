"""Configuración central de la aplicación (cargada desde variables de entorno)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


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
    CORS_ORIGINS: list[str] = ["http://localhost:4200"]

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
