import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, SmallInteger, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ExamenResultado(Base):
    __tablename__ = "examen_resultado"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    nivel: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # 1 | 2 | 3
    puntaje: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    total: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    aprobado: Mapped[bool] = mapped_column(Boolean, nullable=False)
    completado_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
