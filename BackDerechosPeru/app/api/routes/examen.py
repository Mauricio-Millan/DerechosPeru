"""Examen constitucional de 3 niveles (preguntas fijas).

GET  /examen/preguntas/{nivel}  -> preguntas sin respuesta correcta
POST /examen/enviar             -> corrige, guarda resultado, promueve si nivel 3
GET  /examen/mi-progreso        -> medallas y niveles completados del usuario
"""
from __future__ import annotations

import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, get_current_user
from app.core.database import get_db
from app.models import Profile
from app.models.examen import ExamenResultado
from app.schemas.examen import (
    DetalleRespuesta,
    EnviarExamenIn,
    NivelProgreso,
    PreguntaOut,
    ProgresoOut,
    ResultadoOut,
)

router = APIRouter(prefix="/examen", tags=["examen"])

PUNTAJE_MINIMO = 7  # de 10 para aprobar
MEDALLAS = {1: "bronce", 2: "plata", 3: "oro"}

# ──────────────────────────────────────────────
# Banco de preguntas (respuesta = índice 0-3)
# ──────────────────────────────────────────────
_PREGUNTAS: dict[int, list[dict]] = {
    1: [
        {
            "id": 101,
            "pregunta": "¿En qué año fue promulgada la Constitución Política vigente del Perú?",
            "opciones": ["1979", "1993", "1985", "2001"],
            "respuesta": 1,
        },
        {
            "id": 102,
            "pregunta": "¿Quién promulgó la Constitución Política de 1993?",
            "opciones": ["Alan García", "Valentín Paniagua", "Alberto Fujimori", "Francisco Morales Bermúdez"],
            "respuesta": 2,
        },
        {
            "id": 103,
            "pregunta": "¿Cuántos artículos tiene la Constitución Política de 1993?",
            "opciones": ["150", "234", "206", "180"],
            "respuesta": 2,
        },
        {
            "id": 104,
            "pregunta": "¿Cuántas cámaras tiene el Congreso de la República según la Constitución de 1993?",
            "opciones": ["Dos (Senado y Cámara de Diputados)", "Tres", "Una (unicameral)", "Cuatro"],
            "respuesta": 2,
        },
        {
            "id": 105,
            "pregunta": "¿Cuántos años dura el mandato presidencial en el Perú?",
            "opciones": ["4 años", "6 años", "5 años", "3 años"],
            "respuesta": 2,
        },
        {
            "id": 106,
            "pregunta": "¿Cuál de los siguientes es un poder del Estado según la Constitución peruana?",
            "opciones": ["Poder Electoral", "Poder Judicial", "Poder Ciudadano", "Poder Regional"],
            "respuesta": 1,
        },
        {
            "id": 107,
            "pregunta": "¿Cuál es el idioma oficial del Perú según el artículo 48 de la Constitución?",
            "opciones": [
                "Solo el quechua",
                "El inglés y el castellano",
                "El castellano; y en las zonas donde sean mayoritarias, el quechua, aimara y demás lenguas aborígenes",
                "Solo el castellano",
            ],
            "respuesta": 2,
        },
        {
            "id": 108,
            "pregunta": "¿Qué establece el artículo 1 de la Constitución?",
            "opciones": [
                "La forma de gobierno del Estado",
                "La defensa de la persona humana y el respeto de su dignidad son el fin supremo de la sociedad y del Estado",
                "Los derechos políticos de los ciudadanos",
                "La división de poderes del Estado",
            ],
            "respuesta": 1,
        },
        {
            "id": 109,
            "pregunta": "¿Cuál es la forma de gobierno del Perú según el artículo 43?",
            "opciones": [
                "Monarquía constitucional",
                "República aristocrática",
                "República democrática, social, independiente y soberana",
                "Estado federal",
            ],
            "respuesta": 2,
        },
        {
            "id": 110,
            "pregunta": "¿Qué institución ejerce el control de la constitucionalidad de las leyes?",
            "opciones": [
                "El Congreso de la República",
                "El Poder Judicial",
                "El Tribunal Constitucional",
                "El Ministerio de Justicia",
            ],
            "respuesta": 2,
        },
    ],
    2: [
        {
            "id": 201,
            "pregunta": "¿En qué artículo se reconoce el derecho a la vida como primer derecho fundamental?",
            "opciones": ["Artículo 1", "Artículo 3", "Artículo 2, inciso 1", "Artículo 5"],
            "respuesta": 2,
        },
        {
            "id": 202,
            "pregunta": "¿Cuántos miembros tiene el Tribunal Constitucional?",
            "opciones": ["5", "9", "7", "12"],
            "respuesta": 2,
        },
        {
            "id": 203,
            "pregunta": "¿Cuál es la edad mínima para ser candidato a la Presidencia de la República?",
            "opciones": ["30 años", "40 años", "35 años", "25 años"],
            "respuesta": 2,
        },
        {
            "id": 204,
            "pregunta": "¿Qué garantía constitucional protege la libertad personal ante detenciones arbitrarias?",
            "opciones": ["El amparo", "El hábeas corpus", "El hábeas data", "La acción popular"],
            "respuesta": 1,
        },
        {
            "id": 205,
            "pregunta": "¿Qué establece el artículo 139 sobre la función jurisdiccional?",
            "opciones": [
                "La pluralidad de instancias como único principio",
                "La unidad y exclusividad de la función jurisdiccional",
                "La gratuidad absoluta de la justicia",
                "La independencia del Ministerio Público",
            ],
            "respuesta": 1,
        },
        {
            "id": 206,
            "pregunta": "¿Quién nombra a los magistrados del Tribunal Constitucional?",
            "opciones": [
                "El Presidente de la República",
                "El Consejo Nacional de la Magistratura",
                "El Congreso de la República",
                "La Corte Suprema de Justicia",
            ],
            "respuesta": 2,
        },
        {
            "id": 207,
            "pregunta": "¿Qué establece el artículo 55 sobre los tratados internacionales?",
            "opciones": [
                "Los tratados deben aprobarse siempre por referéndum",
                "Los tratados celebrados por el Estado forman parte del derecho nacional",
                "Los tratados tienen rango superior a la Constitución",
                "Solo los tratados ratificados por el Congreso tienen validez",
            ],
            "respuesta": 1,
        },
        {
            "id": 208,
            "pregunta": "¿Qué derecho protege la acción de amparo?",
            "opciones": [
                "La libertad personal ante detenciones arbitrarias",
                "El acceso a la información pública",
                "Los derechos constitucionales distintos a la libertad personal",
                "La inconstitucionalidad de una norma legal",
            ],
            "respuesta": 2,
        },
        {
            "id": 209,
            "pregunta": "¿En qué artículo se establece el derecho a la educación?",
            "opciones": ["Artículo 10", "Artículo 15", "Artículo 13", "Artículo 20"],
            "respuesta": 2,
        },
        {
            "id": 210,
            "pregunta": "¿Qué establece el artículo 2 inciso 4 sobre la libertad de expresión?",
            "opciones": [
                "La censura previa está permitida en casos excepcionales",
                "La libertad de expresión está restringida a medios impresos",
                "Toda persona tiene derecho a las libertades de información, opinión, expresión y difusión del pensamiento",
                "El Estado puede suspender la libertad de expresión por decreto supremo",
            ],
            "respuesta": 2,
        },
    ],
    3: [
        {
            "id": 301,
            "pregunta": "¿Qué establece el artículo 51 sobre la jerarquía normativa?",
            "opciones": [
                "Los decretos supremos están sobre las leyes ordinarias",
                "La Constitución prevalece sobre toda norma legal; la ley, sobre las demás normas de inferior jerarquía",
                "Los tratados internacionales están sobre la Constitución",
                "Las ordenanzas regionales prevalecen sobre las leyes nacionales",
            ],
            "respuesta": 1,
        },
        {
            "id": 302,
            "pregunta": "¿Cuál es el procedimiento para reformar la Constitución sin referéndum?",
            "opciones": [
                "Aprobación en una legislatura con mayoría simple",
                "Aprobación por decreto supremo del Ejecutivo",
                "Aprobación en dos legislaturas ordinarias sucesivas con mayoría absoluta del número legal de congresistas",
                "Aprobación en una legislatura con dos tercios del Congreso",
            ],
            "respuesta": 2,
        },
        {
            "id": 303,
            "pregunta": "¿Qué es el control difuso establecido en el artículo 138?",
            "opciones": [
                "El control que ejerce el Tribunal Constitucional sobre las leyes",
                "La facultad de los jueces de preferir la Constitución e inaplicar una norma inconstitucional al caso concreto",
                "El control que ejerce el Congreso sobre el Ejecutivo",
                "La revisión de oficio de los actos administrativos",
            ],
            "respuesta": 1,
        },
        {
            "id": 304,
            "pregunta": "¿Cuántos requisitos establece el artículo 90 para ser elegido congresista?",
            "opciones": ["2 requisitos", "4 requisitos", "3 requisitos", "5 requisitos"],
            "respuesta": 2,
        },
        {
            "id": 305,
            "pregunta": "¿Qué establece el artículo 103 sobre las leyes especiales?",
            "opciones": [
                "Solo el Ejecutivo puede proponer leyes especiales",
                "Las leyes especiales pueden dictarse por razón de las diferencias de las personas",
                "Pueden expedirse leyes especiales por la naturaleza de las cosas, pero no por razón de las diferencias de las personas",
                "Las leyes especiales requieren aprobación por referéndum",
            ],
            "respuesta": 2,
        },
        {
            "id": 306,
            "pregunta": "¿Qué establece el artículo 200 de la Constitución?",
            "opciones": [
                "Los derechos económicos y sociales",
                "Las garantías constitucionales: hábeas corpus, amparo, hábeas data, acción de cumplimiento, acción popular e inconstitucionalidad",
                "La organización del Poder Judicial",
                "Los tratados internacionales de derechos humanos",
            ],
            "respuesta": 1,
        },
        {
            "id": 307,
            "pregunta": "¿Cuál es la principal diferencia entre la Constitución de 1993 y la de 1979 respecto a la reelección presidencial?",
            "opciones": [
                "La de 1993 prohíbe la reelección presidencial",
                "La de 1993 permite la reelección presidencial inmediata por un período adicional",
                "La de 1993 permite la reelección indefinida",
                "No existe diferencia entre ambas constituciones en este tema",
            ],
            "respuesta": 1,
        },
        {
            "id": 308,
            "pregunta": "¿Qué establece el artículo 118 inciso 19 sobre las facultades del Presidente?",
            "opciones": [
                "La facultad de disolver el Congreso sin límites",
                "La facultad de declarar la guerra sin aprobación del Congreso",
                "Dictar medidas extraordinarias mediante decretos de urgencia con fuerza de ley en materia económica y financiera",
                "Nombrar y remover libremente a los magistrados del Poder Judicial",
            ],
            "respuesta": 2,
        },
        {
            "id": 309,
            "pregunta": "¿Qué principio constitucional establece que nadie está obligado a hacer lo que la ley no manda?",
            "opciones": [
                "Principio de legalidad (artículo 2, inciso 24, literal a)",
                "Principio de proporcionalidad",
                "Principio de igualdad ante la ley",
                "Principio de presunción de inocencia",
            ],
            "respuesta": 0,
        },
        {
            "id": 310,
            "pregunta": "¿Qué diferencia fundamental introduce la Constitución de 1993 respecto al modelo económico?",
            "opciones": [
                "Establece una economía planificada por el Estado",
                "Refuerza el rol empresarial del Estado como actor principal",
                "Adopta una economía social de mercado con mayor apertura al capital privado y extranjero",
                "Elimina la propiedad privada de los medios de producción",
            ],
            "respuesta": 2,
        },
    ],
}


@router.get("/preguntas/{nivel}", response_model=list[PreguntaOut])
async def obtener_preguntas(nivel: int, user: CurrentUser = Depends(get_current_user)):
    if nivel not in (1, 2, 3):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nivel debe ser 1, 2 o 3")
    preguntas = _PREGUNTAS[nivel].copy()
    random.shuffle(preguntas)
    return [PreguntaOut(id=p["id"], pregunta=p["pregunta"], opciones=p["opciones"]) for p in preguntas]


@router.post("/enviar", response_model=ResultadoOut)
async def enviar_examen(
    payload: EnviarExamenIn,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    banco = {p["id"]: p for p in _PREGUNTAS[payload.nivel]}
    if len(payload.respuestas) != 10:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Se requieren exactamente 10 respuestas")

    detalle: list[DetalleRespuesta] = []
    correctas = 0
    for r in payload.respuestas:
        p = banco.get(r.pregunta_id)
        if not p:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Pregunta {r.pregunta_id} no válida para nivel {payload.nivel}")
        es_correcta = r.opcion == p["respuesta"]
        if es_correcta:
            correctas += 1
        detalle.append(DetalleRespuesta(
            pregunta_id=r.pregunta_id,
            opcion_elegida=r.opcion,
            correcta=es_correcta,
            opcion_correcta=p["respuesta"],
        ))

    aprobado = correctas >= PUNTAJE_MINIMO
    resultado = ExamenResultado(
        user_id=user.id,
        nivel=payload.nivel,
        puntaje=correctas,
        total=10,
        aprobado=aprobado,
        completado_at=datetime.now(),
    )
    db.add(resultado)

    # Promover a experto si aprueba el nivel 3 y aún es ciudadano
    promovido = False
    nuevo_rol = None
    if aprobado and payload.nivel == 3 and user.role == "ciudadano":
        await db.execute(update(Profile).where(Profile.id == user.id).values(role="experto"))
        promovido = True
        nuevo_rol = "experto"

    await db.commit()

    return ResultadoOut(
        puntaje=correctas,
        total=10,
        aprobado=aprobado,
        medalla=MEDALLAS[payload.nivel] if aprobado else "",
        promovido=promovido,
        nuevo_rol=nuevo_rol,
        detalle=detalle,
    )


@router.get("/mi-progreso", response_model=ProgresoOut)
async def mi_progreso(user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (
        await db.execute(
            select(ExamenResultado)
            .where(ExamenResultado.user_id == user.id, ExamenResultado.aprobado.is_(True))
            .order_by(ExamenResultado.nivel, ExamenResultado.completado_at.desc())
        )
    ).scalars().all()

    # Un resultado por nivel (el mejor / primero aprobado)
    vistos: set[int] = set()
    niveles: list[NivelProgreso] = []
    for r in rows:
        if r.nivel not in vistos:
            vistos.add(r.nivel)
            niveles.append(NivelProgreso(
                nivel=r.nivel,
                aprobado=True,
                puntaje=r.puntaje,
                total=r.total,
                medalla=MEDALLAS[r.nivel],
                completado_at=r.completado_at,
            ))

    return ProgresoOut(niveles=niveles, es_experto=user.role == "experto")
