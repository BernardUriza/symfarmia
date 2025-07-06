// Centralized site configuration
export function getSiteUrl() {
  // Check environment variables for production URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Check if we're in development environment
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Default production URL
  return 'https://symfarmia.netlify.app/';
}

// Static site configuration to avoid hydration issues
export const SITE_CONFIG = {
  name: 'SYMFARMIA',
  title: 'SYMFARMIA - Plataforma inteligente para médicos independientes',
  description: 'Convierte consultas médicas en reportes clínicos automáticamente. Habla durante tu consulta y obtén un reporte médico estructurado en segundos.',
  url: getSiteUrl(),
  image: `${getSiteUrl()}/banner2.png`,
  favicon: `${getSiteUrl()}/favicon.ico`,
};

export function getSiteConfig() {
  return SITE_CONFIG;
}