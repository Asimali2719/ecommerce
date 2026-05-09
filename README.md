# 🛒 Luxe Shop — Production eCommerce

A full-stack, production-ready eCommerce platform built with **Next.js 15**, **TypeScript**, **Prisma**, **PostgreSQL**, **NextAuth v5**, and **Stripe**.

---

## 📁 Project Structure

```
ecommerce/
├── prisma/
│   ├── schema.prisma          # Database schema (all models)
│   └── seed.ts                # Seed admin + demo users + products
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage (hero, categories, featured)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── products/          # Product listing + [slug] detail
│   │   ├── checkout/          # Checkout page (Stripe + COD)
│   │   ├── orders/            # Order history + [id] detail
│   │   ├── admin/             # Admin panel (dashboard, products, orders, users)
│   │   └── api/               # All REST API route handlers
│   │       ├── auth/          # NextAuth + register
│   │       ├── products/      # Public product API
│   │       ├── orders/        # Order create + list
│   │       ├── stripe/        # Checkout session + webhook
│   │       └── admin/         # Admin-only product + order APIs
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, HeroSection, Providers
│   │   ├── product/           # ProductCard, ProductDetail, ProductFilters
│   │   ├── cart/              # CartSidebar
│   │   ├── checkout/          # CheckoutForm
│   │   └── admin/             # AdminSidebar, ProductForm, OrderStatusSelect
│   ├── lib/
│   │   ├── auth.ts            # NextAuth v5 config (Credentials + Google)
│   │   ├── db.ts              # Prisma singleton
│   │   ├── stripe.ts          # Stripe server + client helpers
│   │   ├── utils.ts           # formatPrice, slugify, order totals, etc.
│   │   └── validations.ts     # Zod schemas for all inputs
│   ├── store/
│   │   └── cart.ts            # Zustand cart store (persisted to localStorage)
│   ├── types/
│   │   ├── index.ts           # App-level TypeScript types
│   │   └── next-auth.d.ts     # NextAuth session type extensions
│   └── middleware.ts          # Route protection (auth + admin guard)
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone <your-repo-url> ecommerce
cd ecommerce
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Railway / Supabase (see below) |
| `AUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI (see below) |

### 3. Set Up the Database

**Option A — Supabase (recommended, free tier)**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → Database → Copy the **Connection string (URI)**
3. Paste into `DATABASE_URL` in `.env.local`

**Option B — Railway**
1. Go to [railway.app](https://railway.app) → New Project → PostgreSQL
2. Click the Postgres service → Variables tab → Copy `DATABASE_URL`

```bash
# Push schema to database
npm run db:push

# Seed with demo data (admin + test user + 6 products)
npm run db:seed
```

### 4. Set Up Stripe Webhook (local)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_... secret into STRIPE_WEBHOOK_SECRET in .env.local
```

### 5. Run the Dev Server

```bash
npm run dev
# Open http://localhost:3000
```

**Demo accounts (after seeding):**
- Admin: `admin@shop.com` / `admin123` → `/admin`
- User: `user@shop.com` / `user123`

---

## ☁️ Deployment to Vercel + Supabase

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ecommerce.git
git push -u origin main
```

### Step 2: Create Production Database (Supabase)

1. [supabase.com](https://supabase.com) → New Project
2. Choose a strong database password
3. Settings → Database → **Connection string → URI**
4. Copy — this is your `DATABASE_URL`

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project → select your GitHub repo
2. Framework preset: **Next.js** (auto-detected)
3. Add **all environment variables** from your `.env.example`:

```
NEXT_PUBLIC_APP_URL         = https://your-project.vercel.app
DATABASE_URL                = (Supabase connection string)
AUTH_SECRET                 = (openssl rand -base64 32)
GOOGLE_CLIENT_ID            = (from Google Cloud)
GOOGLE_CLIENT_SECRET        = (from Google Cloud)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_SECRET_KEY           = sk_live_...
STRIPE_WEBHOOK_SECRET       = whsec_... (set after step 4)
```

4. Click **Deploy**

### Step 4: Run Migrations on Production

In Vercel → Settings → Functions → add a one-time command, **or** run locally with your production `DATABASE_URL`:

```bash
DATABASE_URL="postgres://..." npx prisma migrate deploy
DATABASE_URL="postgres://..." npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Step 5: Set Up Stripe Webhook (Production)

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → Add Endpoint
2. URL: `https://your-project.vercel.app/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
4. Copy the **Signing Secret** → update `STRIPE_WEBHOOK_SECRET` in Vercel → Redeploy

### Step 6: Update Google OAuth (if using)

In [Google Cloud Console](https://console.cloud.google.com/):
- APIs & Services → Credentials → your OAuth client
- Authorised redirect URIs → Add `https://your-project.vercel.app/api/auth/callback/google`

---

## 🔑 Key Features Reference

### Authentication
- Email/password (bcrypt hashed) via NextAuth Credentials provider
- Google OAuth via NextAuth Google provider
- JWT sessions stored in cookies
- Role-based access: `USER` | `ADMIN`
- Middleware-level route protection for `/checkout`, `/orders`, `/admin`

### Cart
- Zustand store persisted to `localStorage` (survives page reload)
- Slide-out sidebar with quantity controls
- Real-time subtotal, tax (8%), free shipping over $100

### Payments
- **Stripe Checkout** — redirects to hosted Stripe page; webhook marks order `PAID`
- **Cash on Delivery** — order created immediately with `PENDING` payment status
- Stock decremented atomically inside a DB transaction

### Admin Panel (`/admin`)
| Page | Features |
|---|---|
| Dashboard | Revenue, order count, products, users, low-stock alerts |
| Products | List, create, edit, soft-delete (unpublish) |
| Orders | Filter by status, inline status update dropdown |
| Users | View all registered users and order counts |

### API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account |
| `GET` | `/api/products` | — | List products (filterable) |
| `GET` | `/api/orders` | User | List own orders |
| `POST` | `/api/orders` | User | Create COD order |
| `POST` | `/api/stripe/checkout` | User | Create Stripe session |
| `POST` | `/api/stripe/webhook` | Stripe | Handle payment events |
| `GET/POST` | `/api/admin/products` | Admin | List / create products |
| `PATCH/DELETE` | `/api/admin/products/[id]` | Admin | Update / soft-delete |
| `GET/PATCH` | `/api/admin/orders/[id]` | Admin | Get / update order status |

---

## 🔒 Security

- All admin API routes verify `role === 'ADMIN'` server-side
- Input validated with **Zod** on every API route
- Passwords hashed with **bcrypt** (12 rounds)
- Stripe webhook signature verified before processing
- `AUTH_SECRET` rotatable without schema changes
- SQL injection impossible via Prisma's parameterised queries
- Stock decremented inside a **transaction** to prevent overselling

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary colour | `stone-900` (#1c1917) |
| Accent | `amber-600` (#d97706) |
| Success | `emerald-500` |
| Danger | `red-600` |
| Font (body) | Inter (variable) |
| Font (headings) | Playfair Display (variable) |
| Border radius | `rounded-xl` / `rounded-2xl` |

---

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build (runs prisma generate first)
npm run start        # Start production server
npm run db:push      # Push schema changes without migration history
npm run db:migrate   # Create & apply migration (production-safe)
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed demo data
npm run lint         # ESLint
```

---

## 🗺️ Roadmap (Next Steps)

- [ ] Product reviews & ratings
- [ ] Wishlist / saved items
- [ ] Discount codes & coupons
- [ ] Email notifications (Resend / SendGrid)
- [ ] Image uploads (Cloudinary / Uploadthing)
- [ ] Inventory import via CSV
- [ ] Analytics dashboard (charts)
- [ ] Multi-currency support
