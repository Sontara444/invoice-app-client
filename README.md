# Invoice App — Client

React + Vite frontend for the Invoice management application.

## 🚫 Plus Points Implemented

| Feature | Details |
|---|---|
| ✅ **Authentication** | JWT login/register, bcrypt password hashing, protected routes via React Context |
| ✅ **PDF Generation** | One-click invoice PDF export using `jsPDF` + `html2canvas` |
| ✅ **Tax Logic** | Configurable tax rate input; subtotal, tax amount, and grand total calculated server-side |
| ✅ **Multi-Currency** | Currency selector on invoice create; amounts formatted with correct currency symbol |
| ✅ **Overdue Logic** | Invoices past their due date are automatically marked **Overdue** with a red badge |
| ✅ **Advanced UI Animations** | Smooth hover transitions, loading spinners per button, toggle switch animation, live preview updates |

## Tech Stack
- React 19, Vite 7, Tailwind CSS 4
- React Router DOM 7, Lucide React
- jsPDF + html2canvas (PDF export)

## Features
- ✅ JWT Authentication (login, register, protected routes)
- ✅ Dashboard with income overview stats
- ✅ Invoice list with real-time search
- ✅ Status filter tabs — All, Pending, Paid, Overdue
- ✅ Computed status badges (Pending / Paid / Overdue)
- ✅ Create invoice with dynamic line items & tax calculation
- ✅ Live preview panel on invoice create page
- ✅ Auto-generated unique invoice numbers
- ✅ Client-side validation with inline error messages
- ✅ Save as Draft or Send Invoice with individual loading spinners
- ✅ Invoice detail view with full line items and payment history
- ✅ Add Payment modal with auto-updated Balance Due
- ✅ Export invoice to PDF
- ✅ Archive (soft-delete) invoices
- ✅ Fixed viewport layout — no page scroll, internal panel scrolling

## Setup

```bash
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Run

```bash
npm run dev
```

Runs at **http://localhost:5173**

> The backend server must be running first.

## Pages
| Route | Page |
|---|---|
| `/` | Dashboard |
| `/invoices` | Invoice List |
| `/invoices/new` | Create Invoice |
| `/invoices/:id` | Invoice Details |
| `/login` | Login |
| `/register` | Register |
