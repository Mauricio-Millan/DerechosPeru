"""Cliente mínimo de Supabase Storage (Sprint 6 — M8).

Sube y firma PDFs fuente en un bucket privado usando la REST API de Storage
con la service_role key. La key vive solo en .env / secret del Container App.
"""
from __future__ import annotations

import httpx

from app.core.config import settings


def _base_url() -> str:
    return f"{settings.SUPABASE_URL}/storage/v1"


def _headers() -> dict[str, str]:
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY no configurado")
    return {"Authorization": f"Bearer {key}", "apikey": key}


def upload_pdf(data: bytes, path: str) -> str:
    """Sube un PDF al bucket privado y devuelve su ruta (path) dentro del bucket."""
    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{_base_url()}/object/{bucket}/{path}"
    headers = {**_headers(), "Content-Type": "application/pdf", "x-upsert": "true"}
    resp = httpx.post(url, content=data, headers=headers, timeout=60)
    resp.raise_for_status()
    return path


def create_signed_url(path: str, expires: int = 3600) -> str:
    """Devuelve una URL firmada (absoluta) para ver el PDF durante la revisión."""
    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{_base_url()}/object/sign/{bucket}/{path}"
    resp = httpx.post(url, json={"expiresIn": expires}, headers=_headers(), timeout=30)
    resp.raise_for_status()
    signed = resp.json()["signedURL"]  # p. ej. "/object/sign/bucket/path?token=..."
    return f"{_base_url()}{signed}"
