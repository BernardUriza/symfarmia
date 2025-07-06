import { getSiteConfig } from './site-config'

// Utility to generate metadata for pages
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website'
}) {
  const siteConfig = getSiteConfig()
  
  const finalTitle = title || siteConfig.title
  const finalDescription = description || siteConfig.description
  const finalImage = image || siteConfig.image
  const finalUrl = url || siteConfig.url
  
  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: finalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      locale: 'es_ES',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [finalImage],
    },
  }
}