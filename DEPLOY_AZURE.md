# Despliegue en Azure (Container Apps + Static Web Apps)

> Monorepo: **back** (FastAPI) → Azure Container Apps · **front** (Angular) → Azure Static Web Apps · **BD** → Supabase.
> Comandos en **PowerShell**. Ejecútalos tú (el `az login` abre el navegador).

## 0. Prerrequisitos (una sola vez)

```powershell
# Instalar Azure CLI
winget install -e --id Microsoft.AzureCLI
# Cierra y reabre la terminal después de instalar.

az login                      # abre el navegador
az account show               # confirma la suscripción (Azure for Students)

# Extensión de Container Apps y proveedores
az extension add --name containerapp --upgrade
az provider register -n Microsoft.App --wait
az provider register -n Microsoft.OperationalInsights --wait
```

## 1. Variables

```powershell
$RG    = "rg-derechosperu"
$LOC   = "eastus2"
$ACR   = "derechosacr" + (Get-Random -Maximum 99999)   # debe ser único global
$APP   = "back-derechos"
$ENVCA = "cae-derechos"
$SWA   = "swa-derechos"

az group create -n $RG -l $LOC
```

## 2. Backend → Container Registry + Container Apps

```powershell
# Registro y build de la imagen EN LA NUBE (no necesitas Docker local)
az acr create -n $ACR -g $RG --sku Basic --admin-enabled true
az acr build -r $ACR -t backderechos:latest ./BackDerechosPeru

# Entorno de Container Apps
az containerapp env create -n $ENVCA -g $RG -l $LOC

# Credenciales del registro
$ACR_SERVER = az acr show -n $ACR --query loginServer -o tsv
$ACR_USER   = az acr credential show -n $ACR --query username -o tsv
$ACR_PASS   = az acr credential show -n $ACR --query "passwords[0].value" -o tsv

# Tu cadena de Supabase (la misma del .env, pooler 6543)
$DBURL = "postgresql+asyncpg://postgres.ibwxubyunahygfsgljdg:--88oscar88--@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# Crear la app (scale-to-zero, 1 vCPU / 2 GiB por el modelo de embeddings)
az containerapp create `
  -n $APP -g $RG --environment $ENVCA `
  --image "$ACR_SERVER/backderechos:latest" `
  --registry-server $ACR_SERVER --registry-username $ACR_USER --registry-password $ACR_PASS `
  --target-port 8000 --ingress external `
  --min-replicas 0 --max-replicas 2 --cpu 1 --memory 2Gi `
  --secrets "db-url=$DBURL" `
  --env-vars DATABASE_URL=secretref:db-url DEBUG=false `
             EMBEDDING_PROVIDER=local `
             EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 `
             EMBEDDING_DIM=384 `
             'CORS_ORIGINS=["https://placeholder"]'

# URL pública del backend
$BACK_URL = az containerapp show -n $APP -g $RG --query properties.configuration.ingress.fqdn -o tsv
Write-Output "Backend: https://$BACK_URL"
# Pruébalo:
#   https://$BACK_URL/health   y   https://$BACK_URL/docs
```

> El primer arranque es lento (carga torch + modelo). Las siguientes peticiones van rápidas hasta que escala a 0 por inactividad.

## 3. Frontend → Static Web Apps

```powershell
# 1) Pon la URL real del backend en el front
#    Edita FrontDerechosPeru/src/environments/environment.prod.ts
#    y reemplaza __BACKEND_URL__ por el valor de $BACK_URL (sin https://).

# 2) Build de producción
cd FrontDerechosPeru
npm ci
npm run build          # genera dist/FrontDerechosPeru/browser
cd ..

# 3) Crear la Static Web App y desplegar el build estático
az staticwebapp create -n $SWA -g $RG -l $LOC
$TOKEN = az staticwebapp secrets list -n $SWA -g $RG --query "properties.apiKey" -o tsv
npx @azure/static-web-apps-cli deploy ./FrontDerechosPeru/dist/FrontDerechosPeru/browser `
  --deployment-token $TOKEN --env production

$FRONT_URL = az staticwebapp show -n $SWA -g $RG --query defaultHostname -o tsv
Write-Output "Frontend: https://$FRONT_URL"
```

## 4. Conectar CORS (back ↔ front)

```powershell
# Autoriza el dominio del front en el backend
az containerapp update -n $APP -g $RG `
  --set-env-vars "CORS_ORIGINS=[`"https://$FRONT_URL`"]"
```

Abre `https://$FRONT_URL` y prueba estructura, búsqueda y consulta guiada.

## Orden y por qué
1. **Backend primero** → obtienes su URL.
2. **Front** con esa URL (`environment.prod.ts`) → build → deploy → obtienes la URL del front.
3. **CORS** del backend apuntando al front.

## Notas
- **Costo:** ACR Basic (~USD 5/mes) y Container Apps por uso; cubierto por los créditos de *Azure for Students*. Static Web Apps tiene tier gratuito.
- **Apagar para no gastar:** `az group delete -n $RG --yes` borra todo el grupo de recursos.
- **Actualizar backend:** repite `az acr build ...` y luego
  `az containerapp update -n $APP -g $RG --image $ACR_SERVER/backderechos:latest`.
- **Actualizar front:** `npm run build` + el `swa deploy` de nuevo.
- **SSR:** se despliega solo el build estático (`/browser`); el SSR de Angular se ignora en este hosting (suficiente para el portal).
