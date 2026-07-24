// src/pages/nutrition/index.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Loader, Calculator, Droplets, Zap, Barcode, Search, Check, AlertTriangle, Camera, X, ScanLine } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

// ── شاشة غير مشترك ────────────────────────────────────────
function PremiumGate({ user }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', direction: 'rtl' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '36px 28px', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--accent),transparent)' }} />
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,77,46,0.1)', border: '1px solid rgba(255,77,46,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 26 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 8 }}>للمشتركين فقط</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 24 }}>
          الأنظمة الغذائية متاحة للمشتركين. اشترك دلوقتي عن طريق فودافون كاش واتفتحلك فوراً.
        </p>
        <div style={{ padding: '16px', background: 'rgba(255,77,46,0.07)', border: '1px solid rgba(255,77,46,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 8 }}>ابعت على فودافون كاش</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--chalk)', letterSpacing: '0.06em', direction: 'ltr' }}>01097931713</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--accent)', lineHeight: 1 }}>29</div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>جنيه</div>
            </div>
          </div>
        </div>
        <a
          href={`https://wa.me/201097931713?text=عايز اشتراك الأنظمة الغذائية — إيميلي: ${user?.email || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: 12, textDecoration: 'none', color: '#25D166', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em' }}
        >
          📲 ابعت السكرين شوت على واتساب
        </a>
        <p style={{ fontSize: '0.72rem', color: 'var(--ash)', textAlign: 'center', lineHeight: 1.6 }}>
          بعد التأكيد هيتفتحلك الاشتراك على إيميلك<br />
          <span style={{ color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{user?.email}</span>
        </p>
      </motion.div>
    </div>
  );
}

// ── قاعدة بيانات الأطعمة ──────────────────────────────────
const PROTEIN_OPTIONS = [
  { name: '100جم صدر فراخ مشوي',            protein: 31,   carbs: 0,   fat: 3.6,  cal: 165 },
  { name: '150جم تونة في الماء',             protein: 33,   carbs: 0,   fat: 1.5,  cal: 147 },
  { name: '5 بيضات مسلوقة',                  protein: 30,   carbs: 2,   fat: 25,   cal: 350 },
  { name: '150جم جبنة قريش',                 protein: 24,   carbs: 4,   fat: 1,    cal: 121 },
  { name: '100جم لحمة بتلو مشوية',           protein: 26,   carbs: 0,   fat: 12,   cal: 217 },
  { name: '150جم كبدة دجاج',                 protein: 30,   carbs: 2,   fat: 8,    cal: 198 },
  { name: '120جم سمك بلطي مشوي',             protein: 27,   carbs: 0,   fat: 4,    cal: 144 },
  { name: '150جم جمبري مسلوق',               protein: 36,   carbs: 1,   fat: 1.5,  cal: 162 },
  { name: '100جم سمك سالمون مشوي',           protein: 22,   carbs: 0,   fat: 13,   cal: 205 },
  { name: '1 سكوب بروتين واي (30جم)',        protein: 24,   carbs: 3,   fat: 1.5,  cal: 122 },
  { name: '150جم زبادي يوناني خالي الدسم',   protein: 20,   carbs: 7,   fat: 0.8,  cal: 115 },
  { name: '100جم بياض بيض',                  protein: 11,   carbs: 0.7, fat: 0.2,  cal: 49  },
  { name: '100جم ورك فراخ مشوي بدون جلد',    protein: 26,   carbs: 0,   fat: 7,    cal: 167 },
  { name: '150جم لحم مفروم قليل الدسم',      protein: 31.5, carbs: 0,   fat: 7.5,  cal: 194 },
  { name: '100جم كبدة بقري مشوية',           protein: 20,   carbs: 3.9, fat: 3.6,  cal: 128 },
  { name: '150جم سمك دنيس مشوي',             protein: 33,   carbs: 0,   fat: 6,    cal: 186 },
  { name: '150جم لحم ضاني مشوي قليل الدهن',  protein: 34.5, carbs: 0,   fat: 15,   cal: 273 },
  { name: '200مل حليب خالي الدسم',           protein: 7,    carbs: 10,  fat: 0.2,  cal: 70  },
  { name: '150جم جبنة فيتا قليلة الدسم',     protein: 18,   carbs: 4,   fat: 9,    cal: 169 },
  { name: '100جم حبار مشوي',                 protein: 16,   carbs: 3,   fat: 1.5,  cal: 90  },
  { name: '100جم ديك رومي مشوي',             protein: 29,   carbs: 0,   fat: 1,    cal: 125 },
  // 💰 خيارات اقتصادية
  { name: '100جم سردين معلب',                protein: 25,   carbs: 0,   fat: 11,   cal: 208 },
  { name: '3 بيضات كاملة مقلية',             protein: 18,   carbs: 1,   fat: 21,   cal: 258 },
  { name: '100جم ورك فراخ بالجلد مشوي',      protein: 24,   carbs: 0,   fat: 15,   cal: 245 },
  { name: '150جم زبادي بلدي كامل الدسم',     protein: 8,    carbs: 11,  fat: 8,    cal: 150 },
  { name: '150جم فراخ مفرومة اقتصادية',      protein: 28,   carbs: 0,   fat: 6,    cal: 165 },

  // 📋 من الجدول الغذائي
  { name: "100جم اللانشون الرومي المدخن", protein: 20, carbs: 6, fat: 3, cal: 91 },
  { name: "100جم صدر دجاج مطهي", protein: 30, carbs: 0, fat: 4, cal: 165 },
  { name: "100جم شوربة دجاج", protein: 2, carbs: 0.5, fat: 0.6, cal: 16 },
  { name: "100جم صدر بط مطهي", protein: 26.22, carbs: 0, fat: 2.38, cal: 133 },
  { name: "100جم ورك بط مطهي", protein: 29.1, carbs: 0, fat: 5.96, cal: 178 },
  { name: "100جم بياض البيض فقط نئ", protein: 10, carbs: 0.7, fat: 0.2, cal: 52 },
  { name: "100جم البسطرمة", protein: 22.7, carbs: 0.2, fat: 1.5, cal: 105 },
  { name: "100جم الكبدة المطهية", protein: 20.36, carbs: 3.89, fat: 3.63, cal: 135 },
  { name: "100جم التونة المصفاة", protein: 23.62, carbs: 0, fat: 2.97, cal: 128 },
  { name: "100جم السمك البورى المطهي", protein: 24.81, carbs: 0, fat: 4.86, cal: 150 },
  { name: "100جم السمك البلطى المطهي", protein: 26, carbs: 0, fat: 3, cal: 128 },
  { name: "100جم السمك السالمون المطهي", protein: 18, carbs: 0, fat: 4.3, cal: 117 },
  { name: "100جم الجمبرى المطهي", protein: 24.47, carbs: 1.17, fat: 5.03, cal: 154 },
  { name: "100جم جبنة قريش", protein: 12.49, carbs: 2.68, fat: 4.51, cal: 103 },
  { name: "100جم الجرجير", protein: 2.3, carbs: 1.29, fat: 0.1, cal: 11 },
  { name: "100جم الترمس المسلوق", protein: 16, carbs: 10, fat: 3, cal: 120 },
];

const CARB_OPTIONS = [
  { name: '100جم أرز أبيض مطبوخ',       protein: 2.7, carbs: 28,   fat: 0.3, cal: 130 },
  { name: '150جم مكرونة مطبوخة',         protein: 5,   carbs: 36,   fat: 1,   cal: 174 },
  { name: '80جم شوفان',                  protein: 5,   carbs: 54,   fat: 3.5, cal: 267 },
  { name: '2 رغيف بلدي',                 protein: 8,   carbs: 60,   fat: 2,   cal: 290 },
  { name: '300جم بطاطس مسلوقة',          protein: 6,   carbs: 51,   fat: 0.4, cal: 231 },
  { name: '150جم كوسة مطبوخة + خبز',    protein: 4,   carbs: 28,   fat: 1,   cal: 140 },
  { name: '100جم عدس مطبوخ',             protein: 9,   carbs: 20,   fat: 0.4, cal: 116 },
  { name: '100جم أرز بني مطبوخ',         protein: 2.7, carbs: 26,   fat: 1,   cal: 124 },
  { name: '150جم فريك مطبوخ',            protein: 6,   carbs: 30,   fat: 1,   cal: 153 },
  { name: '2 رغيف عيش شامي',             protein: 11,  carbs: 66,   fat: 1.5, cal: 320 },
  { name: '100جم بطاطا حلوة مسلوقة',     protein: 1.6, carbs: 20,   fat: 0.1, cal: 87  },
  { name: '150جم كينوا مطبوخة',          protein: 6.6, carbs: 31,   fat: 2.9, cal: 178 },
  { name: '100جم ذرة مسلوقة',            protein: 3.4, carbs: 21,   fat: 1.5, cal: 111 },
  { name: '250جم فول مدمس بدون زيت',    protein: 19,  carbs: 45,   fat: 1.8, cal: 272 },
  { name: '100جم حمص مسلوق',             protein: 8.9, carbs: 27,   fat: 2.6, cal: 167 },
  { name: '150جم مكرونة قمح كامل مطبوخة',protein: 8,   carbs: 37.5, fat: 0.8, cal: 189 },
  { name: '100جم توست أسمر',             protein: 13,  carbs: 41,   fat: 3.4, cal: 247 },
  // 💰 خيارات اقتصادية
  { name: '200جم كشري (أرز+عدس+مكرونة)', protein: 10,  carbs: 65,   fat: 3,   cal: 330 },
  { name: '100جم بطاطس مقلية منزلي',     protein: 3,   carbs: 35,   fat: 12,  cal: 260 },
  { name: '2 رغيف بلدي إضافي',           protein: 8,   carbs: 60,   fat: 2,   cal: 290 },
  { name: '100جم دقيق شوفان اقتصادي',    protein: 6.3, carbs: 68,   fat: 4.4, cal: 335 },

  // 📋 من الجدول الغذائي
  { name: "100جم اللبن خالى الدسم", protein: 3, carbs: 5, fat: 0.2, cal: 35 },
  { name: "100جم الزبادى كامل الدسم", protein: 2.9, carbs: 13, fat: 2.7, cal: 95 },
  { name: "100جم الزبادى خالى الدسم", protein: 5.73, carbs: 7.68, fat: 0.18, cal: 56 },
  { name: "100جم الشوفان النئ", protein: 14, carbs: 57, fat: 7, cal: 347 },
  { name: "100جم الفول المسلوق", protein: 7.6, carbs: 19.7, fat: 0.4, cal: 110 },
  { name: "100جم الارز الابيض المسلوق", protein: 2.66, carbs: 27.9, fat: 0.28, cal: 129 },
  { name: "100جم الارز البنى المسلوق", protein: 2.32, carbs: 23.51, fat: 0.83, cal: 112 },
  { name: "100جم الارز البسمتى المسلوق", protein: 3.52, carbs: 25.08, fat: 0.38, cal: 120 },
  { name: "100جم المكرونة المسلوقة", protein: 3, carbs: 28, fat: 1, cal: 126 },
  { name: "100جم الخبز البني الكامل", protein: 9, carbs: 55, fat: 2.6, cal: 266 },
  { name: "100جم خبز السن", protein: 8, carbs: 82, fat: 1.3, cal: 366 },
  { name: "100جم الخبز الابيض", protein: 7.64, carbs: 50.61, fat: 3.29, cal: 275 },
  { name: "100جم البطاطا المطهية", protein: 1.37, carbs: 17.72, fat: 0.14, cal: 76 },
  { name: "100جم البطاطس المسلوقة", protein: 1.81, carbs: 19.52, fat: 2.24, cal: 103 },
  { name: "100جم البطاطس المقلية", protein: 4, carbs: 44, fat: 16, cal: 340 },
  { name: "100جم البقسماط", protein: 13.35, carbs: 71.98, fat: 5.3, cal: 395 },
  { name: "100جم الكاتشاب", protein: 1.7, carbs: 25.08, fat: 0.38, cal: 97 },
  { name: "100جم السكر الابيض", protein: 0, carbs: 99.6, fat: 0, cal: 389 },
  { name: "100جم عسل النحل", protein: 0.3, carbs: 82.4, fat: 0, cal: 304 },
  { name: "100جم العسل الاسود", protein: 0, carbs: 73, fat: 0, cal: 269 },
  { name: "100جم البسكويت السادة", protein: 6, carbs: 49, fat: 17, cal: 366 },
  { name: "100جم شراب الشعير", protein: 0.21, carbs: 8.05, fat: 0.12, cal: 37 },
  { name: "100جم الذرة", protein: 3.22, carbs: 19.02, fat: 1.18, cal: 86 },
  { name: "100جم الكورن فلكس", protein: 7.24, carbs: 83.02, fat: 3.38, cal: 376 },
  { name: "100جم نشا الذرة", protein: 0.3, carbs: 91, fat: 0.1, cal: 381 },
  { name: "100جم دبس الرمان", protein: 0, carbs: 45, fat: 0, cal: 180 },
  { name: "100جم اللب", protein: 19, carbs: 54, fat: 19, cal: 446 },
  { name: "100جم الموز", protein: 1.09, carbs: 22.84, fat: 0.33, cal: 89 },
  { name: "100جم البرتقال", protein: 0.94, carbs: 11.75, fat: 0.12, cal: 47 },
  { name: "100جم التفاح", protein: 0.26, carbs: 13.81, fat: 0.17, cal: 52 },
  { name: "100جم العنب", protein: 0.72, carbs: 18.1, fat: 0.16, cal: 69 },
  { name: "100جم البطيخ", protein: 0.61, carbs: 7.55, fat: 0.15, cal: 30 },
  { name: "100جم الشمام", protein: 0.54, carbs: 9.09, fat: 0.14, cal: 36 },
  { name: "100جم الكانتلوب", protein: 0.84, carbs: 8.16, fat: 0.19, cal: 34 },
  { name: "100جم التين الشوكي", protein: 0.7, carbs: 9.6, fat: 0.5, cal: 41 },
  { name: "100جم التين", protein: 0.8, carbs: 19.2, fat: 0.3, cal: 74 },
  { name: "100جم الخوخ", protein: 0.91, carbs: 9.54, fat: 0.25, cal: 39 },
  { name: "100جم البرقوق", protein: 0.7, carbs: 11.42, fat: 0.28, cal: 46 },
  { name: "100جم المشمش", protein: 1.4, carbs: 11.12, fat: 0.39, cal: 48 },
  { name: "100جم اليوسفى", protein: 0.81, carbs: 13.34, fat: 0.31, cal: 53 },
  { name: "100جم الكريز", protein: 1, carbs: 16, fat: 0, cal: 63 },
  { name: "100جم المانجو", protein: 0.51, carbs: 17, fat: 0.27, cal: 65 },
  { name: "100جم البلح", protein: 2.45, carbs: 75.03, fat: 0.39, cal: 282 },
  { name: "100جم الكاكا", protein: 0.58, carbs: 18.6, fat: 0.19, cal: 70 },
  { name: "100جم الفراولة", protein: 0.67, carbs: 7.68, fat: 0.3, cal: 32 },
  { name: "100جم الكيوى", protein: 1.14, carbs: 14.7, fat: 0.52, cal: 61 },
  { name: "100جم الرمان", protein: 0.95, carbs: 17.17, fat: 0.3, cal: 68 },
  { name: "100جم الاناناس", protein: 0.54, carbs: 12.63, fat: 0.12, cal: 48 },
  { name: "100جم الجوافة", protein: 2.55, carbs: 14.32, fat: 0.95, cal: 68 },
  { name: "100جم الكمثرى", protein: 0.38, carbs: 15.46, fat: 0.12, cal: 58 },
  { name: "100جم الزبيب", protein: 3.07, carbs: 79.18, fat: 0.46, cal: 299 },
  { name: "100جم المشمش المجفف (مشمشية)", protein: 3.4, carbs: 62.6, fat: 0.5, cal: 241 },
  { name: "100جم قمر الدين", protein: 3.4, carbs: 84, fat: 0.4, cal: 350 },
  { name: "100جم التمر الهندي", protein: 2.8, carbs: 63, fat: 0.6, cal: 239 },
  { name: "100جم الخيار", protein: 0.65, carbs: 3.63, fat: 0.11, cal: 15 },
  { name: "100جم الطماطم", protein: 0.88, carbs: 3.92, fat: 0.2, cal: 18 },
  { name: "100جم البقدونس", protein: 2.97, carbs: 6.33, fat: 0.79, cal: 36 },
  { name: "100جم الكرفس", protein: 0.69, carbs: 2.97, fat: 0.17, cal: 14 },
  { name: "100جم الكرنب", protein: 1.44, carbs: 5.58, fat: 0.12, cal: 24 },
  { name: "100جم البروكلى", protein: 2.82, carbs: 6.64, fat: 0.38, cal: 34 },
  { name: "100جم الشبت", protein: 3.46, carbs: 7.02, fat: 1.12, cal: 43 },
  { name: "100جم الروز مارى", protein: 3.31, carbs: 20.7, fat: 5.86, cal: 131 },
  { name: "100جم الريحان", protein: 2.54, carbs: 4.34, fat: 0.61, cal: 27 },
  { name: "100جم الخس", protein: 0.9, carbs: 2.97, fat: 0.14, cal: 14 },
  { name: "100جم الجزر", protein: 0.93, carbs: 9.58, fat: 0.24, cal: 41 },
  { name: "100جم الفلفل", protein: 0.99, carbs: 6.03, fat: 0.3, cal: 26 },
  { name: "100جم المشروم", protein: 3.09, carbs: 3.28, fat: 0.34, cal: 22 },
  { name: "100جم العدس الناشف", protein: 26, carbs: 60, fat: 1, cal: 350 },
  { name: "100جم الكوسة", protein: 1.2, carbs: 3.1, fat: 0.3, cal: 17 },
  { name: "100جم البسلة", protein: 5, carbs: 14, fat: 0.4, cal: 81 },
  { name: "100جم البامية", protein: 1.9, carbs: 7, fat: 0.2, cal: 33 },
  { name: "100جم الفاصوليا الخضراء", protein: 1.8, carbs: 7, fat: 0.1, cal: 31 },
  { name: "100جم اللوبيا", protein: 3, carbs: 19, fat: 0.4, cal: 90 },
  { name: "100جم الفاصوليا البيضاء", protein: 24, carbs: 60, fat: 0.8, cal: 333 },
  { name: "100جم الحمص", protein: 19, carbs: 61, fat: 6, cal: 364 },
  { name: "100جم الباذنجان", protein: 1, carbs: 6, fat: 0.2, cal: 25 },
  { name: "100جم القرنبيط", protein: 1.98, carbs: 5.3, fat: 0.1, cal: 25 },
];

// ✅ إصلاح: FAT_OPTIONS متصلة دلوقتي بالوجبات
const FAT_OPTIONS = [
  { name: '1 ملعقة كبيرة زيت زيتون',         protein: 0,   carbs: 0,   fat: 14,   cal: 120 },
  { name: '20جم مكسرات مشكلة',                protein: 4,   carbs: 4,   fat: 12,   cal: 140 },
  { name: 'نص أفوكادو',                        protein: 1,   carbs: 4,   fat: 11,   cal: 120 },
  { name: '1 ملعقة زبدة فول سوداني طبيعية',  protein: 3.5, carbs: 3,   fat: 8,    cal: 94  },
  { name: '30جم لوز',                          protein: 6.3, carbs: 6.6, fat: 15,  cal: 187 },
  { name: '20جم زبدة',                          protein: 0.2, carbs: 0,   fat: 16.2,cal: 147 },
  { name: '1 ملعقة كبيرة زيت جوز الهند',      protein: 0,   carbs: 0,   fat: 13.5, cal: 122 },
  { name: '30جم جبنة شيدر',                    protein: 7.5, carbs: 0.4, fat: 9.9, cal: 121 },
  { name: '15جم طحينة',                        protein: 2.6, carbs: 3.2, fat: 8.1, cal: 96  },
  { name: '30جم كاجو',                          protein: 5.4, carbs: 9,   fat: 13.2,cal: 176 },
  // 💰 خيارات اقتصادية
  { name: '1 ملعقة كبيرة زيت دوار الشمس',     protein: 0,   carbs: 0,   fat: 14,   cal: 120 },
  { name: '20جم فول سوداني محمص',              protein: 5.2, carbs: 4.5, fat: 10,  cal: 124 },

  // 📋 من الجدول الغذائي
  { name: "100جم اللحم البقرى الصافى المطهي", protein: 25, carbs: 0, fat: 13, cal: 250 },
  { name: "100جم اللحمة المفرومة 10% دسم مطهي", protein: 20, carbs: 0, fat: 10, cal: 176 },
  { name: "100جم المرتديلا", protein: 16, carbs: 3, fat: 25, cal: 311 },
  { name: "100جم ورك دجاج مطهي", protein: 23.68, carbs: 0, fat: 12.28, cal: 212 },
  { name: "100جم بيض نئ", protein: 12.58, carbs: 0.77, fat: 9.94, cal: 147 },
  { name: "100جم اللانشون", protein: 18, carbs: 4, fat: 14, cal: 216 },
  { name: "100جم اللبن الكامل الدسم", protein: 3, carbs: 5, fat: 3, cal: 60 },
  { name: "100جم الجبنة الرومى", protein: 25, carbs: 1, fat: 30, cal: 374 },
  { name: "100جم الجبنة الشيدر", protein: 24.9, carbs: 1.28, fat: 33.14, cal: 403 },
  { name: "100جم جبنة مثلثات", protein: 7.55, carbs: 2.66, fat: 34.87, cal: 349 },
  { name: "100جم اللبن الرائب", protein: 3, carbs: 5, fat: 3, cal: 60 },
  { name: "100جم البطاطس الشيبسى", protein: 6.56, carbs: 49.74, fat: 37.47, cal: 547 },
  { name: "100جم الحلاوة الطحينية", protein: 11, carbs: 32, fat: 44, cal: 533 },
  { name: "100جم المايونيز عادى", protein: 1.1, carbs: 3.9, fat: 78.2, cal: 717 },
  { name: "100جم المايونيز لايت", protein: 0.88, carbs: 8.2, fat: 33.09, cal: 324 },
  { name: "100جم زيت الزيتون", protein: 0, carbs: 0, fat: 100, cal: 884 },
  { name: "100جم زيت الذرة", protein: 0, carbs: 0, fat: 100, cal: 884 },
  { name: "100جم زيت عباد الشمس", protein: 0, carbs: 0, fat: 100, cal: 884 },
  { name: "100جم الزبدة", protein: 0.85, carbs: 0.06, fat: 81.11, cal: 717 },
  { name: "100جم كريمة الطبخ", protein: 2, carbs: 3, fat: 37, cal: 345 },
  { name: "100جم الزيتون", protein: 0.8, carbs: 6, fat: 11, cal: 115 },
  { name: "100جم الفول سودانى", protein: 28.03, carbs: 15.26, fat: 52.5, cal: 599 },
  { name: "100جم الفستق", protein: 20.61, carbs: 27.97, fat: 44.44, cal: 557 },
  { name: "100جم الكاجو", protein: 18.22, carbs: 30.19, fat: 43.85, cal: 553 },
  { name: "100جم عين الجمل", protein: 15.23, carbs: 13.71, fat: 65.21, cal: 654 },
  { name: "100جم اللوز", protein: 21.26, carbs: 19.74, fat: 50.64, cal: 578 },
  { name: "100جم زبدة الفول السودانى", protein: 25.09, carbs: 19.56, fat: 50.39, cal: 588 },
  { name: "100جم زيت السمك", protein: 0, carbs: 0, fat: 100, cal: 902 },
  { name: "100جم الطحينة", protein: 17, carbs: 21, fat: 54, cal: 595 },
  { name: "100جم الافوكادو", protein: 2, carbs: 8.53, fat: 14.66, cal: 160 },
];

// ── تطبيع النص العربي عشان البحث يشتغل صح مهما كتب المستخدم ──
function normalizeArabic(str = '') {
  return str
    .replace(/[\u064B-\u0652]/g, '')   // شكل/تشكيل
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/^ال/, '')                 // شيل "ال" التعريف من الأول
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ── كل الأكلات مجمّعة (للبحث السريع) ──────────────────────
const ALL_FOODS = [
  ...PROTEIN_OPTIONS.map(f => ({ ...f, category: 'بروتين', icon: '🥩', color: '#f87171' })),
  ...CARB_OPTIONS.map(f => ({ ...f, category: 'كارب', icon: '🍚', color: '#facc15' })),
  ...FAT_OPTIONS.map(f => ({ ...f, category: 'دهون', icon: '🥑', color: '#4ade80' })),
];

// ── مكملات مقترحة حسب الهدف ──────────────────────────────
const SUPPLEMENTS = {
  cut: [
    { name: 'كرياتين مونوهيدرات', dose: '5g يومياً', reason: 'يحافظ على العضل وانت بتنزل وزن', important: true },
    { name: 'بروتين واي', dose: '1-2 سكوب بعد التمرين', reason: 'لو صعب توصل للبروتين من الأكل', important: false },
    { name: 'أوميجا 3', dose: '2-3 كبسولة مع الأكل', reason: 'يقلل الالتهاب ويحسن حرق الدهون', important: false },
  ],
  bulk: [
    { name: 'كرياتين مونوهيدرات', dose: '5g يومياً', reason: 'يزود القوة وحجم العضل', important: true },
    { name: 'بروتين واي', dose: '1-2 سكوب بعد التمرين', reason: 'يساعد توصل للبروتين المطلوب', important: true },
    { name: 'كارب باودر / مالتوديكسترين', dose: '30-50g بعد التمرين', reason: 'يعيد الجليكوجين بسرعة', important: false },
    { name: 'أوميجا 3', dose: '2-3 كبسولة مع الأكل', reason: 'صحة المفاصل وهرمونات أفضل', important: false },
  ],
  maintain: [
    { name: 'كرياتين مونوهيدرات', dose: '5g يومياً', reason: 'يحافظ على الأداء والقوة', important: true },
    { name: 'أوميجا 3', dose: '2-3 كبسولة مع الأكل', reason: 'صحة عامة وقلب', important: false },
    { name: 'فيتامين D3', dose: '2000-4000 IU يومياً', reason: 'الأغلبية ناقصاه خصوصاً في مصر', important: false },
  ],
};

// ── حفظ بيانات المستخدم على Supabase (تفضل معاه من أي جهاز) ──
async function loadUserDataFromSupabase(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('nutrition_user_data')
      .select('weight, height, age, gender, activity')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function saveUserDataToSupabase(userId, data) {
  if (!userId) return;
  try {
    await supabase.from('nutrition_user_data').upsert({
      user_id: userId,
      weight: data.weight,
      height: data.height,
      age: data.age,
      gender: data.gender,
      activity: data.activity,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // لو النت وقع أو حصلت مشكلة، البيانات لسه محفوظة محلياً في localStorage
  }
}

async function clearUserDataFromSupabase(userId) {
  if (!userId) return;
  try {
    await supabase.from('nutrition_user_data').delete().eq('user_id', userId);
  } catch {
    // تجاهل
  }
}

// ── بحث بالباركود ──────────────────────────────────────────
// الترتيب: 1) Open Food Facts (المصدر العالمي المفتوح)
//          2) لو مش موجود هناك → قاعدة بياناتنا (منتجات ضافها مستخدمين قبل كده)
//          3) لو مش موجود في الاتنين → نعرض فورم إدخال يدوي، وبنحفظ النتيجة في
//             قاعدة بياناتنا عشان تظهر لأي مستخدم تاني يدور على نفس الباركود بعدين.
function isValidBarcode(str = '') {
  const digits = str.replace(/\D/g, '');
  // أشهر مقاسات الباركود العالمية: EAN-8, UPC-A(12), EAN-13, GTIN-14
  return digits.length >= 8 && digits.length <= 14;
}

async function lookupOpenFoodFacts(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};
    // القيم دي بتيجي غالباً لكل 100 جرام من المنتج
    let cal = n['energy-kcal_100g'];
    if (cal == null && n['energy_100g'] != null) cal = n['energy_100g'] / 4.184; // كيلوجول → كالوري
    if (cal == null) return null; // بيانات ناقصة أوي، متنفعش نعرضها

    return {
      barcode,
      name: (p.product_name_ar || p.product_name || p.generic_name_ar || p.generic_name || '').trim() || 'منتج بدون اسم',
      cal: Math.round(cal),
      protein: Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
      carbs: Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
      fat: Math.round((n['fat_100g'] ?? 0) * 10) / 10,
      serving: '100 جرام',
      source: 'openfoodfacts',
    };
  } catch {
    return null; // مشكلة نت أو الخدمة واقعة — نكمل نجرب المصادر التانية
  }
}

async function lookupCommunityFood(barcode) {
  try {
    const { data, error } = await supabase
      .from('community_foods')
      .select('barcode, name, cal, protein, carbs, fat, serving')
      .eq('barcode', barcode)
      .single();
    if (error || !data) return null;
    return { ...data, source: 'community' };
  } catch {
    return null;
  }
}

async function saveCommunityFood(barcode, food, userId) {
  try {
    const { error } = await supabase.from('community_foods').upsert({
      barcode,
      name: food.name,
      cal: food.cal,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      serving: food.serving || '100 جرام',
      created_by: userId || null,
      updated_at: new Date().toISOString(),
    });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

// ── حفظ بيانات المستخدم محلياً (عشان متتكتبش من جديد كل مرة) ──
const NUTRITION_STORAGE_KEY = 'gymz_nutrition_userdata';

function loadSavedUserData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(NUTRITION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // متجاهلين لو الخزنة ممتلئة أو متبلوكة
  }
}

function clearSavedUserData() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(NUTRITION_STORAGE_KEY);
  } catch {
    // متجاهلين
  }
}

// ── حساب TDEE ─────────────────────────────────────────────
function calcTDEE({ weight, height, age, gender, activity }) {
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
  const activityMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
  return Math.round(bmr * (activityMap[activity] || 1.55));
}

// ── توليد الخطط ───────────────────────────────────────────
function generatePlans(tdee) {
  return {
    cut_strong: {
      label: `${tdee - 600} سعرة`, goal: 'نزول وزن بسرعة', goalType: 'cut',
      color: '#f87171', icon: '🔥', deficit: -600, targetCal: tdee - 600,
      macros: {
        protein: Math.round(((tdee - 600) * 0.40) / 4),
        carbs:   Math.round(((tdee - 600) * 0.35) / 4),
        fat:     Math.round(((tdee - 600) * 0.25) / 9),
      },
      meals: buildMeals('cut_strong'),
    },
    cut_light: {
      label: `${tdee - 300} سعرة`, goal: 'نزول وزن بالراحة', goalType: 'cut',
      color: '#fb923c', icon: '⚡', deficit: -300, targetCal: tdee - 300,
      macros: {
        protein: Math.round(((tdee - 300) * 0.38) / 4),
        carbs:   Math.round(((tdee - 300) * 0.37) / 4),
        fat:     Math.round(((tdee - 300) * 0.25) / 9),
      },
      meals: buildMeals('cut_light'),
    },
    maintain: {
      label: `${tdee} سعرة`, goal: 'ثبات على وزنك', goalType: 'maintain',
      color: '#facc15', icon: '⚖️', deficit: 0, targetCal: tdee,
      macros: {
        protein: Math.round((tdee * 0.30) / 4),
        carbs:   Math.round((tdee * 0.45) / 4),
        fat:     Math.round((tdee * 0.25) / 9),
      },
      meals: buildMeals('maintain'),
    },
    bulk_lean: {
      label: `${tdee + 300} سعرة`, goal: 'زيادة عضل بالراحة', goalType: 'bulk',
      color: '#4ade80', icon: '💪', deficit: +300, targetCal: tdee + 300,
      macros: {
        protein: Math.round(((tdee + 300) * 0.30) / 4),
        carbs:   Math.round(((tdee + 300) * 0.48) / 4),
        fat:     Math.round(((tdee + 300) * 0.22) / 9),
      },
      meals: buildMeals('bulk_lean'),
    },
    bulk_strong: {
      label: `${tdee + 600} سعرة`, goal: 'زيادة عضل بسرعة', goalType: 'bulk',
      color: '#a78bfa', icon: '🏆', deficit: +600, targetCal: tdee + 600,
      macros: {
        protein: Math.round(((tdee + 600) * 0.28) / 4),
        carbs:   Math.round(((tdee + 600) * 0.50) / 4),
        fat:     Math.round(((tdee + 600) * 0.22) / 9),
      },
      meals: buildMeals('bulk_strong'),
    },
  };
}

// ✅ إصلاح: إضافة fatKey لكل وجبة + وجبة قبل التمرين واضحة
function buildMeals(type) {
  const templates = {
    cut_strong: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 3,    carbKey: 2,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'سناك',                     time: '11:00 ص', proteinKey: 1,    carbKey: null, fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '2:00 م',  proteinKey: 0,    carbKey: 0,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: '🏋️ قبل التمرين (بساعة)', time: '5:00 م',  proteinKey: 3,    carbKey: 6,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: '✅ بعد التمرين',           time: '7:30 م',  proteinKey: 0,    carbKey: 3,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '9:00 م',  proteinKey: 2,    carbKey: null, fatKey: 0,    preWorkout: false, postWorkout: false },
    ],
    cut_light: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 2,    carbKey: 2,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'سناك صباحي',              time: '11:00 ص', proteinKey: 3,    carbKey: 6,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '2:00 م',  proteinKey: 0,    carbKey: 0,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: '🏋️ قبل التمرين (بساعة)', time: '5:00 م',  proteinKey: 3,    carbKey: 3,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: '✅ بعد التمرين',           time: '7:00 م',  proteinKey: 1,    carbKey: 4,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '9:00 م',  proteinKey: 5,    carbKey: null, fatKey: 0,    preWorkout: false, postWorkout: false },
    ],
    maintain: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 2,    carbKey: 2,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'سناك',                     time: '11:00 ص', proteinKey: 3,    carbKey: 3,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '2:00 م',  proteinKey: 0,    carbKey: 0,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: '🏋️ قبل التمرين (بساعة)', time: '5:00 م',  proteinKey: 3,    carbKey: 6,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: '✅ بعد التمرين',           time: '7:00 م',  proteinKey: 1,    carbKey: 4,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '9:00 م',  proteinKey: 6,    carbKey: 1,    fatKey: 0,    preWorkout: false, postWorkout: false },
    ],
    bulk_lean: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 2,    carbKey: 2,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'سناك صباحي',              time: '10:30 ص', proteinKey: 3,    carbKey: 6,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '1:00 م',  proteinKey: 4,    carbKey: 0,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: '🏋️ قبل التمرين (بساعة)', time: '4:30 م',  proteinKey: 1,    carbKey: 4,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: '✅ بعد التمرين',           time: '6:30 م',  proteinKey: 0,    carbKey: 2,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '8:30 م',  proteinKey: 5,    carbKey: 1,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'قبل النوم',                time: '11:00 م', proteinKey: 3,    carbKey: null, fatKey: 3,    preWorkout: false, postWorkout: false },
    ],
    bulk_strong: [
      { name: 'الفطار',                   time: '7:30 ص',  proteinKey: 2,    carbKey: 2,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'سناك 1',                  time: '10:00 ص', proteinKey: 3,    carbKey: 4,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '1:00 م',  proteinKey: 4,    carbKey: 0,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: '🏋️ قبل التمرين (بساعة)', time: '4:00 م',  proteinKey: 1,    carbKey: 6,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: '✅ بعد التمرين',           time: '6:00 م',  proteinKey: 0,    carbKey: 1,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'سناك 2',                  time: '8:00 م',  proteinKey: 3,    carbKey: 4,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'العشاء',                   time: '9:30 م',  proteinKey: 5,    carbKey: 2,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'قبل النوم',                time: '11:30 م', proteinKey: 3,    carbKey: null, fatKey: 3,    preWorkout: false, postWorkout: false },
    ],
  };
  return templates[type] || templates.maintain;
}

// ── Meal Card ──────────────────────────────────────────────
function MealCard({ meal, planColor, mealIndex }) {
  const [proteinChoice, setProteinChoice] = useState(meal.proteinKey);
  const [carbChoice,    setCarbChoice]    = useState(meal.carbKey);
  const [fatChoice,     setFatChoice]     = useState(meal.fatKey);   // ✅ جديد
  const [open,    setOpen]    = useState(false);
  const [swapping, setSwapping] = useState(null);

  const currentProtein = proteinChoice !== null ? PROTEIN_OPTIONS[proteinChoice] : null;
  const currentCarb    = carbChoice    !== null ? CARB_OPTIONS[carbChoice]        : null;
  const currentFat     = fatChoice     !== null ? FAT_OPTIONS[fatChoice]          : null;  // ✅ جديد

  const mealCal = (currentProtein?.cal || 0) + (currentCarb?.cal || 0) + (currentFat?.cal || 0);

  // لون خاص لوجبة قبل/بعد التمرين
  const cardBorderColor = meal.preWorkout
    ? 'rgba(250,204,21,0.25)'
    : meal.postWorkout
    ? 'rgba(74,222,128,0.25)'
    : 'var(--glass-border)';

  const cardBg = meal.preWorkout
    ? 'rgba(250,204,21,0.04)'
    : meal.postWorkout
    ? 'rgba(74,222,128,0.04)'
    : 'var(--glass-bg)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: mealIndex * 0.07 }}
      style={{ background: cardBg, border: `1px solid ${cardBorderColor}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 12 }}
    >
      {/* ✅ شريط علوي ملون لوجبات التمرين */}
      {(meal.preWorkout || meal.postWorkout) && (
        <div style={{ height: 2, background: meal.preWorkout ? 'linear-gradient(90deg,#facc15,transparent)' : 'linear-gradient(90deg,#4ade80,transparent)' }} />
      )}

      {/* Header */}
      <div
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: planColor, boxShadow: `0 0 8px ${planColor}80` }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em', color: 'var(--chalk)' }}>{meal.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)' }}>{meal.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: planColor }}>{mealCal} كال</span>
          {open ? <ChevronUp size={14} color="var(--ash)" /> : <ChevronDown size={14} color="var(--ash)" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 18px', direction: 'rtl' }}>

              {/* نصيحة وجبة التمرين */}
              {meal.preWorkout && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 8, fontSize: '0.75rem', color: '#facc15', fontFamily: 'var(--font-body)' }}>
                  💡 تجنب الدهون قبل التمرين — بتبطئ الهضم وبتأثر على الأداء
                </div>
              )}
              {meal.postWorkout && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, fontSize: '0.75rem', color: '#4ade80', fontFamily: 'var(--font-body)' }}>
                  💡 النافذة الذهبية — بروتين سريع + كارب بسيط خلال 30-60 دقيقة بعد التمرين
                </div>
              )}

              {/* ── البروتين ── */}
              {currentProtein && (
                <FoodRow
                  label="🥩 البروتين"
                  item={currentProtein}
                  color="#f87171"
                  swapKey="protein"
                  swapping={swapping}
                  setSwapping={setSwapping}
                  options={PROTEIN_OPTIONS}
                  currentIndex={proteinChoice}
                  onSelect={(i) => { setProteinChoice(i); setSwapping(null); }}
                />
              )}

              {/* ── الكارب ── */}
              {currentCarb && (
                <FoodRow
                  label="🍚 الكارب"
                  item={currentCarb}
                  color="#facc15"
                  swapKey="carb"
                  swapping={swapping}
                  setSwapping={setSwapping}
                  options={CARB_OPTIONS}
                  currentIndex={carbChoice}
                  onSelect={(i) => { setCarbChoice(i); setSwapping(null); }}
                />
              )}

              {/* ✅ الدهون — متصلة دلوقتي */}
              {currentFat && (
                <FoodRow
                  label="🥑 الدهون الصحية"
                  item={currentFat}
                  color="#4ade80"
                  swapKey="fat"
                  swapping={swapping}
                  setSwapping={setSwapping}
                  options={FAT_OPTIONS}
                  currentIndex={fatChoice}
                  onSelect={(i) => { setFatChoice(i); setSwapping(null); }}
                />
              )}

              {/* ملخص الماكرو */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 14 }}>
                {[
                  { label: 'سعرات', val: mealCal, unit: '', color: planColor },
                  { label: 'بروتين', val: Math.round((currentProtein?.protein||0)+(currentCarb?.protein||0)+(currentFat?.protein||0)), unit: 'g', color: '#f87171' },
                  { label: 'كارب',   val: Math.round((currentProtein?.carbs||0)+(currentCarb?.carbs||0)+(currentFat?.carbs||0)),   unit: 'g', color: '#facc15' },
                  { label: 'دهون',   val: Math.round((currentProtein?.fat||0)+(currentCarb?.fat||0)+(currentFat?.fat||0)),           unit: 'g', color: '#4ade80' },
                ].map(({ label, val, unit, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '8px 4px', background: `${color}0a`, border: `1px solid ${color}18`, borderRadius: 6 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color }}>{val}<span style={{ fontSize: '0.6rem' }}>{unit}</span></div>
                    <div style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── مكون صف الأكل القابل للتبديل ─────────────────────────
function FoodRow({ label, item, color, swapKey, swapping, setSwapping, options, currentIndex, onSelect }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: `${color}09`, border: `1px solid ${color}25`, borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--chalk)', fontFamily: 'var(--font-body)' }}>{item.name}</span>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
          onClick={() => setSwapping(swapping === swapKey ? null : swapKey)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 6, color, cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}
        >
          <RefreshCw size={11} /> بدّل
        </motion.button>
      </div>
      <AnimatePresence>
        {swapping === swapKey && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {options.map((opt, i) => (
              <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => onSelect(i)}
                style={{ textAlign: 'right', padding: '8px 12px', background: i === currentIndex ? `${color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${i === currentIndex ? color + '50' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, color: 'var(--chalk)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)' }}>{opt.cal} كال · {opt.protein}g بروتين</span>
                {opt.name}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Supplements Card ──────────────────────────────────────
function SupplementsCard({ goalType }) {
  const supps = SUPPLEMENTS[goalType] || SUPPLEMENTS.maintain;
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, background: 'var(--glass-bg)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg,#a78bfa,transparent)' }} />
      <div onClick={() => setOpen(p => !p)} style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={15} color="#a78bfa" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--chalk)', letterSpacing: '0.04em' }}>مكملات مقترحة لهدفك</span>
          <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }}>اختياري</span>
        </div>
        {open ? <ChevronUp size={14} color="var(--ash)" /> : <ChevronDown size={14} color="var(--ash)" />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 18px 18px', direction: 'rtl', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supps.map((s, i) => (
                <div key={i} style={{ padding: '12px 14px', background: s.important ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.important ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--chalk)' }}>{s.name}</span>
                    {s.important && <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}>مهم</span>}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#a78bfa', marginBottom: 4 }}>{s.dose}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash-light)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{s.reason}</div>
                </div>
              ))}
              <p style={{ fontSize: '0.7rem', color: 'var(--ash)', lineHeight: 1.6, marginTop: 4 }}>
                ⚠️ المكملات مش إلزامية — الأكل الطبيعي هو الأساس. استشر دكتور قبل ما تاخد أي مكمل لو عندك أي حالة صحية.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Water Intake Card ─────────────────────────────────────
function WaterCard({ weight }) {
  const liters = ((weight * 33) / 1000).toFixed(1);
  const glasses = Math.round((weight * 33) / 250);
  return (
    <div style={{ marginBottom: 16, padding: '16px 18px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 'var(--radius-md)', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Droplets size={16} color="#38bdf8" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--chalk)', marginBottom: 2 }}>احتياجك اليومي من المياه</div>
          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>وزن ({weight}kg) × 33ml</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#38bdf8', lineHeight: 1 }}>{liters}L</div>
        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>≈ {glasses} كوب</div>
      </div>
    </div>
  );
}

// ── بحث ذكي في قاعدة بيانات الأكلات ───────────────────────
function FoodSearch() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const nq = normalizeArabic(query);
    if (!nq) return [];
    return ALL_FOODS
      .map(f => ({ ...f, _n: normalizeArabic(f.name) }))
      .filter(f => f._n.includes(nq))
      .sort((a, b) => {
        // الأكلة اللي بتبدأ بنفس اللي كتبه المستخدم تطلع الأول
        const aStarts = a._n.startsWith(nq) ? 0 : 1;
        const bStarts = b._n.startsWith(nq) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.name.length - b.name.length;
      })
      .slice(0, 10);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '20px 20px 22px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#facc15,transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: '1rem' }}>🔍</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--chalk)', letterSpacing: '0.04em' }}>دوّر على أكلة</span>
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="اكتب اسم الأكلة... (مثلاً: فراخ، أرز، لوز)"
        style={{
          width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)',
          color: 'var(--chalk)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          outline: 'none', boxSizing: 'border-box', direction: 'rtl',
        }}
      />
      <AnimatePresence>
        {query.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {results.length === 0 ? (
              <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--ash-light)', fontFamily: 'var(--font-body)' }}>
                معملناش لقيلها حاجة، جرّب اسم تاني.
              </div>
            ) : (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {results.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: `${f.color}0a`, border: `1px solid ${f.color}25`, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{f.icon}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--chalk)', fontFamily: 'var(--font-body)' }}>{f.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)' }}>
                      <span style={{ color: f.color }}>{f.category}</span>
                      <span>{f.cal} كال</span>
                      <span>{f.protein}g بروتين</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── بحث بالباركود (Open Food Facts + قاعدة بيانات المجتمع) ──
// ── مسح الباركود بالكاميرا ─────────────────────────────────
function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  // starting | scanning | success | denied | notfound | error
  const [scanState, setScanState] = useState('starting');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();

        const controls = await reader.decodeFromConstraints(
  {
          video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
                 }
  },
  videoRef.current,
          (result) => {
            if (!alive || !result) return;
            const text = (result.getText() || '').replace(/\D/g, '');
            if (text.length >= 8 && text.length <= 14) {
              setScanState('success');
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 30, 60]);
              controlsRef.current?.stop();
              setTimeout(() => { if (alive) onDetected(text); }, 420);
            }
          }
        );
        if (!alive) { controls.stop(); return; }
        controlsRef.current = controls;
        setScanState('scanning');
      } catch (err) {
        if (!alive) return;
        setScanState(err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' ? 'denied' : 'error');
      }
    })();

    return () => {
      alive = false;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  const statusText = {
    starting: 'بنفتح الكاميرا...',
    scanning: 'وجّه الكاميرا على الباركود',
    success: 'تمام! اتقرا الباركود ✅',
    denied: 'محتاجين إذن الكاميرا عشان نقدر نمسح',
    notfound: 'متقدرش نلاقي كاميرا على الجهاز ده',
    error: 'حصلت مشكلة في فتح الكاميرا',
  }[scanState];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(6,8,12,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}
      >
        <button
          onClick={onClose}
          aria-label="قفل"
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--chalk)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', background: '#000', overflow: 'hidden' }}>
          <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanState === 'scanning' || scanState === 'success' ? 'block' : 'none' }} />

          {(scanState === 'starting') && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size={26} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {(scanState === 'denied' || scanState === 'notfound' || scanState === 'error') && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
              <AlertTriangle size={28} color="#f87171" />
              <span style={{ color: '#f87171', fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.7 }}>{statusText}</span>
              {scanState === 'denied' && (
                <span style={{ color: 'var(--ash-light)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', lineHeight: 1.7 }}>
                  فعّل إذن الكاميرا من إعدادات المتصفح وجرب تاني.
                </span>
              )}
            </div>
          )}

          {/* إطار المسح + التغذية البصرية */}
          {(scanState === 'scanning' || scanState === 'success') && (
            <>
              <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.28)', maskImage: 'radial-gradient(ellipse 46% 26% at 50% 50%, transparent 60%, black 61%)', pointerEvents: 'none' }} />

              <div style={{
                position: 'absolute', top: '37%', left: '10%', right: '10%', height: '26%',
                border: `2px solid ${scanState === 'success' ? '#4ade80' : '#38bdf8'}`,
                borderRadius: 10, transition: 'border-color 0.25s ease', pointerEvents: 'none',
              }}>
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => {
                  const [v, h] = corner.split('-');
                  return (
                    <div key={corner} style={{
                      position: 'absolute', width: 18, height: 18,
                      [v]: -2, [h]: -2,
                      borderTop: v === 'top' ? `3px solid ${scanState === 'success' ? '#4ade80' : '#38bdf8'}` : 'none',
                      borderBottom: v === 'bottom' ? `3px solid ${scanState === 'success' ? '#4ade80' : '#38bdf8'}` : 'none',
                      borderLeft: h === 'left' ? `3px solid ${scanState === 'success' ? '#4ade80' : '#38bdf8'}` : 'none',
                      borderRight: h === 'right' ? `3px solid ${scanState === 'success' ? '#4ade80' : '#38bdf8'}` : 'none',
                      borderRadius: 4,
                    }} />
                  );
                })}

                {scanState === 'scanning' && (
                  <motion.div
                    initial={{ top: '6%' }}
                    animate={{ top: ['6%', '90%', '6%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', left: '4%', right: '4%', height: 2, background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)', boxShadow: '0 0 8px 1px #38bdf8' }}
                  />
                )}

                {scanState === 'success' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74,222,128,0.15)', borderRadius: 8 }}
                  >
                    <Check size={34} color="#4ade80" />
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <ScanLine size={14} color={scanState === 'success' ? '#4ade80' : '#38bdf8'} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: scanState === 'success' ? '#4ade80' : 'var(--chalk)' }}>{statusText}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BarcodeSearch({ userId }) {
  const [barcode, setBarcode]   = useState('');
  const [status,  setStatus]    = useState('idle'); // idle | loading | found | manual | saving | saved | error
  const [result,  setResult]    = useState(null);
  const [manualErr, setManualErr] = useState('');
  const [manual, setManual] = useState({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '100 جرام' });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [fromCamera, setFromCamera] = useState(false);
  const shakeControls = useAnimation();

  const resetManual = () => setManual({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '100 جرام' });

  const handleSearch = async (codeOverride) => {
    const clean = (codeOverride ?? barcode).replace(/\D/g, '');
    if (!isValidBarcode(clean)) {
      setStatus('error');
      setResult(null);
      shakeControls.start({ x: [0, -9, 9, -6, 6, -3, 3, 0], transition: { duration: 0.45 } });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(70);
      return;
    }
    setStatus('loading');
    setResult(null);
    setManualErr('');

    // 1) Open Food Facts أولاً
    const off = await lookupOpenFoodFacts(clean);
    if (off) {
      setResult(off);
      setStatus('found');
      return;
    }

    // 2) لو مش موجود هناك، ندور في قاعدة بياناتنا (منتجات ضافها مستخدمين قبل كده)
    const community = await lookupCommunityFood(clean);
    if (community) {
      setResult(community);
      setStatus('found');
      return;
    }

    // 3) مفيش في أي حتة → نعرض فورم الإدخال اليدوي
    resetManual();
    setStatus('manual');
  };

  const handleManualSave = async () => {
    const name = manual.name.trim();
    const cal = parseFloat(manual.cal);
    const protein = parseFloat(manual.protein || 0);
    const carbs = parseFloat(manual.carbs || 0);
    const fat = parseFloat(manual.fat || 0);

    if (!name) { setManualErr('اكتب اسم المنتج'); return; }
    if (!cal || cal <= 0 || cal > 3000) { setManualErr('اكتب سعرات حرارية منطقية (1-3000)'); return; }
    if ([protein, carbs, fat].some(v => isNaN(v) || v < 0 || v > 500)) {
      setManualErr('اكتب أرقام موجبة ومنطقية للبروتين/الكارب/الدهون');
      return;
    }
    // ✅ فحص منطقي: السعرات المحسوبة من الماكروز لازم تكون قريبة من السعرات المكتوبة
    const calcCal = protein * 4 + carbs * 4 + fat * 9;
    if (calcCal > 0 && Math.abs(calcCal - cal) / cal > 0.35) {
      setManualErr('الأرقام مش متطابقة منطقياً — السعرات المحسوبة من البروتين/الكارب/الدهون بعيدة عن السعرات اللي كتبتها. راجع الأرقام من العلبة تاني.');
      return;
    }

    setManualErr('');
    setStatus('saving');
    const clean = barcode.replace(/\D/g, '');
    const food = { name, cal: Math.round(cal), protein, carbs, fat, serving: manual.serving.trim() || '100 جرام' };
    const ok = await saveCommunityFood(clean, food, userId);
    if (ok) {
      setResult({ ...food, barcode: clean, source: 'community' });
      setStatus('saved');
    } else {
      // حتى لو فشل الحفظ في قاعدة البيانات، نعرضله البيانات محلياً عشان يكمل نظامه
      setResult({ ...food, barcode: clean, source: 'community' });
      setStatus('error-save');
    }
  };

  const handleDetected = (code) => {
    setScannerOpen(false);
    setBarcode(code);
    setFromCamera(true);
    handleSearch(code);
  };

  const sourceLabel = result?.source === 'openfoodfacts'
    ? { text: 'المصدر: Open Food Facts', color: '#38bdf8' }
    : { text: 'مضاف من مستخدمين — راجع الأرقام من العلبة لو مش متأكد', color: '#a78bfa' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '20px 20px 22px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#38bdf8,transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Barcode size={17} color="#38bdf8" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--chalk)', letterSpacing: '0.04em' }}>دوّر بالباركود</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.div animate={shakeControls} style={{ flex: 1 }}>
          <input
            type="text"
            inputMode="numeric"
            value={barcode}
            onChange={e => { setBarcode(e.target.value.replace(/[^\d]/g, '')); setFromCamera(false); if (status !== 'idle') setStatus('idle'); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="اكتب رقم الباركود (8-14 رقم)"
            style={{
              width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${status === 'error' ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 'var(--radius-sm)',
              color: 'var(--chalk)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
              outline: 'none', boxSizing: 'border-box', direction: 'ltr', textAlign: 'center',
              transition: 'border-color 0.2s ease',
            }}
          />
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.92 }} transition={{ duration: 0.12 }}
          onClick={() => handleSearch()}
          disabled={status === 'loading'}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: 'var(--radius-sm)', color: '#38bdf8', cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          {status === 'loading' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
          دور
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.92 }} transition={{ duration: 0.12 }}
          onClick={() => setScannerOpen(true)}
          disabled={status === 'loading'}
          title="امسح بالكاميرا"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 46, padding: 0, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 'var(--radius-sm)', color: '#38bdf8', cursor: status === 'loading' ? 'default' : 'pointer', flexShrink: 0 }}
        >
          <Camera size={17} />
        </motion.button>
      </div>

      <AnimatePresence>
        {scannerOpen && (
          <BarcodeScannerModal
            onDetected={handleDetected}
            onClose={() => setScannerOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.78rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} /> رقم الباركود مش صح — لازم يكون بين 8 و14 رقم.
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> بندور على المنتج...
          </motion.div>
        )}

        {(status === 'found' || status === 'saved') && result && (
          <motion.div key="found"
            initial={{ opacity: 0, y: -6, boxShadow: '0 0 0 0 rgba(74,222,128,0)' }}
            animate={{ opacity: 1, y: 0, boxShadow: fromCamera ? ['0 0 0 0 rgba(74,222,128,0.35)', '0 0 0 8px rgba(74,222,128,0)'] : '0 0 0 0 rgba(74,222,128,0)' }}
            exit={{ opacity: 0 }}
            transition={{ boxShadow: { duration: 0.9, ease: 'easeOut' } }}
            style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(56,189,248,0.05)', border: `1px solid ${fromCamera ? 'rgba(74,222,128,0.35)' : 'rgba(56,189,248,0.2)'}`, borderRadius: 'var(--radius-sm)' }}>
            {fromCamera && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#4ade80', fontSize: '0.72rem', fontFamily: 'var(--font-body)' }}>
                <Camera size={13} /> اتقرا بالكاميرا
              </div>
            )}
            {status === 'saved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#4ade80', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>
                <Check size={13} /> اتحفظ المنتج — هيظهر لباقي المستخدمين لما يدوروا على نفس الباركود.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)' }}>{result.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', direction: 'ltr' }}>{result.barcode}</span>
            </div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginBottom: 10 }}>لكل {result.serving || '100 جرام'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {[
                { label: 'سعرات', val: result.cal, unit: '', color: '#38bdf8' },
                { label: 'بروتين', val: result.protein, unit: 'g', color: '#f87171' },
                { label: 'كارب', val: result.carbs, unit: 'g', color: '#facc15' },
                { label: 'دهون', val: result.fat, unit: 'g', color: '#4ade80' },
              ].map(({ label, val, unit, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '8px 4px', background: `${color}0a`, border: `1px solid ${color}18`, borderRadius: 6 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color }}>{val}<span style={{ fontSize: '0.6rem' }}>{unit}</span></div>
                  <div style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: sourceLabel.color }}>{sourceLabel.text}</div>
          </motion.div>
        )}

        {(status === 'manual' || status === 'saving' || status === 'error-save') && (
          <motion.div key="manual" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '0.78rem', color: 'var(--ash-light)', fontFamily: 'var(--font-body)' }}>
              <Barcode size={13} color="var(--ash-light)" />
              المنتج مش موجود — اكتب بياناته من علبة المنتج وهنحفظها عشان تفيد غيرك بعدين.
            </div>

            {status === 'error-save' && (
              <div style={{ marginTop: 8, marginBottom: 8, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.72rem', fontFamily: 'var(--font-body)' }}>
                <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                حصلت مشكلة في حفظ المنتج في قاعدة البيانات (ممكن يكون مشكلة نت). البيانات ظاهرة تحت عشان تكمل نظامك دلوقتي، بس ممكن متتحفظش لغيرك.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <input type="text" placeholder="اسم المنتج" value={manual.name}
                onChange={e => setManual(m => ({ ...m, name: e.target.value }))}
                style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--chalk)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', outline: 'none', direction: 'rtl' }} />

              <input type="text" placeholder="حجم الحصة (مثلاً: 100 جرام، علبة واحدة)" value={manual.serving}
                onChange={e => setManual(m => ({ ...m, serving: e.target.value }))}
                style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--chalk)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', outline: 'none', direction: 'rtl' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {[
                  { key: 'cal', ph: 'سعرات' },
                  { key: 'protein', ph: 'بروتين g' },
                  { key: 'carbs', ph: 'كارب g' },
                  { key: 'fat', ph: 'دهون g' },
                ].map(({ key, ph }) => (
                  <input key={key} type="number" placeholder={ph} value={manual[key]}
                    onChange={e => setManual(m => ({ ...m, [key]: e.target.value }))}
                    style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--chalk)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', outline: 'none', textAlign: 'center', direction: 'ltr' }} />
                ))}
              </div>

              {manualErr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.72rem', fontFamily: 'var(--font-body)' }}>
                  <AlertTriangle size={12} /> {manualErr}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.92 }} transition={{ duration: 0.12 }}
                onClick={handleManualSave}
                disabled={status === 'saving'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: 'var(--radius-sm)', color: '#38bdf8', cursor: status === 'saving' ? 'default' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}
              >
                {status === 'saving' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                احفظ المنتج
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── فورم البيانات ─────────────────────────────────────────
function UserDataForm({ onCalculate, initialData, onClear }) {
  const [weight, setWeight]   = useState('');
  const [height, setHeight]   = useState('');
  const [age,    setAge]      = useState('');
  const [gender, setGender]   = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [error,  setError]    = useState('');

  // ✅ لو فيه بيانات محفوظة من قبل، نعبي بيها الفورم تلقائياً
  useEffect(() => {
    if (initialData) {
      setWeight(initialData.weight ?? '');
      setHeight(initialData.height ?? '');
      setAge(initialData.age ?? '');
      setGender(initialData.gender ?? 'male');
      setActivity(initialData.activity ?? 'moderate');
    }
  }, [initialData]);

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-sm)', color: 'var(--chalk)',
    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', direction: 'ltr', textAlign: 'center',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
    color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 6,
  };
  const activities = [
    { id: 'sedentary',  label: 'مش بتتحرك', desc: 'مكتب طول اليوم' },
    { id: 'light',      label: 'خفيف',       desc: '1-3 أيام أسبوعياً' },
    { id: 'moderate',   label: 'متوسط',      desc: '3-5 أيام أسبوعياً' },
    { id: 'active',     label: 'نشيط',       desc: '6-7 أيام أسبوعياً' },
    { id: 'veryActive', label: 'نشيط جداً',  desc: 'رياضيين أو شغل جسدي' },
  ];

  const handleCalc = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a || w < 30 || w > 250 || h < 100 || h > 250 || a < 10 || a > 100) {
      setError('اكتب بيانات صح: وزن (30-250كج)، طول (100-250سم)، سن (10-100)');
      return;
    }
    setError('');
    onCalculate({ weight: w, height: h, age: a, gender, activity });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--accent),transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Calculator size={18} color="var(--accent)" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--chalk)', letterSpacing: '0.04em' }}>احسب نظامك</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={labelStyle}>الجنس</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ id: 'male', label: '👨 ذكر' }, { id: 'female', label: '👩 أنثى' }].map(g => (
            <motion.button key={g.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => setGender(g.id)}
              style={{ flex: 1, padding: '10px', background: gender === g.id ? 'rgba(255,77,46,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gender === g.id ? 'rgba(255,77,46,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 'var(--radius-sm)', color: gender === g.id ? 'var(--accent)' : 'var(--ash-light)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', transition: 'all 180ms' }}>
              {g.label}
            </motion.button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'الوزن (كجم)', val: weight, set: setWeight, ph: '75' },
          { label: 'الطول (سم)',  val: height, set: setHeight, ph: '175' },
          { label: 'السن',         val: age,    set: setAge,    ph: '25' },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <span style={labelStyle}>{label}</span>
            <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <span style={labelStyle}>مستوى النشاط</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activities.map(a => (
            <motion.button key={a.id} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => setActivity(a.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: activity === a.id ? 'rgba(255,77,46,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${activity === a.id ? 'rgba(255,77,46,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 180ms', direction: 'rtl' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: activity === a.id ? 'var(--accent)' : 'var(--chalk)' }}>{a.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)' }}>{a.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.78rem', fontFamily: 'var(--font-body)', marginBottom: 14, direction: 'rtl' }}>
          ⚠️ {error}
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
        onClick={handleCalc}
        style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em', cursor: 'pointer' }}
      >
        احسب احتياجك وشوف خطتك 🔥
      </motion.button>
      {initialData && (
        <motion.button
          whileHover={{ opacity: 0.8 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
          onClick={() => {
            clearSavedUserData();
            onClear?.();
            setWeight(''); setHeight(''); setAge(''); setGender('male'); setActivity('moderate');
          }}
          style={{ width: '100%', marginTop: 10, padding: '8px', background: 'transparent', border: 'none', color: 'var(--ash-light)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', textDecoration: 'underline' }}
        >
          🗑 امسح البيانات المحفوظة وابدأ من جديد
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function NutritionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [tdee,      setTdee]      = useState(null);
  const [plans,     setPlans]     = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [userData,  setUserData]  = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [autoLoaded, setAutoLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    const checkPremium = async () => {
      const { data } = await supabase.from('nutrition_premium').select('id').eq('email', user.email).single();
      setIsPremium(!!data);
      setChecking(false);
    };
    checkPremium();
  }, [user, authLoading]);

  // ✅ لما الصفحة تفتح، نجيب بيانات المستخدم المحفوظة (لو موجودة) ونحسب على طول من غيرها تكتب تاني
  const handleCalculate = useCallback(({ weight, height, age, gender, activity }) => {
    const calculatedTdee = calcTDEE({ weight, height, age, gender, activity });
    setTdee(calculatedTdee);
    setPlans(generatePlans(calculatedTdee));
    setActivePlan('maintain');
    const data = { weight, height, age, gender, activity };
    setUserData(data);
    setSavedData(data);
    saveUserData(data); // 💾 نسخة محلية سريعة
    saveUserDataToSupabase(user?.id, data); // ☁️ نسخة على حسابه، تفضل معاه من أي جهاز
    setTimeout(() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [user]);

  useEffect(() => {
    if (!isPremium || autoLoaded) return;
    let cancelled = false;
    (async () => {
      // نجرب Supabase الأول (البيانات دي بتفضل معاه من أي جهاز)
      const remote = user?.id ? await loadUserDataFromSupabase(user.id) : null;
      if (cancelled) return;
      if (remote) {
        setSavedData(remote);
        saveUserData(remote); // نحدّث النسخة المحلية كمان عشان الفتح السريع بعد كده
        handleCalculate(remote);
      } else {
        // مفيش على Supabase؟ نجرب النسخة المحلية القديمة ونرفعها فوق
        const local = loadSavedUserData();
        if (local) {
          setSavedData(local);
          handleCalculate(local);
          saveUserDataToSupabase(user?.id, local);
        }
      }
      setAutoLoaded(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, autoLoaded, user]);

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isPremium) return <><Head><title>الأنظمة الغذائية — GYMZ</title></Head><PremiumGate user={user} /></>;

  const plan = plans && activePlan ? plans[activePlan] : null;
  const goalBadge = plan
    ? plan.goalType === 'cut'
      ? { label: 'نزول وزن', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
      : plan.goalType === 'bulk'
      ? { label: 'زيادة عضل', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
      : { label: 'ثبات على وزنك', color: '#facc15', bg: 'rgba(250,204,21,0.1)' }
    : null;

  return (
    <>
      <Head><title>الأنظمة الغذائية — GYMZ</title></Head>
      <div style={{ minHeight: '100vh', paddingTop: 88, paddingBottom: 60, position: 'relative', direction: 'rtl' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 40% at 50% 20%, rgba(255,77,46,0.07) 0%,transparent 60%)' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

          {/* header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ash)', marginBottom: 8 }}>أنظمة غذائية مصرية</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '0.04em', lineHeight: 1 }}>
              تغذية<br /><span style={{ color: 'var(--accent)' }}>على قد إيدك</span>
            </h1>
            <p style={{ color: 'var(--ash-light)', marginTop: 12, fontSize: '0.875rem', lineHeight: 1.7 }}>
              حط بياناتك، هنحسبلك احتياجك اليومي من السعرات ونديك النظام المناسب لهدفك.
            </p>
          </motion.div>

          <FoodSearch />

          <BarcodeSearch userId={user?.id} />

          <UserDataForm
            onCalculate={handleCalculate}
            initialData={savedData}
            onClear={() => {
              setSavedData(null);
              clearUserDataFromSupabase(user?.id);
            }}
          />

          {plans && activePlan && (
            <div id="plans-section">

              {/* ✅ Water Intake */}
              {userData && <WaterCard weight={userData.weight} />}

              {/* TDEE badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,77,46,0.06)', border: '1px solid rgba(255,77,46,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 4 }}>احتياجك اليومي من السعرات</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}>{tdee} <span style={{ fontSize: '0.8rem', color: 'var(--ash-light)' }}>سعرة/يوم</span></div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
                  onClick={() => { setPlans(null); setTdee(null); setActivePlan(null); setUserData(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'var(--ash-light)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}
                >
                  <RefreshCw size={11} /> غيّر
                </motion.button>
              </motion.div>

              {/* plan selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {Object.entries(plans).map(([key, p]) => {
                  const active = activePlan === key;
                  return (
                    <motion.button key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => setActivePlan(key)}
                      style={{ padding: '10px 14px', background: active ? `${p.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? p.color + '55' : 'rgba(255,255,255,0.08)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 200ms', minWidth: 100 }}>
                      <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: active ? p.color : 'var(--chalk)', letterSpacing: '0.04em' }}>{p.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: active ? p.color : 'var(--ash)', letterSpacing: '0.06em' }}>{p.goal}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* macros summary */}
              <AnimatePresence mode="wait">
                <motion.div key={activePlan}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 24, padding: '18px 20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${plan.color},transparent)` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--chalk)' }}>{plan.label} — {plan.goal}</div>
                        {goalBadge && (
                          <span style={{ padding: '2px 10px', background: goalBadge.bg, border: `1px solid ${goalBadge.color}40`, borderRadius: 20, fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: goalBadge.color, letterSpacing: '0.06em' }}>
                            {goalBadge.label}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)', marginTop: 3 }}>
                        {plan.deficit > 0 ? `+${plan.deficit}` : plan.deficit} سعرة عن احتياجك اليومي
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: plan.color, lineHeight: 1 }}>{plan.targetCal}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)' }}>سعرة/يوم</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[
                      { label: 'بروتين', val: plan.macros.protein, color: '#f87171', icon: '🥩' },
                      { label: 'كارب',   val: plan.macros.carbs,   color: '#facc15', icon: '🍚' },
                      { label: 'دهون',   val: plan.macros.fat,     color: '#4ade80', icon: '🥑' },
                    ].map(({ label, val, color, icon }) => (
                      <div key={label} style={{ textAlign: 'center', padding: '10px 6px', background: `${color}0a`, border: `1px solid ${color}18`, borderRadius: 8 }}>
                        <div style={{ fontSize: '1rem', marginBottom: 2 }}>{icon}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color }}>{val}<span style={{ fontSize: '0.7rem' }}>g</span></div>
                        <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ✅ مكملات مقترحة */}
              <SupplementsCard goalType={plan.goalType} />

              {/* meals */}
              <div style={{ marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)', letterSpacing: '0.02em', }}>
                الوجبات — اضغط على الوجبة للتفاصيل والبدائل
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activePlan} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {plan.meals.map((meal, i) => (
                    <MealCard key={`${activePlan}-${i}`} meal={meal} planColor={plan.color} mealIndex={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>
                💡 <strong style={{ color: 'var(--chalk)' }}>نصيحة:</strong> الأرقام تقريبية بناءً على معادلة هاريس-بينيديكت. لو وزنك اتغير، اضغط &quot;غيّر&quot; وحسب من جديد.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
