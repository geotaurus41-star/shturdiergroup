import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })),
  deliveryMethod: z.enum(['COURIER', 'PICKUP', 'PRIORITY']),
  address: z.string().optional(),
  paymentMethod: z.string().optional(),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid order payload.', issues: parsed.error.flatten() });
  }

  const { items, deliveryMethod, address, paymentMethod } = parsed.data;

  let subtotal = 0;
  const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      return res.status(404).json({ message: `Product ${item.productId} not found.` });
    }

    const unitPrice = Number(product.salePrice ?? product.price);
    subtotal += unitPrice * item.quantity;
    orderItems.push({ productId: item.productId, quantity: item.quantity, price: unitPrice });
  }

  const deliveryPrices: Record<string, number> = { COURIER: 25, PICKUP: 0, PRIORITY: 55 };
  const deliveryPrice = deliveryPrices[deliveryMethod] ?? 0;

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      subtotal,
      deliveryMethod,
      deliveryPrice,
      deliveryAddress: address ?? 'No address provided',
      paymentMethod: paymentMethod ?? 'MOCK',
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      items: { create: orderItems },
    },
    include: { items: true },
  });

  res.status(201).json({ order });
});

router.get('/mine', requireAuth, async (req: AuthenticatedRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ orders });
});

export default router;
