# DesiDera

QR-based restaurant ordering web app.

## Structure

- `backend/` Express + MongoDB API
- `frontend/` Next.js app (Pages Router)

## Backend (Express)

### Setup

1. Create a `.env` file in `backend/` (copy from `.env.example`):

- `MONGODB_URI` (required)
- `PUBLIC_BASE_URL` (required for correct bill URLs)
- `WHATSAPP_PHONE` (defaults to `7318582007`)

2. Install deps:

- `npm install`

3. Seed menu:

- `npm run seed`

4. Run dev server:

- `npm run dev`

Backend runs on `http://localhost:5000`.

### API

- `GET /api/menu`
- `GET /api/cart/:tableNumber`
- `POST /api/cart/:tableNumber/items`
- `PATCH /api/cart/:tableNumber/items`
- `DELETE /api/cart/:tableNumber`
- `POST /api/orders` (creates order, returns WhatsApp click link + bill PDF link)
- `POST /api/feedback`
- `GET /api/bills/:pdfFileName`

## Frontend (Next.js)

### Setup

1. Create `frontend/.env.local` (copy from `.env.local.example`):

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`

2. Install deps:

- `npm install`

3. Run dev server:

- `npm run dev`

Frontend runs on `http://localhost:3000`.

## Usage

- Open `http://localhost:3000/table/1` (or any table number).
- Add items to cart.
- Click `Place Order (WhatsApp)`.
  - It opens a WhatsApp click-to-chat link (simulating sending to `7318582007`).
  - It also shows a `View Bill PDF` link.
- Use `/feedback` to submit feedback.

## Deployment notes

- **Backend (Render)**: set env vars `MONGODB_URI`, `PUBLIC_BASE_URL` (Render public URL), `WHATSAPP_PHONE`.
- **Frontend (Vercel)**: set env var `NEXT_PUBLIC_API_BASE_URL` to the backend public URL.

