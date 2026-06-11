# GYMX — Gym Training PWA

> Premium gym training programs & exercises. Built for those who are serious.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Framer Motion |
| PWA | next-pwa (offline-ready) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + Refresh Token Rotation |
| Images | Cloudinary |
| Security | Helmet, Rate Limiting, Input Sanitization |

---

## 🚀 Setup

### 1. Database

```bash
psql -U postgres
CREATE DATABASE gymx_db;
\c gymx_db
\i backend/config/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
# Create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```

---

## 🔐 Security Features

- **JWT Access Tokens** (15min expiry) — short-lived, in memory
- **Refresh Token Rotation** — new token each refresh, old one revoked
- **Tokens stored safely** — access in sessionStorage, refresh in httpOnly-style cookie
- **Rate Limiting** — 10 login attempts / 15min, 100 req/15min general
- **Helmet.js** — security headers (CSP, HSTS, etc.)
- **Input Sanitization** — strips XSS attempts
- **bcrypt cost 12** — strong password hashing
- **Timing-safe login** — prevents user enumeration
- **Soft Deletes** — data never permanently deleted
- **Audit Log** — every action tracked with IP + user agent
- **Admin Role Guard** — all write operations require admin

---

## 📁 Project Structure

```
gymx/
├── backend/
│   ├── config/
│   │   ├── database.js         # PostgreSQL pool
│   │   └── schema.sql          # Full DB schema + seed
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── exerciseController.js
│       │   └── programController.js
│       ├── middleware/
│       │   ├── auth.js          # JWT + refresh + audit
│       │   └── security.js     # Rate limit + helmet + sanitize
│       ├── routes/
│       │   ├── auth.js
│       │   └── index.js
│       └── index.js            # Express app entry
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx  # Auth + auto token refresh
        ├── components/
        │   └── layout/
        │       └── Navbar.jsx
        ├── pages/
        │   ├── index.jsx        # Homepage (hero + programs preview)
        │   ├── exercises/       # Exercise library with filters
        │   ├── login.jsx
        │   └── register.jsx
        └── styles/
            └── globals.css      # Design tokens + utilities
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--obsidian` | `#0A0A0A` | Main background |
| `--carbon` | `#141414` | Cards |
| `--iron` | `#1E1E1E` | Borders |
| `--volt` | `#C8F135` | Primary accent |
| `--chalk` | `#F0EDE8` | Primary text |
| `--ash` | `#6B6B6B` | Secondary text |

**Fonts:**
- Display: `Bebas Neue` (headings)
- Body: `Inter` (text)
- Mono: `JetBrains Mono` (labels, data)

---

## 📌 Next Steps

- [ ] Add exercise detail page (`/exercises/[id]`)
- [ ] Add programs page + program detail
- [ ] Admin panel (add/edit/delete exercises & programs)
- [ ] User profile page
- [ ] Trainer profile (future)
- [ ] Push notifications (PWA)
- [ ] App icons (192x192, 512x512)
