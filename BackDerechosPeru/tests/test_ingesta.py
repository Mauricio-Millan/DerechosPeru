"""Checks mínimos de la ingesta del Sprint 6 (M8).

Ejecutar:  python -m tests.test_ingesta
"""
from app.api.routes.ingesta import puede_publicar
from etl.etlconstitucion import parse_constitution_text
from etl.verify_json import validate_structure

SINTETICA = """TITULO I
DE LA PERSONA
CAPITULO I
DERECHOS FUNDAMENTALES
Artículo 1.- La defensa de la persona humana es el fin supremo.
Artículo 2.- Toda persona tiene derecho a la vida.
TITULO II
DEL ESTADO
CAPITULO I
DISPOSICIONES GENERALES
Artículo 3.- El Estado es uno e indivisible.
"""


def test_parse_constitution_text():
    data = parse_constitution_text(SINTETICA)
    assert len(data["titulos"]) == 2, data["titulos"]
    assert len(data["capitulos"]) == 2, data["capitulos"]
    assert len(data["articulos"]) == 3, data["articulos"]
    nums = sorted(a["numero"] for a in data["articulos"])
    assert nums == [1, 2, 3]
    # un artículo conserva su contenido
    art1 = next(a for a in data["articulos"] if a["numero"] == 1)
    assert "persona humana" in art1["contenido"]


def test_validate_structure_detecta_hueco_y_duplicado():
    titulos = [{"numero_romano": "I", "denominacion": "T"}]
    capitulos = [{"titulo_romano": "I", "numero_romano": "I", "denominacion": "C"}]

    def art(n):
        return {"titulo_romano": "I", "capitulo_romano": "I", "numero": n, "contenido": "x"}

    # Hueco: falta el 3
    rep = validate_structure({"titulos": titulos, "capitulos": capitulos, "articulos": [art(1), art(2), art(4)]})
    assert not rep["ok"]
    assert any("Huecos" in e for e in rep["errors"]), rep["errors"]

    # Duplicado: el 2 repetido
    rep = validate_structure({"titulos": titulos, "capitulos": capitulos, "articulos": [art(1), art(2), art(2), art(3)]})
    assert not rep["ok"]
    assert any("duplicados" in e for e in rep["errors"]), rep["errors"]

    # Correcto
    rep = validate_structure({"titulos": titulos, "capitulos": capitulos, "articulos": [art(1), art(2), art(3)]})
    assert rep["ok"], rep["errors"]


def test_puede_publicar():
    assert puede_publicar({"total": 3, "verificados": 3, "observados": 0, "pendientes": 0})
    assert not puede_publicar({"total": 3, "verificados": 2, "observados": 0, "pendientes": 1})
    assert not puede_publicar({"total": 3, "verificados": 2, "observados": 1, "pendientes": 0})
    assert not puede_publicar({"total": 0, "verificados": 0, "observados": 0, "pendientes": 0})


if __name__ == "__main__":
    test_parse_constitution_text()
    test_validate_structure_detecta_hueco_y_duplicado()
    test_puede_publicar()
    print("OK: tests ingesta")
