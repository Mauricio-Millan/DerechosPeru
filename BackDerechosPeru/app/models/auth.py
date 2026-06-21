"""Modelos de identidad y marcadores (Sprint 2 — M3).

`profile` extiende auth.users de Supabase con el rol (RBAC).
`bookmark` son los marcadores persistentes por usuario.
"""
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# Roles canónicos (ver ROLES.md). Visitante anónimo = sin fila / sin JWT.
ROLES = ("ciudadano", "redactor", "experto", "editor", "admin")


class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)  # = auth.users.id
    display_name: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str] = mapped_column(Text, nullable=False, default="ciudadano")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Bookmark(Base):
    __tablename__ = "bookmark"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    articulo_id: Mapped[int] = mapped_column(ForeignKey("articulo.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
