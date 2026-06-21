"""Check mínimo del foro y RBAC del Sprint 3.

Ejecutar:  python -m tests.test_foro
"""
import asyncio
import uuid

from fastapi import HTTPException

from app.api.routes.forum import decidir_voto
from app.core.auth import CurrentUser, require_role


def _run(coro):
    return asyncio.run(coro)


def test_decidir_voto():
    # Caso 1: Voto inicial (no existe) -> insertar
    assert decidir_voto(None, 1) == "insertar"
    assert decidir_voto(None, -1) == "insertar"

    # Caso 2: Voto igual al existente -> borrar (toggle)
    assert decidir_voto(1, 1) == "borrar"
    assert decidir_voto(-1, -1) == "borrar"

    # Caso 3: Voto diferente al existente -> actualizar
    assert decidir_voto(1, -1) == "actualizar"
    assert decidir_voto(-1, 1) == "actualizar"


def test_verificar_rechaza_ciudadano():
    # El endpoint de verificar requiere rol experto, editor o admin
    guard = require_role("experto", "editor", "admin")
    ciudadano = CurrentUser(id=uuid.uuid4(), role="ciudadano")

    try:
        _run(guard(user=ciudadano))
    except HTTPException as e:
        assert e.status_code == 403
    else:
        raise AssertionError("debió lanzar 403")


def test_verificar_acepta_experto():
    guard = require_role("experto", "editor", "admin")
    experto = CurrentUser(id=uuid.uuid4(), role="experto")
    assert _run(guard(user=experto)) is experto


if __name__ == "__main__":
    test_decidir_voto()
    test_verificar_rechaza_ciudadano()
    test_verificar_acepta_experto()
    print("OK: tests foro")
