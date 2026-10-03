import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const issueToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid registration payload.', issues: parsed.error.flatten() });
  }

  const { email, password, firstName, lastName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'CUSTOMER',
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  const token = issueToken(user);
  res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid login payload.', issues: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone,
  };

  const token = issueToken({ id: user.id, email: user.email, role: user.role });
  res.json({ user: safeUser, token });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { addresses: true, loyaltyAccount: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

router.post('/forgot-password', async (_req, res) => {
  res.json({ message: 'Password reset instructions would be sent to the registered email.' });
});

router.post('/reset-password', async (_req, res) => {
  res.json({ message: 'Password reset flow registered for production implementation.' });
});

export default router;
