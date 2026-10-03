import { Router } from 'express';
import { z } from 'zod';
import { MaterialType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(3),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  materialId: z.string().optional(),
  themeId: z.string().optional(),
  collectionId: z.string().optional(),
  stock: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED']).optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), isPrimary: z.boolean().optional() })).optional(),
  tags: z.array(z.string()).optional(),
  nameGeo: z.string().optional(),
  nameEng: z.string().optional(),
  descriptionGeo: z.string().optional(),
  descriptionEng: z.string().optional(),
  year: z.number().int().optional(),
  model: z.string().optional(),
  materialType: z.nativeEnum(MaterialType).optional(),
});
const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().min(3).optional(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).nullable().optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED']).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  nameGeo: z.string().optional(),
  nameEng: z.string().optional(),
  descriptionGeo: z.string().optional(),
  descriptionEng: z.string().optional(),
  year: z.number().int().nullable().optional(),
  model: z.string().nullable().optional(),
  collectionId: z.string().nullable().optional(),
  materialId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  materialType: z.nativeEnum(MaterialType).nullable().optional(),
}).strict();

router.get('/', async (req, res) => {
  const readQuery = (key: string) => {
    const value = req.query[key];
    return typeof value === 'string' ? value.trim() : Array.isArray(value) && typeof value[0] === 'string' ? value[0].trim() : '';
  };
  const query = readQuery('q');
  const collection = readQuery('collection');
  const materialType = readQuery('material');
  const model = readQuery('model');
  const sku = readQuery('sku');
  const year = Number(readQuery('year'));
  const minPrice = Number(readQuery('minPrice'));
  const maxPrice = Number(readQuery('maxPrice'));
  const where: Prisma.ProductWhereInput = { status: 'PUBLISHED', available: true };
  const conditions: Prisma.ProductWhereInput[] = [];
  if (readQuery('categoryId')) conditions.push({ categoryId: readQuery('categoryId') });
  if (readQuery('featured') === 'true') conditions.push({ featured: true });
  if (collection) conditions.push({ collection: { slug: { equals: collection, mode: 'insensitive' } } });
  if (Object.values(MaterialType).includes(materialType as MaterialType)) conditions.push({ materialType: materialType as MaterialType });
  if (model) conditions.push({ model: { contains: model, mode: 'insensitive' } });
  if (sku) conditions.push({ OR: [{ sku: { contains: sku, mode: 'insensitive' } }, { id: { contains: sku, mode: 'insensitive' } }] });
  if (Number.isInteger(year) && year > 0) conditions.push({ year });
  const priceRange: Prisma.FloatNullableFilter = {};
  if (readQuery('minPrice') && Number.isFinite(minPrice) && minPrice >= 0) priceRange.gte = minPrice;
  if (readQuery('maxPrice') && Number.isFinite(maxPrice) && maxPrice >= 0) priceRange.lte = maxPrice;
  if (Object.keys(priceRange).length) {
    conditions.push({
      OR: [
        { salePrice: null, price: priceRange as Prisma.FloatFilter },
        { salePrice: priceRange },
      ],
    });
  }
  if (query) {
    const terms = query.split(/\s+/).filter(Boolean);
    conditions.push({
      AND: terms.map((term) => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { nameGeo: { contains: term, mode: 'insensitive' } },
          { nameEng: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { descriptionGeo: { contains: term, mode: 'insensitive' } },
          { descriptionEng: { contains: term, mode: 'insensitive' } },
          { model: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } },
          { id: { contains: term, mode: 'insensitive' } },
          { tags: { has: term } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
          { category: { slug: { contains: term, mode: 'insensitive' } } },
          { collection: { name: { contains: term, mode: 'insensitive' } } },
          { collection: { nameGeo: { contains: term, mode: 'insensitive' } } },
          { collection: { nameEng: { contains: term, mode: 'insensitive' } } },
          { material: { name: { contains: term, mode: 'insensitive' } } },
        ],
      })),
    });
  }
  if (conditions.length) where.AND = conditions;

  const products = await prisma.product.findMany({
    where,
    include: { images: true, category: true, brand: true, material: true, theme: true, collection: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ products });
});

router.get('/featured', async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED', featured: true },
    include: { images: true, category: true, brand: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ products });
});

router.get('/:slug', async (req, res) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      brand: true,
      material: true,
      theme: true,
      collection: true,
    },
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const related = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: product.categoryId ?? undefined,
      id: { not: product.id },
    },
    include: { images: true },
    take: 4,
  });

  res.json({ product, related });
});

router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid product payload.', issues: parsed.error.flatten() });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      stock: parsed.data.stock ?? 0,
      featured: parsed.data.featured ?? false,
      available: parsed.data.available ?? true,
      tags: parsed.data.tags ?? [],
      status: parsed.data.status ?? 'PUBLISHED',
      images: {
        create: parsed.data.images ?? [{ url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', alt: 'Silver product' }],
      },
    },
    include: { images: true },
  });

  res.status(201).json({ product });
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid product update.', issues: parsed.error.flatten() });
  }
  const { images, ...data } = parsed.data;

  const product = await prisma.$transaction(async (transaction) => {
    if (images) {
      await transaction.productImage.deleteMany({ where: { productId } });
    }
    return transaction.product.update({
      where: { id: productId },
      data: {
        ...data,
        ...(images ? { images: { create: images } } : {}),
      },
      include: { images: true, category: true, brand: true, material: true, theme: true },
    });
  });

  res.json({ product });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await prisma.product.delete({ where: { id: productId } });
  res.json({ ok: true });
});

export default router;
