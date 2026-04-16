import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.fathomstore.in'
  const today = new Date()

  // ─── Static Pages ───────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // ─── Dynamic Product Pages ───────────────────────────────────
  let productPages: MetadataRoute.Sitemap = []

  try {
    const productsSnapshot = await getDocs(collection(db, 'products'))
    productPages = productsSnapshot.docs.map((doc) => ({
      url: `${baseUrl}/product/${doc.id}`,
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Sitemap: Failed to fetch products from Firebase', error)
    // Falls back to static pages only — sitemap still works
  }

  return [...staticPages, ...productPages]
}
