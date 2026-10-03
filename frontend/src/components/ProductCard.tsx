import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart, useWishlist } from '../context/storefront';
import { getProductBrand, getProductImage } from '../utils/product';
import { useLanguage } from '../context/language';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    nameGeo?: string | null;
    nameEng?: string | null;
    slug: string;
    price: number;
    salePrice?: number | null;
    brand?: string | { name?: string } | null;
    stock?: number | null;
    images?: Array<{ url?: string; alt?: string }> | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const image = getProductImage(product as any, 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80');
  const productName = language === 'GEO' ? product.nameGeo ?? product.name : product.nameEng ?? product.name;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 shadow-[0_18px_38px_rgba(84,70,62,0.08)] transition-transform duration-200 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img src={image} alt={productName} className="h-80 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <button
          onClick={() => toggleWishlist(product as any)}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-[#8a7666] shadow-sm"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={isWishlisted(product.id) ? '#8a7666' : 'none'} />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.18rem] text-[#8a7666]/70">{getProductBrand(product as any)}</p>
          <span className="text-xs uppercase tracking-[0.16rem] text-[#607977]">{product.stock ?? 6} left</span>
        </div>
        <Link to={`/product/${product.slug}`} className="block text-xl font-light text-[#40332f]">{productName}</Link>
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-[#40332f]">₾{product.salePrice ?? product.price}</span>
          {product.salePrice && <span className="text-sm text-[#8a7666]/60 line-through">₾{product.price}</span>}
        </div>
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => addToCart(product as any, 1)} className="rounded-full bg-[#d7e6ee] px-4 py-2 text-xs uppercase tracking-[0.12rem] text-[#3f312d]">
            {t('Add to cart')}
          </button>
          <Link to={`/product/${product.slug}`} className="text-sm uppercase tracking-[0.14rem] text-[#8a7666]">{t('Details')}</Link>
        </div>
      </div>
    </article>
  );
}
