import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const storeSettingsSchema = z.object({
  storeName: z.string().min(1),
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
  address: z.string(),
  currency: z.string().min(1),
  logoUrl: z.string().url().or(z.literal('')),
  homepageHero: z.record(z.string()),
  footer: z.record(z.string()),
  socialMedia: z.record(z.string()),
});
const collectionSchema = z.object({
  name: z.string().min(1),
  nameGeo: z.string().optional(),
  nameEng: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional(),
  descriptionGeo: z.string().optional(),
  descriptionEng: z.string().optional(),
  imageUrl: z.string().url().or(z.literal('')),
});
const policiesSchema = z.array(z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  titleGeo: z.string().optional(),
  titleEng: z.string().optional(),
  content: z.string(),
  contentGeo: z.string().optional(),
  contentEng: z.string().optional(),
}));
const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string(),
  excerptGeo: z.string().optional(),
  excerptEng: z.string().optional(),
  titleGeo: z.string().optional(),
  titleEng: z.string().optional(),
  content: z.string().min(1),
  contentGeo: z.string().optional(),
  contentEng: z.string().optional(),
  featuredImage: z.string().url().or(z.literal('')),
  author: z.string().min(1),
  published: z.boolean(),
});
router.get('/products', requireAuth, requireAdmin, async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { images: true, category: true, brand: true, material: true, theme: true },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ products });
});

router.get('/collections', requireAuth, requireAdmin, async (_req, res) => {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ collections });
});

router.post('/collections', requireAuth, requireAdmin, async (req, res) => {
  const parsed = collectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid collection.', issues: parsed.error.flatten() });
  }
  const collection = await prisma.collection.create({
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
    include: { _count: { select: { products: true } } },
  });
  res.status(201).json({ collection });
});

router.put('/collections/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = collectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid collection.', issues: parsed.error.flatten() });
  }
  const collection = await prisma.collection.update({
    where: { id },
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
    include: { _count: { select: { products: true } } },
  });
  res.json({ collection });
});

router.delete('/collections/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await prisma.$transaction([
    prisma.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } }),
    prisma.collection.delete({ where: { id } }),
  ]);
  res.json({ ok: true });
});

router.get('/blog', requireAuth, requireAdmin, async (_req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' } });
  res.json({ posts });
});

router.get('/policies', requireAuth, requireAdmin, async (_req, res) => {
  const policies = await prisma.policy.findMany({ orderBy: { title: 'asc' } });
  res.json({ policies });
});

router.put('/policies', requireAuth, requireAdmin, async (req, res) => {
  const parsed = policiesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid policies.', issues: parsed.error.flatten() });
  }
  const policies = await prisma.$transaction(
    parsed.data.map(({ key, ...data }) =>
      prisma.policy.upsert({ where: { key }, update: data, create: { key, ...data } }),
    ),
  );
  res.json({ policies });
});

router.post('/blog', requireAuth, requireAdmin, async (req, res) => {
  const parsed = blogPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid blog post.', issues: parsed.error.flatten() });
  }
  const post = await prisma.blogPost.create({
    data: { ...parsed.data, featuredImage: parsed.data.featuredImage || null, publishedAt: parsed.data.published ? new Date() : null },
  });
  res.status(201).json({ post });
});

router.put('/blog/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = blogPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid blog post.', issues: parsed.error.flatten() });
  }
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      featuredImage: parsed.data.featuredImage || null,
      publishedAt: parsed.data.published ? new Date() : null,
    },
  });
  res.json({ post });
});

router.get('/dashboard', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res) => {
  const [orders, products, customers, totalSales, monthlySales, recentOrders] = await Promise.all([
    prisma.order.findMany({ include: { items: true } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({
      _sum: { subtotal: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      include: { items: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: true },
    }),
  ]);

  const today = new Date();
  const todaysSales = orders.filter((order: { createdAt: Date; subtotal: number }) => {
    const created = new Date(order.createdAt);
    return created.toDateString() === today.toDateString();
  }).reduce((sum: number, order: { subtotal: number }) => sum + order.subtotal, 0);

  const totalRevenue = totalSales._sum.subtotal ?? 0;

  res.json({
    metrics: {
      totalSales: totalRevenue,
      todaysSales,
      monthlySales: monthlySales.reduce((sum: number, order: { subtotal: number }) => sum + order.subtotal, 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter((order: { orderStatus: string }) => order.orderStatus === 'PENDING').length,
      completedOrders: orders.filter((order: { orderStatus: string }) => order.orderStatus === 'DELIVERED').length,
      totalCustomers: customers,
      totalProducts: products,
      lowStockProducts: await prisma.product.count({ where: { stock: { lt: 5 } } }),
    },
    recentOrders,
  });
});

router.get('/customers', requireAuth, requireAdmin, async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  });

  res.json({ customers });
});

router.get('/settings', requireAuth, requireAdmin, async (_req, res) => {
  const settings = await prisma.storeSettings.findFirst();
  res.json({ settings });
});

router.put('/settings', requireAuth, requireAdmin, async (req, res) => {
  const parsed = storeSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid store settings.', issues: parsed.error.flatten() });
  }

  const data = {
    ...parsed.data,
    email: parsed.data.email || null,
    logoUrl: parsed.data.logoUrl || null,
    socialMedia: parsed.data.socialMedia,
  };
  const existing = await prisma.storeSettings.findFirst();
  const settings = existing
    ? await prisma.storeSettings.update({ where: { id: existing.id }, data })
    : await prisma.storeSettings.create({ data });
  res.json({ settings });
});

export default router;
