"""Configuración de SQLAlchemy async contra Postgres de Supabase."""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Conexión a Supavisor (pooler de Supabase) en MODO TRANSACCIÓN (puerto 6543).
#   - Pool pequeño y CALIENTE: mantenemos unas pocas conexiones abiertas para que
#     cada request no pague el handshake de red a Supabase (esa era la lentitud).
#     pool_pre_ping descarta conexiones muertas tras un scale-to-zero; pool_recycle
#     las renueva antes de que el pooler las corte.
#   - statement_cache_size / prepared_statement_cache_size = 0: el modo transacción
#     no soporta prepared statements (causaría "prepared statement does not exist").
# ponytail: pool_size=5 alcanza para la capa gratuita; subir si crece la concurrencia.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=5,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    """Clase base para los modelos ORM."""


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependencia de FastAPI: entrega una sesión por request."""
    async with AsyncSessionLocal() as session:
        yield session
