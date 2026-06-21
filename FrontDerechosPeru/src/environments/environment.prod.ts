// Producción: URL pública del backend en Azure Container Apps.
// Reemplaza __BACKEND_URL__ por la URL real tras desplegar el backend
// (p. ej. https://back-derechos.xxxx.azurecontainerapps.io), y reconstruye el front.
export const environment = {
  production: true,
  apiUrl: 'https://back-derechos.braveocean-030c7a83.eastus2.azurecontainerapps.io/api',
};
