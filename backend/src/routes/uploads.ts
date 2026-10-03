import { randomUUID } from 'node:crypto';
import { lstat, mkdir, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const uploadsDirectory = resolve(process.cwd(), 'uploads');
const maxFileSize = 5 * 1024 * 1024;
const storedImagePath = /^\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(jpg|png|webp)$/i;
const multipartUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize, files: 1, fields: 0, parts: 1 },
});

const parseImage = (buffer: Buffer) => {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { extension: 'png', mimeType: 'image/png' };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }
  return null;
};

const receiveImage = (req: Request, res: Response, next: NextFunction) => {
  multipartUpload.single('image')(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ message: 'Image must be 5 MB or smaller.' });
      return;
    }

    res.status(400).json({ message: 'Invalid image upload. Send one image in the "image" field.' });
  });
};

router.post('/', requireAuth, requireAdmin, receiveImage, async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'An image file is required in the "image" field.' });
    return;
  }

  const image = parseImage(file.buffer);
  if (!image) {
    res.status(400).json({ message: 'Only JPG, JPEG, PNG, and WEBP images are supported.' });
    return;
  }

  const filename = `${randomUUID()}.${image.extension}`;
  try {
    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(join(uploadsDirectory, filename), file.buffer, {
      flag: 'wx',
    });
  } catch (error) {
    console.error('Failed to save uploaded image.', error);
    res.status(500).json({ message: 'Unable to save uploaded image.' });
    return;
  }

  const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  res.status(201).json({ url, filename, mimeType: image.mimeType, size: file.size });
});

router.delete('/', requireAuth, requireAdmin, async (req, res) => {
  const { url } = req.body as { url?: unknown };
  if (typeof url !== 'string') {
    res.status(400).json({ message: 'An uploaded image URL is required.' });
    return;
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(url, 'http://uploads.local');
  } catch {
    res.status(400).json({ message: 'Invalid uploaded image URL.' });
    return;
  }

  const isRelative = url.startsWith('/');
  if (
    (isRelative && imageUrl.origin !== 'http://uploads.local') ||
    (!isRelative &&
      (!['http:', 'https:'].includes(imageUrl.protocol) || imageUrl.username || imageUrl.password)) ||
    imageUrl.search ||
    imageUrl.hash
  ) {
    res.status(400).json({ message: 'Invalid uploaded image URL.' });
    return;
  }

  const match = storedImagePath.exec(imageUrl.pathname);
  if (!match) {
    res.status(400).json({ message: 'URL must identify an image stored by this service.' });
    return;
  }

  const filename = `${match[1]}.${match[2].toLowerCase()}`;
  const filePath = join(uploadsDirectory, filename);
  try {
    const file = await lstat(filePath);
    if (!file.isFile()) {
      res.status(404).json({ message: 'Uploaded image not found.' });
      return;
    }
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ message: 'Uploaded image not found.' });
      return;
    }
    console.error('Failed to delete uploaded image.', error);
    res.status(500).json({ message: 'Unable to delete uploaded image.' });
    return;
  }

  res.status(204).end();
});

export default router;
