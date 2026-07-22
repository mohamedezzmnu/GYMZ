// src/pages/exercises/videos.jsx
// ── مكتبة التمارين — صفحة مستقلة، بريميوم ──────────────────
//
// المصدر: arhxam/free-exercise-db-with-videos (رخصة MIT — حر تمامًا)
// https://github.com/arhxam/free-exercise-db-with-videos
// 317 تمرين، 593 فيديو حقيقي (راجل وست) بجودة Full HD، بالإضافة لخطوات
// أداء، ملاحظات فورم، أخطاء شائعة، وتعليمات تنفس لكل تمرين.
//
// الداتا بتتجاب عن طريق jsDelivr (مرآة CDN لأي مشروع مفتوح المصدر على
// GitHub، ومضمون إنها بتشتغل مع طلبات المتصفح CORS) — مفيش API key
// ولا سيرفر مطلوب.
//
// ⚠️ التعليمات وخطوات الأداء جايه من المصدر بالإنجليزي. الصفحة فيها زرار
// "ترجم بالمصري" بيبعت التمرين لسيرفر GYMZ (/api/translate-exercise)
// يترجمه بالعامية المصرية ويكاشه، عشان يترجم مرة واحدة بس لكل تمرين.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Crown, Loader, ChevronRight, RefreshCw, WifiOff, Play, Languages, User, UserRound } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

// ── مصدر الداتا: jsDelivr (مرآة CDN رسمية لأي مشروع GitHub، بتدعم
// CORS بشكل مضمون من المتصفح) ──────────────────────────────
const DATA_URL = 'https://cdn.jsdelivr.net/gh/arhxam/free-exercise-db-with-videos@main/data/exercises.json';
const PAGE_LIMIT = 24;

// ── ترجمة أقسام الجسم ──────────────────────────────────────
const BODYPART_AR = {
  back: 'الظهر', cardio: 'كارديو', chest: 'الصدر', hips: 'الحوض والجلوتس',
  'lower arms': 'أسفل الذراع', 'lower legs': 'أسفل الرجل', shoulders: 'الأكتاف',
  'upper arms': 'أعلى الذراع', 'upper legs': 'أعلى الرجل', waist: 'الخصر',
};
const BODYPARTS = Object.keys(BODYPART_AR);

// ── ترجمة المعدات ──────────────────────────────────────────
const EQUIPMENT_AR = {
  band: 'رباط مقاومة', barbell: 'بار', 'body weight': 'وزن الجسم', cable: 'كابل',
  dumbbell: 'دمبل', 'ez barbell': 'بار EZ', kettlebell: 'كيتلبل',
  'leverage machine': 'جهاز رافعة', rope: 'حبل', 'sled machine': 'زلاجة',
  'smith machine': 'سميث مشين', 'stability ball': 'كورة اتزان', weighted: 'بوزن إضافي',
};
const EQUIPMENTS = Object.keys(EQUIPMENT_AR);

// ── ترجمة مستوى الصعوبة ─────────────────────────────────────
const DIFFICULTY_AR = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

// ── قاموس ترجمة أسماء العضلات (شامل لكل مصطلحات المصدر) ─────
const MUSCLE_AR = {
  abdominals: 'البطن', abs: 'البطن', 'lower abdominals': 'أسفل البطن', 'lower abs': 'أسفل البطن',
  abductors: 'الفخذ الخارجي', 'hip abductors': 'عضلات فتح الفخذ', adductors: 'الفخذ الداخلي',
  'adductor group': 'مجموعة عضلات الفخذ الداخلي', 'adductor muscles': 'عضلات الفخذ الداخلي', 'hip adductors': 'عضلات ضم الفخذ',
  'achilles tendon': 'وتر أكيلوس', anconeus: 'عضلة خلف المرفق',
  'ankle stabilizers': 'عضلات ثبات الكاحل', ankles: 'الكاحل',
  'anterior deltoid': 'مقدمة الكتف', 'anterior deltoids': 'مقدمة الكتف',
  biceps: 'الباي', 'biceps brachii': 'الباي',
  brachialis: 'عضلة الذراع العميقة', brachioradialis: 'عضلة الساعد العلوي',
  calves: 'السمانة', chest: 'الصدر', core: 'عضلات الجذع', 'core stabilizers': 'عضلات ثبات الجذع',
  'cardiovascular system': 'الجهاز الدوري', 'heart and lungs': 'القلب والرئتين',
  deltoid: 'الكتف', 'deltoid anterior': 'مقدمة الكتف', deltoideus: 'الكتف', deltoids: 'الأكتاف', delts: 'الأكتاف',
  'erector spinae': 'عضلات مقيم الظهر', erectors: 'عضلات مقيم الظهر', 'spinal erectors': 'عضلات مقيم الظهر',
  'thoracic spinal extensors': 'عضلات مد الظهر العلوي',
  'external and internal obliques': 'عضلات الخصر الجانبية', 'external obliques': 'عضلات الخصر الجانبية',
  obliques: 'عضلات الخصر الجانبية', 'obliquus externus abdominis': 'عضلات الخصر الجانبية',
  'flexor carpi radialis': 'عضلة ثني الساعد الكعبرية', 'flexor carpi ulnaris': 'عضلة ثني الساعد الزندية',
  'forearm extensors': 'عضلات مد الساعد', 'forearm flexors': 'عضلات ثني الساعد',
  'forearm flexors and extensors': 'عضلات الساعد (ثني ومد)', forearms: 'الساعد',
  'full body': 'الجسم كله',
  gastrocnemius: 'السمانة', 'gastrocnemius, soleus': 'السمانة بالكامل', soleus: 'عضلة السمانة العميقة',
  glutes: 'الجلوتس', 'gluteus maximus': 'الجلوتس الكبرى', 'gluteus medius': 'الجلوتس الوسطى', 'gluteus minimus': 'الجلوتس الصغرى',
  groin: 'الفخذ الداخلي', hamstrings: 'الهامسترينج', 'hip flexors': 'عضلات ثني الفخذ',
  iliopsoas: 'عضلة الحرقفي القطني', 'iliopsoas, gluteus medius, gluteus minimus': 'الحرقفي القطني والجلوتس',
  infraspinatus: 'الكتف الدوارة', intercostals: 'عضلات ما بين الأضلاع',
  'latissimus dorsi': 'اللاتس', lats: 'اللاتس',
  'lower back': 'أسفل الظهر', 'lower trapezius': 'أسفل الترابس', 'middle back': 'وسط الظهر', 'middle trapezius': 'وسط الترابس',
  'neck flexors': 'عضلات ثني الرقبة',
  'pectoralis major': 'الصدر', 'pectoralis major, clavicular head': 'أعلى الصدر', pectorals: 'الصدر',
  'upper pectorals': 'أعلى الصدر', 'upper chest': 'أعلى الصدر',
  peroneals: 'عضلات الساق الجانبية', 'peroneus longus and brevis': 'عضلات الساق الجانبية',
  piriformis: 'عضلة الكمثري', 'quadratus lumborum': 'عضلة أسفل الظهر الجانبية',
  quadriceps: 'أعلى الرجل', 'quadriceps femoris': 'أعلى الرجل', quads: 'أعلى الرجل',
  'rear deltoids': 'خلفية الكتف', 'posterior deltoid': 'خلفية الكتف', 'posterior deltoids': 'خلفية الكتف',
  'rectus abdominis': 'عضلة البطن المستقيمة', 'rectus femoris': 'مقدمة الفخذ',
  rhoboids: 'عضلات الرومبويد', rhomboids: 'عضلات الرومبويد', 'rhomboids, trapezius, latissimus dorsi': 'الرومبويد والترابس واللاتس',
  'rotator cuff': 'الكتف الدوارة', scalenes: 'عضلات جانب الرقبة', 'serratus anterior': 'عضلة جانب الصدر',
  shoulders: 'الأكتاف',
  spine: 'العمود الفقري', 'thoracic spine': 'أعلى الظهر', 'thoracic spine muscles': 'عضلات أعلى الظهر',
  sternocleidomastoid: 'عضلة جانب الرقبة',
  'tensor fasciae latae': 'عضلة جانب الفخذ العلوي', 'teres major': 'عضلة أسفل الكتف الخلفية',
  'tibialis anterior': 'مقدمة الساق', 'tibialis posterior': 'خلفية الساق العميقة',
  'transverse abdominis': 'عضلة البطن العرضية',
  trapezius: 'الترابس', traps: 'الترابس', 'upper trapezius': 'أعلى الترابس',
  triceps: 'التراي', 'triceps brachii': 'التراي',
  'upper arms': 'أعلى الذراع', 'upper back': 'أعلى الظهر',
  'varies by machine': 'بيختلف حسب الجهاز', 'varies by machine (legs, glutes, arms)': 'بيختلف حسب الجهاز',
  'varies by movement': 'بيختلف حسب الحركة', 'vastus medialis': 'عضلة داخل الفخذ',
};

function muscleAr(term) {
  if (!term) return '';
  return MUSCLE_AR[term.toLowerCase()] || term;
}

// ── شاشة غير مشترك (بريميوم — بعلامة التاج) ────────────────
function PremiumGate({ user }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', direction: 'rtl' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '36px 28px', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#facc15,transparent)' }} />
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Crown size={26} color="#facc15" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 8 }}>للمشتركين فقط</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 24 }}>
          مكتبة التمارين متاحة للمشتركين. اشترك دلوقتي عن طريق فودافون كاش واتفتحلك فوراً.
        </p>
        <div style={{ padding: '16px', background: 'rgba(250,204,21,0.07)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 8 }}>ابعت على فودافون كاش</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--chalk)', letterSpacing: '0.06em', direction: 'ltr' }}>01097931713</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#facc15', lineHeight: 1 }}>29</div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>جنيه</div>
            </div>
          </div>
        </div>
        <a
          href={`https://wa.me/201097931713?text=عايز اشتراك مكتبة التمارين — إيميلي: ${user?.email || ''}`}
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

// ── شاشة لو الاتصال فشل (مؤقتًا، مش إعداد ناقص) ─────────────
function LoadFailed({ onRetry }) {
  return (
    <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', direction: 'rtl' }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <WifiOff size={36} color="var(--ash-light)" style={{ marginBottom: 14 }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', marginBottom: 8 }}>
          مقدرناش نجيب بيانات التمارين دلوقتي
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 18 }}>
          ممكن يكون النت وقع لحظة أو GitHub مش رادّ. جرب تاني.
        </p>
        <button
          onClick={onRetry}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 8, color: '#facc15', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          <RefreshCw size={13} /> إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

// ── كارت التمرين ──────────────────────────────────────────
function ExerciseCard({ exercise, onOpen }) {
  const poster = exercise.thumbnails?.male || exercise.thumbnails?.female || '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(250,204,21,0.4)' }}
      onClick={() => onOpen(exercise)}
      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'all 250ms' }}
    >
      <div style={{ position: 'relative', height: 170, background: 'rgba(255,255,255,0.03)' }}>
        {poster && (
          <img src={poster} alt={exercise.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.opacity = 0.15; }}
          />
        )}
        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.58rem', fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 20, background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Crown size={9} /> PRO
        </span>
        <span style={{ position: 'absolute', bottom: 10, left: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={13} color="#fff" fill="#fff" />
        </span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: '#facc15' }}>
            {muscleAr(exercise.target)}
          </span>
          <span style={{ fontSize: '0.58rem', color: 'var(--ash)' }}>·</span>
          <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>
            {DIFFICULTY_AR[exercise.difficulty] || exercise.difficulty}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.03em', color: 'var(--chalk)', textTransform: 'capitalize' }}>
          {exercise.name}
        </div>
      </div>
    </motion.div>
  );
}

// ── مودال تفاصيل التمرين ──────────────────────────────────
function ExerciseModal({ exercise, onClose }) {
  const [gender, setGender] = useState('male');
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showArabic, setShowArabic] = useState(false);
  const [translateError, setTranslateError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setGender('male');
    setTranslated(null);
    setShowArabic(false);
    setTranslateError(false);
  }, [exercise?.id]);

  if (!exercise) return null;

  const videoSrc = exercise.videos?.[gender] || exercise.videos?.male || exercise.videos?.female;
  const poster = exercise.thumbnails?.[gender] || exercise.thumbnails?.male;
  const hasBothGenders = exercise.videos?.male && exercise.videos?.female;

  const handleTranslate = async () => {
    if (translated) { setShowArabic(true); return; }
    setTranslating(true);
    setTranslateError(false);
    try {
      const res = await fetch('/api/translate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: exercise.id,
          name: exercise.name,
          instructions: exercise.instructions,
          steps: exercise.steps,
          formCues: exercise.formCues,
          commonMistakes: exercise.commonMistakes,
          breathing: exercise.breathing,
        }),
      });
      if (!res.ok) throw new Error('translate failed');
      const data = await res.json();
      setTranslated(data);
      setShowArabic(true);
    } catch {
      setTranslateError(true);
    }
    setTranslating(false);
  };

  const view = showArabic && translated ? translated : exercise;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, direction: 'rtl' }}
        >
          <div style={{ position: 'relative', background: '#000' }}>
            {videoSrc ? (
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                poster={poster}
                controls
                loop
                playsInline
                style={{ width: '100%', maxHeight: 320, display: 'block', background: '#000' }}
              />
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ash-light)', fontSize: '0.8rem' }}>
                مفيش فيديو متاح للتمرين ده
              </div>
            )}
            <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
            {hasBothGenders && (
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 3 }}>
                <button
                  onClick={() => setGender('male')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 16, border: 'none', cursor: 'pointer', background: gender === 'male' ? '#facc15' : 'transparent', color: gender === 'male' ? '#000' : '#fff', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}
                >
                  <User size={12} /> راجل
                </button>
                <button
                  onClick={() => setGender('female')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 16, border: 'none', cursor: 'pointer', background: gender === 'female' ? '#facc15' : 'transparent', color: gender === 'female' ? '#000' : '#fff', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}
                >
                  <UserRound size={12} /> ست
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '20px 22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', textTransform: 'capitalize' }}>
                {exercise.name}
              </div>
              <button
                onClick={translated && showArabic ? () => setShowArabic(false) : handleTranslate}
                disabled={translating}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, border: '1px solid rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.1)', color: '#facc15', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', cursor: translating ? 'wait' : 'pointer' }}
              >
                {translating ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Languages size={12} />}
                {translating ? 'بيترجم...' : (translated && showArabic ? 'رجّع الإنجليزي' : 'ترجم بالمصري')}
              </button>
            </div>

            {translateError && (
              <div style={{ fontSize: '0.7rem', color: '#f87171', marginBottom: 10 }}>
                مقدرناش نترجم دلوقتي، جرب تاني بعد شوية.
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                {BODYPART_AR[exercise.bodyPart] || exercise.bodyPart}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                {muscleAr(exercise.target)}
              </span>
              {(exercise.secondaryMuscles || []).map((m, i) => (
                <span key={i} style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                  {muscleAr(m)}
                </span>
              ))}
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                {EQUIPMENT_AR[exercise.equipment] || exercise.equipment}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', color: '#facc15' }}>
                {DIFFICULTY_AR[exercise.difficulty] || exercise.difficulty}
              </span>
            </div>

            {view.instructions && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 8 }}>نبذة عن التمرين</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ash-light)', lineHeight: 1.7, margin: 0 }}>{view.instructions}</p>
              </div>
            )}

            {view.steps?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 10 }}>خطوات الأداء</div>
                <ol style={{ margin: 0, paddingRight: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {view.steps.filter(Boolean).map((step, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {view.formCues?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 10 }}>ملاحظات الفورم</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {view.formCues.filter(Boolean).map((cue, i) => (
                    <span key={i} style={{ fontSize: '0.72rem', color: 'var(--chalk)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '5px 10px' }}>{cue}</span>
                  ))}
                </div>
              </div>
            )}

            {view.commonMistakes?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#f87171', marginBottom: 10 }}>أخطاء شائعة</div>
                <ul style={{ margin: 0, paddingRight: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {view.commonMistakes.filter(Boolean).map((m, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', color: 'var(--ash-light)', lineHeight: 1.6 }}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {view.breathing && (
              <div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 6 }}>التنفس</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--ash-light)', lineHeight: 1.6, margin: 0 }}>{view.breathing}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ExerciseVideosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [allExercises, setAllExercises] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    const checkPremium = async () => {
      const { data } = await supabase.from('exercise_premium').select('id').eq('email', user.email).single();
      setIsPremium(!!data);
      setChecking(false);
    };
    checkPremium();
  }, [user, authLoading]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // جلب الداتا كلها مرة واحدة (JSON واحد، مفيش صفحات في المصدر نفسه)
  const fetchExercises = useCallback(async () => {
    setLoadingList(true);
    setLoadError(false);
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      setAllExercises(Array.isArray(json) ? json : []);
    } catch {
      setLoadError(true);
      setAllExercises([]);
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    if (isPremium && allExercises.length === 0) fetchExercises();
  }, [isPremium, fetchExercises, allExercises.length]);

  // فلترة وترقيم على الجهاز نفسه (مفيش API نرجعله فلتر)
  const filtered = useMemo(() => {
    return allExercises.filter(ex => {
      if (debouncedSearch) {
        const inName = ex.name?.toLowerCase().includes(debouncedSearch);
        const inAlias = (ex.aliases || []).some(a => a.toLowerCase().includes(debouncedSearch));
        if (!inName && !inAlias) return false;
      }
      if (bodyPart && ex.bodyPart !== bodyPart) return false;
      if (equipment && ex.equipment !== equipment) return false;
      if (difficulty && ex.difficulty !== difficulty) return false;
      return true;
    });
  }, [allExercises, debouncedSearch, bodyPart, equipment, difficulty]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT);

  useEffect(() => { setPage(1); }, [debouncedSearch, bodyPart, equipment, difficulty]);

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="#facc15" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isPremium) return <><Head><title>مكتبة التمارين — GYMZ</title></Head><PremiumGate user={user} /></>;

  return (
    <>
      <Head><title>مكتبة التمارين — GYMZ</title></Head>
      <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />

      <div style={{ minHeight: '100vh', paddingTop: 88, paddingBottom: 60, direction: 'rtl' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

          {/* header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#facc15', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Crown size={12} /> بريميوم
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '0.04em', lineHeight: 1 }}>
              مكتبة<br /><span style={{ color: '#facc15' }}>التمارين</span>
            </h1>
            <p style={{ color: 'var(--ash-light)', marginTop: 12, fontSize: '0.875rem', lineHeight: 1.7 }}>
              فيديو حقيقي راجل وست لكل تمرين، مع خطوات الأداء وملاحظات الفورم.
            </p>
          </motion.div>

          {/* فلاتر */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                className="input" placeholder="دوّر باسم التمرين بالإنجليزي (مثلاً: squat)"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingRight: 38, boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }}
              />
            </div>
            <select className="input" value={bodyPart} onChange={e => setBodyPart(e.target.value)} style={{ flex: '1 1 140px', cursor: 'pointer' }}>
              <option value="">كل أقسام الجسم</option>
              {BODYPARTS.map(b => <option key={b} value={b}>{BODYPART_AR[b]}</option>)}
            </select>
            <select className="input" value={equipment} onChange={e => setEquipment(e.target.value)} style={{ flex: '1 1 140px', cursor: 'pointer' }}>
              <option value="">كل المعدات</option>
              {EQUIPMENTS.map(eq => <option key={eq} value={eq}>{EQUIPMENT_AR[eq]}</option>)}
            </select>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ flex: '1 1 120px', cursor: 'pointer' }}>
              <option value="">كل المستويات</option>
              {Object.keys(DIFFICULTY_AR).map(d => <option key={d} value={d}>{DIFFICULTY_AR[d]}</option>)}
            </select>
            <button
              onClick={fetchExercises}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 8, color: '#facc15', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              <RefreshCw size={13} /> تحديث
            </button>
          </div>

          {/* المحتوى */}
          {loadingList ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader size={26} color="#facc15" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : loadError ? (
            <LoadFailed onRetry={fetchExercises} />
          ) : pageItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', marginBottom: 6 }}>مفيش نتايج</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ash-light)' }}>جرّب كلمة تانية أو غيّر الفلتر</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {pageItems.map(ex => (
                  <ExerciseCard key={ex.id} exercise={ex} onOpen={setSelected} />
                ))}
              </div>

              {/* pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: currentPage <= 1 ? 'var(--ash)' : 'var(--chalk)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <ChevronRight size={14} /> السابق
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash-light)' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: currentPage >= totalPages ? 'var(--ash)' : 'var(--chalk)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  التالي <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
