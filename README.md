# STURDIER GROUP

A premium full-stack silver storefront for STURDIER GROUP. The project includes a React + Vite storefront, Express + TypeScript API, Prisma/PostgreSQL schema, and an authenticated content management panel.

## Stack

- Frontend: React, Vite, TypeScript, React Router, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL
- Auth: JWT with password hashing and role-based access control
- Features: GEO/ENG storefront, product catalog and shareable filters, cart, wishlist, authenticated customer accounts and order history, demo checkout, blog, contact form, and admin CMS

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

## Installation

1. Clone the repository.
2. Copy `.env.example` to `.env` and update the values for your environment.
3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client and run migrations:

```bash
npm run db:generate --workspace backend
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```

## Run locally

```bash
npm run dev
```

This starts the backend and frontend together.

## Workspace scripts

```bash
npm run dev
npm run build
npm run seed
npm run lint
```

## Backend API summary

- `GET /api/health` — health check
- `POST /api/auth/register` — register a new customer
- `POST /api/auth/login` — login
- `GET /api/auth/me` — current authenticated user
- `POST /api/contact` — create a contact message
- `GET /api/products` — list published products
- `GET /api/products/:slug` — fetch a product by slug
- `GET /api/search` — search products
- `GET /api/blog` — list published blog posts
- `GET /api/blog/:slug` — fetch a blog post
- `POST /api/orders` — create an order for the logged-in user
- `GET /api/orders/mine` — list a user’s orders
- `POST /api/payments/initiate` — create a mock payment session

## Admin access

Open `/admin` (or `/admin-login`) and sign in with the seeded admin account:

- Email: `admin@silverboutique.com`
- Password: `Admin123!@#`

The admin editor at `/admin` manages homepage and About/Contact copy, bilingual products and journal entries, product collections, policies, branding, contact details, and social links. It supports authenticated JPG/JPEG/PNG/WEBP image uploads up to 5 MB for the homepage, logo, products, collections, and journal entries. Local uploads are stored under `backend/uploads`; configure durable shared storage before deploying multiple backend instances.

## Notes

- Customer accounts support registration, profile/address display, and order history. Orders require an authenticated account.
- Use a PostgreSQL database with UTF-8 encoding so Georgian page and product text can be saved.
- The checkout currently creates a pending demo order and does not collect card data or charge a payment method. Configure and test a real payment provider before accepting live orders.
- The `/payment` page is linked from the footer and its GEO/ENG text is editable in the admin Policies tab.
- The language switch provides GEO/ENG interface copy; administrators can edit bilingual page, product, collection, blog, and policy content.
- Replace the development admin password and configure production secrets, HTTPS, database backups, and persistent image storage before deployment.
