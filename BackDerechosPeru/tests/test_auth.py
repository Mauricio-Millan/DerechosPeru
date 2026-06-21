"""Check mínimo del guard RBAC: rol permitido pasa, rol no permitido -> 403.

Ejecutar:  python -m tests.test_auth   (o pytest tests/test_auth.py)
"""
import asyncio
import uuid

from fastapi import HTTPException

from app.core.auth import CurrentUser, require_role


def _run(coro):
    return asyncio.run(coro)


def test_role_permitido_pasa():
    admin = CurrentUser(id=uuid.uuid4(), role="admin")
    guard = require_role("admin")
    assert _run(guard(user=admin)) is admin


def test_role_no_permitido_403():
    ciudadano = CurrentUser(id=uuid.uuid4(), role="ciudadano")
    guard = require_role("admin")
    try:
        _run(guard(user=ciudadano))
    except HTTPException as e:
        assert e.status_code == 403
    else:
        raise AssertionError("debió lanzar 403")


def test_acepta_varios_roles():
    editor = CurrentUser(id=uuid.uuid4(), role="editor")
    guard = require_role("editor", "admin")
    assert _run(guard(user=editor)) is editor


if __name__ == "__main__":
    test_role_permitido_pasa()
    test_role_no_permitido_403()
    test_acepta_varios_roles()
    print("OK: require_role")
