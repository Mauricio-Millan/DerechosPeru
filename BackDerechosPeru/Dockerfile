FROM python:3.12-slim

WORKDIR /code

ENV HF_HUB_DISABLE_SYMLINKS_WARNING=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-descargar el modelo de embeddings DENTRO de la imagen, para que el
# cold start en Container Apps no tenga que bajarlo (~120 MB) cada vez.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

COPY app ./app

EXPOSE 8000
# Azure Container Apps inyecta el puerto en $PORT (default 8000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
