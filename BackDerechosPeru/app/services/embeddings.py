"""Generación de embeddings con proveedor intercambiable.

Proveedores soportados (via EMBEDDING_PROVIDER):
  - "openai": OpenAI o Azure OpenAI (recomendado, 1536 dims).
  - "local":  sentence-transformers (offline; cambia EMBEDDING_DIM).
  - "fake":   vector determinista para pruebas sin costo/red.
"""
from __future__ import annotations

import hashlib

from app.core.config import settings

_local_model = None  # cache perezoso del modelo local


def _embed_openai(texts: list[str]) -> list[list[float]]:
    from openai import OpenAI

    client = OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,  # None -> OpenAI; URL -> Azure/compatible
    )
    resp = client.embeddings.create(model=settings.EMBEDDING_MODEL, input=texts)
    return [d.embedding for d in resp.data]


def _embed_local(texts: list[str]) -> list[list[float]]:
    global _local_model
    if _local_model is None:
        from sentence_transformers import SentenceTransformer

        _local_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _local_model.encode(texts, normalize_embeddings=True).tolist()


def _embed_fake(texts: list[str]) -> list[list[float]]:
    """Vector pseudo-aleatorio determinista (solo para desarrollo)."""
    dim = settings.EMBEDDING_DIM
    out: list[list[float]] = []
    for t in texts:
        h = hashlib.sha256(t.encode("utf-8")).digest()
        vals = [(h[i % len(h)] / 255.0) - 0.5 for i in range(dim)]
        norm = sum(v * v for v in vals) ** 0.5 or 1.0
        out.append([v / norm for v in vals])
    return out


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Devuelve un embedding por cada texto de entrada."""
    if not texts:
        return []
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "openai":
        return _embed_openai(texts)
    if provider == "local":
        return _embed_local(texts)
    if provider == "fake":
        return _embed_fake(texts)
    raise ValueError(f"EMBEDDING_PROVIDER desconocido: {provider}")


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
