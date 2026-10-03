import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Linkedin, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useCart, useWishlist } from '../context/storefront';
import { getStorefront } from '../lib/api';
import { useLanguage } from '../context/language';

export function PageShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const [storeSettings, setStoreSettings] = useState<{
    storeName?: string;
    logoUrl?: string | null;
    footer?: Record<string, string>;
    socialMedia?: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    void getStorefront().then((data) => setStoreSettings(data.settings));
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setMobileSearchOpen(false);
    setMobileOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };
  const footer = storeSettings?.footer ?? {};
  const socialMedia = {
    linkedin: 'https://www.linkedin.com/company/sturdier/',
    ...(storeSettings?.socialMedia ?? {}),
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#8a7666]">
      <header className="sticky top-0 z-40 border-b border-[#8a7666]/10 bg-[#f7f5f2]/90 backdrop-blur">
        <div className="container-shell flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen((current) => !current)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>
            <Link to="/" aria-label="STURDIER GROUP - Home" className="flex flex-col text-sm font-semibold leading-[0.95] tracking-[0.22rem] text-[#3f312d]">
              {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="STURDIER GROUP" className="max-h-10 max-w-40 object-contain" />
              ) : (
                <><span>STURDIER</span><span className="mt-1 text-[0.65rem] tracking-[0.38rem]">GROUP</span></>
              )}
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: t('Shop'), to: '/shop' },
              { label: t('About us'), to: '/about' },
              { label: t('Contact'), to: '/contact' },
              { label: t('Blog'), to: '/blog' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `text-sm uppercase tracking-[0.14rem] ${isActive ? 'text-[#5e4d46]' : 'text-[#8a7666]/80 hover:text-[#5e4d46]'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden items-center gap-2 rounded-full border border-[#8a7666]/15 bg-white/60 px-3 py-2 md:flex">
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('Search')}
                className="w-28 bg-transparent text-sm outline-none placeholder:text-[#8a7666]/60"
              />
            </form>
            <button type="button" onClick={() => setMobileSearchOpen((open) => !open)} className="rounded-full border border-[#8a7666]/15 bg-white/60 p-2 md:hidden" aria-label={t('Search')}>
              <Search size={16} />
            </button>
            <Link to="/wishlist" className="relative rounded-full border border-[#8a7666]/15 bg-white/60 p-2 text-[#8a7666]" aria-label="Wishlist">
              <Heart size={16} />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8a7666] text-[10px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/account" className="rounded-full border border-[#8a7666]/15 bg-white/60 p-2 text-[#8a7666]" aria-label="Account">
              <User size={16} />
            </Link>
            <Link to="/cart" className="relative rounded-full border border-[#8a7666]/15 bg-[#d7e6ee] p-2 text-[#8a7666]">
              <ShoppingBag size={16} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8a7666] text-[10px] text-white">
                {itemCount}
              </span>
            </Link>
            <button onClick={() => setLanguage(language === 'ENG' ? 'GEO' : 'ENG')} className="rounded-full border border-[#8a7666]/15 bg-white/60 px-2.5 py-2 text-xs font-semibold tracking-wide text-[#5e4d46]" aria-label="Switch language">
              {language}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="container-shell flex gap-2 pb-4 md:hidden">
            <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('Search')} aria-label={t('Search')} className="min-w-0 flex-1 rounded-full border border-[#8a7666]/15 bg-white px-4 py-2 text-sm outline-none" />
            <button type="submit" className="rounded-full bg-[#8a7666] px-4 py-2 text-sm text-white">{t('Search')}</button>
          </form>
        )}

        {mobileOpen && (
          <div className="border-t border-[#8a7666]/10 bg-[#f7f5f2] md:hidden">
            <div className="container-shell flex flex-col gap-4 py-4">
              {[
                { label: t('Shop'), to: '/shop' },
                { label: t('About us'), to: '/about' },
                { label: t('Contact'), to: '/contact' },
                { label: t('Blog'), to: '/blog' },
              ].map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.14rem] text-[#8a7666]">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-[#8a7666]/10 bg-[#e6e2dc]">
        <div className="container-shell grid gap-10 py-12 md:grid-cols-4">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.22rem] text-[#8a7666]">{t(footer.shopTitle ?? 'Shop')}</p>
            <ul className="space-y-3 text-sm text-[#8a7666]/80">
              <li>{footer.shopProducts ?? 'All products'}</li>
              <li>{footer.shopCollections ?? 'Collections'}</li>
              <li>{footer.shopArrivals ?? 'New arrivals'}</li>
              <li>{footer.shopBestSellers ?? 'Best sellers'}</li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.22rem] text-[#8a7666]">{footer.customerTitle ?? 'Customer'}</p>
            <ul className="space-y-3 text-sm text-[#8a7666]/80">
              <li><Link to="/account">{t(footer.customerAccount ?? 'My account')}</Link></li>
              <li><Link to="/account#orders">{t(footer.customerOrders ?? 'Orders')}</Link></li>
              <li><Link to="/wishlist">{t(footer.customerWishlist ?? 'Wishlist')}</Link></li>
              <li><Link to="/policies">{t(footer.customerPrivacy ?? 'Privacy Policy')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.22rem] text-[#8a7666]">{footer.aboutTitle ?? 'About'}</p>
            <ul className="space-y-3 text-sm text-[#8a7666]/80">
              <li><Link to="/about">{t(footer.aboutUs ?? 'About us')}</Link></li>
              <li><Link to="/contact">{t(footer.aboutContact ?? 'Contact')}</Link></li>
              <li><Link to="/blog">{t(footer.aboutBlog ?? 'Blog')}</Link></li>
              <li><Link to="/payment">{t('Payment information')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.22rem] text-[#8a7666]">{footer.socialTitle ?? 'Social'}</p>
            <ul className="space-y-3 text-sm text-[#8a7666]/80">
              {socialMedia.instagram && <li><a href={socialMedia.instagram} target="_blank" rel="noreferrer">{footer.socialInstagram ?? 'Instagram'}</a></li>}
              {socialMedia.facebook && <li><a href={socialMedia.facebook} target="_blank" rel="noreferrer">{footer.socialFacebook ?? 'Facebook'}</a></li>}
              {socialMedia.tiktok && <li><a href={socialMedia.tiktok} target="_blank" rel="noreferrer">{footer.socialTikTok ?? 'TikTok'}</a></li>}
              {socialMedia.linkedin && <li><a href={socialMedia.linkedin} target="_blank" rel="noreferrer" aria-label="STURDIER on LinkedIn" className="inline-flex items-center gap-2"><Linkedin size={16} /> LinkedIn</a></li>}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function FeatureTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 p-6 text-left shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
      <div className="mb-4 inline-flex rounded-full bg-[#d7e6ee] p-3 text-[#3f312d]">{icon}</div>
      <h3 className="mb-2 text-lg font-medium text-[#3f312d]">{title}</h3>
      <p className="text-sm leading-6 text-[#8a7666]/80">{text}</p>
    </div>
  );
}

export function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/60 p-5">
      <div className="text-2xl font-light text-[#3f312d]">{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.14rem] text-[#8a7666]/70">{label}</div>
    </div>
  );
}

export function Panel({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#8a7666]/10 bg-white/40 p-6 shadow-[0_18px_38px_rgba(84,70,62,0.08)]">
      <h2 className="text-xl font-light text-[#3f312d]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#8a7666]/80">{content}</p>
    </div>
  );
}

export function StepItem({ title }: { title: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#8a7666]/10 bg-[#f7f5f2] p-4 text-sm uppercase tracking-[0.12rem] text-[#8a7666]">{title}</div>
  );
}

export function CallToActionLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-sm uppercase tracking-[0.12rem] text-[#8a7666]">
      {label}
      <ArrowRight size={16} />
    </Link>
  );
}
