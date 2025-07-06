// Centralized site configuration
export function getSiteUrl() {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    
    // If localhost or development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
      return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }
  }
  
  // Check environment variables for production URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Default production URL
  return 'https://symfarmia.com';
}

export function getSiteConfig() {
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