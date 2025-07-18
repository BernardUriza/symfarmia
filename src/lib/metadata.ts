import { getSiteConfig } from './site-config';

interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  itemProp?: string;
}

interface OpenGraph {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: OpenGraphImage[];
  locale: string;
  type: string;
}

interface Twitter {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  images: string[];
}

interface Metadata {
  title: string;
  description: string;
  openGraph: OpenGraph;
  twitter: Twitter;
}

// Utility to generate metadata for pages
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website'
}: MetadataOptions): Metadata {
  const siteConfig = getSiteConfig();
  
  const finalTitle = title || siteConfig.title;
  const finalDescription = description || siteConfig.description;
  const finalImage = image || siteConfig.image;
  const finalUrl = url || siteConfig.url;
  
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
          itemProp: "image" 
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
  };
}