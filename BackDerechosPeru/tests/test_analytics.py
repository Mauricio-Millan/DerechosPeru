"""Checks mínimos de la analítica del Sprint 5.

Ejecutar:  python -m tests.test_analytics
"""
from app.services.analytics_service import contar_apariciones, es_fallida


def test_contar_apariciones():
    listas = [[1, 2, 3], [2, 3], None, [3], [1, 1]]  # 1 aparece 3 veces, 3 -> 3, 2 -> 2
    out = contar_apariciones(listas)
    # Orden por frecuencia desc, luego id asc
    assert out[0] == (1, 3) or out[0] == (3, 3), out
    d = dict(out)
    assert d[1] == 3 and d[3] == 3 and d[2] == 2, out
    # Empate 1 y 3 (ambos 3) -> id menor primero
    assert out[0] == (1, 3) and out[1] == (3, 3), out


def test_es_fallida():
    umbral = 0.25
    assert es_fallida(0, None, umbral)          # sin resultados
    assert es_fallida(5, 0.10, umbral)          # mejor score bajo el umbral
    assert es_fallida(3, None, umbral)          # sin score
    assert not es_fallida(3, 0.80, umbral)      # buena búsqueda


if __name__ == "__main__":
    test_contar_apariciones()
    test_es_fallida()
    print("OK: tests analytics")
