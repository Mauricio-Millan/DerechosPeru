"""Ingesta de constituciones por PDF: subir, revisar vs PDF y publicar (Sprint 6 — M8).

Flujo:
  POST /admin/ingest      -> sube PDF, extrae, crea versión 'borrador'
  GET  /admin/versions    -> versiones con progreso de revisión
  GET  .../qa             -> reporte QA estructural
  GET  .../articulos      -> artículos del borrador para el panel de revisión
  GET  .../pdf            -> URL firmada del PDF fuente
  PATCH /admin/articulos/{id}/review -> verificar/observar/editar un artículo
  GET  .../progress       -> avance de la revisión
  POST .../publish        -> publica (genera embeddings) si está 100% verificado
"""
from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, require_role
from app.core.database import get_db
from app.models import (
    Articulo,
    Capitulo,
    ConstitutionVersion,
    IngestJob,
    SourceDocument,
    Titulo,
)
from app.schemas.ingesta import (
    DraftArticuloOut,
    IngestResult,
    ProgressOut,
    QAReport,
    ReviewIn,
    SignedUrlOut,
    VersionOut,
)
from app.services import storage
from app.services.embeddings import embed_texts
from app.services.pdf_extract import extract_text

# etl es un paquete top-level de BackDerechosPeru
from etl.etlconstitucion import parse_constitution_text
from etl.verify_json import validate_structure

router = APIRouter(prefix="/admin", tags=["ingesta"])

_editor = require_role("editor", "admin")


def puede_publicar(progress: dict) -> bool:
    """Solo se publica si hay artículos y todos están verificados (función pura, testeable)."""
    return progress["total"] > 0 and progress["pendientes"] == 0 and progress["observados"] == 0


def _build_embedding_text(numero: int, sumilla: str | None, contenido: str) -> str:
    head = f"Artículo {numero}. {sumilla or ''}".strip()
    return f"{head}\n{contenido}"


async def _progress(db: AsyncSession, version_id: int) -> dict:
    rows = (
        await db.execute(
            select(Articulo.review_status, func.count())
            .where(Articulo.version_id == version_id)
            .group_by(Articulo.review_status)
        )
    ).all()
    counts = {estado: n for estado, n in rows}
    total = sum(counts.values())
    verificados = counts.get("verificado", 0)
    observados = counts.get("observado", 0)
    pendientes = counts.get("pendiente", 0)
    pct = round(verificados / total * 100) if total else 0
    return {
        "total": total,
        "verificados": verificados,
        "observados": observados,
        "pendientes": pendientes,
        "pct": pct,
    }


async def _rebuild_data(db: AsyncSession, version_id: int) -> dict:
    """Reconstruye el dict {titulos, capitulos, articulos} desde la BD para el QA."""
    titulos = (
        await db.execute(select(Titulo).where(Titulo.version_id == version_id))
    ).scalars().all()
    capitulos = (
        await db.execute(select(Capitulo).where(Capitulo.version_id == version_id))
    ).scalars().all()
    articulos = (
        await db.execute(select(Articulo).where(Articulo.version_id == version_id))
    ).scalars().all()

    tit_romano = {t.id: t.numero_romano for t in titulos}
    cap_info = {c.id: (tit_romano.get(c.titulo_id), c.numero_romano) for c in capitulos}

    return {
        "titulos": [{"numero_romano": t.numero_romano, "denominacion": t.denominacion} for t in titulos],
        "capitulos": [
            {
                "titulo_romano": tit_romano.get(c.titulo_id),
                "numero_romano": c.numero_romano,
                "denominacion": c.denominacion,
            }
            for c in capitulos
        ],
        "articulos": [
            {
                "titulo_romano": tit_romano.get(a.titulo_id),
                "capitulo_romano": cap_info.get(a.capitulo_id, (None, None))[1],
                "numero": a.numero,
                "contenido": a.contenido,
            }
            for a in articulos
        ],
    }


@router.post("/ingest", response_model=IngestResult)
async def ingest(
    file: UploadFile = File(...),
    label: str = Form(...),
    year: int = Form(...),
    promulgated_on: str | None = Form(None),
    user: CurrentUser = Depends(_editor),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El archivo debe ser un PDF")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Archivo vacío")

    # 1) Extraer + parsear PRIMERO, en memoria. Si la extracción falla, no se
    #    escribe NADA (ni versión, ni PDF en Storage, ni artículos): atómico.
    try:
        texto = extract_text(pdf_bytes)
        data = parse_constitution_text(texto)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"No se pudo extraer el PDF: {e}")

    # 2) Versión en borrador (no vigente, invisible al sitio público)
    version = ConstitutionVersion(
        label=label,
        year=year,
        promulgated_on=date.fromisoformat(promulgated_on) if promulgated_on else None,
        is_current=False,
        status="borrador",
        notes="Ingesta por PDF (M8).",
    )
    db.add(version)
    await db.flush()

    # 3) Insertar estructura (pendiente de revisión, sin publicar)
    titulo_by_romano: dict[str, Titulo] = {}
    for order, t in enumerate(data["titulos"]):
        obj = Titulo(version_id=version.id, numero_romano=t["numero_romano"], denominacion=t["denominacion"], display_order=order)
        db.add(obj)
        titulo_by_romano[t["numero_romano"]] = obj
    await db.flush()

    cap_by_key: dict[tuple, Capitulo] = {}
    for order, c in enumerate(data["capitulos"]):
        t = titulo_by_romano.get(c["titulo_romano"])
        if not t:
            continue
        obj = Capitulo(version_id=version.id, titulo_id=t.id, numero_romano=c["numero_romano"], denominacion=c["denominacion"], display_order=order)
        db.add(obj)
        cap_by_key[(c["titulo_romano"], c["numero_romano"])] = obj
    await db.flush()

    for a in data["articulos"]:
        tit = titulo_by_romano.get(a["titulo_romano"])
        cap = cap_by_key.get((a["titulo_romano"], a.get("capitulo_romano")))
        db.add(
            Articulo(
                version_id=version.id,
                titulo_id=tit.id if tit else None,
                capitulo_id=cap.id if cap else None,
                numero=a["numero"],
                sumilla=a.get("sumilla"),
                contenido=a["contenido"],
                is_published=False,
                review_status="pendiente",
            )
        )

    stats = {
        "titulos": len(data["titulos"]),
        "capitulos": len(data["capitulos"]),
        "articulos": len(data["articulos"]),
    }
    storage_path = f"{version.id}/{file.filename or 'fuente.pdf'}"
    db.add(
        SourceDocument(
            version_id=version.id,
            storage_path=storage_path,
            original_filename=file.filename,
            content_type=file.content_type,
            size_bytes=len(pdf_bytes),
            uploaded_by=user.id,
        )
    )
    db.add(IngestJob(version_id=version.id, status="extraido", filename=file.filename, stats=stats, created_by=user.id))

    # 4) Subir el PDF a Storage como ÚLTIMO paso falible antes del commit.
    #    Si falla, no hacemos commit -> la transacción entera se descarta.
    try:
        storage.upload_pdf(pdf_bytes, storage_path)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"No se pudo subir el PDF a Storage: {e}")

    # ponytail: si el upload pasa pero el commit falla, queda un PDF huérfano en
    # Storage (raro e inofensivo en bucket privado); la BD nunca queda a medias.
    await db.commit()

    return IngestResult(
        version_id=version.id,
        label=version.label,
        year=version.year,
        stats=stats,
        qa=QAReport(**validate_structure(data)),
    )


@router.get("/versions", response_model=list[VersionOut])
async def listar_versiones(user: CurrentUser = Depends(_editor), db: AsyncSession = Depends(get_db)):
    versiones = (
        await db.execute(select(ConstitutionVersion).order_by(ConstitutionVersion.year.desc()))
    ).scalars().all()

    out: list[VersionOut] = []
    for v in versiones:
        total = await db.scalar(select(func.count()).where(Articulo.version_id == v.id)) or 0
        verif = await db.scalar(
            select(func.count()).where(Articulo.version_id == v.id, Articulo.review_status == "verificado")
        ) or 0
        out.append(
            VersionOut(
                id=v.id,
                label=v.label,
                year=v.year,
                status=v.status,
                is_current=v.is_current,
                promulgated_on=v.promulgated_on,
                total_articulos=total,
                verificados=verif,
            )
        )
    return out


@router.get("/versions/{version_id}/qa", response_model=QAReport)
async def qa(version_id: int, user: CurrentUser = Depends(_editor), db: AsyncSession = Depends(get_db)):
    data = await _rebuild_data(db, version_id)
    return QAReport(**validate_structure(data))


@router.get("/versions/{version_id}/articulos", response_model=list[DraftArticuloOut])
async def articulos_borrador(version_id: int, user: CurrentUser = Depends(_editor), db: AsyncSession = Depends(get_db)):
    rows = (
        await db.execute(
            select(Articulo, Titulo.denominacion, Capitulo.denominacion)
            .outerjoin(Titulo, Articulo.titulo_id == Titulo.id)
            .outerjoin(Capitulo, Articulo.capitulo_id == Capitulo.id)
            .where(Articulo.version_id == version_id)
            .order_by(Articulo.numero)
        )
    ).all()
    return [
        DraftArticuloOut(
            id=a.id,
            numero=a.numero,
            sumilla=a.sumilla,
            contenido=a.contenido,
            review_status=a.review_status,
            titulo=tit_denom,
            capitulo=cap_denom,
        )
        for a, tit_denom, cap_denom in rows
    ]


@router.get("/versions/{version_id}/pdf", response_model=SignedUrlOut)
async def pdf_firmado(version_id: int, user: CurrentUser = Depends(_editor), db: AsyncSession = Depends(get_db)):
    doc = (
        await db.execute(
            select(SourceDocument).where(SourceDocument.version_id == version_id).order_by(SourceDocument.id.desc())
        )
    ).scalars().first()
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No hay PDF fuente para esta versión")
    try:
        url = storage.create_signed_url(doc.storage_path)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"No se pudo firmar la URL: {e}")
    return SignedUrlOut(url=url)


@router.patch("/articulos/{articulo_id}/review", response_model=DraftArticuloOut)
async def revisar_articulo(
    articulo_id: int,
    payload: ReviewIn,
    user: CurrentUser = Depends(_editor),
    db: AsyncSession = Depends(get_db),
):
    art = await db.get(Articulo, articulo_id)
    if not art:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Artículo no encontrado")

    art.review_status = payload.review_status
    if payload.contenido is not None:
        art.contenido = payload.contenido
    art.reviewer_id = user.id
    art.reviewed_at = datetime.now()
    await db.commit()
    await db.refresh(art)

    return DraftArticuloOut(
        id=art.id,
        numero=art.numero,
        sumilla=art.sumilla,
        contenido=art.contenido,
        review_status=art.review_status,
    )


@router.get("/versions/{version_id}/progress", response_model=ProgressOut)
async def progreso(version_id: int, user: CurrentUser = Depends(_editor), db: AsyncSession = Depends(get_db)):
    return ProgressOut(**await _progress(db, version_id))


@router.post("/versions/{version_id}/publish", response_model=VersionOut)
async def publicar(version_id: int, user: CurrentUser = Depends(_editor), db: AsyncSession = Depends(get_db)):
    version = await db.get(ConstitutionVersion, version_id)
    if not version:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Versión no encontrada")

    prog = await _progress(db, version_id)
    if not puede_publicar(prog):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"No se puede publicar: {prog['pendientes']} pendientes, {prog['observados']} observados de {prog['total']}.",
        )

    qa = validate_structure(await _rebuild_data(db, version_id))
    if not qa["ok"]:
        raise HTTPException(status.HTTP_409_CONFLICT, f"El QA estructural falló: {qa['errors']}")

    # Generar embeddings por lotes y publicar
    articulos = (
        await db.execute(select(Articulo).where(Articulo.version_id == version_id).order_by(Articulo.numero))
    ).scalars().all()

    BATCH = 64
    for i in range(0, len(articulos), BATCH):
        chunk = articulos[i : i + BATCH]
        vectors = embed_texts([_build_embedding_text(o.numero, o.sumilla, o.contenido) for o in chunk])
        for o, v in zip(chunk, vectors):
            o.embedding = v
            o.is_published = True
        await db.flush()

    version.status = "publicada"
    await db.commit()

    total = len(articulos)
    return VersionOut(
        id=version.id,
        label=version.label,
        year=version.year,
        status=version.status,
        is_current=version.is_current,
        promulgated_on=version.promulgated_on,
        total_articulos=total,
        verificados=total,
    )
