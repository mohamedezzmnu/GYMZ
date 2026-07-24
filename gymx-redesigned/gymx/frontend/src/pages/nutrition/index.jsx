// src/pages/nutrition/index.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Loader, Calculator, Droplets, Zap } from 'lucide-react';
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
