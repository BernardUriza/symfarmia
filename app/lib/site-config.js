// Centralized site configuration
export function getSiteUrl() {
  // Check environment variables for production URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Check if we're in development environment
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // Default production URL
  return 'https://symfarmia.netlify.app/';
}

// Static site configuration to avoid hydration issues
function createSiteConfig() {
  const baseUrl = getSiteUrl();
  return {
    name: 'SYMFARMIA',
    title: 'SYMFARMIA - Plataforma inteligente para médicos independientes',
    description: 'Convierte consultas médicas en reportes clínicos automáticamente. Habla durante tu consulta y obtén un reporte médico estructurado en segundos.',
    url: baseUrl,
    image: `${baseUrl}/banner2.png`,
    favicon: `${baseUrl}/favicon.ico`,
  };
}

export const SITE_CONFIG = createSiteConfig();

export function getSiteConfig() {
  return SITE_CONFIG;
}