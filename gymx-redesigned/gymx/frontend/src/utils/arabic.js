// src/utils/arabic.js
// تطبيع النص العربي عشان البحث يشتغل صح مهما كتب المستخدم
// (بيشيل التشكيل، بيوحّد أشكال الألف/الياء/التاء المربوطة، وبيشيل "ال" التعريف)
export function normalizeArabic(str = '') {
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
