import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Loader, Calculator, User } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

// ── شاشة غير مشترك ────────────────────────────────────────
function PremiumGate({ user }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', direction: 'rtl' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '36px 28px', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--fire),transparent)' }} />
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 26 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 8 }}>للمشتركين فقط</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 24 }}>
          الأنظمة الغذائية متاحة للمشتركين. اشترك دلوقتي عن طريق فودافون كاش واتفتحلك فوراً.
        </p>
        <div style={{ padding: '16px', background: 'rgba(255,59,48,0.07)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.08em', marginBottom: 8 }}>ابعت على فودافون كاش</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--chalk)', letterSpacing: '0.06em', direction: 'ltr' }}>01097931713</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--fire)', lineHeight: 1 }}>29</div>
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
  { name: '100جم صدر فراخ مشوي', protein: 31, carbs: 0, fat: 3.6, cal: 165 },
  { name: '150جم تونة في الماء', protein: 33, carbs: 0, fat: 1.5, cal: 147 },
  { name: '5 بيضات مسلوقة', protein: 30, carbs: 2, fat: 25, cal: 350 },
  { name: '150جم جبنة قريش', protein: 24, carbs: 4, fat: 1, cal: 121 },
  { name: '100جم لحمة بتلو مشوية', protein: 26, carbs: 0, fat: 12, cal: 217 },
  { name: '150جم كبدة دجاج', protein: 30, carbs: 2, fat: 8, cal: 198 },
  { name: '120جم سمك بلطي مشوي', protein: 27, carbs: 0, fat: 4, cal: 144 },
];

const CARB_OPTIONS = [
  { name: '100جم أرز أبيض مطبوخ', protein: 2.7, carbs: 28, fat: 0.3, cal: 130 },
  { name: '150جم مكرونة مطبوخة', protein: 5, carbs: 36, fat: 1, cal: 174 },
  { name: '80جم شوفان', protein: 5, carbs: 54, fat: 3.5, cal: 267 },
  { name: '2 رغيف بلدي', protein: 8, carbs: 60, fat: 2, cal: 290 },
  { name: '300جم بطاطس مسلوقة', protein: 6, carbs: 51, fat: 0.4, cal: 231 },
  { name: '150جم كوسة مطبوخة + خبز', protein: 4, carbs: 28, fat: 1, cal: 140 },
  { name: '100جم عدس مطبوخ', protein: 9, carbs: 20, fat: 0.4, cal: 116 },
];

const FAT_OPTIONS = [
  { name: '1 ملعقة كبيرة زيت زيتون', protein: 0, carbs: 0, fat: 14, cal: 120 },
  { name: '20جم مكسرات مشكلة', protein: 4, carbs: 4, fat: 12, cal: 140 },
  { name: 'نص أفوكادو', protein: 1, carbs: 4, fat: 11, cal: 120 },
  { name: '1 ملعقة زبدة فول سوداني طبيعية', protein: 3.5, carbs: 3, fat: 8, cal: 94 },
];

// ── حساب TDEE ─────────────────────────────────────────────
// Harris-Benedict Revised
function calcTDEE({ weight, height, age, gender, activity }) {
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  return Math.round(bmr * (activityMap[activity] || 1.55));
}

// ── توليد الخطط بناءً على TDEE والهدف ────────────────────
function generatePlans(tdee) {
  // تعريفات الأهداف
  return {
    cut_strong: {
      label: `${tdee - 600} سعرة`,
      goal: 'تنشيف قوي',
      goalType: 'cut',
      color: '#f87171',
      icon: '🔥',
      deficit: -600,
      targetCal: tdee - 600,
      macros: {
        protein: Math.round(((tdee - 600) * 0.40) / 4),
        carbs: Math.round(((tdee - 600) * 0.35) / 4),
        fat: Math.round(((tdee - 600) * 0.25) / 9),
      },
      meals: buildMeals('cut_strong'),
    },
    cut_light: {
      label: `${tdee - 300} سعرة`,
      goal: 'تنشيف خفيف',
      goalType: 'cut',
      color: '#fb923c',
      icon: '⚡',
      deficit: -300,
      targetCal: tdee - 300,
      macros: {
        protein: Math.round(((tdee - 300) * 0.38) / 4),
        carbs: Math.round(((tdee - 300) * 0.37) / 4),
        fat: Math.round(((tdee - 300) * 0.25) / 9),
      },
      meals: buildMeals('cut_light'),
    },
    maintain: {
      label: `${tdee} سعرة`,
      goal: 'محافظة',
      goalType: 'maintain',
      color: '#facc15',
      icon: '⚖️',
      deficit: 0,
      targetCal: tdee,
      macros: {
        protein: Math.round((tdee * 0.30) / 4),
        carbs: Math.round((tdee * 0.45) / 4),
        fat: Math.round((tdee * 0.25) / 9),
      },
      meals: buildMeals('maintain'),
    },
    bulk_lean: {
      label: `${tdee + 300} سعرة`,
      goal: 'تضخيم نظيف',
      goalType: 'bulk',
      color: '#4ade80',
      icon: '💪',
      deficit: +300,
      targetCal: tdee + 300,
      macros: {
        protein: Math.round(((tdee + 300) * 0.30) / 4),
        carbs: Math.round(((tdee + 300) * 0.48) / 4),
        fat: Math.round(((tdee + 300) * 0.22) / 9),
      },
      meals: buildMeals('bulk_lean'),
    },
    bulk_strong: {
      label: `${tdee + 600} سعرة`,
      goal: 'تضخيم قوي',
      goalType: 'bulk',
      color: '#a78bfa',
      icon: '🏆',
      deficit: +600,
      targetCal: tdee + 600,
      macros: {
        protein: Math.round(((tdee + 600) * 0.28) / 4),
        carbs: Math.round(((tdee + 600) * 0.50) / 4),
        fat: Math.round(((tdee + 600) * 0.22) / 9),
      },
      meals: buildMeals('bulk_strong'),
    },
  };
}

// ── بناء الوجبات حسب النوع ────────────────────────────────
function buildMeals(type) {
  const templates = {
    cut_strong: [
      { name: 'الفطار', time: '8:00 ص', proteinKey: 3, carbKey: 2 },
      { name: 'سناك', time: '11:00 ص', proteinKey: 1, carbKey: null },
      { name: 'الغداء', time: '2:00 م', proteinKey: 0, carbKey: 0 },
      { name: 'العشاء', time: '7:00 م', proteinKey: 2, carbKey: 3 },
    ],
    cut_light: [
      { name: 'الفطار', time: '8:00 ص', proteinKey: 2, carbKey: 2 },
      { name: 'سناك صباحي', time: '11:00 ص', proteinKey: 3, carbKey: 6 },
      { name: 'الغداء', time: '2:00 م', proteinKey: 0, carbKey: 0 },
      { name: 'سناك مسائي', time: '5:00 م', proteinKey: 1, carbKey: 3 },
      { name: 'العشاء', time: '8:00 م', proteinKey: 5, carbKey: 4 },
    ],
    maintain: [
      { name: 'الفطار', time: '8:00 ص', proteinKey: 2, carbKey: 2 },
      { name: 'سناك', time: '11:00 ص', proteinKey: 3, carbKey: 3 },
      { name: 'الغداء', time: '2:00 م', proteinKey: 0, carbKey: 0 },
      { name: 'سناك مسائي', time: '5:00 م', proteinKey: 1, carbKey: 6 },
      { name: 'العشاء', time: '8:00 م', proteinKey: 6, carbKey: 1 },
    ],
    bulk_lean: [
      { name: 'الفطار', time: '8:00 ص', proteinKey: 2, carbKey: 2 },
      { name: 'سناك صباحي', time: '10:30 ص', proteinKey: 3, carbKey: 6 },
      { name: 'الغداء', time: '2:00 م', proteinKey: 4, carbKey: 0 },
      { name: 'ما بعد التمرين', time: '5:30 م', proteinKey: 1, carbKey: 4 },
      { name: 'العشاء', time: '8:00 م', proteinKey: 0, carbKey: 1 },
      { name: 'قبل النوم', time: '11:00 م', proteinKey: 3, carbKey: null },
    ],
    bulk_strong: [
      { name: 'الفطار', time: '7:30 ص', proteinKey: 2, carbKey: 2 },
      { name: 'سناك 1', time: '10:00 ص', proteinKey: 3, carbKey: 4 },
      { name: 'الغداء', time: '1:00 م', proteinKey: 4, carbKey: 0 },
      { name: 'سناك 2', time: '4:00 م', proteinKey: 1, carbKey: 6 },
      { name: 'ما بعد التمرين', time: '6:00 م', proteinKey: 0, carbKey: 1 },
      { name: 'العشاء', time: '8:30 م', proteinKey: 5, carbKey: 4 },
      { name: 'قبل النوم', time: '11:00 م', proteinKey: 3, carbKey: null },
    ],
  };
  return templates[type] || templates.maintain;
}

// ── Meal Card ──────────────────────────────────────────────
function MealCard({ meal, planColor, mealIndex }) {
  const [proteinChoice, setProteinChoice] = useState(meal.proteinKey);
  const [carbChoice, setCarbChoice] = useState(meal.carbKey);
  const [open, setOpen] = useState(false);
  const [swapping, setSwapping] = useState(null);

  const currentProtein = proteinChoice !== null ? PROTEIN_OPTIONS[proteinChoice] : null;
  const currentCarb = carbChoice !== null ? CARB_OPTIONS[carbChoice] : null;

  const mealCal = (currentProtein?.cal || 0) + (currentCarb?.cal || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: mealIndex * 0.07 }}
      style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 12 }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: planColor, boxShadow: `0 0 8px ${planColor}80` }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em', color: 'var(--chalk)' }}>{meal.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', marginRight: 4 }}>{meal.time}</span>
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

              {/* البروتين */}
              {currentProtein && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.08em', marginBottom: 6 }}>🥩 البروتين</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--chalk)', fontFamily: 'var(--font-body)' }}>{currentProtein.name}</span>
                    <button
                      onClick={() => setSwapping(swapping === 'protein' ? null : 'protein')}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}
                    >
                      <RefreshCw size={11} /> بدّل
                    </button>
                  </div>
                  <AnimatePresence>
                    {swapping === 'protein' && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {PROTEIN_OPTIONS.map((opt, i) => (
                          <button key={i} onClick={() => { setProteinChoice(i); setSwapping(null); }}
                            style={{ textAlign: 'right', padding: '8px 12px', background: i === proteinChoice ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === proteinChoice ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, color: 'var(--chalk)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)' }}>{opt.cal} كال</span>
                            {opt.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* الكارب */}
              {currentCarb && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.08em', marginBottom: 6 }}>🍚 الكارب</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(250,204,21,0.07)', border: '1px solid rgba(250,204,21,0.18)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--chalk)', fontFamily: 'var(--font-body)' }}>{currentCarb.name}</span>
                    <button
                      onClick={() => setSwapping(swapping === 'carb' ? null : 'carb')}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 6, color: '#facc15', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}
                    >
                      <RefreshCw size={11} /> بدّل
                    </button>
                  </div>
                  <AnimatePresence>
                    {swapping === 'carb' && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {CARB_OPTIONS.map((opt, i) => (
                          <button key={i} onClick={() => { setCarbChoice(i); setSwapping(null); }}
                            style={{ textAlign: 'right', padding: '8px 12px', background: i === carbChoice ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === carbChoice ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, color: 'var(--chalk)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)' }}>{opt.cal} كال</span>
                            {opt.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ملخص الماكرو */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 12 }}>
                {[
                  { label: 'بروتين', val: (currentProtein?.protein || 0) + (currentCarb?.protein || 0), unit: 'g', color: '#f87171' },
                  { label: 'كارب', val: (currentProtein?.carbs || 0) + (currentCarb?.carbs || 0), unit: 'g', color: '#facc15' },
                  { label: 'دهون', val: (currentProtein?.fat || 0) + (currentCarb?.fat || 0), unit: 'g', color: '#4ade80' },
                ].map(({ label, val, unit, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '8px 4px', background: `${color}0a`, border: `1px solid ${color}1a`, borderRadius: 6 }}>
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

// ── كارت إدخال البيانات ────────────────────────────────────
function UserDataForm({ onCalculate }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [error, setError] = useState('');

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--chalk)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    direction: 'ltr',
    textAlign: 'center',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.62rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--ash-light)',
    letterSpacing: '0.08em',
    marginBottom: 6,
  };

  const activities = [
    { id: 'sedentary', label: 'مش بتتحرك', desc: 'مكتب طول اليوم' },
    { id: 'light', label: 'خفيف', desc: '1-3 أيام أسبوعياً' },
    { id: 'moderate', label: 'متوسط', desc: '3-5 أيام أسبوعياً' },
    { id: 'active', label: 'نشيط', desc: '6-7 أيام أسبوعياً' },
    { id: 'veryActive', label: 'نشيط جداً', desc: 'رياضيين أو شغل جسدي' },
  ];

  const handleCalc = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a || w < 30 || w > 250 || h < 100 || h > 250 || a < 10 || a > 100) {
      setError('اكتب بيانات صح: وزن (30-250كج)، طول (100-250سم)، سن (10-100)');
      return;
    }
    setError('');
    onCalculate({ weight: w, height: h, age: a, gender, activity });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--fire),transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Calculator size={18} color="var(--fire)" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--chalk)', letterSpacing: '0.04em' }}>احسب نظامك</span>
      </div>

      {/* الجنس */}
      <div style={{ marginBottom: 16 }}>
        <span style={labelStyle}>الجنس</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ id: 'male', label: '👨 ذكر' }, { id: 'female', label: '👩 أنثى' }].map(g => (
            <button key={g.id} onClick={() => setGender(g.id)}
              style={{ flex: 1, padding: '10px', background: gender === g.id ? 'rgba(255,107,43,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gender === g.id ? 'rgba(255,107,43,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 'var(--radius-sm)', color: gender === g.id ? 'var(--fire)' : 'var(--ash-light)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', transition: 'all 180ms' }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* الوزن / الطول / السن */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'الوزن (كجم)', val: weight, set: setWeight, ph: '75' },
          { label: 'الطول (سم)', val: height, set: setHeight, ph: '175' },
          { label: 'السن', val: age, set: setAge, ph: '25' },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <span style={labelStyle}>{label}</span>
            <input
              type="number"
              value={val}
              onChange={e => set(e.target.value)}
              placeholder={ph}
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      {/* مستوى النشاط */}
      <div style={{ marginBottom: 20 }}>
        <span style={labelStyle}>مستوى النشاط</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activities.map(a => (
            <button key={a.id} onClick={() => setActivity(a.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: activity === a.id ? 'rgba(255,107,43,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${activity === a.id ? 'rgba(255,107,43,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 180ms', direction: 'rtl' }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: activity === a.id ? 'var(--fire)' : 'var(--chalk)' }}>{a.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)' }}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.78rem', fontFamily: 'var(--font-body)', marginBottom: 14, direction: 'rtl' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleCalc}
        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,var(--fire),#ff8c42)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em', cursor: 'pointer', transition: 'opacity 200ms' }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      >
        احسب TDEE وأنا الخطة 🔥
      </button>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function NutritionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  // بيانات المستخدم المحسوبة
  const [tdee, setTdee] = useState(null);
  const [plans, setPlans] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    const checkPremium = async () => {
      const { data } = await supabase
        .from('nutrition_premium')
        .select('id')
        .eq('email', user.email)
        .single();
      setIsPremium(!!data);
      setChecking(false);
    };
    checkPremium();
  }, [user, authLoading]);

  const handleCalculate = useCallback(({ weight, height, age, gender, activity }) => {
    const calculatedTdee = calcTDEE({ weight, height, age, gender, activity });
    const generatedPlans = generatePlans(calculatedTdee);
    setTdee(calculatedTdee);
    setPlans(generatedPlans);
    setActivePlan('maintain');
    setUserData({ weight, height, age, gender, activity });

    // scroll للخطط
    setTimeout(() => {
      document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="var(--fire)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <Head><title>الأنظمة الغذائية — GYMZ</title></Head>
        <PremiumGate user={user} />
      </>
    );
  }

  const plan = plans && activePlan ? plans[activePlan] : null;

  // goal badge
  const goalBadge = plan
    ? plan.goalType === 'cut'
      ? { label: 'تنشيف', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
      : plan.goalType === 'bulk'
      ? { label: 'تضخيم', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
      : { label: 'محافظة', color: '#facc15', bg: 'rgba(250,204,21,0.1)' }
    : null;

  return (
    <>
      <Head><title>الأنظمة الغذائية — GYMZ</title></Head>
      <div style={{ minHeight: '100vh', paddingTop: 88, paddingBottom: 60, position: 'relative', direction: 'rtl' }}>
        {/* bg glow */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 40% at 50% 20%, rgba(255,107,43,0.07) 0%,transparent 60%)' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

          {/* header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--fire)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>— أنظمة غذائية مصرية</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '0.04em', lineHeight: 1 }}>
              تغذية<br /><span style={{ color: 'var(--fire)' }}>على قد إيدك</span>
            </h1>
            <p style={{ color: 'var(--ash-light)', marginTop: 12, fontSize: '0.875rem', lineHeight: 1.7 }}>
              حط بياناتك، هنحسبلك الـ TDEE الخاص بيك ونديك النظام المناسب لهدفك.
            </p>
          </motion.div>

          {/* فورم الحساب */}
          <UserDataForm onCalculate={handleCalculate} />

          {/* النتايج */}
          {plans && activePlan && (
            <div id="plans-section">

              {/* TDEE badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', letterSpacing: '0.1em', marginBottom: 4 }}>TDEE — حرقك اليومي</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--fire)', lineHeight: 1 }}>{tdee} <span style={{ fontSize: '0.8rem', color: 'var(--ash-light)' }}>سعرة/يوم</span></div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginBottom: 4 }}>إعادة الحساب؟</div>
                  <button
                    onClick={() => { setPlans(null); setTdee(null); setActivePlan(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'var(--ash-light)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}
                  >
                    <RefreshCw size={11} /> غيّر
                  </button>
                </div>
              </motion.div>

              {/* plan selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {Object.entries(plans).map(([key, p]) => {
                  const active = activePlan === key;
                  return (
                    <button key={key} onClick={() => setActivePlan(key)}
                      style={{ padding: '10px 14px', background: active ? `${p.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? p.color + '55' : 'rgba(255,255,255,0.08)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 200ms', minWidth: 100 }}>
                      <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: active ? p.color : 'var(--chalk)', letterSpacing: '0.04em' }}>{p.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: active ? p.color : 'var(--ash)', letterSpacing: '0.06em' }}>{p.goal}</span>
                    </button>
                  );
                })}
              </div>

              {/* macros summary */}
              <AnimatePresence mode="wait">
                <motion.div key={activePlan}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 24, padding: '18px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden' }}
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
                        {plan.deficit > 0 ? `+${plan.deficit}` : plan.deficit} سعرة عن TDEE
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
                      { label: 'كارب', val: plan.macros.carbs, color: '#facc15', icon: '🍚' },
                      { label: 'دهون', val: plan.macros.fat, color: '#4ade80', icon: '🥑' },
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

              {/* meals */}
              <div style={{ marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                الوجبات — اضغط على الوجبة للتفاصيل والبدائل
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activePlan} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {plan.meals.map((meal, i) => (
                    <MealCard key={`${activePlan}-${i}`} meal={meal} planColor={plan.color} mealIndex={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* tip */}
              <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>
                💡 <strong style={{ color: 'var(--chalk)' }}>نصيحة:</strong> الأرقام تقريبية بناءً على معادلة هاريس-بينيديكت. لو وزنك اتغير، ضغط على &quot;غيّر&quot; وحسب من جديد.
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
