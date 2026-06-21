// Desarrollo: usa el proxy (proxy.conf.json) → /api se reenvía al backend local.
// La anon key de Supabase es pública por diseño (segura en el navegador).
export const environment = {
  production: false,
  apiUrl: '/api',
  supabaseUrl: 'https://ibwxubyunahygfsgljdg.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid3h1Ynl1bmFoeWdmc2dsamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzE2MjAsImV4cCI6MjA5NjgwNzYyMH0.hmOswWDxTaAFTiLixsWFeBw77msbFK_8j-CLGa5pXTI',
};
