import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Users, Target, Zap } from 'lucide-react';
import Head from 'next/head';

// ══════════════════════════════════════════
// بيانات البرامج
// ══════════════════════════════════════════
const PROGRAMS = [
  {
    id: 1,
    tag: 'FULL BODY',
    title: 'كامل الجسم',
    subtitle: 'Full Body',
    days: '3 أيام أسبوعياً',
    level: 'مبتدئ',
    levelColor: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', text: '#4ade80' },
    accentColor: '#4ade80',
    icon: '💪',
    suitable: 'للمبتدئين أو اللي عندهم وقت محدود',
    schedule: 'السبت، الإثنين، الأربعاء',
    description: 'في الـ Full Body بتشتغل على كل عضلات جسمك في نفس الجلسة. مش محتاج تيجي كتير — 3 أيام في الأسبوع بس وهتحس بالفرق.',
    days_detail: [
      {
        day: 'اليوم الأول — السبت',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق كارديو خفيف + تمدد مفاصل' },
          { name: 'بنش برس', detail: '4 سيتات × 8 رباعات — الصدر الأساسي' },
          { name: 'سكوات', detail: '4 سيتات × 10 رباعات — الأرجل الأساسي' },
          { name: 'رووينج بار', detail: '3 سيتات × 10 رباعات — الظهر' },
          { name: 'ضغط كتف', detail: '3 سيتات × 10 رباعات — الكتف' },
          { name: 'كيرل بايسبس', detail: '3 سيتات × 12 رباعة — الذراع' },
          { name: 'تبريد وإطالات', detail: '5 دقايق تمدد للعضلات' },
        ],
      },
      {
        day: 'اليوم التاني — الإثنين',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق كارديو خفيف + تمدد مفاصل' },
          { name: 'ضغط بنش مائل', detail: '4 سيتات × 8 رباعات — الصدر العلوي' },
          { name: 'ديد ليفت رومانيان', detail: '4 سيتات × 10 رباعات — الهامسترينج' },
          { name: 'لات بول داون', detail: '3 سيتات × 12 رباعة — الظهر العريض' },
          { name: 'رفع جانبي', detail: '3 سيتات × 15 رباعة — الكتف الجانبي' },
          { name: 'تراسبس بوش داون', detail: '3 سيتات × 12 رباعة — التراسبس' },
          { name: 'تبريد وإطالات', detail: '5 دقايق تمدد للعضلات' },
        ],
      },
      {
        day: 'اليوم التالت — الأربعاء',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق كارديو خفيف + تمدد مفاصل' },
          { name: 'فلاي كيبل', detail: '3 سيتات × 15 رباعة — الصدر عزل' },
          { name: 'ليج برس', detail: '4 سيتات × 12 رباعة — الكواد' },
          { name: 'سيتد رووينج', detail: '3 سيتات × 12 رباعة — الظهر الوسط' },
          { name: 'أرنولد برس', detail: '3 سيتات × 10 رباعات — الكتف الكامل' },
          { name: 'هامر كيرل', detail: '3 سيتات × 12 رباعة — البايسبس' },
          { name: 'تبريد وإطالات', detail: '5 دقايق تمدد للعضلات' },
        ],
      },
    ],
  },
  {
    id: 2,
    tag: 'PPL',
    title: 'دفع / سحب / أرجل',
    subtitle: 'Push / Pull / Legs',
    days: '3 أو 6 أيام أسبوعياً',
    level: 'متوسط — متقدم',
    levelColor: { bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', text: '#facc15' },
    accentColor: '#facc15',
    icon: '🔥',
    suitable: 'للمستويات المتوسطة والمتقدمة',
    schedule: 'الإثنين، الأربعاء، الجمعة (أو 6 أيام)',
    description: 'التقسيم الأشهر في الجيم. بتقسم جسمك على 3 أيام حسب حركة العضلة — دفع أو سحب أو أرجل. لو عندك وقت أكتر تقدر تعمله 6 أيام.',
    days_detail: [
      {
        day: 'يوم الدفع — Push 💥',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق كارديو + إطالة للكتف والصدر' },
          { name: 'بنش برس بار', detail: '4 سيتات × 6-8 رباعات — الصدر الأساسي' },
          { name: 'ضغط بنش مائل دمبل', detail: '3 سيتات × 10 رباعات — الصدر العلوي' },
          { name: 'أوفر هيد برس', detail: '4 سيتات × 8 رباعات — الكتف الأمامي' },
          { name: 'رفع جانبي', detail: '4 سيتات × 15 رباعة — الكتف الجانبي' },
          { name: 'تراسبس بوش داون', detail: '3 سيتات × 12 رباعة — التراسبس' },
          { name: 'سكال كراشر', detail: '3 سيتات × 10 رباعات — التراسبس' },
          { name: 'تبريد', detail: '5 دقايق إطالات خفيفة' },
        ],
      },
      {
        day: 'يوم السحب — Pull 🦾',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق كارديو + إطالة للظهر والكتف' },
          { name: 'ديد ليفت', detail: '4 سيتات × 5 رباعات — الظهر الكامل' },
          { name: 'عقلة', detail: '4 سيتات × بقصاك — الظهر العريض' },
          { name: 'رووينج بار', detail: '3 سيتات × 8 رباعات — الظهر الوسط' },
          { name: 'لات بول داون', detail: '3 سيتات × 12 رباعة — الظهر العريض' },
          { name: 'فيس بولز', detail: '3 سيتات × 15 رباعة — الكتف الخلفي' },
          { name: 'كيرل بار', detail: '4 سيتات × 10 رباعات — البايسبس' },
          { name: 'هامر كيرل', detail: '3 سيتات × 12 رباعة — البايسبس' },
          { name: 'تبريد', detail: '5 دقايق إطالات خفيفة' },
        ],
      },
      {
        day: 'يوم الأرجل — Legs 🦵',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق كارديو + فرد الركبة والورك' },
          { name: 'سكوات بار', detail: '4 سيتات × 6-8 رباعات — الكواد الأساسي' },
          { name: 'ليج برس', detail: '4 سيتات × 12 رباعة — الكواد' },
          { name: 'رومانيان ديد ليفت', detail: '3 سيتات × 10 رباعات — الهامسترينج' },
          { name: 'ليج كيرل', detail: '3 سيتات × 12 رباعة — الهامسترينج' },
          { name: 'هيب ثراست', detail: '4 سيتات × 12 رباعة — المؤخرة' },
          { name: 'رفع سمانة', detail: '4 سيتات × 20 رباعة — السمانة' },
          { name: 'تبريد', detail: '5 دقايق إطالات للأرجل' },
        ],
      },
    ],
  },
  {
    id: 3,
    tag: 'UPPER / LOWER',
    title: 'علوي / سفلي',
    subtitle: 'Upper / Lower',
    days: '4 أيام أسبوعياً',
    level: 'جميع المستويات',
    levelColor: { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa' },
    accentColor: '#60a5fa',
    icon: '⚖️',
    suitable: 'ممتاز لكل المستويات وللموازنة بين البناء والراحة',
    schedule: 'الإثنين، الثلاثاء، الخميس، الجمعة',
    description: 'تقسيم ذكي بيخليك تشتغل على الجزء العلوي يومين والسفلي يومين، مع راحة كافية لكل عضلة. مناسب لأي مستوى.',
    days_detail: [
      {
        day: 'علوي أ — Upper A 🏋️',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد للكتف والصدر' },
          { name: 'بنش برس', detail: '4 سيتات × 6-8 رباعات' },
          { name: 'رووينج بار', detail: '4 سيتات × 6-8 رباعات' },
          { name: 'أوفر هيد برس', detail: '3 سيتات × 10 رباعات' },
          { name: 'لات بول داون', detail: '3 سيتات × 10 رباعات' },
          { name: 'كيرل بايسبس', detail: '3 سيتات × 12 رباعة' },
          { name: 'تراسبس بوش داون', detail: '3 سيتات × 12 رباعة' },
          { name: 'تبريد', detail: '5 دقايق إطالات' },
        ],
      },
      {
        day: 'سفلي أ — Lower A 🦵',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الأرجل' },
          { name: 'سكوات بار', detail: '4 سيتات × 6-8 رباعات' },
          { name: 'رومانيان ديد ليفت', detail: '3 سيتات × 8 رباعات' },
          { name: 'ليج برس', detail: '3 سيتات × 12 رباعة' },
          { name: 'ليج كيرل', detail: '3 سيتات × 12 رباعة' },
          { name: 'هيب ثراست', detail: '3 سيتات × 15 رباعة' },
          { name: 'رفع سمانة', detail: '4 سيتات × 20 رباعة' },
          { name: 'تبريد', detail: '5 دقايق إطالات' },
        ],
      },
      {
        day: 'علوي ب — Upper B 💪',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد للكتف والظهر' },
          { name: 'ضغط مائل دمبل', detail: '4 سيتات × 10 رباعات' },
          { name: 'عقلة أو كيبل', detail: '4 سيتات × بقصاك' },
          { name: 'رفع جانبي', detail: '4 سيتات × 15 رباعة' },
          { name: 'سيتد رووينج', detail: '3 سيتات × 12 رباعة' },
          { name: 'هامر كيرل', detail: '3 سيتات × 12 رباعة' },
          { name: 'سكال كراشر', detail: '3 سيتات × 12 رباعة' },
          { name: 'تبريد', detail: '5 دقايق إطالات' },
        ],
      },
      {
        day: 'سفلي ب — Lower B 🔥',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الأرجل' },
          { name: 'ديد ليفت', detail: '4 سيتات × 5 رباعات' },
          { name: 'سبليت سكوات بلغاري', detail: '3 سيتات × 10 لكل رجل' },
          { name: 'ليج اكستنشن', detail: '3 سيتات × 15 رباعة' },
          { name: 'كيبل كيك باك', detail: '3 سيتات × 15 رباعة' },
          { name: 'رفع سمانة جالس', detail: '4 سيتات × 20 رباعة' },
          { name: 'تبريد', detail: '5 دقايق إطالات' },
        ],
      },
    ],
  },
  {
    id: 4,
    tag: 'BRO SPLIT',
    title: 'عضلة في اليوم',
    subtitle: 'Bro Split',
    days: '5 أيام أسبوعياً',
    level: 'متقدم',
    levelColor: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
    accentColor: '#f87171',
    icon: '🏆',
    suitable: 'للمحترفين ولاعبي كمال الأجسام',
    schedule: 'الإثنين للجمعة — يوم كامل لكل عضلة',
    description: 'الأسلوب الكلاسيكي اللي بيعمله المحترفين. يوم كامل لكل عضلة بس عشان تقدر تعمل أعلى حجم تدريب ممكن.',
    days_detail: [
      {
        day: 'يوم الصدر — Chest 💪',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الصدر والكتف' },
          { name: 'بنش برس بار', detail: '5 سيتات × 5 رباعات — القوة الأساسية' },
          { name: 'ضغط مائل دمبل', detail: '4 سيتات × 10 رباعات — الصدر العلوي' },
          { name: 'ضغط نازل', detail: '3 سيتات × 12 رباعة — الصدر السفلي' },
          { name: 'فلاي دمبل', detail: '3 سيتات × 15 رباعة — فتح الصدر' },
          { name: 'فلاي كيبل', detail: '3 سيتات × 15 رباعة — عزل الصدر' },
          { name: 'تبريد', detail: '5 دقايق إطالات للصدر' },
        ],
      },
      {
        day: 'يوم الظهر — Back 🦾',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الظهر والكتف' },
          { name: 'ديد ليفت', detail: '5 سيتات × 5 رباعات — الظهر الكامل' },
          { name: 'عقلة', detail: '4 سيتات × بقصاك — الظهر العريض' },
          { name: 'رووينج بار', detail: '4 سيتات × 8 رباعات — الظهر الوسط' },
          { name: 'لات بول داون', detail: '3 سيتات × 12 رباعة — الظهر العريض' },
          { name: 'سيتد رووينج', detail: '3 سيتات × 12 رباعة — الظهر الكامل' },
          { name: 'تبريد', detail: '5 دقايق إطالات للظهر' },
        ],
      },
      {
        day: 'يوم الأرجل — Legs 🦵',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الأرجل والورك' },
          { name: 'سكوات بار', detail: '5 سيتات × 5 رباعات — الكواد الأساسي' },
          { name: 'ليج برس', detail: '4 سيتات × 12 رباعة — الكواد' },
          { name: 'رومانيان ديد ليفت', detail: '4 سيتات × 10 رباعات — الهامسترينج' },
          { name: 'ليج كيرل', detail: '3 سيتات × 15 رباعة — الهامسترينج' },
          { name: 'هيب ثراست', detail: '4 سيتات × 12 رباعة — المؤخرة' },
          { name: 'رفع سمانة واقف', detail: '5 سيتات × 20 رباعة — السمانة' },
          { name: 'تبريد', detail: '5 دقايق إطالات للأرجل' },
        ],
      },
      {
        day: 'يوم الأكتاف — Shoulders 💪',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الكتف والعنق' },
          { name: 'أوفر هيد برس بار', detail: '4 سيتات × 6-8 رباعات — الكتف الأساسي' },
          { name: 'أرنولد برس', detail: '4 سيتات × 10 رباعات — الكتف الكامل' },
          { name: 'رفع جانبي', detail: '4 سيتات × 15 رباعة — الكتف الجانبي' },
          { name: 'رفع أمامي', detail: '3 سيتات × 15 رباعة — الكتف الأمامي' },
          { name: 'فيس بولز', detail: '4 سيتات × 15 رباعة — الكتف الخلفي' },
          { name: 'تبريد', detail: '5 دقايق إطالات للكتف' },
        ],
      },
      {
        day: 'يوم الذراعين — Arms 💪',
        exercises: [
          { name: 'إحماء', detail: '10 دقايق + تمدد الكوع والمعصم' },
          { name: 'كيرل بار', detail: '4 سيتات × 10 رباعات — بايسبس' },
          { name: 'هامر كيرل', detail: '3 سيتات × 12 رباعة — بايسبس' },
          { name: 'بريتشر كيرل', detail: '3 سيتات × 12 رباعة — بايسبس عزل' },
          { name: 'تراسبس بوش داون', detail: '4 سيتات × 12 رباعة — تراسبس' },
          { name: 'سكال كراشر', detail: '3 سيتات × 10 رباعات — تراسبس' },
          { name: 'مط تراسبس فوق الرأس', detail: '3 سيتات × 12 رباعة — تراسبس' },
          { name: 'تبريد', detail: '5 دقايق إطالات للذراعين' },
        ],
      },
    ],
  },
];

// ══════════════════════════════════════════
// الهيكل الأساسي لأي يوم تمرين
// ══════════════════════════════════════════
const DAY_STRUCTURE = [
  { step: '01', title: 'الإحماء', subtitle: 'Warm-up', desc: '10 دقايق كارديو خفيف + تمدد للمفاصل عشان جسمك يكون جاهز وتتجنب الإصابات.', color: '#4ade80', icon: '🔥' },
  { step: '02', title: 'التمارين الأساسية', subtitle: 'Compound Exercises', desc: 'رفع الأثقال في التمارين الكبيرة زي السكوات والبنش برس والديدليفت — دي أهم جزء في التمرين.', color: '#60a5fa', icon: '🏋️' },
  { step: '03', title: 'التمارين المساعدة', subtitle: 'Isolation Exercises', desc: 'تمارين بتستهدف العضلة بشكل مباشر زي تجميع الدمبل أو جهاز السحب — لإكمال الشغل.', color: '#facc15', icon: '🎯' },
  { step: '04', title: 'التبريد والإطالات', subtitle: 'Cool-down', desc: 'في الآخر مش اختياري — بيقلل وجع العضلات وبيساعد على الاسترداد للتمرين الجاي.', color: '#f87171', icon: '❄️' },
];

// ══════════════════════════════════════════
// Components
// ══════════════════════════════════════════
function ProgramCard({ program, index, highlighted = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [open, setOpen] = useState(highlighted);
  const [activeDay, setActiveDay] = useState(0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      id={'program-' + program.subtitle} style={{ marginBottom: 16 }}
    >
      {/* Card Header */}
      <motion.div
        whileHover={{ borderColor: program.accentColor + '66' }}
        style={{ position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: highlighted ? '1px solid rgba(61,127,255,0.5)' : '1px solid rgba(255,255,255,0.08)', borderRadius: open ? '16px 16px 0 0' : 16, transition: 'all 300ms ease', cursor: 'pointer', padding: '24px 28px' }}
        onClick={() => setOpen(!open)}
      >
        {/* shimmer */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${program.accentColor}44,transparent)` }} />
        {/* glow accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: program.accentColor + '08', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem' }}>{program.icon}</span>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', padding: '3px 10px', borderRadius: 6, background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.2)', color: 'rgba(61,127,255,0.9)' }}>
                {program.tag}
              </span>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 6, background: program.levelColor.bg, border: '1px solid ' + program.levelColor.border, color: program.levelColor.text }}>
                {program.level}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--chalk)', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {program.title}
            </h2>
            <div style={{ fontSize: '0.8rem', color: program.accentColor, fontFamily: 'var(--font-mono)', marginBottom: 12, opacity: 0.8 }}>
              {program.subtitle}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px 0', direction: 'rtl', fontFamily: 'sans-serif', maxWidth: 600 }}>
              {program.description}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} color='rgba(255,255,255,0.4)' />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>{program.days}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={13} color='rgba(255,255,255,0.4)' />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', direction: 'rtl' }}>{program.suitable}</span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ color: program.accentColor, flexShrink: 0, marginTop: 4 }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '24px 28px' }}>
              {/* Day tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {program.days_detail.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid', transition: 'all 200ms ease', background: activeDay === i ? program.accentColor + '22' : 'transparent', borderColor: activeDay === i ? program.accentColor + '88' : 'rgba(255,255,255,0.1)', color: activeDay === i ? program.accentColor : 'rgba(255,255,255,0.4)' }}
                  >
                    يوم {i + 1}
                  </button>
                ))}
              </div>

              {/* Active day */}
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ fontFamily: 'sans-serif', fontSize: '0.95rem', color: program.accentColor, marginBottom: 16, direction: 'rtl', fontWeight: 'bold' }}>
                  {program.days_detail[activeDay].day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {program.days_detail[activeDay].exercises.map((ex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', direction: 'rtl' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: program.accentColor, opacity: 0.7, minWidth: 22, paddingTop: 2 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', color: 'var(--chalk)', fontFamily: 'sans-serif', marginBottom: 2 }}>{ex.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif' }}>{ex.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StructureStep({ step, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: step.color + '18', border: '1px solid ' + step.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
        {step.icon}
      </div>
      <div style={{ flex: 1, direction: 'rtl' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: step.color, opacity: 0.8 }}>{step.step}</span>
          <span style={{ fontFamily: 'sans-serif', fontSize: '0.95rem', color: 'var(--chalk)', fontWeight: 'bold' }}>{step.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>— {step.subtitle}</span>
        </div>
        <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0, fontFamily: 'sans-serif' }}>{step.desc}</p>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════
// Main Page
export default function ProgramsPage() {
  const router = useRouter();
  return (
    <>
      <Head><title>Programs - GYMX</title></Head>

      {/* Hero */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mono" style={{ color: 'var(--volt)', marginBottom: 12 }}>— Training Programs</div>
            <h1 className="display-lg" id={'program-' + program.subtitle} style={{ marginBottom: 16 }}>اختار<br /><span style={{ color: 'var(--volt)' }}>برنامجك</span></h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.8, direction: 'rtl', fontFamily: 'sans-serif' }}>
              4 برامج تمرين جاهزة — كل واحد ليه أسلوبه وناسه. اختار اللي يناسب مستواك ووقتك وابدأ.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          {PROGRAMS.map((p, i) => <ProgramCard key={p.id} program={p} index={i} highlighted={router.query.program === p.subtitle} />)}
        </div>
      </section>

      {/* Day Structure */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ marginBottom: 32 }}>
            <div className="mono" style={{ color: 'var(--volt)', marginBottom: 8 }}>— هيكل أي يوم تمرين</div>
            <h2 className="display-sm" style={{ margin: 0 }}>الترتيب<br /><span style={{ color: 'var(--volt)' }}>الصح</span></h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DAY_STRUCTURE.map((s, i) => <StructureStep key={i} step={s} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
