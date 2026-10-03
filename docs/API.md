# API Reference

## Authentication

### POST /api/auth/register
Creates a customer account.

Request body:
- email: string
- password: string (minimum 8 chars)
- firstName?: string
- lastName?: string

### POST /api/auth/login
Authenticates an existing user and returns a JWT token.

### GET /api/auth/me
Returns the current user profile. Requires authentication.

### POST /api/auth/forgot-password
Returns a reset message. Intended for future password reset implementation.

### POST /api/auth/reset-password
Returns a reset confirmation message.

## Products

### GET /api/products
Gets published and available products. Optional query parameters can be combined and shared:

- `q`: multilingual keyword search across name, description, model, SKU/ID, tags, category, collection, and material
- `minPrice`, `maxPrice`: inclusive range over the effective price (sale price when set)
- `collection`: collection slug
- `year`, `model`, `sku`: product filters; `sku` also matches product ID
- `material`: `SILVER_ONLY`, `SILVER_GOLD`, `SILVER_DIAMONDS`, or `SILVER_STONES`

### GET /api/products/:slug
Gets one product by slug, along with related items.

### POST /api/products
Admin-only product creation endpoint.

## Search

### GET /api/search?q=ring
Searches product name, model, description, and tags.

## Blog

### GET /api/blog
List all published blog posts.

### GET /api/blog/:slug
Get a single blog post by slug.

## Orders

### POST /api/orders
Creates an order for the authenticated user.

### GET /api/orders/mine
Lists orders for the authenticated user.

## Payments

### POST /api/payments/initiate
Initializes a mock payment and returns a transaction reference. It does not charge a real payment method.

### GET /api/payments/callback
Mock callback URL for payment processing.

## Contact

### POST /api/contact
Creates a contact message.

### GET /api/contact
Admin-only list of contact submissions.

## Storefront

### GET /api/storefront
Returns featured products, new products, blog posts, and store settings.

### GET /api/categories
Returns category metadata and product counts.

### GET /api/settings
Returns storefront settings.

## Admin

### GET /api/admin/dashboard
Returns aggregated dashboard metrics for admins.

### GET /api/admin/customers
Lists customer accounts.

### GET /api/admin/settings
Gets admin-configured settings.

### GET /api/collections
Lists product collections and their product counts.

### POST /api/admin/collections
Creates a collection. Requires admin authentication.

### PUT /api/admin/collections/:id
Updates a collection. Requires admin authentication.

### DELETE /api/admin/collections/:id
Deletes a collection without deleting its products. Requires admin authentication.

### POST /api/admin/uploads
Uploads one JPG/JPEG, PNG, or WEBP image (maximum 5 MB) and returns its public URL. Requires admin authentication.

### DELETE /api/admin/uploads
Deletes a generated image URL stored by this service. Requires admin authentication.
