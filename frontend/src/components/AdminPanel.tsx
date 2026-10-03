import { useEffect, useState, type FormEvent } from 'react';
import { LogOut, Save, Settings, ShoppingBag, FileText, LayoutDashboard } from 'lucide-react';
import { apiBase } from '../lib/api';

type AdminTab = 'content' | 'products' | 'collections' | 'journal' | 'policies' | 'settings';
type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  featured: boolean;
  available: boolean;
  status: string;
  images: Array<{ url: string; alt?: string | null; isPrimary?: boolean }>;
  nameGeo?: string;
  nameEng?: string;
  descriptionGeo?: string;
  descriptionEng?: string;
  year?: number | null;
  model?: string | null;
  collectionId?: string | null;
  materialId?: string | null;
  materialType?: string | null;
  tags?: string[];
};
type BlogPost = {
  id: string;
  title: string;
  titleGeo?: string | null;
  titleEng?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptGeo?: string | null;
  excerptEng?: string | null;
  content: string;
  contentGeo?: string | null;
  contentEng?: string | null;
  featuredImage?: string | null;
  author: string;
  published: boolean;
};
type Policy = { key: string; title: string; titleGeo?: string; titleEng?: string; content: string; contentGeo?: string; contentEng?: string };
type Collection = {
  id: string;
  name: string;
  nameGeo?: string | null;
  nameEng?: string | null;
  slug: string;
  description?: string | null;
  descriptionGeo?: string | null;
  descriptionEng?: string | null;
  imageUrl?: string | null;
  _count?: { products: number };
};
type Settings = {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  logoUrl: string;
  homepageHero: Record<string, string>;
  footer: Record<string, string>;
  socialMedia: Record<string, string>;
};

const defaultSettings: Settings = {
  storeName: 'STURDIER GROUP',
  email: 'founder@sturdiergroup.com',
  phone: '+995 555 123 456',
  address: 'Tbilisi, Georgia',
  currency: 'GEL',
  logoUrl: '',
  homepageHero: {
    eyebrow: 'Crafted in silver',
    title: 'Elegant silver pieces for life’s meaningful moments.',
    subtitle: 'Luxury silver jewelry and handcrafted objects shaped by heritage, balance, and modern simplicity.',
    heroImage: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
    philosophyEyebrow: 'Our philosophy',
    philosophyTitle: 'Quiet luxury, crafted to endure.',
    philosophyDescription: 'Our collections reflect heritage, considered design, and the enduring value of thoughtful materials. Each object is designed to feel personal, intentional, and beautiful with time.',
    philosophyImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    feature1Title: 'Handmade quality',
    feature1Description: 'Each piece is carefully shaped and finished in small-batch production.',
    feature2Title: 'Authentic silver',
    feature2Description: 'Sterling and 925 silver selected for lasting brilliance and purity.',
    feature3Title: 'Worldwide delivery',
    feature3Description: 'Secure, premium shipping with attentive packaging and careful handling.',
    featuredEyebrow: 'Featured collection',
    featuredTitle: 'Most-loved pieces',
    featuredLink: 'View all',
    heroShopLabel: 'Shop collection',
    heroStoryLabel: 'Our story',
    journalEyebrow: 'Journal',
    journalTitle: 'Latest insights',
    stat1Label: 'Collections',
    stat1Value: '12+',
    stat2Label: 'Crafted pieces',
    stat2Value: '3k+',
    stat3Label: 'Years of heritage',
    stat3Value: '18',
    stat4Label: 'Collection Lines',
    stat4Value: '0',
    aboutTitle: 'The artistry of enduring silver',
    aboutImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    aboutParagraph1: 'We design silver objects with restraint, detail, and purpose. Our pieces balance handcrafted warmth with refined contemporary structure.',
    aboutParagraph2: 'From concept to completion, every form is shaped to feel quietly luxurious and meaningful. The collection reflects heritage, material honesty, and the slower rituals of everyday beauty.',
    aboutParagraph3: 'Our studio values elegance without excess, authenticity without spectacle, and craftsmanship that grows more beautiful over time.',
    contactTitle: 'We’d love to hear from you',
  },
  socialMedia: { linkedin: 'https://www.linkedin.com/company/sturdier/' },
  footer: {
    shopTitle: 'Shop',
    shopProducts: 'All products',
    shopCollections: 'Collections',
    shopArrivals: 'New arrivals',
    shopBestSellers: 'Best sellers',
    customerTitle: 'Customer',
    customerAccount: 'My account',
    customerOrders: 'Orders',
    customerWishlist: 'Wishlist',
    customerPrivacy: 'Privacy Policy',
    aboutTitle: 'About',
    aboutUs: 'About us',
    aboutContact: 'Contact',
    aboutBlog: 'Blog',
    socialTitle: 'Social',
    socialInstagram: 'Instagram',
    socialFacebook: 'Facebook',
    socialTikTok: 'TikTok',
  },
};

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'content', label: 'Page content', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'collections', label: 'Collections', icon: LayoutDashboard },
  { id: 'journal', label: 'Journal', icon: FileText },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'settings', label: 'Store settings', icon: Settings },
];
const defaultPolicies: Policy[] = [
  { key: 'privacy', title: 'Privacy Policy', content: 'We protect personal data and use it only to process orders, improve the customer experience, and provide account updates.' },
  { key: 'terms', title: 'Terms & Conditions', content: 'By placing an order, customers agree to product availability, shipping timelines, and return conditions defined by the boutique.' },
  { key: 'returns', title: 'Return Policy', content: 'Eligible returns within 14 days are reviewed in line with order condition and item specification.' },
  { key: 'cookies', title: 'Cookies Policy', titleGeo: 'ქუქი-ფაილების პოლიტიკა', content: 'We use cookies for remember-me functionality, cart persistence, and analytics to improve the shopping experience.' },
  { key: 'payment', title: 'Payment information', titleGeo: 'გადახდის ინფორმაცია', content: 'Payment methods: Available methods will be shown at checkout. The current demo checkout does not process or collect real payments.\nPayment confirmation: An order is marked paid only after an enabled payment provider confirms the transaction.\nSecurity: When a provider is enabled, payment credentials are handled by that provider. This store does not store full card details.\nFailed payments: An unconfirmed or failed payment is not treated as paid. Retry only through the provider checkout or contact support.\nRefunds and cancellations: Eligible refunds and cancellations are handled under the published return policy and the payment provider rules.\nGeneral rules: Prices and the final order total are displayed before order submission. Contact support if a payment or order status appears incorrect.', contentGeo: 'გადახდის მეთოდები: ხელმისაწვდომი მეთოდები შეკვეთის გაფორმებისას გამოჩნდება. ამჟამინდელი დემო-შეკვეთა რეალურ გადახდას არ ამუშავებს და თანხას არ აგროვებს.\nგადახდის დადასტურება: შეკვეთა გადახდილად ითვლება მხოლოდ ჩართული გადახდის პროვაიდერის დასტურის შემდეგ.\nუსაფრთხოება: პროვაიდერის ჩართვის შემდეგ გადახდის მონაცემებს ამუშავებს თავად პროვაიდერი. მაღაზია ბარათის სრულ მონაცემებს არ ინახავს.\nწარუმატებელი გადახდა: დაუდასტურებელი ან წარუმატებელი გადახდა გადახდილად არ ითვლება. ხელახლა სცადეთ მხოლოდ პროვაიდერის გვერდიდან ან დაუკავშირდით მხარდაჭერას.\nდაბრუნება და გაუქმება: თანხის დაბრუნება და შეკვეთის გაუქმება განიხილება გამოქვეყნებული დაბრუნების პოლიტიკისა და პროვაიდერის წესების შესაბამისად.\nზოგადი პირობები: ფასები და საბოლოო თანხა შეკვეთის გაგზავნამდე გამოჩნდება. გადახდის ან შეკვეთის სტატუსის პრობლემისას დაუკავშირდით მხარდაჭერას.' },
];

export function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem('silver-admin-token') ?? '');
  const [tab, setTab] = useState<AdminTab>('content');
  const [email, setEmail] = useState('admin@silverboutique.com');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>(defaultPolicies);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const authorizedFetch = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('silver-admin-token');
        setToken('');
      }
      throw new Error(data.message ?? 'The request could not be completed.');
    }
    return data;
  };

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [settingsData, productData, blogData, policiesData, collectionData] = await Promise.all([
        authorizedFetch('/admin/settings'),
        authorizedFetch('/admin/products'),
        authorizedFetch('/admin/blog'),
        authorizedFetch('/admin/policies'),
        authorizedFetch('/admin/collections'),
      ]);
      if (settingsData.settings) {
        setSettings({
          ...defaultSettings,
          ...settingsData.settings,
          storeName: settingsData.settings.storeName === 'Silver Boutique' ? 'STURDIER GROUP' : settingsData.settings.storeName,
          email: settingsData.settings.email ?? '',
          phone: settingsData.settings.phone ?? '',
          address: settingsData.settings.address ?? '',
          logoUrl: settingsData.settings.logoUrl ?? '',
          homepageHero: { ...defaultSettings.homepageHero, ...(settingsData.settings.homepageHero ?? {}) },
          footer: { ...defaultSettings.footer, ...(settingsData.settings.footer ?? {}) },
          socialMedia: { ...defaultSettings.socialMedia, ...(settingsData.settings.socialMedia ?? {}) },
        });
      }
      setProducts(productData.products);
      setPosts(blogData.posts);
      setPolicies([
        ...policiesData.policies,
        ...defaultPolicies.filter((fallback) => !policiesData.policies.some((policy: Policy) => policy.key === fallback.key)),
      ]);
      setCollections(collectionData.collections);
      setSelectedCollection((current) => current ? collectionData.collections.find((item: Collection) => item.id === current.id) ?? null : collectionData.collections[0] ?? null);
      setSelectedProduct((current) => current ? productData.products.find((item: Product) => item.id === current.id) ?? productData.products[0] ?? null : productData.products[0] ?? null);
      setSelectedPost((current) => current ? blogData.posts.find((item: BlogPost) => item.id === current.id) ?? blogData.posts[0] ?? null : blogData.posts[0] ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadAdminData();
  }, [token]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Sign in failed.');
      if (data.user.role !== 'ADMIN') throw new Error('This account does not have admin access.');
      localStorage.setItem('silver-admin-token', data.token);
      setToken(data.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    setError('');
    try {
      const response = await authorizedFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setSettings({
        ...defaultSettings,
        ...response.settings,
        storeName: response.settings.storeName === 'Silver Boutique' ? 'STURDIER GROUP' : response.settings.storeName,
        email: response.settings.email ?? '',
        phone: response.settings.phone ?? '',
        address: response.settings.address ?? '',
        logoUrl: response.settings.logoUrl ?? '',
        homepageHero: { ...defaultSettings.homepageHero, ...(response.settings.homepageHero ?? {}) },
        footer: { ...defaultSettings.footer, ...(response.settings.footer ?? {}) },
        socialMedia: { ...defaultSettings.socialMedia, ...(response.settings.socialMedia ?? {}) },
      });
      setNotice('Store content saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save store content.');
    }
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProduct) return;
    setNotice('');
    setError('');
    try {
      const { id, images } = selectedProduct;
      const payload = {
        name: selectedProduct.name,
        nameGeo: selectedProduct.nameGeo,
        nameEng: selectedProduct.nameEng,
        slug: selectedProduct.slug,
        sku: selectedProduct.sku,
        description: selectedProduct.description,
        descriptionGeo: selectedProduct.descriptionGeo,
        descriptionEng: selectedProduct.descriptionEng,
        shortDescription: selectedProduct.shortDescription,
        price: selectedProduct.price,
        ...(selectedProduct.salePrice == null ? {} : { salePrice: selectedProduct.salePrice }),
        stock: selectedProduct.stock,
        featured: selectedProduct.featured,
        available: selectedProduct.available,
        status: selectedProduct.status,
        year: selectedProduct.year,
        model: selectedProduct.model,
        collectionId: selectedProduct.collectionId,
        materialType: selectedProduct.materialType,
        tags: selectedProduct.tags ?? [],
        images: images.map((image, index) => ({ ...image, isPrimary: index === 0 })),
      };
      const response = await authorizedFetch(id ? `/products/${id}` : '/products', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setProducts((current) => id
        ? current.map((product) => product.id === id ? response.product : product)
        : [response.product, ...current]);
      setSelectedProduct(response.product);
      setNotice(id ? 'Product changes saved.' : 'Product created.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save product.');
    }
  };

  const savePost = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPost) return;
    setNotice('');
    setError('');
    try {
      const { id, ...fields } = selectedPost;
      const response = await authorizedFetch(isCreatingPost ? '/admin/blog' : `/admin/blog/${id}`, {
        method: isCreatingPost ? 'POST' : 'PUT',
        body: JSON.stringify(fields),
      });
      const savedPost = response.post;
      setPosts((current) => isCreatingPost ? [savedPost, ...current] : current.map((post) => post.id === id ? savedPost : post));
      setSelectedPost(savedPost);
      setIsCreatingPost(false);
      setNotice('Journal entry saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save journal entry.');
    }
  };

  const savePolicies = async (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    setError('');
    try {
      const response = await authorizedFetch('/admin/policies', { method: 'PUT', body: JSON.stringify(policies) });
      setPolicies(response.policies);
      setNotice('Policies saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save policies.');
    }
  };

  const saveCollection = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCollection) return;
    setNotice('');
    setError('');
    try {
      const { id, ...fields } = selectedCollection;
      const response = await authorizedFetch(id ? `/admin/collections/${id}` : '/admin/collections', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...fields, imageUrl: fields.imageUrl ?? '' }),
      });
      const saved = response.collection;
      setCollections((current) => id ? current.map((item) => item.id === id ? saved : item) : [saved, ...current]);
      setSelectedCollection(saved);
      setNotice(id ? 'Collection updated.' : 'Collection created.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save collection.');
    }
  };

  const deleteCollection = async () => {
    if (!selectedCollection?.id || !window.confirm('Delete this collection line? Products will remain, but become unassigned.')) return;
    setNotice('');
    setError('');
    try {
      await authorizedFetch(`/admin/collections/${selectedCollection.id}`, { method: 'DELETE' });
      const remaining = collections.filter((item) => item.id !== selectedCollection.id);
      setCollections(remaining);
      setSelectedCollection(remaining[0] ?? null);
      setNotice('Collection deleted.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete collection.');
    }
  };

  const updateHero = (key: string, value: string) => {
    setSettings((current) => ({ ...current, homepageHero: { ...current.homepageHero, [key]: value } }));
  };
  const updateFooter = (key: string, value: string) => {
    setSettings((current) => ({ ...current, footer: { ...current.footer, [key]: value } }));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] px-4 py-16 text-[#3f312d]">
        <form onSubmit={login} className="mx-auto max-w-md rounded-3xl border border-[#8a7666]/15 bg-white p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]">STURDIER GROUP</p>
          <h1 className="mt-3 text-3xl font-light">Admin sign in</h1>
          <label className="mt-8 block text-sm">Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" />
          </label>
          <label className="mt-4 block text-sm">Password
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" />
          </label>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="mt-6 w-full rounded-full bg-[#8a7666] px-5 py-3 text-sm uppercase tracking-wider text-white disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  const textField = (label: string, key: string, multiline = false, image = false) => (
    image
      ? <ImageField key={key} label={label} value={settings.homepageHero[key] ?? ''} token={token} onChange={(value) => updateHero(key, value)} onError={setError} />
      : <label key={key} className="block text-sm text-[#5e4d46]">
        {label}
        {multiline ? (
          <textarea value={settings.homepageHero[key] ?? ''} onChange={(event) => updateHero(key, event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3" />
        ) : (
          <input type="text" value={settings.homepageHero[key] ?? ''} onChange={(event) => updateHero(key, event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3" />
        )}
      </label>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#3f312d]">
      <header className="flex items-center justify-between border-b border-[#8a7666]/15 bg-white px-5 py-4 md:px-8">
        <div><p className="text-xs uppercase tracking-[0.2rem] text-[#8a7666]">STURDIER GROUP</p><h1 className="text-xl font-medium">Content manager</h1></div>
        <button onClick={() => { localStorage.removeItem('silver-admin-token'); setToken(''); }} className="flex items-center gap-2 rounded-full border border-[#8a7666]/20 px-4 py-2 text-sm"><LogOut size={16} /> Sign out</button>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setNotice(''); setError(''); }} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${tab === id ? 'bg-[#8a7666] text-white' : 'bg-white text-[#5e4d46]'}`}>
              <Icon size={17} /> {label}
            </button>
          ))}
          <a href="/" className="mt-2 px-4 py-3 text-sm text-[#8a7666]">← View storefront</a>
        </nav>

        <main className="min-w-0 rounded-2xl border border-[#8a7666]/10 bg-white p-5 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.18rem] text-[#8a7666]">Admin editor</p><h2 className="mt-1 text-2xl font-light">{tabs.find((item) => item.id === tab)?.label}</h2></div>
            {loading && <span className="text-sm text-[#8a7666]">Loading…</span>}
          </div>
          {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="mb-5 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

          {tab === 'content' && (
            <form onSubmit={saveSettings} className="space-y-8">
              <section><h3 className="mb-4 text-lg">Homepage hero</h3><div className="grid gap-4 md:grid-cols-2">
                {textField('Eyebrow (ENG)', 'eyebrow')}
                {textField('Eyebrow (GEO)', 'eyebrowGeo')}
                {textField('Hero image URL', 'heroImage', false, true)}
                {textField('Headline (ENG)', 'title', true)}
                {textField('Headline (GEO)', 'titleGeo', true)}
                {textField('Description (ENG)', 'subtitle', true)}
                {textField('Description (GEO)', 'subtitleGeo', true)}
              </div></section>
              <section><h3 className="mb-4 text-lg">Homepage philosophy</h3><div className="grid gap-4 md:grid-cols-2">
                {textField('Section label (ENG)', 'philosophyEyebrow')}
                {textField('Section label (GEO)', 'philosophyEyebrowGeo')}
                {textField('Image URL', 'philosophyImage', false, true)}
                {textField('Headline (ENG)', 'philosophyTitle')}
                {textField('Headline (GEO)', 'philosophyTitleGeo')}
                {textField('Description (ENG)', 'philosophyDescription', true)}
                {textField('Description (GEO)', 'philosophyDescriptionGeo', true)}
              </div></section>
              <section><h3 className="mb-4 text-lg">Homepage labels and feature tiles</h3><div className="grid gap-4 md:grid-cols-2">
                {textField('Shop button', 'heroShopLabel')}
                {textField('Story button', 'heroStoryLabel')}
                {textField('Featured section label', 'featuredEyebrow')}
                {textField('Featured section title', 'featuredTitle')}
                {textField('Featured link label', 'featuredLink')}
                {textField('Journal section label', 'journalEyebrow')}
                {textField('Journal section title', 'journalTitle')}
                {textField('Feature 1 title', 'feature1Title')}
                {textField('Feature 1 description', 'feature1Description', true)}
                {textField('Feature 2 title', 'feature2Title')}
                {textField('Feature 2 description', 'feature2Description', true)}
                {textField('Feature 3 title', 'feature3Title')}
                {textField('Feature 3 description', 'feature3Description', true)}
                {textField('Stat 1 label', 'stat1Label')}
                {textField('Stat 1 value', 'stat1Value')}
                {textField('Stat 2 label', 'stat2Label')}
                {textField('Stat 2 value', 'stat2Value')}
                {textField('Stat 3 label', 'stat3Label')}
                {textField('Stat 3 value', 'stat3Value')}
                {textField('Stat 4 label', 'stat4Label')}
                {textField('Stat 4 value', 'stat4Value')}
              </div></section>
              <section><h3 className="mb-4 text-lg">About page</h3><div className="grid gap-4 md:grid-cols-2">
                {textField('Page title (ENG)', 'aboutTitle')}
                {textField('Page title (GEO)', 'aboutTitleGeo')}
                {textField('Image URL', 'aboutImage', false, true)}
                {textField('Paragraph 1 (ENG)', 'aboutParagraph1', true)}
                {textField('Paragraph 1 (GEO)', 'aboutParagraph1Geo', true)}
                {textField('Paragraph 2 (ENG)', 'aboutParagraph2', true)}
                {textField('Paragraph 2 (GEO)', 'aboutParagraph2Geo', true)}
                {textField('Paragraph 3 (ENG)', 'aboutParagraph3', true)}
                {textField('Paragraph 3 (GEO)', 'aboutParagraph3Geo', true)}
              </div></section>
              <section><h3 className="mb-4 text-lg">Contact page</h3><div className="grid gap-4 md:grid-cols-2">
                {textField('Page title (ENG)', 'contactTitle')}
                {textField('Page title (GEO)', 'contactTitleGeo')}
              </div></section>
              <SaveButton />
            </form>
          )}

          {tab === 'policies' && (
            <form onSubmit={savePolicies} className="space-y-6">
              {policies.map((policy, index) => (
                <section key={policy.key} className="grid gap-4 border-b border-[#8a7666]/10 pb-6 md:grid-cols-2">
                  <Field label="Policy title (ENG)" value={policy.titleEng ?? policy.title} onChange={(value) => setPolicies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: value, titleEng: value } : item))} />
                  <Field label="Policy title (GEO)" value={policy.titleGeo ?? ''} onChange={(value) => setPolicies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, titleGeo: value } : item))} />
                  <label className="block text-sm">Policy text (ENG)<textarea rows={4} value={policy.contentEng ?? policy.content} onChange={(event) => setPolicies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, content: event.target.value, contentEng: event.target.value } : item))} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                  <label className="block text-sm">Policy text (GEO)<textarea rows={4} value={policy.contentGeo ?? ''} onChange={(event) => setPolicies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, contentGeo: event.target.value } : item))} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                </section>
              ))}
              <SaveButton />
            </form>
          )}

          {tab === 'collections' && (
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="space-y-2">
                <button onClick={() => setSelectedCollection({ id: '', name: '', nameGeo: '', nameEng: '', slug: '', description: '', descriptionGeo: '', descriptionEng: '', imageUrl: '' })} className="mb-2 w-full rounded-xl bg-[#d7e6ee] p-3 text-sm">+ New collection line</button>
                {collections.map((collection) => <button key={collection.id} onClick={() => setSelectedCollection(collection)} className={`block w-full rounded-xl p-3 text-left text-sm ${selectedCollection?.id === collection.id ? 'bg-[#d7e6ee]' : 'bg-[#f7f5f2]'}`}>{collection.nameEng ?? collection.name} <span className="text-xs text-[#8a7666]">({collection._count?.products ?? 0})</span></button>)}
              </div>
              {selectedCollection && <form onSubmit={saveCollection} className="grid gap-4">
                {selectedCollection.id && <p className="text-xs text-[#8a7666]">Collection ID: {selectedCollection.id} · {selectedCollection._count?.products ?? 0} products</p>}
                <Field label="Name (ENG)" value={selectedCollection.nameEng ?? selectedCollection.name} onChange={(value) => setSelectedCollection({ ...selectedCollection, name: value, nameEng: value, slug: selectedCollection.id ? selectedCollection.slug : slugify(value) })} />
                <Field label="Name (GEO)" value={selectedCollection.nameGeo ?? ''} onChange={(value) => setSelectedCollection({ ...selectedCollection, nameGeo: value })} />
                <Field label="URL slug" value={selectedCollection.slug} onChange={(value) => setSelectedCollection({ ...selectedCollection, slug: value, name: selectedCollection.name || value })} />
                <ImageField label="Collection image" value={selectedCollection.imageUrl ?? ''} token={token} onChange={(value) => setSelectedCollection({ ...selectedCollection, imageUrl: value })} onError={setError} />
                <label className="block text-sm">Description (ENG)<textarea rows={3} value={selectedCollection.descriptionEng ?? selectedCollection.description ?? ''} onChange={(event) => setSelectedCollection({ ...selectedCollection, description: event.target.value, descriptionEng: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm">Description (GEO)<textarea rows={3} value={selectedCollection.descriptionGeo ?? ''} onChange={(event) => setSelectedCollection({ ...selectedCollection, descriptionGeo: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <div className="flex flex-wrap gap-3"><SaveButton />{selectedCollection.id && <button type="button" onClick={deleteCollection} className="rounded-full border border-red-300 px-5 py-3 text-sm text-red-700">Delete collection</button>}</div>
              </form>}
            </div>
          )}

          {tab === 'products' && (
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="max-h-[70vh] space-y-2 overflow-auto">
                <button onClick={() => setSelectedProduct({ id: '', name: '', slug: '', sku: '', description: '', shortDescription: '', price: 0, salePrice: null, stock: 0, featured: false, available: true, status: 'PUBLISHED', images: [] })} className="mb-2 w-full rounded-xl bg-[#d7e6ee] p-3 text-sm">+ New product</button>
                {products.map((product) => <button key={product.id} onClick={() => setSelectedProduct(product)} className={`block w-full rounded-xl p-3 text-left text-sm ${selectedProduct?.id === product.id ? 'bg-[#d7e6ee]' : 'bg-[#f7f5f2]'}`}>{product.name}</button>)}
              </div>
              {selectedProduct && <form onSubmit={saveProduct} className="grid gap-4 md:grid-cols-2">
                {selectedProduct.id && <p className="text-xs text-[#8a7666] md:col-span-2">Product ID: {selectedProduct.id}</p>}
                <Field label="Product name (ENG)" value={selectedProduct.nameEng ?? selectedProduct.name} onChange={(value) => setSelectedProduct({ ...selectedProduct, name: value, nameEng: value })} />
                <Field label="Product name (GEO)" value={selectedProduct.nameGeo ?? ''} onChange={(value) => setSelectedProduct({ ...selectedProduct, nameGeo: value })} />
                <Field label="URL slug" value={selectedProduct.slug} onChange={(value) => setSelectedProduct({ ...selectedProduct, slug: value })} />
                <Field label="SKU" value={selectedProduct.sku} onChange={(value) => setSelectedProduct({ ...selectedProduct, sku: value })} />
                <Field label="Price" type="number" value={String(selectedProduct.price)} onChange={(value) => setSelectedProduct({ ...selectedProduct, price: Number(value) })} />
                <Field label="Sale price (optional)" type="number" value={selectedProduct.salePrice == null ? '' : String(selectedProduct.salePrice)} onChange={(value) => setSelectedProduct({ ...selectedProduct, salePrice: value ? Number(value) : null })} />
                <Field label="Stock" type="number" value={String(selectedProduct.stock)} onChange={(value) => setSelectedProduct({ ...selectedProduct, stock: Number(value) })} />
                <Field label="Year" type="number" value={selectedProduct.year == null ? '' : String(selectedProduct.year)} onChange={(value) => setSelectedProduct({ ...selectedProduct, year: value ? Number(value) : null })} />
                <Field label="Model" value={selectedProduct.model ?? ''} onChange={(value) => setSelectedProduct({ ...selectedProduct, model: value })} />
                <label className="block text-sm">Collection<select value={selectedProduct.collectionId ?? ''} onChange={(event) => setSelectedProduct({ ...selectedProduct, collectionId: event.target.value || null })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3"><option value="">—</option>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.nameEng ?? collection.name}</option>)}</select></label>
                <label className="block text-sm">Material<select value={selectedProduct.materialType ?? ''} onChange={(event) => setSelectedProduct({ ...selectedProduct, materialType: event.target.value || null })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3"><option value="">—</option><option value="SILVER_ONLY">Silver only</option><option value="SILVER_GOLD">Silver & Gold</option><option value="SILVER_DIAMONDS">Silver & Diamonds</option><option value="SILVER_STONES">Silver & Stones</option></select></label>
                <Field label="Tags (comma-separated)" value={(selectedProduct.tags ?? []).join(', ')} onChange={(value) => setSelectedProduct({ ...selectedProduct, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) })} />
                <div className="md:col-span-2"><ImageGalleryField label="Product gallery" images={selectedProduct.images} token={token} onChange={(images) => setSelectedProduct({ ...selectedProduct, images })} onError={setError} /></div>
                <label className="block text-sm">Short description<textarea rows={2} value={selectedProduct.shortDescription ?? ''} onChange={(event) => setSelectedProduct({ ...selectedProduct, shortDescription: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm md:col-span-2">Description<textarea required rows={5} value={selectedProduct.description} onChange={(event) => setSelectedProduct({ ...selectedProduct, description: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm">Description (GEO)<textarea rows={5} value={selectedProduct.descriptionGeo ?? ''} onChange={(event) => setSelectedProduct({ ...selectedProduct, descriptionGeo: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm">Description (ENG)<textarea rows={5} value={selectedProduct.descriptionEng ?? selectedProduct.description} onChange={(event) => setSelectedProduct({ ...selectedProduct, descriptionEng: event.target.value, description: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedProduct.featured} onChange={(event) => setSelectedProduct({ ...selectedProduct, featured: event.target.checked })} /> Featured on homepage</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedProduct.available} onChange={(event) => setSelectedProduct({ ...selectedProduct, available: event.target.checked })} /> Available for sale</label>
                <label className="block text-sm">Visibility<select value={selectedProduct.status} onChange={(event) => setSelectedProduct({ ...selectedProduct, status: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3"><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="HIDDEN">Hidden</option><option value="ARCHIVED">Archived</option></select></label>
                <div className="md:col-span-2"><SaveButton /></div>
              </form>}
            </div>
          )}

          {tab === 'journal' && (
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="space-y-2">
                <button onClick={() => { setSelectedPost({ id: '', title: '', slug: '', excerpt: '', content: '', featuredImage: '', author: 'STURDIER GROUP', published: false }); setIsCreatingPost(true); }} className="mb-2 w-full rounded-xl bg-[#d7e6ee] p-3 text-sm">+ New journal entry</button>
                {posts.map((post) => <button key={post.id} onClick={() => { setSelectedPost(post); setIsCreatingPost(false); }} className={`block w-full rounded-xl p-3 text-left text-sm ${selectedPost?.id === post.id && !isCreatingPost ? 'bg-[#d7e6ee]' : 'bg-[#f7f5f2]'}`}>{post.title}</button>)}
              </div>
              {selectedPost && <form onSubmit={savePost} className="grid gap-4">
                <Field label="Title (ENG)" value={selectedPost.titleEng ?? selectedPost.title} onChange={(value) => setSelectedPost({ ...selectedPost, title: value, titleEng: value, slug: isCreatingPost ? slugify(value) : selectedPost.slug })} />
                <Field label="Title (GEO)" value={selectedPost.titleGeo ?? ''} onChange={(value) => setSelectedPost({ ...selectedPost, titleGeo: value })} />
                <Field label="URL slug" value={selectedPost.slug} onChange={(value) => setSelectedPost({ ...selectedPost, slug: value })} />
                <Field label="Author" value={selectedPost.author} onChange={(value) => setSelectedPost({ ...selectedPost, author: value })} />
                <ImageField label="Featured image" value={selectedPost.featuredImage ?? ''} token={token} onChange={(value) => setSelectedPost({ ...selectedPost, featuredImage: value })} onError={setError} />
                <label className="block text-sm">Excerpt (ENG)<textarea rows={2} value={selectedPost.excerptEng ?? selectedPost.excerpt ?? ''} onChange={(event) => setSelectedPost({ ...selectedPost, excerpt: event.target.value, excerptEng: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm">Excerpt (GEO)<textarea rows={2} value={selectedPost.excerptGeo ?? ''} onChange={(event) => setSelectedPost({ ...selectedPost, excerptGeo: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm">Article content (ENG)<textarea required rows={8} value={selectedPost.contentEng ?? selectedPost.content} onChange={(event) => setSelectedPost({ ...selectedPost, content: event.target.value, contentEng: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="block text-sm">Article content (GEO)<textarea rows={8} value={selectedPost.contentGeo ?? ''} onChange={(event) => setSelectedPost({ ...selectedPost, contentGeo: event.target.value })} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 px-4 py-3" /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedPost.published} onChange={(event) => setSelectedPost({ ...selectedPost, published: event.target.checked })} /> Published</label>
                <SaveButton />
              </form>}
            </div>
          )}

          {tab === 'settings' && (
            <form onSubmit={saveSettings} className="space-y-8">
              <section><h3 className="mb-4 text-lg">Brand and contact details</h3><div className="grid gap-4 md:grid-cols-2">
                <Field label="Store name" value={settings.storeName} onChange={(value) => setSettings({ ...settings, storeName: value })} />
                <ImageField label="Logo" value={settings.logoUrl} token={token} onChange={(value) => setSettings({ ...settings, logoUrl: value })} onError={setError} previewClassName="h-24 max-w-48 object-contain" />
                <Field label="Contact email" value={settings.email} onChange={(value) => setSettings({ ...settings, email: value })} />
                <Field label="Phone" value={settings.phone} onChange={(value) => setSettings({ ...settings, phone: value })} />
                <Field label="Address" value={settings.address} onChange={(value) => setSettings({ ...settings, address: value })} />
                <Field label="Currency code" value={settings.currency} onChange={(value) => setSettings({ ...settings, currency: value })} />
                <Field label="LinkedIn URL" value={settings.socialMedia.linkedin ?? ''} onChange={(value) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, linkedin: value } })} />
                <Field label="Instagram URL" value={settings.socialMedia.instagram ?? ''} onChange={(value) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, instagram: value } })} />
                <Field label="Facebook URL" value={settings.socialMedia.facebook ?? ''} onChange={(value) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, facebook: value } })} />
                <Field label="TikTok URL" value={settings.socialMedia.tiktok ?? ''} onChange={(value) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, tiktok: value } })} />
              </div></section>
              <section><h3 className="mb-4 text-lg">Footer text</h3><div className="grid gap-4 md:grid-cols-2">
                {Object.entries(settings.footer).map(([key, value]) => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')} value={value} onChange={(next) => updateFooter(key, next)} />)}
              </div></section>
              <SaveButton />
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

function SaveButton() {
  return <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#8a7666] px-6 py-3 text-sm uppercase tracking-wider text-white"><Save size={16} /> Save changes</button>;
}

type UploadedImage = { url: string; alt?: string | null; isPrimary?: boolean };

async function uploadImage(file: File, token: string) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${apiBase}/admin/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? 'Image upload failed.');
  return result.url as string;
}

function ImageField({
  label,
  value,
  token,
  onChange,
  onError,
  previewClassName = 'mt-3 h-36 w-full rounded-xl object-cover',
}: {
  label: string;
  value: string;
  token: string;
  onChange: (value: string) => void;
  onError: (error: string) => void;
  previewClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file, token));
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="block text-sm text-[#5e4d46]">
      <span>{label}</span>
      <input type="url" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3" />
      <label className="mt-2 inline-flex cursor-pointer items-center rounded-full border border-[#8a7666]/20 px-4 py-2 text-xs">
        {uploading ? 'Uploading…' : 'Upload image'}
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={handleUpload} className="sr-only" />
      </label>
      {value && <div className="mt-2">
        <img src={value} alt={`${label} preview`} className={previewClassName} />
        <button type="button" onClick={() => onChange('')} className="mt-2 text-xs text-red-700">Remove image</button>
      </div>}
    </div>
  );
}

function ImageGalleryField({
  label,
  images,
  token,
  onChange,
  onError,
}: {
  label: string;
  images: UploadedImage[];
  token: string;
  onChange: (images: UploadedImage[]) => void;
  onError: (error: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, token);
      onChange([...images, { url, alt: '', isPrimary: images.length === 0 }]);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };
  const moveImage = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next.map((image, imageIndex) => ({ ...image, isPrimary: imageIndex === 0 })));
  };

  return (
    <section>
      <h3 className="mb-2 text-sm">{label}</h3>
      <label className="inline-flex cursor-pointer items-center rounded-full border border-[#8a7666]/20 px-4 py-2 text-xs">
        {uploading ? 'Uploading…' : 'Add gallery image'}
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={handleUpload} className="sr-only" />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => <div key={`${image.url}-${index}`} className="rounded-xl border border-[#8a7666]/10 p-3">
          <img src={image.url} alt={image.alt ?? `Product image ${index + 1}`} className="h-40 w-full rounded-lg object-cover" />
          <input aria-label={`Image ${index + 1} URL`} value={image.url} onChange={(event) => onChange(images.map((entry, itemIndex) => itemIndex === index ? { ...entry, url: event.target.value } : entry))} className="mt-2 w-full rounded-lg border border-[#8a7666]/20 px-3 py-2 text-xs" />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {index === 0 && <span className="text-[#8a7666]">Primary image</span>}
            <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded border px-2 py-1 disabled:opacity-40" aria-label="Move image earlier">↑</button>
            <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded border px-2 py-1 disabled:opacity-40" aria-label="Move image later">↓</button>
            <button type="button" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, isPrimary: itemIndex === 0 })))} className="ml-auto text-red-700">Remove</button>
          </div>
        </div>)}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-sm">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#8a7666]/20 bg-white px-4 py-3" /></label>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
