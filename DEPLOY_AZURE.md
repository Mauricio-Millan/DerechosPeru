# Despliegue en Azure — Estado actual y CI/CD

> Monorepo: **back** (FastAPI) → Azure Container Apps · **front** (Angular) → Azure Static Web Apps · **BD** → Supabase.

## URLs de producción

| Recurso | URL |
|---|---|
| Frontend | https://derechosperu.mmillan.tech |
| Backend (API) | https://backderechosperu.mmillan.tech/api |
| Docs interactivos | https://backderechosperu.mmillan.tech/docs |

## Despliegue continuo (ya configurado)

**No se necesita ningún comando manual.** Cada `git push` a `main` dispara el workflow correspondiente:

| Qué cambió | Workflow | Resultado |
|---|---|---|
| `BackDerechosPeru/**` | `back-derechos-AutoDeployTrigger-...yml` | Build Docker → ACR → redeploy Container App |
| `FrontDerechosPeru/**` | `frontend-swa.yml` | Build Angular → Static Web Apps |

El backend usa la imagen `derechosperuacr2026.azurecr.io/back-derechos:<sha>` con tag por commit SHA.

---

## Recursos Azure existentes

| Recurso | Nombre | Tipo |
|---|---|---|
| Resource Group | `rg-derechosperu` | Contenedor de todo |
| Container Registry | `derechosperuacr2026` | ACR Basic |
| Container App | `back-derechos` | FastAPI + embeddings |
| CA Environment | `cae-derechos` | Entorno compartido |
| Static Web App | `swa-derechos` | Angular SPA |

## GitHub Secrets necesarios

| Secret | Usado por |
|---|---|
| `BACKDERECHOS_AZURE_CLIENT_ID` | backend workflow (OIDC login) |
| `BACKDERECHOS_AZURE_TENANT_ID` | backend workflow (OIDC login) |
| `BACKDERECHOS_AZURE_SUBSCRIPTION_ID` | backend workflow (OIDC login) |
| `BACKDERECHOS_REGISTRY_USERNAME` | backend workflow (push a ACR) |
| `BACKDERECHOS_REGISTRY_PASSWORD` | backend workflow (push a ACR) |
| `SWA_DEPLOY_TOKEN` | frontend workflow (deploy a SWA) |

---

## Si necesitas recrear todo desde cero

### 0. Prerrequisitos

```powershell
winget install -e --id Microsoft.AzureCLI
az login
az extension add --name containerapp --upgrade
az provider register -n Microsoft.App --wait
az provider register -n Microsoft.OperationalInsights --wait
```

### 1. Variables base

```powershell
$RG    = "rg-derechosperu"
$LOC   = "eastus2"
$ACR   = "derechosperuacr2026"
$APP   = "back-derechos"
$ENVCA = "cae-derechos"
$SWA   = "swa-derechos"

az group create -n $RG -l $LOC
```

### 2. Container Registry

```powershell
az acr create -n $ACR -g $RG --sku Basic --admin-enabled true

$ACR_SERVER = az acr show -n $ACR --query loginServer -o tsv
$ACR_USER   = az acr credential show -n $ACR --query username -o tsv
$ACR_PASS   = az acr credential show -n $ACR --query "passwords[0].value" -o tsv
```

### 3. Backend (Container Apps)

```powershell
az containerapp env create -n $ENVCA -g $RG -l $LOC

# Leer DATABASE_URL desde .env local (no hardcodear)
$DBURL = (Get-Content BackDerechosPeru/.env | Where-Object { $_ -match "^DATABASE_URL=" }) -replace "DATABASE_URL=",""

$FRONT_URL = "https://derechosperu.mmillan.tech"

az containerapp create `
  -n $APP -g $RG --environment $ENVCA `
  --image "$ACR_SERVER/back-derechos:latest" `
  --registry-server $ACR_SERVER --registry-username $ACR_USER --registry-password $ACR_PASS `
  --target-port 8000 --ingress external `
  --min-replicas 0 --max-replicas 2 --cpu 1 --memory 2Gi `
  --secrets "db-url=$DBURL" `
  --env-vars DATABASE_URL=secretref:db-url `
             DEBUG=false `
             EMBEDDING_PROVIDER=local `
             EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 `
             EMBEDDING_DIM=384 `
             "CORS_ORIGINS=$FRONT_URL,https://witty-desert-0c59a5b0f.7.azurestaticapps.net"
```

### 4. Dominio del backend

```powershell
az containerapp hostname add -n $APP -g $RG --hostname backderechosperu.mmillan.tech
az containerapp hostname bind -n $APP -g $RG --hostname backderechosperu.mmillan.tech --validation-method CNAME
```

> En Cloudflare: CNAME `backderechosperu` → FQDN del Container App (DNS only, nube gris).

### 5. Frontend (Static Web Apps)

```powershell
az staticwebapp create -n $SWA -g $RG -l $LOC
$TOKEN = az staticwebapp secrets list -n $SWA -g $RG --query "properties.apiKey" -o tsv
# Guardar $TOKEN como secret SWA_DEPLOY_TOKEN en GitHub
```

El workflow `frontend-swa.yml` hace el build y deploy automáticamente en el siguiente push.

### 6. Dominio del frontend

```powershell
az staticwebapp hostname set -n $SWA -g $RG --hostname derechosperu.mmillan.tech
```

> En Cloudflare: CNAME `derechosperu` → hostname de SWA (DNS only, nube gris).

### 7. CI/CD automático

Configurar en Azure Portal → Container App `back-derechos` → **Deployment** → **Continuous deployment**:
- Registro: `derechosperuacr2026`
- Imagen: `back-derechos`
- Dockerfile: `./BackDerechosPeru/Dockerfile`

Azure crea el workflow y agrega los secrets de OIDC al repo automáticamente.

---

## Variables de entorno del backend en producción

Actualizarlas sin redesplegar:

```powershell
az containerapp update -n $APP -g $RG `
  --set-env-vars "CORS_ORIGINS=https://derechosperu.mmillan.tech,https://witty-desert-0c59a5b0f.7.azurestaticapps.net"
```

## Apagar para no gastar créditos

```powershell
# Solo el backend (el front y ACR siguen activos)
az containerapp update -n $APP -g $RG --min-replicas 0 --max-replicas 0

# Todo (irreversible, borra todo el grupo)
az group delete -n $RG --yes
```

## Notas

- **Cold start**: el primer request después de inactividad tarda ~75s (carga torch + modelo de embeddings). Es normal con `min-replicas=0`.
- **ACR Tasks bloqueado en Azure for Students**: el build se hace en GitHub Actions (runner Linux), no en ACR. Por eso existe el workflow `back-derechos-AutoDeployTrigger-...yml`.
- **Angular SSR**: el build genera `index.csr.html`; el workflow lo copia a `index.html` antes de subir a SWA.
- **Supabase**: la BD vive en Supabase (Postgres + pgvector). La `DATABASE_URL` apunta al pooler de Supavisor (puerto 6543, transaction mode).
