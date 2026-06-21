"""Endpoints del foro de discusión (Sprint 3 — M5)."""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, get_current_user, get_optional_user, require_role
from app.core.database import get_db
from app.models import ForumPost, ForumThread, PostVote, Profile
from app.schemas.forum import (
    MejorRespuestaIn,
    PostCreate,
    PostOut,
    ThreadCreate,
    ThreadDetailOut,
    ThreadOut,
    VoteIn,
)

router = APIRouter(prefix="/foro", tags=["foro"])


def decidir_voto(actual: int | None, nuevo: int) -> str:
    if actual is None:
        return "insertar"
    if actual == nuevo:
        return "borrar"
    return "actualizar"


@router.get("/threads", response_model=list[ThreadOut])
async def listar_hilos(
    articulo_id: int | None = None,
    category_id: int | None = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    sub = (
        select(ForumPost.thread_id, func.count(ForumPost.id).label("total"))
        .group_by(ForumPost.thread_id)
        .subquery()
    )

    query = (
        select(ForumThread, Profile.display_name, func.coalesce(sub.c.total, 0))
        .outerjoin(Profile, ForumThread.author_id == Profile.id)
        .outerjoin(sub, ForumThread.id == sub.c.thread_id)
    )

    if articulo_id is not None:
        query = query.where(ForumThread.articulo_id == articulo_id)
    if category_id is not None:
        query = query.where(ForumThread.category_id == category_id)

    query = query.order_by(ForumThread.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)

    threads = []
    for thread, display_name, total in result:
        threads.append(
            ThreadOut(
                id=thread.id,
                titulo=thread.titulo,
                contenido=thread.contenido,
                articulo_id=thread.articulo_id,
                category_id=thread.category_id,
                author_id=thread.author_id,
                author_name=display_name,
                is_closed=thread.is_closed,
                best_post_id=thread.best_post_id,
                total_respuestas=total,
                created_at=thread.created_at,
            )
        )
    return threads


@router.post("/threads", response_model=ThreadOut)
async def crear_hilo(
    payload: ThreadCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    display_name = await db.scalar(select(Profile.display_name).where(Profile.id == user.id))

    thread = ForumThread(
        titulo=payload.titulo,
        contenido=payload.contenido,
        articulo_id=payload.articulo_id,
        category_id=payload.category_id,
        author_id=user.id,
        is_closed=False,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)

    return ThreadOut(
        id=thread.id,
        titulo=thread.titulo,
        contenido=thread.contenido,
        articulo_id=thread.articulo_id,
        category_id=thread.category_id,
        author_id=thread.author_id,
        author_name=display_name,
        is_closed=thread.is_closed,
        best_post_id=thread.best_post_id,
        total_respuestas=0,
        created_at=thread.created_at,
    )


@router.get("/threads/{id}", response_model=ThreadDetailOut)
async def detalle_hilo(
    id: int,
    user: CurrentUser | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    thread_query = (
        select(ForumThread, Profile.display_name)
        .outerjoin(Profile, ForumThread.author_id == Profile.id)
        .where(ForumThread.id == id)
    )
    thread_res = (await db.execute(thread_query)).first()
    if not thread_res:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    thread, display_name = thread_res

    total = await db.scalar(select(func.count(ForumPost.id)).where(ForumPost.thread_id == id))

    posts_query = (
        select(ForumPost, Profile.display_name)
        .outerjoin(Profile, ForumPost.author_id == Profile.id)
        .where(ForumPost.thread_id == id)
    )
    posts_res = (await db.execute(posts_query)).all()

    post_ids = [p.id for p, _ in posts_res]

    votos_dict = {}
    mi_voto_dict = {}

    if post_ids:
        votes_sum_query = (
            select(PostVote.post_id, func.coalesce(func.sum(PostVote.value), 0))
            .where(PostVote.post_id.in_(post_ids))
            .group_by(PostVote.post_id)
        )
        votes_sum_res = (await db.execute(votes_sum_query)).all()
        votos_dict = {post_id: int(votos) for post_id, votos in votes_sum_res}

        if user:
            mi_voto_query = (
                select(PostVote.post_id, PostVote.value)
                .where(PostVote.user_id == user.id, PostVote.post_id.in_(post_ids))
            )
            mi_voto_res = (await db.execute(mi_voto_query)).all()
            mi_voto_dict = {post_id: value for post_id, value in mi_voto_res}

    posts_out = []
    for post, author_name in posts_res:
        votos = votos_dict.get(post.id, 0)
        mi_voto = mi_voto_dict.get(post.id, 0)
        posts_out.append(
            PostOut(
                id=post.id,
                thread_id=post.thread_id,
                contenido=post.contenido,
                author_id=post.author_id,
                author_name=author_name,
                is_verified=post.is_verified,
                votos=votos,
                mi_voto=mi_voto,
                created_at=post.created_at,
            )
        )

    # Ordenar: verificadas primero, luego por votos desc, luego created_at asc
    posts_out.sort(key=lambda p: (0 if p.is_verified else 1, -p.votos, p.created_at))

    return ThreadDetailOut(
        id=thread.id,
        titulo=thread.titulo,
        contenido=thread.contenido,
        articulo_id=thread.articulo_id,
        category_id=thread.category_id,
        author_id=thread.author_id,
        author_name=display_name,
        is_closed=thread.is_closed,
        best_post_id=thread.best_post_id,
        total_respuestas=total,
        created_at=thread.created_at,
        respuestas=posts_out,
    )


@router.post("/threads/{id}/respuestas", response_model=PostOut)
async def crear_respuesta(
    id: int,
    payload: PostCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await db.get(ForumThread, id)
    if not thread:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    if thread.is_closed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El hilo está cerrado")

    post = ForumPost(
        thread_id=id,
        author_id=user.id,
        contenido=payload.contenido,
        is_verified=False,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    display_name = await db.scalar(select(Profile.display_name).where(Profile.id == user.id))

    return PostOut(
        id=post.id,
        thread_id=post.thread_id,
        contenido=post.contenido,
        author_id=post.author_id,
        author_name=display_name,
        is_verified=post.is_verified,
        votos=0,
        mi_voto=0,
        created_at=post.created_at,
    )


@router.patch("/threads/{id}/cerrar", response_model=ThreadOut)
async def cerrar_hilo(
    id: int,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = (
        await db.execute(
            select(ForumThread, Profile.display_name)
            .outerjoin(Profile, ForumThread.author_id == Profile.id)
            .where(ForumThread.id == id)
        )
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    thread, display_name = res

    if thread.author_id != user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para cerrar este hilo")

    thread.is_closed = not thread.is_closed
    await db.commit()
    await db.refresh(thread)

    total = await db.scalar(select(func.count(ForumPost.id)).where(ForumPost.thread_id == id))

    return ThreadOut(
        id=thread.id,
        titulo=thread.titulo,
        contenido=thread.contenido,
        articulo_id=thread.articulo_id,
        category_id=thread.category_id,
        author_id=thread.author_id,
        author_name=display_name,
        is_closed=thread.is_closed,
        best_post_id=thread.best_post_id,
        total_respuestas=total,
        created_at=thread.created_at,
    )


@router.patch("/threads/{id}/mejor-respuesta", response_model=ThreadOut)
async def mejor_respuesta(
    id: int,
    payload: MejorRespuestaIn,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = (
        await db.execute(
            select(ForumThread, Profile.display_name)
            .outerjoin(Profile, ForumThread.author_id == Profile.id)
            .where(ForumThread.id == id)
        )
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    thread, display_name = res

    if thread.author_id != user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")

    post = await db.get(ForumPost, payload.post_id)
    if not post or post.thread_id != id:
        raise HTTPException(status_code=400, detail="La respuesta no pertenece a este hilo")

    thread.best_post_id = payload.post_id
    await db.commit()
    await db.refresh(thread)

    total = await db.scalar(select(func.count(ForumPost.id)).where(ForumPost.thread_id == id))

    return ThreadOut(
        id=thread.id,
        titulo=thread.titulo,
        contenido=thread.contenido,
        articulo_id=thread.articulo_id,
        category_id=thread.category_id,
        author_id=thread.author_id,
        author_name=display_name,
        is_closed=thread.is_closed,
        best_post_id=thread.best_post_id,
        total_respuestas=total,
        created_at=thread.created_at,
    )


@router.delete("/threads/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_hilo(
    id: int,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await db.get(ForumThread, id)
    if not thread:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    if thread.author_id != user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este hilo")

    await db.delete(thread)
    await db.commit()


@router.post("/respuestas/{id}/voto")
async def votar_respuesta(
    id: int,
    payload: VoteIn,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(ForumPost, id)
    if not post:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")

    vote = (
        await db.execute(
            select(PostVote).where(PostVote.post_id == id, PostVote.user_id == user.id)
        )
    ).scalar_one_or_none()

    actual_val = vote.value if vote else None
    decision = decidir_voto(actual_val, payload.value)

    if decision == "borrar":
        await db.delete(vote)
        mi_voto = 0
    elif decision == "actualizar":
        vote.value = payload.value
        mi_voto = payload.value
    else:  # insertar
        new_vote = PostVote(post_id=id, user_id=user.id, value=payload.value)
        db.add(new_vote)
        mi_voto = payload.value

    await db.commit()

    votos = await db.scalar(
        select(func.coalesce(func.sum(PostVote.value), 0))
        .where(PostVote.post_id == id)
    ) or 0

    return {"votos": int(votos), "mi_voto": mi_voto}


@router.patch("/respuestas/{id}/verificar", response_model=PostOut)
async def verificar_respuesta(
    id: int,
    user: CurrentUser = Depends(require_role("experto", "editor", "admin")),
    db: AsyncSession = Depends(get_db),
):
    res = (
        await db.execute(
            select(ForumPost, Profile.display_name)
            .outerjoin(Profile, ForumPost.author_id == Profile.id)
            .where(ForumPost.id == id)
        )
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    post, author_name = res

    if post.is_verified:
        post.is_verified = False
        post.verified_by = None
        post.verified_at = None
    else:
        post.is_verified = True
        post.verified_by = user.id
        post.verified_at = func.now()

    await db.commit()
    await db.refresh(post)

    votos = await db.scalar(
        select(func.coalesce(func.sum(PostVote.value), 0))
        .where(PostVote.post_id == id)
    ) or 0

    mi_voto = await db.scalar(
        select(PostVote.value)
        .where(PostVote.post_id == id, PostVote.user_id == user.id)
    ) or 0

    return PostOut(
        id=post.id,
        thread_id=post.thread_id,
        contenido=post.contenido,
        author_id=post.author_id,
        author_name=author_name,
        is_verified=post.is_verified,
        votos=int(votos),
        mi_voto=mi_voto or 0,
        created_at=post.created_at,
    )


@router.delete("/respuestas/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_respuesta(
    id: int,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(ForumPost, id)
    if not post:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    if post.author_id != user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta respuesta")

    await db.delete(post)
    await db.commit()
