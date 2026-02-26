# Client – Invoice Details Frontend

React + Vite + Tailwind CSS frontend for the Invoice Details Page.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** (`@tailwindcss/vite`)
- **React Router DOM**
- **Lucide React** (icons)

## Setup

```bash
npm install
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build for production |

> The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically — no CORS config needed.

## Structure

```
src/
├── components/
│   ├── Sidebar.jsx           # Left navigation
│   └── AddPaymentModal.jsx   # Payment entry modal
├── pages/
│   ├── InvoiceListPage.jsx   # / — All invoices table
│   └── InvoiceDetailsPage.jsx # /invoices/:id — Two-column detail view
└── services/
    └── invoiceApi.js         # Fetch functions for all API endpoints
```

## Routes

| Path | Page |
|---|---|
| `/` | Invoice list |
| `/invoices/:id` | Invoice details + preview |
