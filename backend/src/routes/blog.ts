import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
  });

  res.json({ posts });
});

router.get('/:slug', async (req, res) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    return res.status(404).json({ message: 'Blog post not found.' });
  }

  res.json({ post });
});

export default router;
