import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin123!@#', 12);

  await prisma.user.upsert({
    where: { email: 'admin@silverboutique.com' },
    update: {},
    create: {
      email: 'admin@silverboutique.com',
      passwordHash: adminPasswordHash,
      firstName: 'Silver',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: 'store-settings' },
    update: {},
    create: {
      id: 'store-settings',
      storeName: 'STURDIER GROUP',
      email: 'hello@silverboutique.ge',
      phone: '+995 555 123 456',
      address: 'Tbilisi, Georgia',
      currency: 'GEL',
      taxRate: 0,
      socialMedia: { instagram: 'https://instagram.com', facebook: 'https://facebook.com' },
      homepageHero: {},
      footer: {},
    },
  });

  const categories = [
    'Rings',
    'Necklaces',
    'Bracelets',
    'Earrings',
    'Home Objects',
    'Gift Sets',
  ];

  const brands = ['Aurelia Atelier', 'Maison d’Or', 'Sable & Stone', 'Nera Studio'];
  const materials = ['Sterling Silver', '925 Silver', 'Silver with pearl', 'Silver plated brass'];
  const themes = ['Minimalist', 'Heritage', 'Architectural', 'Evening', 'Home Objects'];
  const collections = ['Noir', 'Halo', 'Antique Glow', 'Sculpted Light'];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') },
    });
  }

  for (const brand of brands) {
    const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.brand.upsert({ where: { name: brand }, update: {}, create: { name: brand, slug } });
  }

  for (const material of materials) {
    const slug = material.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.material.upsert({ where: { name: material }, update: {}, create: { name: material, slug } });
  }

  for (const theme of themes) {
    const slug = theme.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.theme.upsert({ where: { name: theme }, update: {}, create: { name: theme, slug } });
  }

  for (const collection of collections) {
    const slug = collection.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.collection.upsert({ where: { name: collection }, update: {}, create: { name: collection, slug } });
  }

  const categoryData = await prisma.category.findMany();
  const brandData = await prisma.brand.findMany();
  const materialData = await prisma.material.findMany();
  const themeData = await prisma.theme.findMany();
  const collectionData = await prisma.collection.findMany();

  const productCatalog = [
    { name: 'Luna Halo Ring', category: 'Rings', brand: 'Aurelia Atelier', material: 'Sterling Silver', theme: 'Minimalist', collection: 'Halo', price: 420, salePrice: 390, sku: 'SR-001', stock: 12, featured: true },
    { name: 'Velvet Thread Necklace', category: 'Necklaces', brand: 'Maison d’Or', material: '925 Silver', theme: 'Heritage', collection: 'Antique Glow', price: 580, salePrice: null, sku: 'SR-002', stock: 8, featured: true },
    { name: 'Noor Pearl Cuff', category: 'Bracelets', brand: 'Sable & Stone', material: 'Silver with pearl', theme: 'Evening', collection: 'Noir', price: 510, salePrice: 470, sku: 'SR-003', stock: 14, featured: true },
    { name: 'Solstice Drop Earrings', category: 'Earrings', brand: 'Aurelia Atelier', material: 'Sterling Silver', theme: 'Evening', collection: 'Sculpted Light', price: 360, salePrice: 320, sku: 'SR-004', stock: 9, featured: false },
    { name: 'Mira Dish Set', category: 'Home Objects', brand: 'Maison d’Or', material: 'Silver plated brass', theme: 'Home Objects', collection: 'Sculpted Light', price: 720, salePrice: null, sku: 'SR-005', stock: 5, featured: true },
    { name: 'Sable Arch Bracelet', category: 'Bracelets', brand: 'Sable & Stone', material: '925 Silver', theme: 'Architectural', collection: 'Noir', price: 470, salePrice: 430, sku: 'SR-006', stock: 11, featured: false },
    { name: 'Aster Signet', category: 'Rings', brand: 'Aurelia Atelier', material: 'Sterling Silver', theme: 'Heritage', collection: 'Antique Glow', price: 390, salePrice: null, sku: 'SR-007', stock: 7, featured: false },
    { name: 'Violet Tear Pendant', category: 'Necklaces', brand: 'Maison d’Or', material: '925 Silver', theme: 'Architectural', collection: 'Halo', price: 620, salePrice: 590, sku: 'SR-008', stock: 10, featured: true },
    { name: 'Silica Twist Earrings', category: 'Earrings', brand: 'Nera Studio', material: 'Sterling Silver', theme: 'Minimalist', collection: 'Halo', price: 330, salePrice: 295, sku: 'SR-009', stock: 15, featured: false },
    { name: 'Orion Heart Charm', category: 'Gift Sets', brand: 'Sable & Stone', material: 'Silver with pearl', theme: 'Heritage', collection: 'Antique Glow', price: 680, salePrice: 650, sku: 'SR-010', stock: 6, featured: true },
    { name: 'Eden Oval Ring', category: 'Rings', brand: 'Nera Studio', material: 'Sterling Silver', theme: 'Minimalist', collection: 'Halo', price: 460, salePrice: 420, sku: 'SR-011', stock: 13, featured: true },
    { name: 'Dune Cuff', category: 'Bracelets', brand: 'Maison d’Or', material: '925 Silver', theme: 'Evening', collection: 'Noir', price: 550, salePrice: null, sku: 'SR-012', stock: 8, featured: false },
    { name: 'Iris Pendant', category: 'Necklaces', brand: 'Nera Studio', material: 'Silver plated brass', theme: 'Home Objects', collection: 'Sculpted Light', price: 495, salePrice: 445, sku: 'SR-013', stock: 12, featured: true },
    { name: 'Sonata Hoops', category: 'Earrings', brand: 'Aurelia Atelier', material: 'Sterling Silver', theme: 'Minimalist', collection: 'Halo', price: 280, salePrice: null, sku: 'SR-014', stock: 18, featured: false },
    { name: 'Dahlia Stack Ring', category: 'Rings', brand: 'Sable & Stone', material: '925 Silver', theme: 'Heritage', collection: 'Antique Glow', price: 440, salePrice: 405, sku: 'SR-015', stock: 9, featured: true },
    { name: 'Mikado Serving Tray', category: 'Home Objects', brand: 'Maison d’Or', material: 'Silver plated brass', theme: 'Home Objects', collection: 'Sculpted Light', price: 820, salePrice: 780, sku: 'SR-016', stock: 4, featured: true },
    { name: 'Rowan Chain', category: 'Necklaces', brand: 'Nera Studio', material: 'Sterling Silver', theme: 'Architecture', collection: 'Noir', price: 540, salePrice: null, sku: 'SR-017', stock: 7, featured: false },
    { name: 'Nero Link Bracelet', category: 'Bracelets', brand: 'Aurelia Atelier', material: '925 Silver', theme: 'Architectural', collection: 'Noir', price: 610, salePrice: 570, sku: 'SR-018', stock: 10, featured: true },
    { name: 'Moonwell Earrings', category: 'Earrings', brand: 'Maison d’Or', material: 'Silver with pearl', theme: 'Evening', collection: 'Sculpted Light', price: 390, salePrice: null, sku: 'SR-019', stock: 11, featured: false },
    { name: 'Hearth Keepsake Set', category: 'Gift Sets', brand: 'Sable & Stone', material: '925 Silver', theme: 'Heritage', collection: 'Antique Glow', price: 910, salePrice: 860, sku: 'SR-020', stock: 3, featured: true },
  ];

  for (const product of productCatalog) {
    const category = categoryData.find((item: { name: string }) => item.name === product.category);
    const brand = brandData.find((item: { name: string }) => item.name === product.brand);
    const material = materialData.find((item: { name: string }) => item.name === product.material);
    const theme = themeData.find((item: { name: string }) => item.name === product.theme);
    const collection = collectionData.find((item: { name: string }) => item.name === product.collection);

    const suggestedMaterialType = product.material === 'Silver with pearl'
      ? 'SILVER_STONES'
      : product.material === 'Silver plated brass'
        ? null
        : 'SILVER_ONLY';
    const savedProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        name: product.name,
        slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: product.sku,
        price: product.price,
        salePrice: product.salePrice,
        description: `${product.name} is a refined silver piece designed with artisanal detail for everyday luxury.`,
        shortDescription: 'Crafted for understated elegance and lasting beauty.',
        categoryId: category?.id,
        brandId: brand?.id,
        materialId: material?.id,
        themeId: theme?.id,
        collectionId: collection?.id,
        tags: ['silver', 'luxury', 'craftsmanship'],
        materialType: suggestedMaterialType,
        year: 2025,
        stock: product.stock,
        featured: product.featured,
        available: true,
        status: 'PUBLISHED',
        images: {
          create: [{ url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80', alt: product.name, isPrimary: true }],
        },
      },
    });
    const missingClassification = !savedProduct.materialType && suggestedMaterialType;
    if (missingClassification || !savedProduct.year) {
      await prisma.product.update({
        where: { id: savedProduct.id },
        data: {
          ...(missingClassification ? { materialType: suggestedMaterialType } : {}),
          ...(!savedProduct.year ? { year: 2025 } : {}),
        },
      });
    }
  }

  const blogPosts = [
    { title: 'The quiet beauty of sterling silver', slug: 'the-quiet-beauty-of-sterling-silver', excerpt: 'Why sterling silver remains the most enduring canvas for heirloom jewelry design.', content: 'Silver offers a timeless balance between craft and elegance.', author: 'Nino Tsereteli', seoTitle: 'The quiet beauty of sterling silver', seoDescription: 'An editorial look at silver craftsmanship and lasting design.' },
    { title: 'How to style silver layering in Georgian interiors', slug: 'how-to-style-silver-layering-in-georgian-interiors', excerpt: 'Neutral tones and delicate silver objects create warmth and depth.', content: 'Layering silver with textured materials adds sophistication to modern homes.', author: 'Mariam K.', seoTitle: 'Styling silver in Georgian interiors', seoDescription: 'A how-to guide to styling silver pieces at home.' },
    { title: 'Craftsmanship stories behind our collections', slug: 'craftsmanship-stories-behind-our-collections', excerpt: 'From sketch to final polish, every piece carries quiet human attention.', content: 'Our studio works in small batches and carefully hand-finishes each item.', author: 'Luka S.', seoTitle: 'Craftsmanship stories behind our collections', seoDescription: 'Behind the scenes of the silver studio.' },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        featuredImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  const demoContactMessages = [
    { name: 'Mira', email: 'mira@example.com', phone: '+995 555 001 111', subject: 'Order question', message: 'How long is standard courier delivery in Tbilisi?', status: 'NEW' as const },
    { name: 'Nika', email: 'nika@example.com', phone: '+995 555 002 222', subject: 'Custom design inquiry', message: 'I would like a custom silver bracelet made for a gift.', status: 'READ' as const },
  ];
  for (const message of demoContactMessages) {
    const exists = await prisma.contactMessage.findFirst({ where: { email: message.email, subject: message.subject } });
    if (!exists) await prisma.contactMessage.create({ data: message });
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
