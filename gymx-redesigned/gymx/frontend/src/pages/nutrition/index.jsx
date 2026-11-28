// src/pages/nutrition/index.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  RefreshCw, ChevronDown, ChevronUp, Loader, Calculator, Droplets,
  Zap, Barcode, Search, Check, AlertTriangle, Camera, X,
  ScanLine, Trash2, Dumbbell, Lightbulb, CheckCircle2, Lock, MessageCircle,
} from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { PROTEIN_OPTIONS, CARB_OPTIONS, FAT_OPTIONS } from '../../data/foods';
import { normalizeArabic } from '../../utils/arabic';
import { mealBaseCalories, scaleFoodItem, sumDay } from '../../utils/portions';
import { calculateCalorieEstimate, validateCalorieInput, CALORIE_SCOPE, SCOPE_CONFIRMATION } from '../../utils/calories';
import { readNutritionCache, writeNutritionCache, clearNutritionCache } from '../../utils/nutritionCache';

// ── شاشة غير مشترك ────────────────────────────────────────
function PremiumGate({ user }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        direction: 'rtl',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, var(--volt), transparent)',
          }}
        />
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'var(--volt-dim)',
            border: '1px solid var(--glass-border-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Lock size={24} color="var(--volt)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--chalk)', marginBottom: 8 }}>
          للمشتركين فقط
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 24 }}>
          الأنظمة الغذائية متاحة للمشتركين. اشترك دلوقتي عن طريق فودافون كاش ويتفعّلك الاشتراك.
        </p>
        <div
          style={{
            padding: '16px',
            background: 'var(--volt-dim)',
            border: '1px solid var(--glass-border-hover)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginBottom: 8 }}>
            ابعت على فودافون كاش
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--chalk)', direction: 'ltr' }}>
              01097931713
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--volt)', lineHeight: 1 }}>
                99
              </div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>
                جنيه
              </div>
            </div>
          </div>
        </div>
        <a
          href={`https://wa.me/201097931713?text=${encodeURIComponent(`عايز اشتراك الأنظمة الغذائية — إيميلي: ${user?.email || ''}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px',
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.35)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 12,
            textDecoration: 'none',
            color: '#25D166',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.98rem',
          }}
        >
          <MessageCircle size={16} /> ابعت السكرين شوت على واتساب
        </a>
        <p style={{ fontSize: '0.72rem', color: 'var(--ash)', textAlign: 'center', lineHeight: 1.6 }}>
          بعد التأكيد هيتفعّلك الاشتراك على إيميلك
          <br />
          <span style={{ color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
            {user?.email}
          </span>
        </p>
      </motion.div>
    </div>
  );
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
    // البيانات محفوظة محلياً في localStorage
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

function isValidBarcode(str = '') {
  const digits = str.replace(/\D/g, '');
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
    let cal = n['energy-kcal_100g'];
    if (cal == null && n['energy_100g'] != null) cal = n['energy_100g'] / 4.184;
    if (cal == null) return null;

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
    return null;
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
    return !error;
  } catch {
    return false;
  }
}

function generatePlans(estimate) {
  const { tdee, goals } = estimate;
  const plans = {
    cut_strong: {
      label: `${goals.cut_strong.targetCal} سعرة`,
      goal: 'نزول تقديري 20٪',
      goalType: 'cut',
      color: '#f87171',
      icon: '🔥',
      deficit: goals.cut_strong.deficit,
      targetCal: goals.cut_strong.targetCal,
      available: goals.cut_strong.available,
      reason: goals.cut_strong.reason,
      macros: {
        protein: Math.round(((goals.cut_strong.targetCal) * 0.40) / 4),
        carbs:   Math.round(((goals.cut_strong.targetCal) * 0.35) / 4),
        fat:     Math.round(((goals.cut_strong.targetCal) * 0.25) / 9),
      },
      meals: buildMeals('cut_strong'),
    },
    cut_light: {
      label: `${goals.cut_light.targetCal} سعرة`,
      goal: 'نزول تقديري 10٪',
      goalType: 'cut',
      color: '#fb923c',
      icon: '⚡',
      deficit: goals.cut_light.deficit,
      targetCal: goals.cut_light.targetCal,
      available: goals.cut_light.available,
      reason: goals.cut_light.reason,
      macros: {
        protein: Math.round(((goals.cut_light.targetCal) * 0.38) / 4),
        carbs:   Math.round(((goals.cut_light.targetCal) * 0.37) / 4),
        fat:     Math.round(((goals.cut_light.targetCal) * 0.25) / 9),
      },
      meals: buildMeals('cut_light'),
    },
    maintain: {
      label: `${goals.maintain.targetCal} سعرة`,
      goal: 'ثبات على وزنك',
      goalType: 'maintain',
      color: '#facc15',
      icon: '⚖️',
      deficit: goals.maintain.deficit,
      targetCal: goals.maintain.targetCal,
      available: goals.maintain.available,
      reason: goals.maintain.reason,
      macros: {
        protein: Math.round((goals.maintain.targetCal * 0.30) / 4),
        carbs:   Math.round((goals.maintain.targetCal * 0.45) / 4),
        fat:     Math.round((goals.maintain.targetCal * 0.25) / 9),
      },
      meals: buildMeals('maintain'),
    },
    bulk_lean: {
      label: `${goals.bulk_lean.targetCal} سعرة`,
      goal: 'زيادة تقديرية 10٪',
      goalType: 'bulk',
      color: '#4ade80',
      icon: '💪',
      deficit: goals.bulk_lean.deficit,
      targetCal: goals.bulk_lean.targetCal,
      available: goals.bulk_lean.available,
      reason: goals.bulk_lean.reason,
      macros: {
        protein: Math.round(((goals.bulk_lean.targetCal) * 0.30) / 4),
        carbs:   Math.round(((goals.bulk_lean.targetCal) * 0.48) / 4),
        fat:     Math.round(((goals.bulk_lean.targetCal) * 0.22) / 9),
      },
      meals: buildMeals('bulk_lean'),
    },
    bulk_strong: {
      label: `${goals.bulk_strong.targetCal} سعرة`,
      goal: 'زيادة تقديرية 20٪',
      goalType: 'bulk',
      color: '#a78bfa',
      icon: '🏆',
      deficit: goals.bulk_strong.deficit,
      targetCal: goals.bulk_strong.targetCal,
      available: goals.bulk_strong.available,
      reason: goals.bulk_strong.reason,
      macros: {
        protein: Math.round(((goals.bulk_strong.targetCal) * 0.28) / 4),
        carbs:   Math.round(((goals.bulk_strong.targetCal) * 0.50) / 4),
        fat:     Math.round(((goals.bulk_strong.targetCal) * 0.22) / 9),
      },
      meals: buildMeals('bulk_strong'),
    },
  };
  // كميات القوالب ثابتة، فبنحسب معامل لكل خطة يخلي مجموع الوجبات يطابق الهدف
  for (const key of Object.keys(plans)) {
    const baseCal = mealBaseCalories(plans[key].meals);
    plans[key].baseCal = baseCal;
    plans[key].scale = baseCal > 0 ? plans[key].targetCal / baseCal : 1;
    if (plans[key].available && sumDay(plans[key].meals, {}, plans[key].scale).cal < estimate.minimum) {
      plans[key].available = false;
      plans[key].reason = 'إجمالي الوجبات بعد تقريب الكميات أقل من حد العرض للتطبيق. راجع مختص.';
    }
  }
  return plans;
}

function buildMeals(type) {
  const templates = {
    cut_strong: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 3, carbKey: 2,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'سناك',                     time: '11:00 ص', proteinKey: 1, carbKey: null, fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '2:00 م',  proteinKey: 0, carbKey: 0,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'قبل التمرين (بساعة)',     time: '5:00 م',  proteinKey: 3, carbKey: 6,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: 'بعد التمرين',             time: '7:30 م',  proteinKey: 0, carbKey: 3,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '9:00 م',  proteinKey: 2, carbKey: null, fatKey: 0,    preWorkout: false, postWorkout: false },
    ],
    cut_light: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 2, carbKey: 2,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'سناك صباحي',              time: '11:00 ص', proteinKey: 3, carbKey: 6,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '2:00 م',  proteinKey: 0, carbKey: 0,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'قبل التمرين (بساعة)',     time: '5:00 م',  proteinKey: 3, carbKey: 3,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: 'بعد التمرين',             time: '7:00 م',  proteinKey: 1, carbKey: 4,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '9:00 م',  proteinKey: 5, carbKey: null, fatKey: 0,    preWorkout: false, postWorkout: false },
    ],
    maintain: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 2, carbKey: 2,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'سناك',                     time: '11:00 ص', proteinKey: 3, carbKey: 3,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '2:00 م',  proteinKey: 0, carbKey: 0,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'قبل التمرين (بساعة)',     time: '5:00 م',  proteinKey: 3, carbKey: 6,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: 'بعد التمرين',             time: '7:00 م',  proteinKey: 1, carbKey: 4,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '9:00 م',  proteinKey: 6, carbKey: 1,    fatKey: 0,    preWorkout: false, postWorkout: false },
    ],
    bulk_lean: [
      { name: 'الفطار',                   time: '8:00 ص',  proteinKey: 2, carbKey: 2,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'سناك صباحي',              time: '10:30 ص', proteinKey: 3, carbKey: 6,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '1:00 م',  proteinKey: 4, carbKey: 0,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'قبل التمرين (بساعة)',     time: '4:30 م',  proteinKey: 1, carbKey: 4,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: 'بعد التمرين',             time: '6:30 م',  proteinKey: 0, carbKey: 2,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'العشاء',                   time: '8:30 م',  proteinKey: 5, carbKey: 1,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'قبل النوم',                time: '11:00 م', proteinKey: 3, carbKey: null, fatKey: 3,    preWorkout: false, postWorkout: false },
    ],
    bulk_strong: [
      { name: 'الفطار',                   time: '7:30 ص',  proteinKey: 2, carbKey: 2,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'سناك 1',                   time: '10:00 ص', proteinKey: 3, carbKey: 4,    fatKey: null, preWorkout: false, postWorkout: false },
      { name: 'الغداء',                   time: '1:00 م',  proteinKey: 4, carbKey: 0,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'قبل التمرين (بساعة)',     time: '4:00 م',  proteinKey: 1, carbKey: 6,    fatKey: null, preWorkout: true,  postWorkout: false },
      { name: 'بعد التمرين',             time: '6:00 م',  proteinKey: 0, carbKey: 1,    fatKey: null, preWorkout: false, postWorkout: true  },
      { name: 'سناك 2',                   time: '8:00 م',  proteinKey: 3, carbKey: 4,    fatKey: 1,    preWorkout: false, postWorkout: false },
      { name: 'العشاء',                   time: '9:30 م',  proteinKey: 5, carbKey: 2,    fatKey: 0,    preWorkout: false, postWorkout: false },
      { name: 'قبل النوم',                time: '11:30 م', proteinKey: 3, carbKey: null, fatKey: 3,    preWorkout: false, postWorkout: false },
    ],
  };
  return templates[type] || templates.maintain;
}

// ── Meal Card ──────────────────────────────────────────────
function MealCard({ meal, planColor, mealIndex, scale = 1, selection, onSelect }) {
  const proteinChoice = selection?.protein ?? meal.proteinKey;
  const carbChoice    = selection?.carb ?? meal.carbKey;
  const fatChoice     = selection?.fat ?? meal.fatKey;
  const [open, setOpen]                   = useState(false);
  const [swapping, setSwapping]           = useState(null);

  const currentProtein = proteinChoice !== null ? scaleFoodItem(PROTEIN_OPTIONS[proteinChoice], scale) : null;
  const currentCarb    = carbChoice !== null ? scaleFoodItem(CARB_OPTIONS[carbChoice], scale) : null;
  const currentFat     = fatChoice !== null ? scaleFoodItem(FAT_OPTIONS[fatChoice], scale) : null;

  const mealCal = (currentProtein?.cal || 0) + (currentCarb?.cal || 0) + (currentFat?.cal || 0);

  const cardBorderColor = meal.preWorkout
    ? 'rgba(250,204,21,0.25)'
    : meal.postWorkout
      ? 'rgba(74,222,128,0.25)'
      : 'var(--glass-border)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: mealIndex * 0.05 }}
      className="glass-card"
      style={{
        borderColor: cardBorderColor,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      <div
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          cursor: 'pointer',
          borderBottom: open ? '1px solid var(--glass-border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ash)', minWidth: 46 }}>
            {meal.time}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.96rem', color: 'var(--chalk)' }}>
            {meal.name}
          </span>
          {meal.preWorkout && <Dumbbell size={12} color="#facc15" style={{ flexShrink: 0 }} />}
          {meal.postWorkout && <CheckCircle2 size={12} color="#4ade80" style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: planColor }}>
            {mealCal} كال
          </span>
          {open ? <ChevronUp size={14} color="var(--ash)" /> : <ChevronDown size={14} color="var(--ash)" />}
        </div>
      </div>

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
              {meal.preWorkout && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: 'rgba(250,204,21,0.06)',
                    border: '1px solid rgba(250,204,21,0.2)',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    color: '#facc15',
                  }}
                >
                  <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                  تجنب الدهون قبل التمرين — بتبطئ الهضم وبتأثر على الأداء
                </div>
              )}

              {meal.postWorkout && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: 'rgba(74,222,128,0.06)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    color: '#4ade80',
                  }}
                >
                  <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                  النافذة الذهبية — بروتين سريع + كارب بسيط خلال 30-60 دقيقة بعد التمرين
                </div>
              )}

              {currentProtein && (
                <FoodRow
                  label="البروتين"
                  item={currentProtein}
                  color="#f87171"
                  swapKey="protein"
                  swapping={swapping}
                  setSwapping={setSwapping}
                  options={PROTEIN_OPTIONS}
                  currentIndex={proteinChoice}
                  scale={scale}
                  onSelect={(i) => {
                    onSelect?.('protein', i);
                    setSwapping(null);
                  }}
                />
              )}

              {currentCarb && (
                <FoodRow
                  label="الكارب"
                  item={currentCarb}
                  color="#facc15"
                  swapKey="carb"
                  swapping={swapping}
                  setSwapping={setSwapping}
                  options={CARB_OPTIONS}
                  currentIndex={carbChoice}
                  scale={scale}
                  onSelect={(i) => {
                    onSelect?.('carb', i);
                    setSwapping(null);
                  }}
                />
              )}

              {currentFat && (
                <FoodRow
                  label="الدهون الصحية"
                  item={currentFat}
                  color="#4ade80"
                  swapKey="fat"
                  swapping={swapping}
                  setSwapping={setSwapping}
                  options={FAT_OPTIONS}
                  currentIndex={fatChoice}
                  scale={scale}
                  onSelect={(i) => {
                    onSelect?.('fat', i);
                    setSwapping(null);
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid var(--glass-border)',
                }}
              >
                {[
                  { label: 'سعرات', val: mealCal, unit: '', color: planColor },
                  {
                    label: 'بروتين',
                    val: Math.round((currentProtein?.protein || 0) + (currentCarb?.protein || 0) + (currentFat?.protein || 0)),
                    unit: 'g',
                    color: '#f87171',
                  },
                  {
                    label: 'كارب',
                    val: Math.round((currentProtein?.carbs || 0) + (currentCarb?.carbs || 0) + (currentFat?.carbs || 0)),
                    unit: 'g',
                    color: '#facc15',
                  },
                  {
                    label: 'دهون',
                    val: Math.round((currentProtein?.fat || 0) + (currentCarb?.fat || 0) + (currentFat?.fat || 0)),
                    unit: 'g',
                    color: '#4ade80',
                  },
                ].map(({ label, val, unit, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color }}>
                      {val}
                      <span style={{ fontSize: '0.62rem' }}>{unit}</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 2 }}>
                      {label}
                    </div>
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
function FoodRow({ label, item, color, swapKey, swapping, setSwapping, options, currentIndex, onSelect, scale = 1 }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <span style={{ fontSize: '0.82rem', color: 'var(--chalk)' }}>{item.name}</span>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
          onClick={() => setSwapping(swapping === swapKey ? null : swapKey)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            background: 'transparent',
            border: `1px solid ${color}40`,
            borderRadius: 6,
            color,
            cursor: 'pointer',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          <RefreshCw size={11} /> بدّل
        </motion.button>
      </div>

      <AnimatePresence>
        {swapping === swapKey && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            {options.map((opt, i) => {
              const scaled = scaleFoodItem(opt, scale);
              return (
              <motion.button
                type="button"
                key={opt.name || i}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12 }}
                onClick={() => onSelect(i)}
                style={{
                  textAlign: 'right',
                  padding: '8px 12px',
                  background: i === currentIndex ? `${color}18` : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${i === currentIndex ? `${color}55` : 'var(--glass-border)'}`,
                  borderRadius: 6,
                  color: 'var(--chalk)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.62rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)' }}>
                  {scaled.cal} كال · {scaled.protein}g بروتين
                </span>
                {scaled.name}
              </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── إجمالي وجبات اليوم (فعليًا، بعد ضبط الكميات) ──────────
function DayTotalsCard({ totals, targetCal, planColor }) {
  const diff = totals.cal - targetCal;
  const within = Math.abs(diff) <= targetCal * 0.1;
  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 24,
        borderRadius: 10,
        padding: '14px 16px',
        borderInlineStart: `2px solid ${within ? '#4ade80' : '#facc15'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.1em' }}>
          إجمالي وجبات اليوم
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: planColor }}>
          ≈ {totals.cal} كال
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: '0.68rem', color: 'var(--ash-light)' }}>
            {' '}من أصل {targetCal} هدفك
          </span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#f87171' }}>بروتين {totals.protein}g</span>
        <span style={{ color: '#facc15' }}>كارب {totals.carbs}g</span>
        <span style={{ color: '#4ade80' }}>دهون {totals.fat}g</span>
      </div>
    </div>
  );
}

// ── Supplements Card ──────────────────────────────────────
function SupplementsCard({ goalType }) {
  const supps = SUPPLEMENTS[goalType] || SUPPLEMENTS.maintain;
  const [open, setOpen] = useState(false);

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 16,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setOpen(p => !p)}
        style={{
          padding: '14px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={15} color="var(--volt)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--chalk)' }}>
            مكملات مقترحة لهدفك
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 7px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              color: 'var(--ash-light)',
            }}
          >
            اختياري
          </span>
        </div>
        {open ? <ChevronUp size={14} color="var(--ash)" /> : <ChevronDown size={14} color="var(--ash)" />}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 18px', direction: 'rtl', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supps.map((s, i) => (
                <div
                  key={s.name || i}
                  style={{
                    padding: '12px 14px',
                    background: s.important ? 'var(--volt-dim)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${s.important ? 'var(--glass-border-hover)' : 'var(--glass-border)'}`,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--chalk)' }}>
                      {s.name}
                    </span>
                    {s.important && (
                      <span
                        style={{
                          fontSize: '0.55rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 3,
                          background: 'var(--volt-dim)',
                          border: '1px solid var(--glass-border-hover)',
                          color: 'var(--volt)',
                        }}
                      >
                        مهم
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--volt)', marginBottom: 4 }}>
                    {s.dose}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash-light)', lineHeight: 1.5 }}>
                    {s.reason}
                  </div>
                </div>
              ))}
              <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.7rem', color: 'var(--ash)', lineHeight: 1.6, marginTop: 4 }}>
                <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                المكملات مش إلزامية — الأكل الطبيعي هو الأساس. استشر دكتور قبل ما تاخد أي مكمل لو عندك أي حالة صحية.
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
    <div
      className="glass-card"
      style={{
        marginBottom: 16,
        padding: '16px 18px',
        borderRadius: 10,
        direction: 'rtl',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Droplets size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--chalk)', marginBottom: 2 }}>
            احتياجك اليومي من المياه
          </div>
          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>
            وزن ({weight}kg) × 33ml
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.9rem', color: 'var(--chalk)', lineHeight: 1 }}>
          {liters}
          <span style={{ fontSize: '0.9rem', color: 'var(--ash-light)' }}>L</span>
        </div>
        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 2 }}>
          ≈ {glasses} كوب
        </div>
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
        const aStarts = a._n.startsWith(nq) ? 0 : 1;
        const bStarts = b._n.startsWith(nq) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.name.length - b.name.length;
      })
      .slice(0, 10);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ borderRadius: 10, padding: '18px 18px 20px', marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Search size={15} color="var(--volt)" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--chalk)' }}>
          دوّر على أكلة
        </span>
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="اكتب اسم الأكلة... (مثلاً: فراخ، أرز، لوز)"
        className="input"
        style={{ direction: 'rtl' }}
      />
      <AnimatePresence>
        {query.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {results.length === 0 ? (
              <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--ash-light)' }}>
                ملقيناش حاجة مطابقة، جرّب اسم تاني.
              </div>
            ) : (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}>
                {results.map((f, i) => (
                  <div
                    key={`${f.category}-${f.name}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 4px',
                      borderTop: i > 0 ? '1px solid var(--glass-border)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--chalk)' }}>{f.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)' }}>
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

// ── مسح الباركود بالكاميرا ─────────────────────────────────
function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const detectedRef = useRef(false);
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
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          videoRef.current,
          (result) => {
            if (!alive || !result || detectedRef.current) return;
            const text = (result.getText() || '').replace(/\D/g, '');
            if (text.length >= 8 && text.length <= 14) {
              detectedRef.current = true;
              setScanState('success');
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([40, 30, 60]);
              }
              controlsRef.current?.stop();
              setTimeout(() => {
                if (alive) onDetected(text);
              }, 400);
            }
          }
        );

        if (!alive) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setScanState('scanning');
      } catch (err) {
        if (!alive) return;
        setScanState(
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' ? 'denied' : 'error'
        );
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
    notfound: 'مقدرناش نلاقي كاميرا على الجهاز ده',
    error: 'حصلت مشكلة في فتح الكاميرا',
  }[scanState];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(8, 8, 8, 0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="قفل"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 3,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(8, 8, 8, 0.65)',
            border: '1px solid var(--glass-border)',
            color: 'var(--chalk)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', background: '#000', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: scanState === 'scanning' || scanState === 'success' ? 'block' : 'none',
            }}
          />

          {scanState === 'starting' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size={26} color="var(--volt)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {(scanState === 'denied' || scanState === 'notfound' || scanState === 'error') && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
              <AlertTriangle size={28} color="#f87171" />
              <span style={{ color: '#f87171', fontSize: '0.82rem', lineHeight: 1.7 }}>{statusText}</span>
              {scanState === 'denied' && (
                <span style={{ color: 'var(--ash-light)', fontSize: '0.7rem', lineHeight: 1.7 }}>
                  فعّل إذن الكاميرا من إعدادات المتصفح وجرب تاني.
                </span>
              )}
            </div>
          )}

          {(scanState === 'scanning' || scanState === 'success') && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.28)',
                  maskImage: 'radial-gradient(ellipse 46% 26% at 50% 50%, transparent 60%, black 61%)',
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: '37%',
                  left: '10%',
                  right: '10%',
                  height: '26%',
                  border: `2px solid ${scanState === 'success' ? '#4ade80' : 'var(--volt)'}`,
                  borderRadius: 10,
                  transition: 'border-color 0.25s ease',
                  pointerEvents: 'none',
                }}
              >
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => {
                  const [v, h] = corner.split('-');
                  return (
                    <div
                      key={corner}
                      style={{
                        position: 'absolute',
                        width: 18,
                        height: 18,
                        [v]: -2,
                        [h]: -2,
                        borderTop: v === 'top' ? `3px solid ${scanState === 'success' ? '#4ade80' : 'var(--volt)'}` : 'none',
                        borderBottom: v === 'bottom' ? `3px solid ${scanState === 'success' ? '#4ade80' : 'var(--volt)'}` : 'none',
                        borderLeft: h === 'left' ? `3px solid ${scanState === 'success' ? '#4ade80' : 'var(--volt)'}` : 'none',
                        borderRight: h === 'right' ? `3px solid ${scanState === 'success' ? '#4ade80' : 'var(--volt)'}` : 'none',
                        borderRadius: 4,
                      }}
                    />
                  );
                })}

                {scanState === 'scanning' && (
                  <motion.div
                    initial={{ top: '6%' }}
                    animate={{ top: ['6%', '90%', '6%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      left: '4%',
                      right: '4%',
                      height: 2,
                      background: 'linear-gradient(90deg, transparent, var(--volt), transparent)',
                      boxShadow: '0 0 8px 1px var(--volt-glow)',
                    }}
                  />
                )}

                {scanState === 'success' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(74,222,128,0.15)',
                      borderRadius: 8,
                    }}
                  >
                    <Check size={34} color="#4ade80" />
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <ScanLine size={14} color={scanState === 'success' ? '#4ade80' : 'var(--volt)'} />
          <span style={{ fontSize: '0.8rem', color: scanState === 'success' ? '#4ade80' : 'var(--chalk)' }}>
            {statusText}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BarcodeSearch({ userId }) {
  const [barcode, setBarcode]       = useState('');
  const [status, setStatus]         = useState('idle');
  const [result, setResult]         = useState(null);
  const [manualErr, setManualErr]   = useState('');
  const [manual, setManual]         = useState({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '100 جرام' });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [fromCamera, setFromCamera] = useState(false);
  const shakeControls = useAnimation();

  const resetManual = () => setManual({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '100 جرام' });

  const handleSearch = useCallback(async (codeOverride) => {
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

    const off = await lookupOpenFoodFacts(clean);
    if (off) {
      setResult(off);
      setStatus('found');
      return;
    }

    const community = await lookupCommunityFood(clean);
    if (community) {
      setResult(community);
      setStatus('found');
      return;
    }

    resetManual();
    setStatus('manual');
  }, [barcode, shakeControls]);

  const handleManualSave = async () => {
    const name = manual.name.trim();
    const cal = parseFloat(manual.cal);
    const protein = parseFloat(manual.protein || 0);
    const carbs = parseFloat(manual.carbs || 0);
    const fat = parseFloat(manual.fat || 0);

    if (!name) {
      setManualErr('اكتب اسم المنتج');
      return;
    }
    if (!cal || cal <= 0 || cal > 3000) {
      setManualErr('اكتب سعرات حرارية منطقية (1-3000)');
      return;
    }
    if ([protein, carbs, fat].some(v => Number.isNaN(v) || v < 0 || v > 500)) {
      setManualErr('اكتب أرقام موجبة ومنطقية للبروتين/الكارب/الدهون');
      return;
    }

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

    setResult({ ...food, barcode: clean, source: 'community' });
    setStatus(ok ? 'saved' : 'error-save');
  };

  const handleDetected = useCallback((code) => {
    setScannerOpen(false);
    setBarcode(code);
    setFromCamera(true);
    handleSearch(code);
  }, [handleSearch]);

  const sourceLabel = result?.source === 'openfoodfacts'
    ? { text: 'المصدر: Open Food Facts', color: '#38bdf8' }
    : { text: 'مضاف من مستخدمين — راجع الأرقام من العلبة لو مش متأكد', color: '#a78bfa' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ borderRadius: 10, padding: '18px 18px 20px', marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Barcode size={16} color="var(--volt)" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--chalk)' }}>
          دوّر بالباركود
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.div animate={shakeControls} style={{ flex: 1 }}>
          <input
            type="text"
            inputMode="numeric"
            value={barcode}
            onChange={e => {
              setBarcode(e.target.value.replace(/[^\d]/g, ''));
              setFromCamera(false);
              if (status !== 'idle') setStatus('idle');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="اكتب رقم الباركود (8-14 رقم)"
            className="input"
            style={{
              borderColor: status === 'error' ? 'rgba(248,113,113,0.55)' : undefined,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              direction: 'ltr',
              textAlign: 'center',
            }}
          />
        </motion.div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
          onClick={() => handleSearch()}
          disabled={status === 'loading'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 18px',
            background: 'var(--volt-dim)',
            border: '1px solid var(--glass-border-hover)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--volt)',
            cursor: status === 'loading' ? 'default' : 'pointer',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
          دور
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
          onClick={() => setScannerOpen(true)}
          disabled={status === 'loading'}
          title="امسح بالكاميرا"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 46,
            padding: 0,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--ash-light)',
            cursor: status === 'loading' ? 'default' : 'pointer',
            flexShrink: 0,
          }}
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
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#f87171',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={14} /> رقم الباركود مش صح — لازم يكون بين 8 و14 رقم.
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12,
              fontSize: '0.78rem',
              color: 'var(--ash-light)',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> بندور على المنتج...
          </motion.div>
        )}

        {(status === 'found' || status === 'saved') && result && (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 14,
              padding: '14px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${fromCamera ? 'rgba(74,222,128,0.35)' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {fromCamera && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#4ade80', fontSize: '0.72rem' }}>
                <Camera size={13} /> اتقرا بالكاميرا
              </div>
            )}
            {status === 'saved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#4ade80', fontSize: '0.75rem' }}>
                <Check size={13} /> اتحفظ المنتج — هيظهر لباقي المستخدمين لما يدوروا على نفس الباركود.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--chalk)' }}>
                {result.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', direction: 'ltr' }}>
                {result.barcode}
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginBottom: 10 }}>
              لكل {result.serving || '100 جرام'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { label: 'سعرات', val: result.cal, unit: '', color: 'var(--chalk)' },
                { label: 'بروتين', val: result.protein, unit: 'g', color: '#f87171' },
                { label: 'كارب', val: result.carbs, unit: 'g', color: '#facc15' },
                { label: 'دهون', val: result.fat, unit: 'g', color: '#4ade80' },
              ].map(({ label, val, unit, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color }}>
                    {val}
                    <span style={{ fontSize: '0.6rem' }}>{unit}</span>
                  </div>
                  <div style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 2 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: sourceLabel.color }}>
              {sourceLabel.text}
            </div>
          </motion.div>
        )}

        {(status === 'manual' || status === 'saving' || status === 'error-save') && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 14,
              padding: '14px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '0.78rem', color: 'var(--ash-light)' }}>
              <Barcode size={13} color="var(--ash-light)" />
              المنتج مش موجود — اكتب بياناته من علبة المنتج وهنحفظها عشان تفيد غيرك بعدين.
            </div>

            {status === 'error-save' && (
              <div
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  padding: '8px 12px',
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 8,
                  color: '#f87171',
                  fontSize: '0.72rem',
                }}
              >
                <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                حصلت مشكلة في حفظ المنتج في قاعدة البيانات. البيانات ظاهرة تحت عشان تكمل نظامك دلوقتي.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <input
                type="text"
                placeholder="اسم المنتج"
                value={manual.name}
                onChange={e => setManual(m => ({ ...m, name: e.target.value }))}
                className="input"
                style={{ padding: '10px 12px', fontSize: '0.82rem', direction: 'rtl' }}
              />

              <input
                type="text"
                placeholder="حجم الحصة (مثلاً: 100 جرام، علبة واحدة)"
                value={manual.serving}
                onChange={e => setManual(m => ({ ...m, serving: e.target.value }))}
                className="input"
                style={{ padding: '10px 12px', fontSize: '0.82rem', direction: 'rtl' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {[
                  { key: 'cal', ph: 'السعرات' },
                  { key: 'protein', ph: 'بروتين (جم)' },
                  { key: 'carbs', ph: 'كارب (جم)' },
                  { key: 'fat', ph: 'دهون (جم)' },
                ].map(({ key, ph }) => (
                  <input
                    key={key}
                    type="number"
                    placeholder={ph}
                    value={manual[key]}
                    onChange={e => setManual(m => ({ ...m, [key]: e.target.value }))}
                    className="input"
                    style={{
                      padding: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      textAlign: 'center',
                      direction: 'ltr',
                    }}
                  />
                ))}
              </div>

              {manualErr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.72rem' }}>
                  <AlertTriangle size={12} /> {manualErr}
                </div>
              )}

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12 }}
                onClick={handleManualSave}
                disabled={status === 'saving'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '11px',
                  background: 'var(--volt-dim)',
                  border: '1px solid var(--glass-border-hover)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--volt)',
                  cursor: status === 'saving' ? 'default' : 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
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
  const [weight, setWeight]     = useState('');
  const [height, setHeight]     = useState('');
  const [age, setAge]           = useState('');
  const [gender, setGender]     = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [error, setError]       = useState('');
  const [scopeAccepted, setScopeAccepted] = useState(false);
  const [expanded, setExpanded] = useState(!initialData);
  const autoCollapsedRef = useRef(false);

  useEffect(() => {
    if (initialData) {
      setWeight(initialData.weight ?? '');
      setHeight(initialData.height ?? '');
      setAge(initialData.age ?? '');
      setGender(initialData.gender ?? 'male');
      setActivity(initialData.activity ?? 'moderate');
      if (!autoCollapsedRef.current) {
        setExpanded(false);
        autoCollapsedRef.current = true;
      }
    }
  }, [initialData]);

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--glass-border)',
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
    marginBottom: 6,
  };

  const activities = [
    { id: 'sedentary',  label: 'مش بتتحرك', desc: 'مكتب طول اليوم' },
    { id: 'light',      label: 'خفيف',      desc: '1-3 أيام أسبوعياً' },
    { id: 'moderate',   label: 'متوسط',     desc: '3-5 أيام أسبوعياً' },
    { id: 'active',     label: 'نشيط',      desc: '6-7 أيام أسبوعياً' },
    { id: 'veryActive', label: 'نشيط جداً', desc: 'رياضيين أو شغل جسدي' },
  ];

  const handleCalc = () => {
    const checked = validateCalorieInput({ weight, height, age, gender, activity });
    if (checked.error) { setError(checked.error); return; }
    if (!scopeAccepted) { setError('راجع شروط الاستخدام التقديري ووافق عليها الأول.'); return; }
    setError('');
    onCalculate(checked.data);
    setExpanded(false);
  };

  if (!expanded && initialData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setExpanded(true)}
        className="glass-card"
        style={{
          cursor: 'pointer',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 6 }}>
            YOUR DATA
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, direction: 'ltr' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--chalk)' }}>
              {weight}
              <span style={{ fontSize: '0.6rem', color: 'var(--ash-light)' }}> KG</span>
            </span>
            <span style={{ color: 'var(--ash)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--chalk)' }}>
              {height}
              <span style={{ fontSize: '0.6rem', color: 'var(--ash-light)' }}> CM</span>
            </span>
            <span style={{ color: 'var(--ash)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--chalk)' }}>
              {age}
              <span style={{ fontSize: '0.6rem', color: 'var(--ash-light)' }}> YRS</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
          عدّل
          <ChevronDown size={15} color="var(--ash-light)" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ borderRadius: 10, padding: '24px 22px', marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calculator size={18} color="var(--volt)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--chalk)' }}>
            احسب نظامك
          </span>
        </div>
        {initialData && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            onClick={() => setExpanded(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              color: 'var(--ash-light)',
              cursor: 'pointer',
              fontSize: '0.66rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ChevronUp size={12} /> اقفل
          </motion.button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={labelStyle}>الجنس</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ id: 'male', label: 'ذكر' }, { id: 'female', label: 'أنثى' }].map(g => (
            <motion.button
              type="button"
              key={g.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.12 }}
              onClick={() => setGender(g.id)}
              style={{
                flex: 1,
                padding: '10px',
                background: gender === g.id ? 'var(--volt-dim)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${gender === g.id ? 'var(--glass-border-hover)' : 'var(--glass-border)'}`,
                borderRadius: 'var(--radius-sm)',
                color: gender === g.id ? 'var(--volt)' : 'var(--ash-light)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 180ms',
              }}
            >
              {g.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { key: 'weight', label: 'الوزن (كجم)', val: weight, set: setWeight, ph: '75', min: 30, max: 250 },
          { key: 'height', label: 'الطول (سم)', val: height, set: setHeight, ph: '175', min: 100, max: 250 },
          { key: 'age', label: 'السن', val: age, set: setAge, ph: '25', min: 18, max: 100 },
        ].map(({ key, label, val, set, ph, min, max }) => (
          <div key={label}>
            <label htmlFor={`nutrition-${key}`} style={labelStyle}>{label}</label>
            <input id={`nutrition-${key}`} min={min} max={max} step={key === 'age' ? 1 : 'any'} type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <span style={labelStyle}>مستوى النشاط</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activities.map(a => (
            <motion.button
              type="button"
              key={a.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.12 }}
              onClick={() => setActivity(a.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: activity === a.id ? 'var(--volt-dim)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${activity === a.id ? 'var(--glass-border-hover)' : 'var(--glass-border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 180ms',
                direction: 'rtl',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: activity === a.id ? 'var(--volt)' : 'var(--chalk)' }}>
                {a.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)' }}>
                {a.desc}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', lineHeight: 1.8, color: 'var(--ash-light)' }}>{CALORIE_SCOPE}</p>
      <label style={{ display: 'flex', gap: 8, fontSize: '0.78rem', lineHeight: 1.8, margin: '12px 0' }}>
        <input type="checkbox" checked={scopeAccepted} onChange={e => setScopeAccepted(e.target.checked)} />{SCOPE_CONFIRMATION}
      </label>
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 14px',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: '0.78rem',
            marginBottom: 14,
            direction: 'rtl',
          }}
        >
          <AlertTriangle size={13} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <button type="button" onClick={handleCalc} className="btn btn-primary" style={{ width: '100%' }}>
        احسب احتياجك وشوف خطتك
      </button>

      {initialData && (
        <motion.button
          type="button"
          whileHover={{ opacity: 0.8 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.12 }}
          onClick={() => {
            onClear?.();
            setWeight('');
            setHeight('');
            setAge('');
            setGender('male');
            setActivity('moderate');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            width: '100%',
            marginTop: 10,
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--ash-light)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.66rem',
            textDecoration: 'underline',
          }}
        >
          <Trash2 size={11} /> امسح البيانات المحفوظة وابدأ من جديد
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function NutritionPage() {
  const { user } = useAuth();
  // A new identity gets a fresh tree before any previous plan can render.
  return <NutritionForUser key={user?.id || 'signed-out'} />;
}

function NutritionForUser() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking]   = useState(true);
  const [tdee, setTdee]           = useState(null);
  const [plans, setPlans]         = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [userData, setUserData]   = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [calculationError, setCalculationError] = useState('');
  // اختيارات المستخدم في الوجبات لكل خطة: { 'cut_light-2': { protein: 5 } }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?from=/nutrition');
      return;
    }

    let active = true;
    const checkPremium = async () => {
      const { data } = await supabase
        .from('nutrition_premium')
        .select('id')
        .eq('email', user.email)
        .single();
      if (!active) return;
      setIsPremium(!!data);
      setChecking(false);
    };
    checkPremium();

    return () => {
      active = false;
    };
  }, [user, authLoading, router]);

  const handleCalculate = useCallback(({ weight, height, age, gender, activity }) => {
    if (!user?.id || !isPremium) return;
    let estimate;
    try { estimate = calculateCalorieEstimate({ weight, height, age, gender, activity }); }
    catch (e) { setCalculationError(e.message); return; }
    const nextPlans = generatePlans(estimate);
    setCalculationError('');
    setTdee(estimate.tdee);
    setPlans(nextPlans);
    setActivePlan(nextPlans.maintain.available ? 'maintain' : null);
    setSelections({});
    const data = { weight, height, age, gender, activity };
    setUserData(data);
    setSavedData(data);
    writeNutritionCache(user.id, data);
    // Only an explicit calculate action saves remotely. Loading never uploads.
    saveUserDataToSupabase(user.id, data);
    setTimeout(() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [user?.id, isPremium]);

  useEffect(() => {
    if (!isPremium || !user?.id || autoLoaded) return;
    let cancelled = false;
    (async () => {
      const remote = await loadUserDataFromSupabase(user.id);
      if (cancelled) return;
      const checked = remote ? validateCalorieInput(remote) : null;
      const data = checked?.data || readNutritionCache(user.id);
      if (data) {
        setSavedData(data);
        writeNutritionCache(user.id, data);
      }
      setAutoLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [isPremium, autoLoaded, user?.id]);

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="var(--volt)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <Head>
          <title>الأنظمة الغذائية — GYMZ</title>
        </Head>
        <PremiumGate user={user} />
      </>
    );
  }

  const plan = plans && activePlan ? plans[activePlan] : null;
  const activeSelections = plan
    ? Object.fromEntries(
        plan.meals
          .map((_, i) => [i, selections[`${activePlan}-${i}`]])
          .filter(([, sel]) => sel)
      )
    : {};
  const dayTotals = plan ? sumDay(plan.meals, activeSelections, plan.scale) : null;
  const goalBadge = plan
    ? plan.goalType === 'cut'
      ? { label: 'نزول وزن', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
      : plan.goalType === 'bulk'
        ? { label: 'زيادة عضل', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
        : { label: 'ثبات على وزنك', color: '#facc15', bg: 'rgba(250,204,21,0.1)' }
    : null;

  return (
    <>
      <Head>
        <title>الأنظمة الغذائية — GYMZ</title>
      </Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 88, paddingBottom: 60, position: 'relative', direction: 'rtl' }}>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 45% 30% at 50% 15%, var(--volt-glow) 0%, transparent 60%)',
          }}
        />

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="rule-orange" />
              <span className="label-tag">NUTRITION</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem,4.6vw,3.2rem)', lineHeight: 1.05 }}>
              تغذية
              <br />
              <span style={{ color: 'var(--volt)' }}>على قد إيدك</span>
            </h1>
            <p style={{ color: 'var(--ash-light)', marginTop: 10, fontSize: '0.85rem', lineHeight: 1.7 }}>
              تقدير مبدئي للسعرات حسب بياناتك وهدفك، مش نظام علاجي أو ضمان ملاءمة طبية.
            </p>
          </motion.div>

          <FoodSearch />

          <BarcodeSearch userId={user?.id} />

          <UserDataForm
            onCalculate={handleCalculate}
            initialData={savedData}
            onClear={() => {
              setSavedData(null);
              setPlans(null); setTdee(null); setActivePlan(null); setUserData(null); setSelections({});
              clearNutritionCache(user?.id);
              clearUserDataFromSupabase(user?.id);
            }}
          />

          {calculationError && <p role="alert" style={{ color: '#f87171' }}>{calculationError}</p>}
          {plans && <div style={{ fontSize: '0.78rem', lineHeight: 1.8, marginBottom: 18, color: 'var(--ash-light)' }}>
            التقدير بمعادلة Mifflin-St Jeor × النشاط. النزول 10٪ أو 20٪، والزيادة 10٪ أو 20٪. حدود العرض 1200 للأنثى و1500 للذكر احتياط للتطبيق، مش ضمان أمان أو بديل لمختص.
            {Object.values(plans).filter(p => !p.available).map(p => <p key={p.goal}>{p.goal}: {p.reason}</p>)}
            {!activePlan && <p>مش هننشئ خطة آلية للحالة دي. راجع مختص.</p>}
          </div>}
          {plans && activePlan && plan && (
            <div id="plans-section">
              {userData && <WaterCard weight={userData.weight} />}

              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  DAILY CALORIES
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.6rem,7vw,3.4rem)', color: 'var(--volt)', lineHeight: 1 }}>
                      {plan.targetCal}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash-light)' }}>
                      kcal / day
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => {
                      setPlans(null);
                      setTdee(null);
                      setActivePlan(null);
                      setUserData(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 14px',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 8,
                      color: 'var(--ash-light)',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <RefreshCw size={11} /> غيّر
                  </motion.button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ash-light)', marginTop: 6 }}>
                  {plan.label} — {plan.goal} · على أساس {tdee} سعرة/يوم احتياجك اليومي التقديري
                </div>
              </motion.div>

              <div
                className="glass-card"
                style={{
                  marginBottom: 24,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', letterSpacing: '0.1em' }}>
                  YOUR GOAL
                </div>
                {Object.entries(plans).map(([key, p], i, arr) => {
                  const active = activePlan === key;
                  return (
                    <div
                      key={key}
                      onClick={() => p.available && setActivePlan(key)}
                      role="button" tabIndex={p.available ? 0 : -1} aria-disabled={!p.available}
                      onKeyDown={e => { if (p.available && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setActivePlan(key); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        cursor: p.available ? 'pointer' : 'not-allowed',
                        opacity: p.available ? 1 : 0.55,
                        background: active ? 'var(--volt-dim)' : 'transparent',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--glass-border)',
                        borderInlineStart: active ? '2px solid var(--volt)' : '2px solid transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: active ? 'var(--volt)' : 'var(--chalk)' }}>
                        {p.goal}{!p.available && ' (غير متاح)'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: active ? 'var(--volt)' : 'var(--ash-light)' }}>
                        {p.targetCal}
                      </span>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlan}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginBottom: 24,
                    padding: '18px 4px',
                    borderTop: '1px solid var(--glass-border)',
                    borderBottom: '1px solid var(--glass-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.1em' }}>
                      MACROS
                    </span>
                    {goalBadge && (
                      <span
                        style={{
                          padding: '2px 8px',
                          background: goalBadge.bg,
                          border: `1px solid ${goalBadge.color}40`,
                          borderRadius: 10,
                          fontSize: '0.58rem',
                          fontFamily: 'var(--font-mono)',
                          color: goalBadge.color,
                        }}
                      >
                        {goalBadge.label}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
                    {[
                      { label: 'PROTEIN', val: plan.macros.protein, color: '#f87171' },
                      { label: 'CARBS',   val: plan.macros.carbs,   color: '#facc15' },
                      { label: 'FAT',     val: plan.macros.fat,     color: '#4ade80' },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.7rem', color }}>
                          {val}
                          <span style={{ fontSize: '0.75rem' }}>g</span>
                        </div>
                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', marginTop: 3 }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <DayTotalsCard totals={dayTotals} targetCal={plan.targetCal} planColor={plan.color} />

              <SupplementsCard goalType={plan.goalType} />

              <div style={{ marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)' }}>
                الوجبات — اضغط على الوجبة للتفاصيل والبدائل
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activePlan} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {plan.meals.map((meal, i) => (
                    <MealCard
                      key={`${activePlan}-${meal.name}-${i}`}
                      meal={meal}
                      planColor={plan.color}
                      mealIndex={i}
                      scale={plan.scale}
                      selection={selections[`${activePlan}-${i}`]}
                      onSelect={(swapKey, idx) =>
                        setSelections((prev) => ({
                          ...prev,
                          [`${activePlan}-${i}`]: { ...prev[`${activePlan}-${i}`], [swapKey]: idx },
                        }))
                      }
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              <div
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginTop: 16,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: 'var(--ash-light)',
                  lineHeight: 1.7,
                }}
              >
                <Lightbulb size={14} color="var(--volt)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong style={{ color: 'var(--chalk)' }}>نصيحة:</strong> الأرقام تقريبية بناءً على معادلة Mifflin-St Jeor ومعامل النشاط. لو وزنك اتغير، اضغط &quot;غيّر&quot; وحسب من جديد.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// exports for the local preview page and tests
export { generatePlans, MealCard, DayTotalsCard };
