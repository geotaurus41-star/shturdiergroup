import { fallbackStorefront, fallbackProducts, fallbackBlogPosts } from '../data/mockData';

export const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const fallbackPaymentPolicy = {
  key: 'payment',
  title: 'Payment information',
  titleGeo: 'გადახდის ინფორმაცია',
  content: 'Payment methods: Available methods will be shown at checkout. The current demo checkout does not process or collect real payments.\nPayment confirmation: An order is marked paid only after an enabled payment provider confirms the transaction.\nSecurity: When a provider is enabled, payment credentials are handled by that provider. This store does not store full card details.\nFailed payments: An unconfirmed or failed payment is not treated as paid. Retry only through the provider checkout or contact support.\nRefunds and cancellations: Eligible refunds and cancellations are handled under the published return policy and the payment provider rules.\nGeneral rules: Prices and the final order total are displayed before order submission. Contact support if a payment or order status appears incorrect.',
  contentGeo: 'გადახდის მეთოდები: ხელმისაწვდომი მეთოდები შეკვეთის გაფორმებისას გამოჩნდება. ამჟამინდელი დემო-შეკვეთა რეალურ გადახდას არ ამუშავებს და თანხას არ აგროვებს.\nგადახდის დადასტურება: შეკვეთა გადახდილად ითვლება მხოლოდ ჩართული გადახდის პროვაიდერის დასტურის შემდეგ.\nუსაფრთხოება: პროვაიდერის ჩართვის შემდეგ გადახდის მონაცემებს ამუშავებს თავად პროვაიდერი. მაღაზია ბარათის სრულ მონაცემებს არ ინახავს.\nწარუმატებელი გადახდა: დაუდასტურებელი ან წარუმატებელი გადახდა გადახდილად არ ითვლება. ხელახლა სცადეთ მხოლოდ პროვაიდერის გვერდიდან ან დაუკავშირდით მხარდაჭერას.\nდაბრუნება და გაუქმება: თანხის დაბრუნება და შეკვეთის გაუქმება განიხილება გამოქვეყნებული დაბრუნების პოლიტიკისა და პროვაიდერის წესების შესაბამისად.\nზოგადი პირობები: ფასები და საბოლოო თანხა შეკვეთის გაგზავნამდე გამოჩნდება. გადახდის ან შეკვეთის სტატუსის პრობლემისას დაუკავშირდით მხარდაჭერას.',
};

export async function getStorefront() {
  try {
    const response = await fetch(`${apiBase}/storefront`);
    if (!response.ok) {
      throw new Error('Failed to fetch storefront');
    }
    return await response.json();
  } catch {
    return fallbackStorefront;
  }
}

export async function getProducts(filters: URLSearchParams | string = '') {
  const query = typeof filters === 'string' ? filters : filters.toString();
  try {
    const response = await fetch(`${apiBase}/products${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return (await response.json()).products ?? [];
  } catch {
    const params = new URLSearchParams(query);
    return fallbackProducts.filter((product) => {
      const search = params.get('q')?.toLowerCase();
      const minPrice = Number(params.get('minPrice'));
      const maxPrice = Number(params.get('maxPrice'));
      const year = params.get('year');
      const model = params.get('model')?.toLowerCase();
      const sku = params.get('sku')?.toLowerCase();
      const content = `${product.name} ${product.description} ${product.model} ${product.sku} ${product.tags.join(' ')} ${product.category} ${product.material}`.toLowerCase();
      const effectivePrice = product.salePrice ?? product.price;
      return (!search || content.includes(search))
        && (!params.has('minPrice') || effectivePrice >= minPrice)
        && (!params.has('maxPrice') || effectivePrice <= maxPrice)
        && (!year || String(product.year) === year)
        && (!model || product.model.toLowerCase().includes(model))
        && (!sku || product.sku.toLowerCase().includes(sku) || product.id.toLowerCase().includes(sku));
    });
  }
}

export async function getCollections() {
  try {
    const response = await fetch(`${apiBase}/collections`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    return (await response.json()).collections ?? [];
  } catch {
    return [];
  }
}

export async function searchProducts(query: string) {
  return getProducts(new URLSearchParams({ q: query }));
}

export async function getBlogPosts() {
  try {
    const response = await fetch(`${apiBase}/blog`);
    if (!response.ok) throw new Error('Failed to fetch blog posts');
    return (await response.json()).posts ?? [];
  } catch {
    return fallbackBlogPosts;
  }
}

export async function getBlogPost(slug: string) {
  const response = await fetch(`${apiBase}/blog/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error('Failed to fetch journal entry');
  return (await response.json()).post;
}

export async function getPolicies() {
  try {
    const response = await fetch(`${apiBase}/policies`);
    if (!response.ok) throw new Error('Failed to fetch policies');
    const policies = (await response.json()).policies ?? [];
    if (policies.length) return policies.some((policy: { key: string }) => policy.key === 'payment') ? policies : [...policies, fallbackPaymentPolicy];
  } catch {
    // Use the built-in policy copy while the API is unavailable.
  }
  return [
    { key: 'privacy', title: 'Privacy Policy', content: 'We protect personal data and use it only to process orders, improve the customer experience, and provide account updates.' },
    { key: 'terms', title: 'Terms & Conditions', content: 'By placing an order, customers agree to product availability, shipping timelines, and return conditions defined by the boutique.' },
    { key: 'returns', title: 'Return Policy', content: 'Eligible returns within 14 days are reviewed in line with order condition and item specification.' },
    { key: 'cookies', title: 'Cookies Policy', content: 'We use cookies for remember-me functionality, cart persistence, and analytics to improve the shopping experience.' },
    fallbackPaymentPolicy,
  ];
}
