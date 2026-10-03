export type ProductLike = {
  brand?: string | { name?: string } | null;
  material?: string | { name?: string } | null;
  theme?: string | { name?: string } | null;
  category?: string | { name?: string } | null;
  images?: Array<{ url?: string; alt?: string }> | null;
  name?: string;
};

export function getProductBrand(product?: ProductLike | null) {
  if (typeof product?.brand === 'string') return product.brand;
  if (product && typeof product.brand === 'object') return product.brand?.name ?? 'Maison d’Or';
  return 'Maison d’Or';
}

export function getProductMaterial(product?: ProductLike | null) {
  if (typeof product?.material === 'string') return product.material;
  if (product && typeof product.material === 'object') return product.material?.name ?? 'Sterling Silver';
  return 'Sterling Silver';
}

export function getProductTheme(product?: ProductLike | null) {
  if (typeof product?.theme === 'string') return product.theme;
  if (product && typeof product.theme === 'object') return product.theme?.name ?? 'Minimalist';
  return 'Minimalist';
}

export function getProductCategory(product?: ProductLike | null) {
  if (typeof product?.category === 'string') return product.category;
  if (product && typeof product.category === 'object') return product.category?.name ?? 'Collection';
  return 'Collection';
}

export function getProductImage(product?: ProductLike | null, fallback = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80') {
  return product?.images?.[0]?.url ?? fallback;
}
