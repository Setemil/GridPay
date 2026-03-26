# Kilo — Frontend

React 19 + TypeScript frontend for the Kilo P2P solar energy trading platform. Built with Vite.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/browse` | Public energy marketplace — buy, sell, and view transaction history |
| `/login` | User login |
| `/register` | User registration |
| `/payment/callback` | Post-payment verification page (Interswitch redirect target) |
| `/dashboard` | Authenticated home — links to all account sections |
| `/my-listings` | Manage energy listings and smart meters |
| `/transactions` | Full transaction history with energy delivery logs |
| `/profile` | Account details and meter overview |

## Stack

- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **React Router v6** for client-side routing
- **Zustand** for auth state (JWT + user profile)
- **Pure CSS** with design tokens — no Tailwind or component library
- **Chakra Petch** (headings) + **DM Mono** (body/data) typefaces

## Setup

```bash
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
# http://localhost:5173
```

## Structure

```
src/
├── pages/        # Public routes (Landing, Browse, Login, Register, PaymentCallback)
├── secure/       # Authenticated routes (Dashboard, MyListings, Transactions, Profile)
├── services/     # API wrappers for listings, transactions, payments, meters, logs
├── store/        # Zustand auth store
├── types/        # Shared TypeScript interfaces
├── components/   # Reusable UI (Modal, nav components, shared CSS)
└── assets/       # Design tokens (CSS variables)
```

## Payment Flow

1. Buyer selects a listing and enters kWh amount
2. Frontend calls `POST /api/payments/initiate` on the FastAPI backend
3. A hidden form is submitted directly to the Interswitch WebPay URL
4. After payment, Interswitch POSTs `txnref` to the backend redirect endpoint
5. Backend 302-redirects the browser to `/payment/callback?txnref=...`
6. Callback page calls `GET /api/payments/verify/{txnref}` to confirm and lock energy delivery
