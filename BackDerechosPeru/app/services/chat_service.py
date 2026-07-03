"""Chat constitucional: RAG primera llamada (con log) + historial en Groq llama-3.3-70b-versatile."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import Articulo
from app.services.consulta_service import consultar

_SYSTEM = (
    "Eres un asistente jurídico especializado en la Constitución Política del Perú.\n"
    "INSTRUCCIONES:\n"
    "- Responde ÚNICAMENTE usando los artículos constitucionales del contexto.\n"
    "- Cita siempre con el formato exacto [Art. N] (ej: [Art. 2]).\n"
    "- Por cada artículo citado, argumenta específicamente cómo aplica al caso.\n"
    "- Usa lenguaje claro y accesible, no solo tecnicismos.\n"
    "- Si la consulta no puede responderse con los artículos dados, dilo con honestidad.\n"
    "- No inventes información legal ni cites artículos fuera del contexto.\n"
    "- Tu orientación es informativa, no asesoramiento legal formal."
)


async def chat(
    db: AsyncSession,
    mensaje: str,
    historial: list[dict] | None = None,
    articulos_ids: list[int] | None = None,
) -> dict:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY no configurada")

    if articulos_ids is None:
        # Primera llamada: RAG + log automático vía consultar()
        matches = await consultar(db, mensaje)
        ctx = [{"numero": m.numero, "titulo": m.titulo, "contenido": m.contenido} for m in matches]
        fuentes = [
            {"id": m.id, "numero": m.numero, "sumilla": m.titulo,
             "contenido": m.contenido, "similarity": m.similarity}
            for m in matches
        ]
    else:
        rows = (
            await db.execute(select(Articulo).where(Articulo.id.in_(articulos_ids)))
        ).scalars().all()
        ctx = [{"numero": r.numero, "titulo": r.sumilla or f"Artículo {r.numero}", "contenido": r.contenido} for r in rows]
        fuentes = []  # Ya fueron enviadas en la primera respuesta

    if not ctx:
        return {
            "respuesta": (
                "No encontré artículos de la Constitución vigente relacionados con tu consulta. "
                "Intenta describirla con otras palabras."
            ),
            "fuentes": [],
        }

    contexto_str = "\n\n".join(
        f"[Art. {a['numero']}] — {a['titulo']}\n{a['contenido']}" for a in ctx
    )
    system_with_ctx = f"{_SYSTEM}\n\nARTÍCULOS DISPONIBLES:\n{contexto_str}"

    messages = [{"role": "system", "content": system_with_ctx}]
    for m in (historial or []):
        role = "user" if m.get("rol") == "user" else "assistant"
        messages.append({"role": role, "content": m["texto"]})
    messages.append({"role": "user", "content": mensaje})

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.2,
        max_tokens=900,
    )

    return {
        "respuesta": completion.choices[0].message.content,
        "fuentes": fuentes,
    }
