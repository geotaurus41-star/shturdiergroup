import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

const paymentSchema = z.object({
  orderId: z.string(),
  amount: z.number(),
  provider: z.string().optional(),
});

router.post('/initiate', async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payment payload.', issues: parsed.error.flatten() });
  }

  const { orderId, amount, provider } = parsed.data;
  const reference = `mock_${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount,
      provider: provider ? (provider as any) : 'MOCK',
      status: 'PENDING',
      transactionId: reference,
    },
  });

  res.status(201).json({
    payment,
    redirectUrl: `/payment/success?ref=${reference}`,
    status: 'PENDING',
  });
});

router.get('/callback', async (_req, res) => {
  res.json({ status: 'ok', message: 'Mock payment callback received.' });
});

router.get('/status/:id', async (req, res) => {
  const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found.' });
  }

  res.json({ payment });
});

export default router;
