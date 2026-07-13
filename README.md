# E-commerce Backend

Node.js and Express backend for an e-commerce application with authentication, product management, carts, orders, reviews, Stripe checkout, and Stripe webhooks.

## Features

- JWT authentication with access and refresh tokens
- Role-based authorization for `admin`, `seller`, and `user`
- Product CRUD with seller ownership checks
- Product thumbnail upload through Cloudinary
- Cart management with stock validation
- Stripe Checkout session creation
- Stripe webhook handling for completed and expired checkout sessions
- Stock reservation and release flow for checkout sessions
- Order management and user order cancellation
- Product reviews with average rating updates
- Request validation with Zod
- MongoDB persistence with Mongoose

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- Stripe
- Cloudinary
- Multer
- Zod

## Requirements

- Node.js 20+
- MongoDB database
- Stripe account and webhook secret
- Cloudinary account

## Environment Variables

Create a `.env` file in the project root:

```env
DB_Url=mongodb_connection_string
access_secret_key=access_token_secret
refresh_secret_key=refresh_token_secret
STRIPE_SECRET_KEY=stripe_secret_key
STRIPE_WEBHOOK_SECRET=stripe_webhook_secret
CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_API_SECRET=cloudinary_api_secret
```

## Installation

```bash
npm install
```

## Run

```bash
npm run run
```

The API runs on:

```text
http://localhost:5000
```

## Webhook

Stripe webhook endpoint:

```text
POST /cart/webhook
```

For local development, forward Stripe events to the local server:

```bash
stripe listen --forward-to localhost:5000/cart/webhook
```

Use the generated webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

## API Overview

### Auth and Users

```text
POST   /user/register
POST   /user/login
POST   /user/refresh
GET    /user/me
PATCH  /user/me
DELETE /user/me
GET    /user/me/orders
DELETE /user/me/order/:id
GET    /user
GET    /user/:id
PATCH  /user/:id
DELETE /user/:id
```

### Products

```text
POST   /product
GET    /product?page=1&limit=10
GET    /product/:id
PATCH  /product/:id
DELETE /product/:id
GET    /product/seller/:id?page=1&limit=10
```

### Cart and Checkout

```text
POST   /cart
GET    /cart
DELETE /cart
DELETE /cart/:id
POST   /cart/payment
POST   /cart/webhook
```

### Orders

```text
GET    /order?page=1&limit=10
GET    /order/:id
PATCH  /order/:id/:status
DELETE /order/:id
```

Allowed order statuses:

```text
processing
shipped
delivered
cancelled
```

### Reviews

```text
GET    /review/product/:id?page=1&limit=10
POST   /review/:id
PATCH  /review/:id
DELETE /review/:id
```

## Example Request Bodies

Register:

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "TestPass1!",
  "phone": "01012345678",
  "role": "user"
}
```

Add item to cart:

```json
{
  "id": "product_id",
  "quantity": 2
}
```

Add review:

```json
{
  "stars": 5,
  "review": "Great product"
}
```

## Notes

- Protected routes require an `Authorization: Bearer <token>` header.
- Product creation uses multipart form data with a `thumbnail` file field.
- Admin routes require an admin token.
- Seller product routes require a seller token where applicable.
