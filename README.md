# GYMZ — Gym Training PWA

تطبيق Next.js 14 شغال كـ **PWA حقيقي** (يتثبت على الموبايل زي أي تطبيق، Android و iOS، من غير متجر تطبيقات) ومتصل بـ **Supabase** مباشرة من الـ frontend.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (Pages Router) |
| PWA | next-pwa (Service Worker + manifest + تثبيت على الشاشة الرئيسية) |
| Backend / DB | Supabase (Auth + Database مباشرة من الـ client) |
| Animations | Framer Motion |
| Styling | CSS Variables (بدون Tailwind — مش مستخدم في الكود) |

> ملحوظة: مفيش backend مستقل (Express/Postgres) في هذا الإصدار — كل شيء بيتعامل مع Supabase مباشرة عن طريق `src/lib/supabaseClient.js`.

## 🚀 تشغيل المشروع محليًا

```bash
npm install
cp .env.example .env.local
# عدّل القيم في .env.local بمفاتيح مشروع Supabase بتاعك
npm run dev
```

افتح `http://localhost:3000`.

## 🔑 Environment Variables

| Variable | الوصف |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروع Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | الـ anon/public key بتاع Supabase |
| `NEXT_PUBLIC_CONTACT_PHONE` | رقم التواصل المعروض في التطبيق |

**لا ترفع `.env.local` على GitHub أبدًا** — استخدم `.env.example` كمرجع، والقيم الحقيقية تتضاف في Vercel من Project Settings → Environment Variables.

## 📦 النشر على Vercel

1. ارفع المشروع على GitHub (الريبو يكون جذره هو نفس مجلد هذا المشروع، فيه `package.json` في الجذر مباشرة).
2. من Vercel: New Project → استورد الريبو → Framework Preset سيتعرف عليه تلقائيًا كـ Next.js.
3. في Environment Variables ضيف المتغيرات الثلاثة اللي فوق (Production + Preview).
4. Deploy.
5. بعد النشر، افتح الرابط من الموبايل → المتصفح هيعرض خيار "Add to Home Screen" / "تثبيت التطبيق" — وده هيحوّل الموقع لتطبيق حقيقي على الشاشة الرئيسية بأيقونة وشاشة بداية، يفتح بدون شريط المتصفح ويشتغل أوفلاين جزئيًا.

## 📱 تثبيت التطبيق (PWA)

- **Android (Chrome):** زر "تثبيت التطبيق" يظهر تلقائيًا، أو من القائمة ⋮ → "Add to Home screen".
- **iOS (Safari):** زر المشاركة (Share) → "Add to Home Screen".

## 📁 هيكل المشروع

```
.
├── public/
│   ├── icons/              # أيقونات التطبيق بكل المقاسات المطلوبة
│   └── manifest.json       # PWA manifest
├── src/
│   ├── pages/
│   │   ├── _app.jsx        # Providers + Layout عام
│   │   ├── _document.jsx   # ربط manifest + meta tags الخاصة بالتطبيق
│   │   ├── index.jsx       # الصفحة الرئيسية
│   │   ├── login.jsx / register.jsx
│   │   ├── dashboard.jsx / onboarding.jsx / profile.jsx
│   │   ├── exercises/ / programs/ / nutrition/ / shapes/ / admin/
│   │   ├── bmi.jsx / tools.jsx / workout.jsx
│   ├── components/layout/Navbar.jsx
│   ├── context/AuthContext.jsx     # حالة المستخدم + Supabase auth
│   ├── context/LangContext.jsx     # عربي/إنجليزي + Dark/Light
│   ├── lib/supabaseClient.js
│   └── styles/globals.css
├── next.config.js          # next-pwa + Security headers (CSP, etc.)
└── package.json
```

## 🔐 Security Headers

محدد في `next.config.js`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

## 📌 خطوات تالية مقترحة

- [ ] صفحة تفاصيل تمرين (`/exercises/[id]`)
- [ ] صفحة تفاصيل برنامج (`/programs/[id]`)
- [ ] لوحة تحكم Admin كاملة (CRUD على التمارين والبرامج)
- [ ] Push Notifications عبر next-pwa
