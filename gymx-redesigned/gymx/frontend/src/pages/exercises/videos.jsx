// src/pages/exercises/videos.jsx
// ── مكتبة التمارين — صفحة مستقلة، بريميوم ──────────────────
//
// المصدر: arhxam/free-exercise-db-with-videos (رخصة MIT — حر تمامًا)
// https://github.com/arhxam/free-exercise-db-with-videos
// 317 تمرين، 593 فيديو حقيقي (راجل وست) بجودة Full HD.
//
// الداتا بتتجاب عن طريق jsDelivr (مرآة CDN لأي مشروع مفتوح المصدر على
// GitHub، ومضمون إنها بتشتغل مع طلبات المتصفح CORS) — مفيش API key
// ولا سيرفر مطلوب.
//
// خطوات الأداء بتتبني محليًا بالعامية المصرية (buildStepsAr تحت) من غير
// أي API أو اتصال إنترنت زيادة — مبنية على اسم العضلة والمعدة الحقيقيين
// لكل تمرين، فبتشتغل فورًا ومحدش ممكن يفشل.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Crown, Loader, ChevronRight, RefreshCw, WifiOff, Play, User, UserRound,
  SlidersHorizontal, ChevronDown, ChevronUp, Check,
  HeartPulse, CircleDot, PersonStanding, Target,
  Cable, Dumbbell, Weight, Link2, Settings, Settings2, Truck, Circle, Waves,
  Gauge, TrendingUp, Rocket,
} from 'lucide-react';
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
  'leverage machine': 'ماشين رافعة', rope: 'حبل', 'sled machine': 'ماشين زلاجة',
  'smith machine': 'سميث ماشين', 'stability ball': 'كورة اتزان', weighted: 'بوزن إضافي',
};
const EQUIPMENTS = Object.keys(EQUIPMENT_AR);

// ── ترجمة مستوى الصعوبة ─────────────────────────────────────
const DIFFICULTY_AR = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

// ── أيقونات كروت "أقسام الجسم" — رسمة عضلة مبسّطة لكل قسم، بنفس
// أسلوب الصورة المرجعية (سيلويت خط واحد، currentColor) ────────
function MuscleIconBase({ children, size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
function ChestIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M12 4c-2.2 0-3.6 1-4.2 2.2C7 8 6 9 5 9.6c-.9.5-1.5 1.6-1.5 3 0 2.4 1.8 4 3.8 4 1.4 0 2.3-.7 2.7-1.6" />
      <path d="M12 4c2.2 0 3.6 1 4.2 2.2C17 8 18 9 19 9.6c.9.5 1.5 1.6 1.5 3 0 2.4-1.8 4-3.8 4-1.4 0-2.3-.7-2.7-1.6" />
      <path d="M12 4v6.4M9.5 10.5c0 1.3 1.1 2.3 2.5 2.3s2.5-1 2.5-2.3" />
    </MuscleIconBase>
  );
}
function BackIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M12 3c-1 0-1.8.7-1.8 1.8 0 .8-.3 1.4-1 1.9-2 1.5-3.7 3.5-3.7 6.6 0 3 1.6 5.2 3.6 6.4M12 3c1 0 1.8.7 1.8 1.8 0 .8.3 1.4 1 1.9 2 1.5 3.7 3.5 3.7 6.6 0 3-1.6 5.2-3.6 6.4" />
      <path d="M12 3v6M9 9h6M8.5 13.5h7M9 17.5h6" />
    </MuscleIconBase>
  );
}
function LegsIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M9.5 3h5l.4 6.5c.15 2.3.6 4.5 1.4 6.6l1.1 3.4" />
      <path d="M9.5 3l-.4 6.5c-.15 2.3-.6 4.5-1.4 6.6L6.6 19.5" />
      <path d="M9.3 9.5h5.4M8.9 14.5h6.3" />
    </MuscleIconBase>
  );
}
function ShoulderIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M4 15c0-4 2.5-7 5.5-8 .6-.2 1-.7 1-1.4C10.5 4.7 11.2 4 12 4s1.5.7 1.5 1.6c0 .7.4 1.2 1 1.4 3 1 5.5 4 5.5 8" />
      <path d="M4 15c0 2.5 1.6 4.3 3.6 4.3S11 17.5 11 15M13 15c0 2.5 1.6 4.3 3.6 4.3S20 17.5 20 15" />
    </MuscleIconBase>
  );
}
function ArmIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M7 20c-1.2-2-1.8-4.3-1.8-7 0-3 1-5.6 2.7-7.2" />
      <path d="M7.9 5.8c1-.9 2.3-1.4 3.8-1.4 3.6 0 6.3 2.8 6.3 6.5 0 1.7-.5 3-1.5 4" />
      <path d="M10 9.2c.5 1.3 1.7 2.2 3.1 2.2s2.6-.9 3.1-2.2M12 11.4c-.4 2-.2 4 .6 6" />
    </MuscleIconBase>
  );
}
function CoreIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M8 4h8l.6 8c.3 3.4-1.4 7-4.6 8-3.2-1-4.9-4.6-4.6-8L8 4Z" />
      <path d="M8.4 9h7.2M8.7 13h6.6" />
      <path d="M12 4v16" />
    </MuscleIconBase>
  );
}
function HipIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M12 4c-3 0-5 2-5 5 0 2 1 3.3 1 5 0 2.4-1 4-2 6M12 4c3 0 5 2 5 5 0 2-1 3.3-1 5 0 2.4 1 4 2 6" />
      <path d="M7 10.5h10" />
    </MuscleIconBase>
  );
}

// ── أيقونات كروت "أقسام الجسم" — رسمة عضلة مبسّطة لكل قسم، بنفس
// أسلوب الصورة المرجعية بدل الأيقونات العامة ──────────────────
const BODYPART_ICON = {
  back: BackIcon, cardio: HeartPulse, chest: ChestIcon, hips: HipIcon,
  'lower arms': ArmIcon, 'lower legs': LegsIcon, shoulders: ShoulderIcon,
  'upper arms': ArmIcon, 'upper legs': LegsIcon, waist: CoreIcon,
};
const EQUIPMENT_ICON = {
  band: Waves, barbell: Dumbbell, 'body weight': PersonStanding, cable: Cable,
  dumbbell: Dumbbell, 'ez barbell': Dumbbell, kettlebell: CircleDot,
  'leverage machine': Settings, rope: Link2, 'sled machine': Truck,
  'smith machine': Settings2, 'stability ball': Circle, weighted: Weight,
};
const DIFFICULTY_ICON = { beginner: Gauge, intermediate: TrendingUp, advanced: Rocket };

// ── خطوات أداء جاهزة بالعامية المصرية، من غير أي API أو نت ──
// (بتتبني على بيانات التمرين نفسه: العضلة المستهدفة والمعدة، مش ترجمة
// حرفية للنص الإنجليزي، عشان تشتغل فورًا ومن غير أي احتمال فشل)
function buildStepsAr(exercise) {
  const target = muscleAr(exercise.target) || 'العضلة المستهدفة';
  const eq = EQUIPMENT_AR[exercise.equipment] || exercise.equipment || 'الجهاز';
  const usesEquipment = exercise.equipment && exercise.equipment !== 'body weight';

  const pool = [
    usesEquipment
      ? `اتمركز صح وامسك ${eq} كويس، وثبّت وضعك قبل ما تبدأ الحركة.`
      : `اتمركز صح في وضع البداية، وشد جسمك كله قبل ما تبدأ الحركة.`,
    `ابدأ الحركة بتحكم وركّز إنك بتشتغل على ${target} وانت بتنفّذ.`,
    `كمّل لحد أعلى نقطة في المدى الحركي، وانت شادّ ${target} طول الوقت.`,
    `ارجع للوضع الأول ببطء وتحكم، من غير ما تسيب الحركة تسقط لوحدها.`,
    `خد نفسك في المرحلة السهلة من الحركة، وزفر في مرحلة المجهود.`,
    `كرر العدد المطلوب من التكرارات وانت محافظ على نفس الفورم من أول تكرار لآخر واحد.`,
  ];

  const count = exercise.steps?.length || 4;
  return pool.slice(0, Math.min(count, pool.length));
}

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
function ExerciseCard({ exercise, onOpen, index = 0 }) {
  const poster = exercise.thumbnails?.male || exercise.thumbnails?.female || '';
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ borderColor: 'rgba(250,204,21,0.4)', y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(exercise)}
      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'border-color 250ms' }}
    >
      <div style={{ position: 'relative', height: 170, background: 'rgba(255,255,255,0.03)' }}>
        {poster && (
          <img src={poster} alt={exercise.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 300ms ease' }}
            onLoad={() => setImgLoaded(true)}
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
  const videoRef = useRef(null);

  useEffect(() => {
    setGender('male');
  }, [exercise?.id]);

  if (!exercise) return null;

  const videoSrc = exercise.videos?.[gender] || exercise.videos?.male || exercise.videos?.female;
  const poster = exercise.thumbnails?.[gender] || exercise.thumbnails?.male;
  const hasBothGenders = exercise.videos?.male && exercise.videos?.female;
  const steps = buildStepsAr(exercise);

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
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', textTransform: 'capitalize', marginBottom: 12 }}>
              {exercise.name}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                {BODYPART_AR[exercise.bodyPart] || exercise.bodyPart}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                {muscleAr(exercise.target)}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)' }}>
                {EQUIPMENT_AR[exercise.equipment] || exercise.equipment}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', color: '#facc15' }}>
                {DIFFICULTY_AR[exercise.difficulty] || exercise.difficulty}
              </span>
            </div>

            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 10 }}>خطوات الأداء</div>

            <ol style={{ margin: 0, paddingRight: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((step, i) => (
                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{step}</li>
              ))}
            </ol>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── قسم واحد جوه درج الفلاتر (أكورديون بيفتح ويقفل) ─────────
function FilterSection({ title, isOpen, onToggle, children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)', letterSpacing: '0.02em' }}>{title}</span>
        {isOpen ? <ChevronUp size={16} color="var(--ash-light)" /> : <ChevronDown size={16} color="var(--ash-light)" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 14px 16px' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── كارت أيقونة داخل الفلتر (قسم جسم / معدة / مستوى) ────────
function FilterIconCard({ Icon, label, subtitle, selected, onClick }) {
  return (
    <motion.button
      layout
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
      animate={selected ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        padding: '12px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'right',
        background: selected ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(250,204,21,0.55)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? '0 0 0 1px rgba(250,204,21,0.15), 0 0 16px rgba(250,204,21,0.15)' : 'none',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: selected ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.15)', position: 'absolute', top: 10, left: 10,
      }}>
        {selected && <Check size={13} color="#facc15" />}
      </span>
      <Icon size={22} color={selected ? '#facc15' : 'var(--ash-light)'} />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--chalk)' }}>{label}</div>
        {subtitle && <div style={{ fontSize: '0.6rem', color: 'var(--ash)', marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>}
      </div>
    </motion.button>
  );
}

// ── درج الفلاتر بالكامل ──────────────────────────────────────
function FiltersDrawer({ open, onClose, bodyPart, equipment, difficulty, onApply }) {
  const [openSection, setOpenSection] = useState('bodyPart');
  const [draftBodyPart, setDraftBodyPart] = useState(bodyPart);
  const [draftEquipment, setDraftEquipment] = useState(equipment);
  const [draftDifficulty, setDraftDifficulty] = useState(difficulty);

  useEffect(() => {
    if (open) {
      setDraftBodyPart(bodyPart);
      setDraftEquipment(equipment);
      setDraftDifficulty(difficulty);
      setOpenSection('bodyPart');
    }
  }, [open, bodyPart, equipment, difficulty]);

  if (!open) return null;

  const toggleSection = (key) => setOpenSection(prev => (prev === key ? '' : key));
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 320, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px 20px 0 0', direction: 'rtl', padding: '20px 18px 96px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.03em', color: 'var(--chalk)' }}>الفلاتر</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--chalk)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FilterSection title="أقسام الجسم" isOpen={openSection === 'bodyPart'} onToggle={() => toggleSection('bodyPart')}>
              <div style={grid}>
                {BODYPARTS.map(b => {
                  const Icon = BODYPART_ICON[b] || Target;
                  return (
                    <FilterIconCard
                      key={b} Icon={Icon} label={BODYPART_AR[b]}
                      selected={draftBodyPart === b}
                      onClick={() => setDraftBodyPart(prev => (prev === b ? '' : b))}
                    />
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="المعدات" isOpen={openSection === 'equipment'} onToggle={() => toggleSection('equipment')}>
              <div style={grid}>
                {EQUIPMENTS.map(eq => {
                  const Icon = EQUIPMENT_ICON[eq] || Dumbbell;
                  return (
                    <FilterIconCard
                      key={eq} Icon={Icon} label={EQUIPMENT_AR[eq]}
                      selected={draftEquipment === eq}
                      onClick={() => setDraftEquipment(prev => (prev === eq ? '' : eq))}
                    />
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="المستوى" isOpen={openSection === 'difficulty'} onToggle={() => toggleSection('difficulty')}>
              <div style={grid}>
                {Object.keys(DIFFICULTY_AR).map(d => {
                  const Icon = DIFFICULTY_ICON[d] || Gauge;
                  return (
                    <FilterIconCard
                      key={d} Icon={Icon} label={DIFFICULTY_AR[d]}
                      selected={draftDifficulty === d}
                      onClick={() => setDraftDifficulty(prev => (prev === d ? '' : d))}
                    />
                  );
                })}
              </div>
            </FilterSection>
          </div>

          <div style={{ position: 'sticky', bottom: 0, marginTop: 20, display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setDraftBodyPart(''); setDraftEquipment(''); setDraftDifficulty(''); }}
              style={{ padding: '13px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              مسح الكل
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => onApply({ bodyPart: draftBodyPart, equipment: draftEquipment, difficulty: draftDifficulty })}
              style={{ flex: 1, padding: '13px 18px', borderRadius: 10, background: '#facc15', border: 'none', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.95rem', letterSpacing: '0.03em', cursor: 'pointer' }}
            >
              تطبيق الفلاتر
            </motion.button>
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [bodyPart, equipment, difficulty].filter(Boolean).length;

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
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFiltersOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: activeFilterCount ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.04)', border: activeFilterCount ? '1px solid rgba(250,204,21,0.35)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: activeFilterCount ? '#facc15' : 'var(--chalk)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={13} /> الفلاتر
              {activeFilterCount > 0 && (
                <motion.span
                  key={activeFilterCount}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ minWidth: 16, height: 16, borderRadius: 8, background: '#facc15', color: '#000', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}
                >
                  {activeFilterCount}
                </motion.span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={fetchExercises}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 8, color: '#facc15', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              <RefreshCw size={13} /> تحديث
            </motion.button>
          </div>

          <FiltersDrawer
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            bodyPart={bodyPart} equipment={equipment} difficulty={difficulty}
            onApply={({ bodyPart: b, equipment: eq, difficulty: d }) => {
              setBodyPart(b); setEquipment(eq); setDifficulty(d);
              setFiltersOpen(false);
            }}
          />

          {/* المحتوى */}
          {loadingList ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="skeleton-shimmer" style={{ height: 170 }} />
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div className="skeleton-shimmer" style={{ height: 10, width: '50%', borderRadius: 4, marginBottom: 8 }} />
                    <div className="skeleton-shimmer" style={{ height: 14, width: '80%', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
              <style>{`
                .skeleton-shimmer {
                  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%);
                  background-size: 400% 100%;
                  animation: shimmer 1.4s ease infinite;
                }
                @keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
              `}</style>
            </div>
          ) : loadError ? (
            <LoadFailed onRetry={fetchExercises} />
          ) : pageItems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', marginBottom: 6 }}>مفيش نتايج</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ash-light)' }}>جرّب كلمة تانية أو غيّر الفلتر</div>
            </motion.div>
          ) : (
            <>
              <div key={`${currentPage}-${bodyPart}-${equipment}-${difficulty}-${debouncedSearch}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {pageItems.map((ex, i) => (
                  <ExerciseCard key={ex.id} exercise={ex} onOpen={setSelected} index={i} />
                ))}
              </div>

              {/* pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
                <motion.button
                  whileHover={currentPage > 1 ? { scale: 1.05 } : {}} whileTap={currentPage > 1 ? { scale: 0.94 } : {}}
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: currentPage <= 1 ? 'var(--ash)' : 'var(--chalk)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <ChevronRight size={14} /> السابق
                </motion.button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash-light)' }}>
                  {currentPage} / {totalPages}
                </span>
                <motion.button
                  whileHover={currentPage < totalPages ? { scale: 1.05 } : {}} whileTap={currentPage < totalPages ? { scale: 0.94 } : {}}
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: currentPage >= totalPages ? 'var(--ash)' : 'var(--chalk)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  التالي <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
