"""Utilidades de mapeo ORM -> contrato del front."""
from app.models import Articulo
from app.schemas.constitution import ArticuloOut

_ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}


def roman_to_int(s: str) -> int:
    total = prev = 0
    for ch in reversed((s or "").strip().upper()):
        v = _ROMAN.get(ch, 0)
        total += -v if v < prev else v
        prev = max(prev, v)
    return total


def articulo_to_out(a: Articulo) -> ArticuloOut:
    # requiere a.category y a.capitulo precargados (selectinload)
    return ArticuloOut(
        id=a.id,
        numero=a.numero,
        titulo=a.sumilla or f"Artículo {a.numero}",
        contenido=a.contenido,
        categoria=a.category.name if a.category else "",
        capituloId=a.capitulo_id,
        tituloId=a.capitulo.titulo_id if a.capitulo else None,
    )
