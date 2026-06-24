"""Extracción de texto de PDFs de constituciones (Sprint 6 — M8).

El texto extraído alimenta al parser (parse_constitution_text). La extracción
de formatos arbitrarios es imperfecta a propósito: la revisión humana contra
el PDF la corrige antes de publicar.
"""
from __future__ import annotations

import io


def extract_text(pdf_bytes: bytes) -> str:
    """Devuelve el texto concatenado de todas las páginas del PDF."""
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(pdf_bytes))
    paginas = [(page.extract_text() or "") for page in reader.pages]
    return "\n".join(paginas)
