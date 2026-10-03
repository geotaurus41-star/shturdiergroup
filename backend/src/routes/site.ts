import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/storefront', async (_req, res) => {
  const [featuredProducts, newArrivals, blogPosts, settings, collectionLines] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: { images: true, category: true, brand: true, material: true, theme: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: { images: true, category: true, brand: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.storeSettings.findFirst(),
    prisma.collection.count(),
  ]);

  res.json({
    featuredProducts,
    newArrivals,
    blogPosts,
    settings,
    collectionLines,
  });
});

router.get('/collections', async (_req, res) => {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ collections });
});

router.get('/search', async (req, res) => {
  const rawQuery = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

  if (!query) {
    return res.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ],
    },
    include: { images: true, brand: true, material: true, theme: true },
    take: 20,
  });

  res.json({ products });
});

router.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { products: true },
    orderBy: { name: 'asc' },
  });

  res.json({ categories });
});

router.get('/settings', async (_req, res) => {
  const settings = await prisma.storeSettings.findFirst();
  res.json({ settings });
});

router.get('/policies', async (_req, res) => {
  const policies = await prisma.policy.findMany({ orderBy: { title: 'asc' } });
  res.json({ policies });
});

export default router;
