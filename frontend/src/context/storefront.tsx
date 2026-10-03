import { createContext, useContext } from 'react';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  images?: Array<{ url?: string; alt?: string }> | null;
  brand?: string | { name?: string } | null;
  material?: string | { name?: string } | null;
  theme?: string | { name?: string } | null;
  stock?: number | null;
  [key: string]: unknown;
};

export interface CartEntry {
  product: Product;
  quantity: number;
}

export interface AuthUser {
  email: string;
  name: string;
}

export interface CartContextValue {
  cart: CartEntry[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  itemCount: number;
}

export interface WishlistContextValue {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);
export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }
  return context;
}
