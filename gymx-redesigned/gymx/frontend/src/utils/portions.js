// src/utils/portions.js
// ضبط كميات الوجبات على هدف السعرات
// القوالب في buildMeals ثابتة، فكان مجموع سعراتها واحد مهما كان هدف المستخدم.
// هنا بنحسب معامل تصغير/تكبير للخطة ونطبّقه على كمية كل صنف،
// بحيث مجموع الوجبات المعروض يطابق السعرات المستهدفة قدر الإمكان.

import { PROTEIN_OPTIONS, CARB_OPTIONS, FAT_OPTIONS } from '../data/foods';

// مجموع سعرات قالب وجبات بالاختيارات الافتراضية (قبل أي تبديل من المستخدم)
export function mealBaseCalories(meals) {
  return meals.reduce((sum, meal) => {
    if (meal.proteinKey !== null && meal.proteinKey !== undefined) sum += PROTEIN_OPTIONS[meal.proteinKey].cal;
    if (meal.carbKey !== null && meal.carbKey !== undefined) sum += CARB_OPTIONS[meal.carbKey].cal;
    if (meal.fatKey !== null && meal.fatKey !== undefined) sum += FAT_OPTIONS[meal.fatKey].cal;
    return sum;
  }, 0);
}

// يفك أول الاسم لكمية + وحدة + باقي الاسم
// '100جم صدر فراخ مشوي' -> { qty: 100, unit: 'جم', rest: 'صدر فراخ مشوي' }
// '5 بيضات مسلوقة'     -> { qty: 5,   unit: '',   rest: 'بيضات مسلوقة' }
// 'نص أفوكادو'          -> { qty: 0.5, unit: '',   rest: 'أفوكادو' }
export function parsePortion(name = '') {
  let m = name.match(/^(\d+(?:\.\d+)?)(جم|مل)?\s*(.*)$/);
  if (m) return { qty: parseFloat(m[1]), unit: m[2] || '', rest: m[3] };
  m = name.match(/^نص\s+(.*)$/);
  if (m) return { qty: 0.5, unit: '', rest: m[1] };
  return null;
}

function roundTo(value, step, min) {
  const rounded = Math.round(value / step) * step;
  return Math.max(min, rounded);
}

// يكبّر/يصغّر الكمية حسب المعامل ويرجّع الاسم الجديد + المعامل الفعلي بعد التقريب
// المعامل الفعلي مهم عشان السعرات المعروضة تبقى متسقة مع الكمية المعروضة
export function scaleFoodName(name, scale) {
  const parsed = parsePortion(name);
  if (!parsed || !Number.isFinite(scale) || scale <= 0) {
    return { name, effectiveScale: 1 };
  }
  const { qty, unit, rest } = parsed;
  let newQty;
  if (unit === 'جم') {
    newQty = roundTo(qty * scale, 5, 5);
  } else if (unit === 'مل') {
    newQty = roundTo(qty * scale, 10, 10);
  } else {
    newQty = roundTo(qty * scale, 0.5, 0.5);
  }
  let newName;
  if (rest === 'أفوكادو' && newQty === 0.5) {
    newName = 'نص أفوكادو';
  } else if (unit) {
    newName = `${newQty}${unit} ${rest}`;
  } else {
    newName = `${newQty} ${rest}`;
  }
  return { name: newName, effectiveScale: newQty / qty };
}

// نسخة من الصنف بكمية وسعرات وماكروز متظبطة على المعامل
export function scaleFoodItem(item, scale) {
  if (!item) return null;
  const { name, effectiveScale } = scaleFoodName(item.name, scale);
  return {
    ...item,
    name,
    cal: Math.round(item.cal * effectiveScale),
    protein: Math.round(item.protein * effectiveScale * 10) / 10,
    carbs: Math.round(item.carbs * effectiveScale * 10) / 10,
    fat: Math.round(item.fat * effectiveScale * 10) / 10,
  };
}

// مجموع اليوم كله من اختيارات المستخدم الحالية (بعد التظبيط)
export function sumDay(meals, selections, scale) {
  const totals = { cal: 0, protein: 0, carbs: 0, fat: 0 };
  meals.forEach((meal, i) => {
    const sel = selections?.[i] || {};
    const items = [
      meal.proteinKey !== null && meal.proteinKey !== undefined
        ? PROTEIN_OPTIONS[sel.protein ?? meal.proteinKey]
        : null,
      meal.carbKey !== null && meal.carbKey !== undefined
        ? CARB_OPTIONS[sel.carb ?? meal.carbKey]
        : null,
      meal.fatKey !== null && meal.fatKey !== undefined
        ? FAT_OPTIONS[sel.fat ?? meal.fatKey]
        : null,
    ];
    items.forEach((item) => {
      const s = scaleFoodItem(item, scale);
      if (!s) return;
      totals.cal += s.cal;
      totals.protein += s.protein;
      totals.carbs += s.carbs;
      totals.fat += s.fat;
    });
  });
  totals.protein = Math.round(totals.protein);
  totals.carbs = Math.round(totals.carbs);
  totals.fat = Math.round(totals.fat);
  return totals;
}
