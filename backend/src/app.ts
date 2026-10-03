import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { resolve } from 'node:path';
import { env } from './config/env.js';
import authRouter from './routes/auth.js';
import productRouter from './routes/products.js';
import siteRouter from './routes/site.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';
import orderRouter from './routes/orders.js';
import blogRouter from './routes/blog.js';
import paymentRouter from './routes/payments.js';
import uploadRouter from './routes/uploads.js';

const app = express();
const uploadsDirectory = resolve(process.cwd(), 'uploads');
const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  }),
);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/uploads',
  express.static(uploadsDirectory, {
    dotfiles: 'deny',
    index: false,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Silver Boutique API is running.' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api', siteRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orders', orderRouter);
app.use('/api/blog', blogRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/admin/uploads', uploadRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.', details: err.message ?? 'Unknown error' });
});

export default app;
