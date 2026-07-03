"""Chat constitucional: RAG con artículos de la versión vigente + Groq llama-3.1-8b-instant."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.consulta_service import consultar

_SYSTEM = (
    "Eres un asistente legal especializado en la Constitución Política del Perú. "
    "Responde ÚNICAMENTE usando los artículos proporcionados como contexto. "
    "Al mencionar un artículo cítalo así: [Art. N]. "
    "Si la pregunta no puede responderse con los artículos dados, dilo claramente. "
    "Responde en español, de forma clara y directa. No inventes información."
)


async def chat(db: AsyncSession, pregunta: str) -> dict:
    """Busca artículos relevantes y genera respuesta con Groq citando fuentes."""
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY no configurada")

    articulos = await consultar(db, pregunta)

    if not articulos:
        return {
            "respuesta": "No encontré artículos de la Constitución vigente relacionados con tu pregunta. "
                         "Intenta reformularla o consulta directamente el texto constitucional.",
            "fuentes": [],
        }

    contexto = "\n\n".join(
        f"[Art. {a.numero}] {a.contenido}" for a in articulos
    )
    user_msg = f"Artículos relevantes de la Constitución:\n\n{contexto}\n\nPregunta: {pregunta}"

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.2,
        max_tokens=600,
    )

    return {
        "respuesta": completion.choices[0].message.content,
        "fuentes": [
            {"numero": a.numero, "sumilla": a.titulo, "similarity": a.similarity}
            for a in articulos
        ],
    }
