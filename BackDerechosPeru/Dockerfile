FROM python:3.12-slim

WORKDIR /code

ENV HF_HUB_DISABLE_SYMLINKS_WARNING=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
# Torch CPU-only PRIMERO: evita arrastrar ~2.5 GB de librerías CUDA (GPU) que no
# usamos. Así sentence-transformers ya encuentra torch satisfecho y no baja la
# variante CUDA. Reduce la imagen de ~5.8 GB a ~1.5 GB (cold start mucho más rápido).
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Pre-descargar el modelo de embeddings DENTRO de la imagen, para que el
# cold start en Container Apps no tenga que bajarlo (~120 MB) cada vez.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

COPY app ./app
# etl es un paquete top-level que importa la ingesta (app/api/routes/ingesta.py).
# Sin esto, `import etl...` falla al arrancar y el contenedor queda Unhealthy.
COPY etl ./etl

EXPOSE 8000
# Azure Container Apps inyecta el puerto en $PORT (default 8000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
