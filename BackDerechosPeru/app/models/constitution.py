"""Modelos ORM del dominio constitucional."""
from datetime import date, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    ARRAY,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.core.database import Base


class ConstitutionVersion(Base):
    __tablename__ = "constitution_version"

    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    promulgated_on: Mapped[date | None] = mapped_column(Date)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    titulos: Mapped[list["Titulo"]] = relationship(back_populates="version", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "category"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str | None] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)


class Titulo(Base):
    __tablename__ = "titulo"

    id: Mapped[int] = mapped_column(primary_key=True)
    version_id: Mapped[int] = mapped_column(ForeignKey("constitution_version.id", ondelete="CASCADE"))
    numero_romano: Mapped[str] = mapped_column(String, nullable=False)
    denominacion: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int | None] = mapped_column(Integer)

    version: Mapped["ConstitutionVersion"] = relationship(back_populates="titulos")
    capitulos: Mapped[list["Capitulo"]] = relationship(back_populates="titulo", cascade="all, delete-orphan")


class Capitulo(Base):
    __tablename__ = "capitulo"

    id: Mapped[int] = mapped_column(primary_key=True)
    version_id: Mapped[int] = mapped_column(ForeignKey("constitution_version.id", ondelete="CASCADE"))
    titulo_id: Mapped[int] = mapped_column(ForeignKey("titulo.id", ondelete="CASCADE"))
    numero_romano: Mapped[str] = mapped_column(String, nullable=False)
    denominacion: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int | None] = mapped_column(Integer)

    titulo: Mapped["Titulo"] = relationship(back_populates="capitulos")
    articulos: Mapped[list["Articulo"]] = relationship(back_populates="capitulo")


class Articulo(Base):
    __tablename__ = "articulo"

    id: Mapped[int] = mapped_column(primary_key=True)
    version_id: Mapped[int] = mapped_column(ForeignKey("constitution_version.id", ondelete="CASCADE"))
    titulo_id: Mapped[int | None] = mapped_column(ForeignKey("titulo.id", ondelete="SET NULL"))
    capitulo_id: Mapped[int | None] = mapped_column(ForeignKey("capitulo.id", ondelete="SET NULL"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id", ondelete="SET NULL"))
    numero: Mapped[int] = mapped_column(Integer, nullable=False)
    sumilla: Mapped[str | None] = mapped_column(Text)
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.EMBEDDING_DIM))
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    capitulo: Mapped["Capitulo"] = relationship(back_populates="articulos")
    category: Mapped["Category"] = relationship()


class ConsultaLog(Base):
    __tablename__ = "consulta_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    matched_article_ids: Mapped[list[int] | None] = mapped_column(ARRAY(Integer))
    top_score: Mapped[float | None] = mapped_column(Float)
    result_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
