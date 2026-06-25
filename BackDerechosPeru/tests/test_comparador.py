"""Checks mínimos del Comparador del Sprint 4.

Ejecutar:  python -m tests.test_comparador
"""
import numpy as np

from app.services.comparador_service import _matriz_similitud, clasificar


class _Art:
    """Stub mínimo: el comparador solo lee .embedding."""

    def __init__(self, emb):
        self.embedding = emb


def test_clasificar():
    umbral = 0.45
    assert clasificar(0.99, "hola mundo", "hola   mundo", umbral) == "identico"  # texto igual (normaliza espacios)
    assert clasificar(0.80, "hola mundo", "hola universo", umbral) == "modificado"
    assert clasificar(0.10, "hola mundo", "otra cosa", umbral) == "sin_equivalente"


def test_matriz_y_emparejamiento():
    # 3 ejes ortogonales: base[i] coincide con target[i] salvo que movemos uno.
    e = np.eye(3, dtype=np.float32)
    base = [_Art(e[0]), _Art(e[1])]               # 2 artículos base
    target = [_Art(e[1]), _Art(e[0]), _Art(e[2])]  # 3 target; el tercero (eje 2) sin par

    sims = _matriz_similitud(base, target)
    assert sims.shape == (2, 3)
    # base[0]=eje0 -> mejor target es el índice 1 (eje0); base[1]=eje1 -> índice 0 (eje1)
    assert int(np.argmax(sims[0])) == 1
    assert int(np.argmax(sims[1])) == 0

    # Replica la detección de "nuevo": el target del eje 2 no lo empareja nadie.
    umbral = 0.45
    usado = [False] * len(target)
    for i in range(len(base)):
        j = int(np.argmax(sims[i]))
        if float(sims[i, j]) >= umbral:
            usado[j] = True
    nuevos = [j for j, u in enumerate(usado) if not u]
    assert nuevos == [2], nuevos


if __name__ == "__main__":
    test_clasificar()
    test_matriz_y_emparejamiento()
    print("OK: tests comparador")
