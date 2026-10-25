import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products-feed.xml', '/api/products-feed'],
        disallow: ['/admin/', '/login', '/api/auth/'],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Google-Shopping'],
        allow: ['/', '/products-feed.xml', '/api/products-feed'],
      },
    ],
    sitemap: 'https://www.fathomstore.in/sitemap.xml',
  }
}
