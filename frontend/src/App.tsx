import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Filter, Linkedin, LogIn, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { PageShell, FeatureTile, StatBox, Panel, StepItem } from './components/PageShell';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import {
  useCart,
  useWishlist,
  type CartContextValue,
  type CartEntry,
  type WishlistContextValue,
  CartContext,
  WishlistContext,
} from './context/storefront';
import { fallbackBlogPosts, fallbackProducts } from './data/mockData';
import { apiBase, getBlogPost, getBlogPosts, getCollections, getPolicies, getProducts, getStorefront, searchProducts } from './lib/api';
import { getProductBrand, getProductMaterial, getProductTheme } from './utils/product';
import { useLanguage } from './context/language';

type Product = (typeof fallbackProducts)[number] & {
  nameGeo?: string | null;
  nameEng?: string | null;
  descriptionGeo?: string | null;
  descriptionEng?: string | null;
  materialType?: string | null;
};
type AccountProfile = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  addresses?: Array<{ street: string; city: string; country?: string; apartment?: string | null; isDefault?: boolean }>;
  loyaltyAccount?: { points: number } | null;
};
type AccountOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  deliveryMethod: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryAddress?: string | null;
  subtotal: number;
  deliveryPrice: number;
  items: Array<{ id: string; product: { name: string }; quantity: number; price: number }>;
};

function HomePage() {
  const [storefront, setStorefront] = useState<any>(null);
  const [collections, setCollections] = useState<Array<{ id: string; slug: string; name: string; nameGeo?: string | null; nameEng?: string | null; imageUrl?: string | null }>>([]);
  const { language, t } = useLanguage();

  useEffect(() => {
    getStorefront().then((data) => setStorefront(data));
    getCollections().then(setCollections);
  }, []);

  const products = storefront?.featuredProducts ?? fallbackProducts;
  const posts = storefront?.blogPosts ?? fallbackBlogPosts;
  const content = storefront?.settings?.homepageHero ?? {};
  const copy = (key: string, fallback: string) => language === 'GEO'
    ? content[`${key}Geo`] ?? t(fallback)
    : content[`${key}Eng`] ?? content[key] ?? fallback;

  return (
    <PageShell>
      <section className="container-shell py-12 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.28rem] text-[#8a7666]/80">{copy('eyebrow', 'Crafted in silver')}</p>
            <h1 className="max-w-xl text-4xl font-light leading-[1.1] text-[#3f312d] md:text-6xl">{copy('title', 'Elegant silver pieces for life’s meaningful moments.')}</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#8a7666]/80">{copy('subtitle', 'Luxury silver jewelry and handcrafted objects shaped by heritage, balance, and modern simplicity.')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="rounded-full bg-[#8a7666] px-6 py-3 text-sm uppercase tracking-[0.12rem] text-white">{copy('heroShopLabel', 'Shop collection')}</Link>
              <Link to="/about" className="rounded-full border border-[#8a7666]/20 bg-white/60 px-6 py-3 text-sm uppercase tracking-[0.12rem] text-[#8a7666]">{copy('heroStoryLabel', 'Our story')}</Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-[#8a7666]/10 bg-white/40 p-3 shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
            <img src={content.heroImage ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80'} alt="Jewelry styled portrait" className="h-[560px] w-full rounded-[1.5rem] object-cover" />
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureTile icon={<Sparkles size={18} />} title={copy('feature1Title', 'Handmade quality')} text={copy('feature1Description', 'Each piece is carefully shaped and finished in small-batch production.')} />
          <FeatureTile icon={<ShieldCheck size={18} />} title={copy('feature2Title', 'Authentic silver')} text={copy('feature2Description', 'Sterling and 925 silver selected for lasting brilliance and purity.')} />
          <FeatureTile icon={<Truck size={18} />} title={copy('feature3Title', 'Worldwide delivery')} text={copy('feature3Description', 'Secure, premium shipping with attentive packaging and careful handling.')} />
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{copy('featuredEyebrow', 'Featured collection')}</p>
            <h2 className="mt-2 text-3xl font-light text-[#3f312d]">{copy('featuredTitle', 'Most-loved pieces')}</h2>
          </div>
          <Link to="/shop" className="flex items-center gap-2 text-sm uppercase tracking-[0.12rem] text-[#8a7666]">{copy('featuredLink', 'View all')} <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {collections.length > 0 && (
        <section className="container-shell pb-16">
          <div className="mb-8"><p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Collection')}</p><h2 className="mt-2 text-3xl font-light text-[#3f312d]">{t('Collection Lines')}</h2></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {collections.slice(0, 4).map((collection) => <Link key={collection.id} to={`/shop?collection=${encodeURIComponent(collection.slug)}`} className="group overflow-hidden rounded-2xl bg-white/60">
              {collection.imageUrl && <img src={collection.imageUrl} alt={language === 'GEO' ? collection.nameGeo ?? collection.name : collection.nameEng ?? collection.name} className="h-52 w-full object-cover transition-transform group-hover:scale-105" />}
              <div className="p-4 text-lg">{language === 'GEO' ? collection.nameGeo ?? collection.name : collection.nameEng ?? collection.name}</div>
            </Link>)}
          </div>
        </section>
      )}

      <section className="bg-[#e6e2dc] py-16">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <img src={content.philosophyImage ?? 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'} alt="Silver craftsmanship" className="h-[480px] w-full rounded-[2rem] object-cover" />
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{copy('philosophyEyebrow', 'Our philosophy')}</p>
            <h2 className="mt-3 text-3xl font-light text-[#3f312d]">{copy('philosophyTitle', 'Quiet luxury, crafted to endure.')}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#8a7666]/80">{copy('philosophyDescription', 'Our collections reflect heritage, considered design, and the enduring value of thoughtful materials. Each object is designed to feel personal, intentional, and beautiful with time.')}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <StatBox label={copy('stat1Label', 'Collections')} value={copy('stat1Value', '12+')} />
              <StatBox label={copy('stat2Label', 'Crafted pieces')} value={copy('stat2Value', '3k+')} />
              <StatBox label={copy('stat3Label', 'Years of heritage')} value={copy('stat3Value', '18')} />
              <StatBox label={t('Collection Lines')} value={String(storefront?.collectionLines ?? collections.length)} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{copy('journalEyebrow', 'Journal')}</p>
            <h2 className="mt-2 text-3xl font-light text-[#3f312d]">{copy('journalTitle', 'Latest insights')}</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((post: any, index: number) => (
            <article key={post.id ?? index} className="overflow-hidden rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
              <img src={post.featuredImage ?? 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'} alt={post.title} className="h-64 w-full object-cover" />
              <div className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.18rem] text-[#8a7666]/70">Story</p>
                <h3 className="text-xl font-light text-[#3f312d]">{post.title ?? 'Silver journal'}</h3>
                <p className="text-sm leading-6 text-[#8a7666]/80">{post.excerpt ?? 'A closer look at handcrafted silver and modern styling.'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Array<{ id: string; slug: string; name: string; nameGeo?: string | null; nameEng?: string | null }>>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { language, t } = useLanguage();
  const filterQuery = searchParams.toString();

  useEffect(() => {
    getProducts(filterQuery).then(setProducts);
  }, [filterQuery]);
  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set(key, value.trim());
    else next.delete(key);
    setSearchParams(next);
  };
  const clearFilters = () => setSearchParams({});

  const filterFields = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <label className="block text-sm">{t('Keyword Search')}
        <input value={searchParams.get('q') ?? ''} onChange={(event) => updateFilter('q', event.target.value)} placeholder="ring / ბეჭედი" className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5" />
      </label>
      <fieldset><legend className="text-sm">{t('Price range')}</legend><div className="mt-2 grid grid-cols-2 gap-2">
        <input aria-label={t('Min GEL')} type="number" min="0" value={searchParams.get('minPrice') ?? ''} onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder={t('Min GEL')} className="min-w-0 rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5" />
        <input aria-label={t('Max GEL')} type="number" min="0" value={searchParams.get('maxPrice') ?? ''} onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder={t('Max GEL')} className="min-w-0 rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5" />
      </div></fieldset>
      <label className="block text-sm">{t('Collection')}
        <select value={searchParams.get('collection') ?? ''} onChange={(event) => updateFilter('collection', event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5">
          <option value="">{t('All collections')}</option>
          {collections.map((collection) => <option key={collection.id} value={collection.slug}>{language === 'GEO' ? collection.nameGeo ?? collection.name : collection.nameEng ?? collection.name}</option>)}
        </select>
      </label>
      <label className="block text-sm">{t('Year')}
        <input type="number" value={searchParams.get('year') ?? ''} onChange={(event) => updateFilter('year', event.target.value)} placeholder="2025" className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5" />
      </label>
      <label className="block text-sm">{t('Model')}
        <input value={searchParams.get('model') ?? ''} onChange={(event) => updateFilter('model', event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5" />
      </label>
      <label className="block text-sm">{t('Product ID / SKU')}
        <input value={searchParams.get('sku') ?? ''} onChange={(event) => updateFilter('sku', event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5" />
      </label>
      <label className="block text-sm">{t('Material')}
        <select value={searchParams.get('material') ?? ''} onChange={(event) => updateFilter('material', event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-3 py-2.5">
          <option value="">{t('All materials')}</option>
          <option value="SILVER_ONLY">{t('Silver only')}</option>
          <option value="SILVER_GOLD">{t('Silver & Gold')}</option>
          <option value="SILVER_DIAMONDS">{t('Silver & Diamonds')}</option>
          <option value="SILVER_STONES">{t('Silver & Stones')}</option>
        </select>
      </label>
    </div>
  );

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">Shop</p>
          <h1 className="mt-3 w-full text-4xl font-light text-[#3f312d]">{t('Curated silver essentials')}</h1>
          <p className="text-sm text-[#8a7666]/80">{products.length} {t('products found')}</p>
          <button onClick={() => setFiltersOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-full border border-[#8a7666]/20 bg-white px-4 py-2 text-sm md:hidden"><Filter size={16} /> {t('Filters')}</button>
          <button onClick={clearFilters} className="rounded-full border border-[#8a7666]/20 bg-white px-4 py-2 text-sm">{t('Clear Filters')}</button>
        </div>
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} rounded-2xl border border-[#8a7666]/10 bg-[#e6e2dc] p-4 lg:block`}>
            <h2 className="mb-4 text-lg">{t('Filters')}</h2>
            {filterFields}
          </aside>
          <div>
            {products.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : <p className="rounded-2xl bg-white/60 p-8 text-[#8a7666]">{t('No products match these filters.')}</p>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ProductPage() {
  const location = useLocation();
  const slug = location.pathname.split('/').pop() ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, itemCount } = useCart();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (!slug) return;
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'}/products/${slug}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setProduct(data.product || data))
      .catch(() => {
        const found = fallbackProducts.find((item) => item.slug === slug) ?? fallbackProducts[0];
        setProduct(found);
      });
  }, [slug]);

  if (!product) {
    return (
      <PageShell>
        <div className="container-shell py-20 text-[#8a7666]">Loading...</div>
      </PageShell>
    );
  }

  const image = product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80';
  const primaryPrice = product.salePrice ?? product.price;
  const productName = language === 'GEO' ? product.nameGeo ?? product.name : product.nameEng ?? product.name;
  const productDescription = language === 'GEO' ? product.descriptionGeo ?? product.description : product.descriptionEng ?? product.description;

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-[#8a7666]/10 bg-white/40 p-4">
            <img src={image} alt={productName} className="h-[620px] w-full rounded-[1.4rem] object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{getProductBrand(product)}</p>
            <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{productName}</h1>
            <div className="mt-5 flex items-center gap-4">
              <span className="text-2xl font-medium text-[#3f312d]">₾{primaryPrice}</span>
              {product.salePrice && <span className="text-lg text-[#8a7666]/60 line-through">₾{product.price}</span>}
            </div>
            <p className="mt-6 text-base leading-7 text-[#8a7666]/80">{productDescription}</p>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="h-10 w-10 rounded-full border border-[#8a7666]/15 bg-white text-lg text-[#3f312d]"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-lg text-[#3f312d]">{quantity}</span>
              <button
                onClick={() => setQuantity((value) => value + 1)}
                className="h-10 w-10 rounded-full border border-[#8a7666]/15 bg-white text-lg text-[#3f312d]"
              >
                +
              </button>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-[#8a7666]/80">
              <div className="flex justify-between border-b border-[#8a7666]/10 pb-2"><span>{t('Material')}</span><span>{getProductMaterial(product)}</span></div>
              <div className="flex justify-between border-b border-[#8a7666]/10 pb-2"><span>{t('Model')}</span><span>{product.model ?? 'Classic'}</span></div>
              <div className="flex justify-between border-b border-[#8a7666]/10 pb-2"><span>{t('Year')}</span><span>{product.year ?? '2025'}</span></div>
              <div className="flex justify-between border-b border-[#8a7666]/10 pb-2"><span>{t('Theme')}</span><span>{getProductTheme(product)}</span></div>
              <div className="flex justify-between border-b border-[#8a7666]/10 pb-2"><span>{t('Availability')}</span><span>{product.stock ? t('In stock') : t('Sold out')}</span></div>
            </div>
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => addToCart(product, quantity)}
                className="rounded-full bg-[#8a7666] px-5 py-3 text-xs uppercase tracking-[0.12rem] text-white"
              >
                {t('Add to cart')}
              </button>
              <button className="rounded-full border border-[#8a7666]/20 bg-white px-5 py-3 text-xs uppercase tracking-[0.12rem] text-[#8a7666]">
                Buy now
              </button>
            </div>
            <div className="mt-4 text-xs uppercase tracking-[0.15rem] text-[#8a7666]/60">Cart items: {itemCount}</div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 p-6 lg:col-span-2">
            <h2 className="mb-4 text-2xl font-light text-[#3f312d]">{t('Detailed description')}</h2>
            <p className="text-base leading-7 text-[#8a7666]/80">{productDescription}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#8a7666]/10 bg-[#e6e2dc] p-6">
            <h2 className="mb-4 text-2xl font-light text-[#3f312d]">{t('Specifications')}</h2>
            <ul className="space-y-3 text-sm text-[#8a7666]/80">
              <li>Material: {getProductMaterial(product)}</li>
              <li>Model: {product.model ?? 'Classic'}</li>
              <li>Theme: {getProductTheme(product)}</li>
              <li>Brand: {getProductBrand(product)}</li>
              <li>Year: {product.year ?? '2025'}</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function AboutPage() {
  const [storefront, setStorefront] = useState<any>(null);
  const { language, t } = useLanguage();
  useEffect(() => {
    getStorefront().then(setStorefront);
  }, []);
  const content = storefront?.settings?.homepageHero ?? {};
  const copy = (key: string, fallback: string) => language === 'GEO'
    ? content[`${key}Geo`] ?? t(fallback)
    : content[`${key}Eng`] ?? content[key] ?? fallback;

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.22rem] text-[#8a7666]/70">{t('About us')}</p>
          <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{copy('aboutTitle', 'The artistry of enduring silver')}</h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <img src={content.aboutImage ?? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'} alt="silver workshop" className="h-[560px] w-full rounded-[2rem] object-cover" />
          <div className="space-y-6 text-base leading-7 text-[#8a7666]/80">
            <p>{copy('aboutParagraph1', 'We design silver objects with restraint, detail, and purpose. Our pieces balance handcrafted warmth with refined contemporary structure.')}</p>
            <p>{copy('aboutParagraph2', 'From concept to completion, every form is shaped to feel quietly luxurious and meaningful. The collection reflects heritage, material honesty, and the slower rituals of everyday beauty.')}</p>
            <p>{copy('aboutParagraph3', 'Our studio values elegance without excess, authenticity without spectacle, and craftsmanship that grows more beautiful over time.')}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [storefront, setStorefront] = useState<any>(null);
  const { language, t } = useLanguage();
  useEffect(() => {
    getStorefront().then(setStorefront);
  }, []);
  const settings = storefront?.settings ?? {};
  const content = settings.homepageHero ?? {};

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setContactError('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Could not send your message.');
      setSubmitted(true);
      form.reset();
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Contact')}</p>
          <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{language === 'GEO'
            ? content.contactTitleGeo ?? t(content.contactTitleEng ?? content.contactTitle ?? 'We’d love to hear from you')
            : content.contactTitleEng ?? content.contactTitle ?? 'We’d love to hear from you'}</h1>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5 rounded-[1.75rem] bg-[#e6e2dc] p-8 text-[#8a7666]">
            <div><p className="text-xs uppercase tracking-[0.15rem] text-[#8a7666]/70">{t('Phone')}</p><p className="mt-2">{settings.phone ?? '+995 555 123 456'}</p></div>
            <div><p className="text-xs uppercase tracking-[0.15rem] text-[#8a7666]/70">{t('Email')}</p><p className="mt-2"><a href={`mailto:${settings.email ?? 'founder@sturdiergroup.com'}`}>{settings.email ?? 'founder@sturdiergroup.com'}</a></p></div>
            <div><p className="text-xs uppercase tracking-[0.15rem] text-[#8a7666]/70">{t('Address')}</p><p className="mt-2">{settings.address ?? 'Tbilisi, Georgia'}</p></div>
            <a href={settings.socialMedia?.linkedin ?? 'https://www.linkedin.com/company/sturdier/'} target="_blank" rel="noreferrer" aria-label="STURDIER GROUP on LinkedIn" className="inline-flex items-center gap-2 text-[#2867B2]"><Linkedin size={20} /> LinkedIn</a>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.75rem] border border-[#8a7666]/10 bg-white/60 p-8">
            <input name="name" required minLength={2} className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Name')} />
            <input name="email" required type="email" className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Email')} />
            <input name="phone" type="tel" className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Phone')} />
            <input name="subject" required minLength={2} className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Subject')} />
            <textarea name="message" required minLength={10} className="min-h-[140px] rounded-[1.25rem] border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Message')} />
            {contactError && <p role="alert" className="text-sm text-red-700">{contactError}</p>}
            <button type="submit" className="rounded-full bg-[#8a7666] px-6 py-3 text-xs uppercase tracking-[0.12rem] text-white">
              {submitting ? '…' : submitted ? t('Message sent') : t('Send message')}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

function PoliciesPage() {
  const { language, t } = useLanguage();
  const [policies, setPolicies] = useState<Array<{ key: string; title: string; titleGeo?: string | null; titleEng?: string | null; content: string; contentGeo?: string | null; contentEng?: string | null }>>([]);
  useEffect(() => {
    getPolicies().then(setPolicies);
  }, []);

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Customer policies')}</p>
          <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{t('Policies')}</h1>
        </div>
        <div className="grid gap-6">
          {policies.map((policy) => (
            <div key={policy.title} className="rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 p-6">
              <h2 className="text-xl font-light text-[#3f312d]">{language === 'GEO' ? policy.titleGeo ?? t(policy.title) : policy.titleEng ?? policy.title}</h2>
              <p className="mt-3 text-base leading-7 text-[#8a7666]/80">{language === 'GEO' ? policy.contentGeo ?? policy.content : policy.contentEng ?? policy.content}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function PaymentPage() {
  const [paymentPolicy, setPaymentPolicy] = useState<{ title: string; titleGeo?: string | null; titleEng?: string | null; content: string; contentGeo?: string | null; contentEng?: string | null } | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    getPolicies().then((items) => {
      setPaymentPolicy(items.find((item: { key: string }) => item.key === 'payment') ?? null);
    });
  }, []);

  const content = paymentPolicy
    ? language === 'GEO' ? paymentPolicy.contentGeo ?? paymentPolicy.content : paymentPolicy.contentEng ?? paymentPolicy.content
    : '';
  const title = paymentPolicy
    ? language === 'GEO' ? paymentPolicy.titleGeo ?? t('Payment information') : paymentPolicy.titleEng ?? paymentPolicy.title
    : t('Payment information');

  return (
    <PageShell>
      <div className="container-shell py-16">
        <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Customer information')}</p>
        <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{title}</h1>
        {content
          ? <div className="mt-8 space-y-4 rounded-[1.5rem] border border-[#8a7666]/10 bg-white/50 p-6 text-base leading-7 text-[#8a7666]/90">
            {content.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          : <p className="mt-8 rounded-2xl bg-white/50 p-6 text-[#8a7666]">{t('Payment details are not available yet.')}</p>}
      </div>
    </PageShell>
  );
}

function AccountPage() {
  const [user, setUser] = useState<AccountProfile | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const { language, t } = useLanguage();
  const profileAddress = user?.addresses?.find((address) => address.isDefault) ?? user?.addresses?.[0];

  useEffect(() => {
    const token = localStorage.getItem('silver-auth-token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${apiBase}/auth/me`, { headers }),
      fetch(`${apiBase}/orders/mine`, { headers }),
    ]).then(async ([profileResponse, ordersResponse]) => {
      if (!profileResponse.ok || !ordersResponse.ok) throw new Error('Please sign in again.');
      const profile = await profileResponse.json();
      const orderData = await ordersResponse.json();
      setUser(profile.user);
      setOrders(orderData.orders);
    }).catch(() => {
      localStorage.removeItem('silver-auth-token');
      setLoginError(t('Please sign in to continue.'));
    });
  }, [language]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const firstName = String(formData.get('firstName') ?? '');
    const lastName = String(formData.get('lastName') ?? '');
    setLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${apiBase}/auth/${registering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? (registering ? 'Could not create account.' : 'Invalid email or password.'));
      localStorage.setItem('silver-auth-token', data.token);
      setUser(data.user);
      const ordersResponse = await fetch(`${apiBase}/orders/mine`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (!ordersResponse.ok) throw new Error('Could not load order history.');
      setOrders((await ordersResponse.json()).orders);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign in failed.');
      localStorage.removeItem('silver-auth-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <PageShell>
        <div className="container-shell py-16">
          <div className="mx-auto max-w-md rounded-[2rem] border border-[#8a7666]/10 bg-white/40 p-8 shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
            <div className="mb-6 flex items-center gap-3 text-[#3f312d]">
              <LogIn size={20} />
              <h1 className="text-2xl font-light">{t('Member login')}</h1>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              {registering && <>
                <input name="firstName" required minLength={2} className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('First name')} />
                <input name="lastName" required minLength={2} className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Last name')} />
              </>}
              <input name="email" type="email" required className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Email')} />
              <input name="password" type="password" required minLength={8} className="rounded-full border border-[#8a7666]/15 bg-white px-4 py-3 outline-none" placeholder={t('Password')} />
              {loginError && <p role="alert" className="text-sm text-red-700">{loginError}</p>}
              <button type="submit" disabled={loading} className="rounded-full bg-[#8a7666] px-6 py-3 text-xs uppercase tracking-[0.12rem] text-white disabled:opacity-60">{loading ? '…' : registering ? t('Create account') : t('Login')}</button>
            </form>
            <button type="button" onClick={() => { setRegistering((value) => !value); setLoginError(''); }} className="mt-4 text-sm text-[#8a7666] underline">{registering ? t('Already have an account? Sign in') : t('Create an account')}</button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Personal Space')}</p>
            <h1 className="mt-3 text-4xl font-light text-[#3f312d]">Welcome, {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</h1>
          </div>
          <button onClick={() => { localStorage.removeItem('silver-auth-token'); setUser(null); setOrders([]); }} className="rounded-full border border-[#8a7666]/20 bg-white px-4 py-2 text-xs uppercase tracking-[0.12rem] text-[#8a7666]">
            {t('Sign out')}
          </button>
        </div>
        <section className="rounded-2xl border border-[#8a7666]/10 bg-white/60 p-6">
          <h2 className="text-2xl font-light">{t('Profile details')}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ['First name', user.firstName],
              ['Last name', user.lastName],
              ['Email', user.email],
              ['Phone', user.phone],
              ['Address', profileAddress ? `${profileAddress.street}, ${profileAddress.city}, ${profileAddress.country ?? 'Georgia'}${profileAddress.apartment ? `, ${profileAddress.apartment}` : ''}` : '—'],
              ['Loyalty points', String(user.loyaltyAccount?.points ?? 0)],
            ] as Array<[string, string | null | undefined]>).map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wider text-[#8a7666]">{t(label)}</dt><dd className="mt-1">{value || '—'}</dd></div>)}
          </dl>
        </section>
        <section id="orders" className="mt-8">
          <h2 className="mb-4 text-2xl font-light">{t('Order history')}</h2>
          {orders.length === 0 ? <p className="rounded-2xl bg-white/60 p-6 text-[#8a7666]">{t('No orders yet.')}</p> : <div className="space-y-4">
            {orders.map((order) => <article key={order.id} className="rounded-2xl border border-[#8a7666]/10 bg-white/60 p-5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <p><span className="text-[#8a7666]">{t('Order number')}: </span>{order.orderNumber}</p>
                <p><span className="text-[#8a7666]">{t('Purchase date')}: </span>{new Date(order.createdAt).toLocaleDateString()}</p>
                <p><span className="text-[#8a7666]">{t('Delivery method')}: </span>{order.deliveryMethod}</p>
                <p><span className="text-[#8a7666]">{t('Delivery address')}: </span>{order.deliveryAddress || '—'}</p>
                <p><span className="text-[#8a7666]">{t('Order status')}: </span>{order.orderStatus}</p>
                <p><span className="text-[#8a7666]">{t('Payment status')}: </span>{order.paymentStatus}</p>
                <p><span className="text-[#8a7666]">{t('Total')}: </span>₾{order.subtotal + order.deliveryPrice}</p>
              </div>
              <ul className="mt-4 space-y-2 border-t border-[#8a7666]/10 pt-4">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.product.name} × {item.quantity}</span><span>₾{item.price * item.quantity}</span></li>)}</ul>
            </article>)}
          </div>}
        </section>
      </div>
    </PageShell>
  );
}

function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<'COURIER' | 'PICKUP' | 'PRIORITY'>('COURIER');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const { t } = useLanguage();
  const subtotal = cart.reduce((total, entry) => total + (entry.product.salePrice ?? entry.product.price) * entry.quantity, 0);
  const shipping = deliveryMethod === 'COURIER' ? 25 : deliveryMethod === 'PRIORITY' ? 55 : 0;
  const total = subtotal + shipping;
  const token = localStorage.getItem('silver-auth-token');

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setCheckoutError(t('Please sign in to place an order.'));
      return;
    }
    if (!cart.length) return;
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setCheckoutError('');
    try {
      const response = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(({ product, quantity }) => ({ productId: product.id, quantity })),
          deliveryMethod,
          address: String(formData.get('address') ?? ''),
          paymentMethod: 'MOCK',
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Could not place order.');
      setOrderNumber(result.order.orderNumber);
      cart.forEach(({ product }) => removeFromCart(product.id));
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Order / payment')}</p>
          <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{t('Checkout')}</h1>
        </div>
        {orderNumber ? (
          <section className="rounded-2xl bg-white/60 p-8">
            <h2 className="text-2xl font-light">{t('Order submitted')}</h2>
            <p className="mt-3">{t('Order number')}: {orderNumber}</p>
            <p className="mt-2 text-sm text-[#8a7666]">{t('Your order is pending confirmation. This demo checkout does not charge payment.')}</p>
            <Link to="/account#orders" className="mt-5 inline-block underline">{t('View order history')}</Link>
          </section>
        ) : !cart.length ? (
          <p className="rounded-2xl bg-white/60 p-6">{t('Your cart is empty.')}</p>
        ) : (
          <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 rounded-[1.75rem] border border-[#8a7666]/10 bg-white/60 p-6">
              {!token && <p className="rounded-xl bg-[#d7e6ee]/60 p-4 text-sm">{t('Sign in or create an account before placing your order.')} <Link to="/account" className="underline">{t('Member login')}</Link></p>}
              <label className="block text-sm">{t('Delivery address')}
                <textarea name="address" required minLength={5} className="mt-2 min-h-28 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3" />
              </label>
              <label className="block text-sm">{t('Delivery method')}
                <select value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value === 'PICKUP' ? 'PICKUP' : event.target.value === 'PRIORITY' ? 'PRIORITY' : 'COURIER')} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3">
                  <option value="COURIER">{t('Courier delivery')} — ₾25</option>
                  <option value="PICKUP">{t('Store pickup')} — ₾0</option>
                  <option value="PRIORITY">{t('Priority courier')} — ₾55</option>
                </select>
              </label>
              <div className="rounded-xl border border-[#8a7666]/10 p-4 text-sm">
                <h2 className="font-medium">{t('Payment')}</h2>
                <p className="mt-2 text-[#8a7666]">{t('This demo checkout does not collect real payment details or charge your card.')}</p>
                <Link to="/payment" className="mt-2 inline-block underline">{t('Payment information')}</Link>
              </div>
              {checkoutError && <p role="alert" className="text-sm text-red-700">{checkoutError}</p>}
            </div>
            <div className="h-fit rounded-[1.75rem] border border-[#8a7666]/10 bg-[#e6e2dc] p-6">
              <h2 className="text-2xl font-light text-[#3f312d]">{t('Order summary')}</h2>
              <div className="mt-6 space-y-4 text-sm text-[#8a7666]/80">
                {cart.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4"><span>{product.name} × {quantity}</span><span>₾{(product.salePrice ?? product.price) * quantity}</span></div>)}
                <div className="flex justify-between"><span>{t('Subtotal')}</span><span>₾{subtotal}</span></div>
                <div className="flex justify-between"><span>{t('Shipping')}</span><span>₾{shipping}</span></div>
                <div className="mt-4 flex justify-between border-t border-[#8a7666]/20 pt-4 text-base text-[#3f312d]"><span>{t('Total')}</span><span>₾{total}</span></div>
              </div>
              <button disabled={!token || submitting} className="mt-8 w-full rounded-full bg-[#8a7666] px-6 py-3 text-xs uppercase tracking-[0.12rem] text-white disabled:opacity-60">{submitting ? '…' : t('Place order')}</button>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  );
}

function SearchPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') ?? '';
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    searchProducts(query).then((data) => setResults(data));
  }, [query]);

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">Search</p>
          <h1 className="mt-3 text-4xl font-light text-[#3f312d]">Results for “{query}”</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart.reduce((total, entry) => total + (entry.product.salePrice ?? entry.product.price) * entry.quantity, 0);

  return (
    <PageShell>
      <div className="container-shell py-16">
        <h1 className="text-4xl font-light text-[#3f312d]">Your cart</h1>
        {cart.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-[#8a7666]/10 bg-white/60 p-8 text-[#8a7666]/80">Your cart is empty. Add a few pieces from the collection.</div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-4 rounded-[1.5rem] border border-[#8a7666]/10 bg-white/60 p-4">
                  <img src={product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="h-24 w-24 rounded-[1rem] object-cover" />
                  <div className="flex-1">
                    <div className="text-lg font-light text-[#3f312d]">{product.name}</div>
                    <div className="text-sm text-[#8a7666]/80">₾{product.salePrice ?? product.price} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(product.id, -1)} className="h-8 w-8 rounded-full border border-[#8a7666]/15 bg-white text-[#3f312d]">−</button>
                    <span className="min-w-[1.5rem] text-center text-[#3f312d]">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, 1)} className="h-8 w-8 rounded-full border border-[#8a7666]/15 bg-white text-[#3f312d]">+</button>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} className="text-xs uppercase tracking-[0.12rem] text-[#8a7666]">Remove</button>
                </div>
              ))}
            </div>
            <div className="rounded-[1.75rem] border border-[#8a7666]/10 bg-[#e6e2dc] p-6">
              <h2 className="text-2xl font-light text-[#3f312d]">Summary</h2>
              <div className="mt-6 space-y-4 text-sm text-[#8a7666]/80">
                <div className="flex justify-between"><span>Subtotal</span><span>₾{subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₾25</span></div>
                <div className="mt-4 border-t border-[#8a7666]/20 pt-4 flex justify-between text-base text-[#3f312d]"><span>Total</span><span>₾{subtotal + 25}</span></div>
              </div>
              <Link to="/checkout" className="mt-8 block rounded-full bg-[#8a7666] px-6 py-3 text-center text-xs uppercase tracking-[0.12rem] text-white">Proceed to checkout</Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <PageShell>
      <div className="container-shell py-16">
        <h1 className="text-4xl font-light text-[#3f312d]">Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-[#8a7666]/10 bg-white/60 p-8 text-[#8a7666]/80">No saved items yet.</div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {wishlist.map((product) => (
              <div key={product.id} className="rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 p-4">
                <img src={product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'} alt={product.name} className="h-60 w-full rounded-[1rem] object-cover" />
                <div className="mt-4 flex items-center justify-between gap-2">
                  <Link to={`/product/${product.slug}`} className="text-lg font-light text-[#3f312d]">{product.name}</Link>
                  <button onClick={() => toggleWishlist(product)} className="text-[#8a7666]">Remove</button>
                </div>
                <div className="mt-2 text-[#8a7666]">₾{product.salePrice ?? product.price}</div>
                <button onClick={() => addToCart(product, 1)} className="mt-4 rounded-full bg-[#d7e6ee] px-4 py-2 text-xs uppercase tracking-[0.12rem] text-[#3f312d]">Add to cart</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const { language, t } = useLanguage();

  useEffect(() => {
    getBlogPosts().then((data) => setPosts(data));
  }, []);

  return (
    <PageShell>
      <div className="container-shell py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]/70">{t('Blog')}</p>
          <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{t('Stories from the atelier')}</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
              <img src={post.featuredImage ?? 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80'} alt={language === 'GEO' ? post.titleGeo ?? post.title : post.titleEng ?? post.title} className="h-64 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.18rem] text-[#8a7666]/70">{post.author}</p>
                <Link to={`/blog/${post.slug}`} className="mt-3 block text-2xl font-light text-[#3f312d]">{language === 'GEO' ? post.titleGeo ?? post.title : post.titleEng ?? post.title}</Link>
                <p className="mt-3 text-sm leading-6 text-[#8a7666]/80">{language === 'GEO' ? post.excerptGeo ?? post.excerpt : post.excerptEng ?? post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function BlogArticlePage() {
  const location = useLocation();
  const slug = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const [post, setPost] = useState<any>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    getBlogPost(slug).then(setPost).catch(() => {
      const found = fallbackBlogPosts.find((entry) => entry.slug === slug);
      setPost(found ?? null);
    });
  }, [slug]);

  if (!post) {
    return <PageShell><div className="container-shell py-16 text-[#8a7666]">{t('Journal entry not found.')}</div></PageShell>;
  }
  const title = language === 'GEO' ? post.titleGeo ?? post.title : post.titleEng ?? post.title;
  const excerpt = language === 'GEO' ? post.excerptGeo ?? post.excerpt : post.excerptEng ?? post.excerpt;
  const content = language === 'GEO' ? post.contentGeo ?? post.content : post.contentEng ?? post.content;

  return (
    <PageShell>
      <div className="container-shell py-16">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[#8a7666]/10 bg-white/40 p-4 shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
          <img src={post.featuredImage ?? 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80'} alt={title} className="h-[420px] w-full rounded-[1.5rem] object-cover" />
          <div className="p-6 md:p-10">
            <p className="text-xs uppercase tracking-[0.18rem] text-[#8a7666]/70">{post.author}</p>
            <h1 className="mt-3 text-4xl font-light text-[#3f312d]">{title}</h1>
            <p className="mt-4 text-base leading-7 text-[#8a7666]/80">{excerpt}</p>
            <div className="mt-8 whitespace-pre-line text-base leading-8 text-[#8a7666]/80">{content}</div>
          </div>
        </article>
      </div>
    </PageShell>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogArticlePage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin-login" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [cart, setCart] = useState<CartEntry[]>(() => {
    try {
      const raw = localStorage.getItem('silver-cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem('silver-wishlist');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('silver-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('silver-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => setCart((current) => current.filter((item) => item.product.id !== productId));

  const updateQuantity = (productId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((current) => {
      const present = current.some((item) => item.id === product.id);
      return present ? current.filter((item) => item.id !== product.id) : [...current, product];
    });
  };

  const isWishlisted = (productId: string) => wishlist.some((product) => product.id === productId);

  const itemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  const cartContextValue = useMemo<CartContextValue>(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, itemCount }),
    [cart, itemCount],
  );

  const wishlistContextValue = useMemo<WishlistContextValue>(
    () => ({ wishlist, toggleWishlist, isWishlisted }),
    [wishlist],
  );

  return (
    <CartContext.Provider value={cartContextValue}>
      <WishlistContext.Provider value={wishlistContextValue}>
        <AppRoutes />
      </WishlistContext.Provider>
    </CartContext.Provider>
  );
}
