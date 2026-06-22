import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ChevronDown, Dumbbell, LayoutGrid, Calculator,
  Activity, Zap, User, ShieldCheck, TrendingUp, Target,
  CheckCircle2, Star, Play, Flame, Apple, ChevronRight,
} from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

// ── helpers ───────────────────────────────────────────────
// Continuous scroll-linked focus: text grows + brightens as it nears the
// center of the viewport, and dims + shrinks slightly as it moves away
// (above or below) — re-triggers every time you scroll, not just once.
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'start 0.55', 'end 0.45', 'end 0.08'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [0.32, 1, 1, 0.32]);
  const scale = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [0.94, 1, 1, 0.94]);
  return (
    <motion.div ref={ref} style={{ opacity, scale, willChange: 'opacity, transform', ...style }}>
      {children}
    </motion.div>
  );
}

function GlassBox({ children, style = {}, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { borderColor: 'var(--glass-border-hover)' } : {}}
      transition={{ duration: 0.15 }}
      style={{
        background: 'var(--carbon)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function ServiceCard({ icon: Icon, title, desc, accent, delay, ar, linkHref }) {
  return (
    <Reveal delay={delay}>
      <GlassBox style={{ padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--iron)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon size={20} color={accent} strokeWidth={1.75} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-0.015em', color: 'var(--chalk)', marginBottom: 10 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: 'var(--ash-light)', lineHeight: 1.7, flex: 1 }}>{desc}</div>
        <Link href={linkHref || '/programs'} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ x: ar ? -3 : 3 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 22, fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--chalk)', cursor: 'pointer' }}
          >
            {ar ? 'عرض التفاصيل' : 'View details'}
            {ar ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </motion.div>
        </Link>
      </GlassBox>
    </Reveal>
  );
}

function Step({ num, title, desc, delay, ar }) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'var(--iron)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--chalk)' }}>{num}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{desc}</div>
        </div>
      </div>
    </Reveal>
  );
}

function ProgramCard({ title, days, level, goal, delay, lang }) {
  const colors = { beginner: '#4ade80', intermediate: '#facc15', advanced: 'var(--accent)' };
  const accent = colors[level] || 'var(--accent)';
  const levelLabel = lang === 'ar'
    ? { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[level]
    : { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[level];
  const goalLabel = lang === 'ar'
    ? { Strength: 'قوة', 'Fat Loss': 'تخسيس', General: 'عام', Hypertrophy: 'ضخامة' }[goal] || goal
    : goal;
  const ar = lang === 'ar';
  const ArrowIcon = ar ? ArrowLeft : ArrowRight;

  return (
    <Reveal delay={delay}>
      <Link href="/programs" style={{ textDecoration: 'none' }}>
        <GlassBox style={{ padding: 0, cursor: 'pointer' }}>
          <div style={{ padding: '22px 20px', direction: ar ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: accent, marginBottom: 12 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block' }} />
              {levelLabel} · {goalLabel}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.35rem', letterSpacing: '-0.015em', color: 'var(--chalk)', marginBottom: 18 }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.9rem', color: 'var(--chalk)' }}>{days}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ash)', marginRight: 4, marginLeft: 4 }}>
                  {ar ? 'يوم/أسبوع' : 'days/wk'}
                </span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--iron)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowIcon size={14} color="var(--chalk)" />
              </div>
            </div>
          </div>
        </GlassBox>
      </Link>
    </Reveal>
  );
}

// ══════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════
export default function HomePage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const ArrowIcon = ar ? ArrowLeft : ArrowRight;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const services = ar ? [
    {
      icon: Dumbbell, accent: 'var(--ash-light)', linkHref: '/programs',
      title: 'برامج تدريب مخصصة',
      desc: 'خطط تدريب مصممة خصيصاً لمستواك وهدفك — تخسيس أو ضخامة أو قوة. كل برنامج بجدول أسبوعي واضح.',
    },
    {
      icon: Apple, accent: 'var(--ash-light)', linkHref: '/nutrition',
      title: 'تغذية وسعرات دقيقة',
      desc: 'أنظمة غذائية مصرية جاهزة بأكل بتعرفه — فراخ، أرز، قريش، بيض. اختار هدفك وبدّل الوجبات زي ما تحب.',
    },
    {
      icon: Activity, accent: 'var(--ash-light)', linkHref: '/dashboard',
      title: 'تتبع التقدم',
      desc: 'سجّل وزنك وقياساتك وتابع تطورك أسبوع بأسبوع. شوف النتيجة الحقيقية بالأرقام.',
    },
    {
      icon: Calculator, accent: 'var(--ash-light)', linkHref: '/bmi',
      title: 'حاسبات ذكية',
      desc: 'BMI، TDEE، ومعدل الحرق — كل الأدوات اللي محتاجها في مكان واحد بدون تعقيد.',
    },
    {
      icon: Target, accent: 'var(--ash-light)', linkHref: '/shapes',
      title: 'تحليل شكل الجسم',
      desc: 'اعرف نوع جسمك واتعلم أفضل أسلوب تدريب وتغذية يناسب تركيبتك الطبيعية.',
    },
    {
      icon: ShieldCheck, accent: 'var(--ash-light)', linkHref: '/register',
      title: 'مجاني 100%',
      desc: 'مفيش اشتراكات ومفيش رسوم مخفية. سجّل حسابك دلوقتي وابدأ رحلتك فوراً.',
    },
  ] : [
    {
      icon: Dumbbell, accent: 'var(--ash-light)', linkHref: '/programs',
      title: 'Custom Training Plans',
      desc: 'Programs built for your level and goal — fat loss, muscle gain, or strength. Clear weekly schedules included.',
    },
    {
      icon: Apple, accent: 'var(--ash-light)', linkHref: '/nutrition',
      title: 'Nutrition & Meal Plans',
      desc: 'Ready-made Egyptian meal plans — chicken, rice, eggs, cottage cheese. Pick your goal and swap meals freely.',
    },
    {
      icon: Activity, accent: 'var(--ash-light)', linkHref: '/dashboard',
      title: 'Progress Tracking',
      desc: 'Log your weight and measurements, track your weekly progress. See real results in real numbers.',
    },
    {
      icon: Calculator, accent: 'var(--ash-light)', linkHref: '/bmi',
      title: 'Smart Calculators',
      desc: 'BMI, TDEE, and burn rate — all the tools you need in one place, no complexity.',
    },
    {
      icon: Target, accent: 'var(--ash-light)', linkHref: '/shapes',
      title: 'Body Type Analysis',
      desc: 'Discover your body type and learn the best training and nutrition approach for your natural build.',
    },
    {
      icon: ShieldCheck, accent: 'var(--ash-light)', linkHref: '/register',
      title: '100% Free',
      desc: 'No subscriptions, no hidden fees. Create your account now and start your journey immediately.',
    },
  ];

  const programs = [
    { title: ar ? 'بناء القوة' : 'Power Builder', days: 5, level: 'intermediate', goal: 'Strength' },
    { title: ar ? 'حرق الدهون' : 'Shred Protocol', days: 4, level: 'advanced', goal: 'Fat Loss' },
    { title: ar ? 'البداية الصح' : 'First Steps', days: 3, level: 'beginner', goal: 'General' },
    { title: ar ? 'مرحلة الضخامة' : 'Mass Phase', days: 6, level: 'advanced', goal: 'Hypertrophy' },
  ];

  const muscles = {
    ar: ['صدر', 'ظهر', 'أكتاف', 'أذرع', 'أرجل', 'بطن', 'مؤخرة', 'جسم كامل'],
    en: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'],
  };

  const steps = ar ? [
    { num: '١', title: 'سجّل حساب مجاناً', desc: 'دقيقة واحدة بس — إيميلك وكلمة سر وخلاص.' },
    { num: '٢', title: 'حدد هدفك ومستواك', desc: 'جاوب على 3 أسئلة بسيطة والموقع يختارلك أنسب برنامج تلقائياً.' },
    { num: '٣', title: 'ابدأ التدريب دلوقتي', desc: 'اتبع البرنامج يوم بيوم، تابع تقدمك، وشوف الفرق بنفسك.' },
  ] : [
    { num: '1', title: 'Create a free account', desc: 'Takes one minute — just your email and password.' },
    { num: '2', title: 'Set your goal & level', desc: 'Answer 3 quick questions and GYMZ picks the best program for you automatically.' },
    { num: '3', title: 'Start training today', desc: 'Follow the plan day by day, track your progress, and see real results.' },
  ];

  const whyPoints = ar ? [
    'برامج مصممة على أسس علمية حقيقية',
    'مناسب لكل المستويات — من الصفر للمتقدم',
    'شغّال كويس على موبايل وكمبيوتر',
    'حاسبات دقيقة للسعرات والـ BMI والـ TDEE',
    'مجاناً تماماً — مفيش اشتراكات',
    'واجهة عربية وإنجليزية',
  ] : [
    'Programs based on real scientific principles',
    'Suitable for all levels — beginner to advanced',
    'Works great on mobile and desktop',
    'Accurate calorie, BMI, and TDEE calculators',
    'Completely free — no subscriptions',
    'Arabic and English interface',
  ];

  return (
    <>
      <Head>
        <title>GYMZ — {ar ? 'ابنِ جسمك بخطة مخصصة' : 'Build Your Body With a Custom Plan'}</title>
        <meta name="description" content={ar ? 'برامج تدريب وغذاء مخصصة لك — مجاناً. ابدأ رحلتك مع GYMZ.' : 'Custom training and nutrition plans — free. Start your journey with GYMZ.'} />
      </Head>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', overflow: 'hidden' }}>

        {/* Animated monochrome background — no external video dependency */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 65% 55% at 78% 28%, rgba(255,255,255,0.16) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 12% 85%, rgba(255,255,255,0.10) 0%, transparent 65%), #000',
          backgroundSize: '180% 180%',
          animation: 'heroGradientShift 10s ease-in-out infinite',
        }} />

        {/* Moving grid for texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 35%, #000 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 35%, #000 0%, transparent 80%)',
          animation: 'heroGridDrift 22s linear infinite',
          pointerEvents: 'none',
        }} />

        <style jsx>{`
          @keyframes heroGradientShift {
            0%, 100% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
          }
          @keyframes heroGridDrift {
            from { background-position: 0 0; }
            to { background-position: 56px 56px; }
          }
          @keyframes warriorFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes punchLeft {
            0%, 100% { transform: rotate(0deg) translateY(0px); }
            40% { transform: rotate(-12deg) translateY(-18px); }
            70% { transform: rotate(-6deg) translateY(-8px); }
          }
          @keyframes guardRight {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(8deg) translateY(-6px); }
          }
          @keyframes warriorGlow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes energyPulse {
            0%, 100% { opacity: 0.2; }
            40% { opacity: 0.7; }
            60% { opacity: 0.1; }
          }
        `}</style>

        {/* Original cartoon warrior-athlete illustration — 100% hand-drawn SVG, no external IP */}
        <div aria-hidden="true" style={{
          position: 'absolute', zIndex: 1,
          right: ar ? 'auto' : '-2%', left: ar ? '-2%' : 'auto',
          bottom: 0,
          width: 'min(580px, 52vw)',
          height: '90vh',
          animation: 'warriorFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          opacity: 0.82,
        }}>
          <svg viewBox="0 0 440 700" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height: '100%' }}>
            <defs>
              <radialGradient id="wGlow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="wBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="100%" stopColor="#aaaaaa"/>
              </linearGradient>
              <linearGradient id="wShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#555"/>
                <stop offset="100%" stopColor="#222"/>
              </linearGradient>
            </defs>

            {/* halo glow */}
            <ellipse cx="220" cy="340" rx="200" ry="280" fill="url(#wGlow)" style={{ animation: 'warriorGlow 5s ease-in-out infinite' }}/>
            {/* ground shadow */}
            <ellipse cx="220" cy="690" rx="100" ry="12" fill="#ffffff" opacity="0.07"/>

            {/* LEGS */}
            <path d="M245,370 L260,490 L272,600 L300,600 L290,488 L278,370 Z" fill="url(#wBody)"/>
            <path d="M162,370 L148,488 L138,600 L166,600 L178,490 L195,370 Z" fill="url(#wShadow)"/>
            <ellipse cx="271" cy="490" rx="16" ry="14" fill="#ccc"/>
            <ellipse cx="152" cy="490" rx="14" ry="13" fill="#666"/>

            {/* BOOTS */}
            <path d="M272,590 L268,625 L240,640 L235,650 L305,650 L305,590 Z" fill="#333"/>
            <path d="M138,590 L134,625 L106,640 L101,650 L171,650 L172,590 Z" fill="#222"/>
            <rect x="235" y="640" width="70" height="12" rx="5" fill="#555"/>
            <rect x="101" y="640" width="70" height="12" rx="5" fill="#444"/>

            {/* TORSO */}
            <path d="M145,165 Q220,140 295,165 L285,375 Q220,395 155,375 Z" fill="url(#wBody)"/>
            <line x1="220" y1="255" x2="220" y2="375" stroke="#888" strokeWidth="3" opacity="0.5"/>
            <line x1="175" y1="275" x2="265" y2="275" stroke="#888" strokeWidth="2" opacity="0.4"/>
            <line x1="172" y1="310" x2="268" y2="310" stroke="#888" strokeWidth="2" opacity="0.4"/>
            <line x1="170" y1="345" x2="270" y2="345" stroke="#888" strokeWidth="2" opacity="0.4"/>
            <path d="M155,175 Q188,162 215,172 L210,230 Q185,238 158,225 Z" fill="#eee" opacity="0.6"/>
            <path d="M285,175 Q252,162 225,172 L230,230 Q255,238 282,225 Z" fill="#eee" opacity="0.6"/>

            {/* BELT */}
            <rect x="150" y="358" width="140" height="28" rx="10" fill="#333"/>
            <rect x="208" y="360" width="24" height="24" rx="6" fill="#888"/>
            <rect x="213" y="365" width="14" height="14" rx="3" fill="#ccc"/>

            {/* LEFT ARM — punching up, animated */}
            <g style={{ animation: 'punchLeft 3.5s ease-in-out infinite', transformOrigin: '150px 180px' }}>
              <path d="M150,175 L90,140" stroke="url(#wBody)" strokeWidth="42" strokeLinecap="round" fill="none"/>
              <ellipse cx="118" cy="156" rx="26" ry="20" fill="#ddd" transform="rotate(-30,118,156)"/>
              <path d="M90,140 L55,68" stroke="url(#wBody)" strokeWidth="34" strokeLinecap="round" fill="none"/>
              <ellipse cx="70" cy="100" rx="20" ry="14" fill="#999" transform="rotate(-55,70,100)"/>
              <rect x="30" y="42" width="48" height="38" rx="14" fill="url(#wBody)" transform="rotate(-15,54,61)"/>
              <line x1="44" y1="50" x2="44" y2="72" stroke="#888" strokeWidth="2" opacity="0.6"/>
              <line x1="54" y1="48" x2="54" y2="72" stroke="#888" strokeWidth="2" opacity="0.6"/>
              <line x1="64" y1="48" x2="64" y2="72" stroke="#888" strokeWidth="2" opacity="0.6"/>
              {/* energy lines from fist */}
              <line x1="18" y1="30" x2="0" y2="18" stroke="#fff" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" style={{ animation: 'energyPulse 3.5s ease-in-out infinite' }}/>
              <line x1="28" y1="20" x2="18" y2="0" stroke="#fff" strokeWidth="2" opacity="0.3" strokeLinecap="round" style={{ animation: 'energyPulse 3.5s ease-in-out infinite 0.1s' }}/>
              <line x1="10" y1="42" x2="-10" y2="36" stroke="#fff" strokeWidth="2" opacity="0.3" strokeLinecap="round" style={{ animation: 'energyPulse 3.5s ease-in-out infinite 0.2s' }}/>
            </g>

            {/* RIGHT ARM — guard, animated */}
            <g style={{ animation: 'guardRight 4.2s ease-in-out infinite', transformOrigin: '290px 180px' }}>
              <path d="M290,175 L348,210" stroke="url(#wBody)" strokeWidth="42" strokeLinecap="round" fill="none"/>
              <ellipse cx="320" cy="193" rx="26" ry="20" fill="#ddd" transform="rotate(30,320,193)"/>
              <path d="M348,210 L345,155" stroke="url(#wBody)" strokeWidth="34" strokeLinecap="round" fill="none"/>
              <ellipse cx="347" cy="178" rx="20" ry="14" fill="#999" transform="rotate(5,347,178)"/>
              <rect x="325" y="130" width="44" height="36" rx="12" fill="url(#wBody)"/>
              <line x1="338" y1="137" x2="338" y2="158" stroke="#888" strokeWidth="2" opacity="0.6"/>
              <line x1="348" y1="135" x2="348" y2="158" stroke="#888" strokeWidth="2" opacity="0.6"/>
              <line x1="358" y1="135" x2="358" y2="158" stroke="#888" strokeWidth="2" opacity="0.6"/>
            </g>

            {/* NECK */}
            <path d="M195,110 Q220,100 245,110 L248,155 Q220,162 192,155 Z" fill="url(#wBody)"/>

            {/* HEAD */}
            <ellipse cx="220" cy="68" rx="46" ry="50" fill="url(#wBody)"/>
            <path d="M180,82 Q220,112 260,82" fill="none" stroke="#bbb" strokeWidth="3" opacity="0.5"/>
            <ellipse cx="204" cy="58" rx="10" ry="7" fill="#111"/>
            <ellipse cx="236" cy="58" rx="10" ry="7" fill="#111"/>
            <ellipse cx="205" cy="57" rx="4" ry="4" fill="#fff" opacity="0.7"/>
            <ellipse cx="237" cy="57" rx="4" ry="4" fill="#fff" opacity="0.7"/>
            <path d="M192,48 Q204,42 216,48" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round"/>
            <path d="M224,48 Q236,42 248,48" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round"/>
            <path d="M213,76 L213,76 Q220,82 227,76" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M205,88 Q220,84 235,88" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round"/>

            {/* HEADBAND */}
            <rect x="175" y="28" width="90" height="14" rx="7" fill="#333"/>
            <path d="M265,35 Q280,30 290,38 Q285,46 270,42" fill="#333"/>
          </svg>
        </div>
        {/* Hero Content */}
        <motion.div style={{ position: 'relative', zIndex: 2, maxWidth: 860, y: heroY, opacity: heroOpacity, direction: ar ? 'rtl' : 'ltr' }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--carbon)', border: '1px solid var(--glass-border)', borderRadius: 100, padding: '6px 14px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--ash-light)' }}>
              {ar ? 'مجاناً — ابدأ دلوقتي' : 'Free — start today'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(2.6rem, 7vw, 5.4rem)', letterSpacing: '-0.035em', color: 'var(--chalk)', lineHeight: 1.03, marginBottom: 0 }}>
            {ar ? 'ابنِ' : 'Build'}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(2.6rem, 7vw, 5.4rem)', letterSpacing: '-0.035em', lineHeight: 1.03, marginBottom: 0, color: 'var(--accent)' }}>
            {ar ? 'جسمك' : 'your body'}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(2.6rem, 7vw, 5.4rem)', letterSpacing: '-0.035em', color: 'var(--chalk)', lineHeight: 1.03, marginBottom: 32 }}>
            {ar ? 'بخطة مخصصة' : 'your plan'}
          </motion.h1>

          {/* Subtext */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.25 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: 'var(--ash-light)', maxWidth: 480, lineHeight: 1.7, marginBottom: 40 }}>
            {ar
              ? 'خطة تدريب وغذاء مصممة لجسمك وهدفك — مش نسخة من شخص تاني. GYMZ بيساعدك توصل لنتيجة حقيقية.'
              : 'A training and nutrition plan built for your body and your goal — not someone else\'s. GYMZ helps you reach real results.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.32 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={15} /> {ar ? 'داشبورد' : 'Dashboard'}
              </Link>
            ) : (
              <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={15} /> {ar ? 'ابدأ الآن' : 'Start now'}
              </Link>
            )}
            <Link href="/programs" className="btn btn-outline" style={{ fontSize: '0.95rem', padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={15} /> {ar ? 'استكشف البرامج' : 'Explore programs'}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} style={{ color: 'var(--ash)' }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ STATS STRIP ════════════════════════════════════ */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
            {[
              { num: '+50', label: ar ? 'تمرين موثّق' : 'Documented exercises' },
              { num: '12', label: ar ? 'برنامج تدريب' : 'Training programs' },
              { num: '3', label: ar ? 'مستويات تدريب' : 'Fitness levels' },
              { num: '8', label: ar ? 'مجموعة عضلية' : 'Muscle groups' },
            ].map(({ num, label }, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div style={{ textAlign: 'center', padding: '32px 16px', direction: ar ? 'rtl' : 'ltr' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--chalk)' }}>{num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ash-light)', marginTop: 8 }}>{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56, direction: ar ? 'rtl' : 'ltr' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash)', marginBottom: 14 }}>
                {ar ? 'كل اللي محتاجه في مكان واحد' : 'Everything you need, in one place'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.025em', color: 'var(--chalk)', lineHeight: 1.15 }}>
                {ar ? 'خدمات ' : 'What '}<span style={{ color: 'var(--accent)' }}>GYMZ</span>{ar ? '' : ' offers'}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {services.map((s, i) => <ServiceCard key={i} {...s} delay={i * 0.04} ar={ar} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <div style={{ direction: ar ? 'rtl' : 'ltr' }}>
              <Reveal>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash)', marginBottom: 14 }}>
                  {ar ? 'ازاي تبدأ' : 'How it works'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', letterSpacing: '-0.025em', color: 'var(--chalk)', lineHeight: 1.15, marginBottom: 44 }}>
                  {ar ? <>٣ خطوات <span style={{ color: 'var(--accent)' }}>وتبدأ</span></> : <>3 steps to <span style={{ color: 'var(--accent)' }}>get started</span></>}
                </h2>
              </Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {steps.map((s, i) => <Step key={i} {...s} delay={i * 0.06} ar={ar} />)}
              </div>
            </div>

            <Reveal delay={0.1}>
              <GlassBox style={{ padding: '36px 32px', direction: ar ? 'rtl' : 'ltr' }} hover={false}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)', marginBottom: 22 }}>
                  {ar ? 'ليه GYMZ؟' : 'Why GYMZ?'}
                </div>
                {whyPoints.map((item, i) => (
                  <div key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < whyPoints.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                    <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--chalk)' }}>{item}</span>
                  </div>
                ))}
                <Link href={user ? "/programs" : "/register"} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 26, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {user ? (ar ? 'اكتشف البرامج' : 'Explore programs') : (ar ? 'ابدأ الآن — مجاناً' : 'Start now — free')}
                </Link>
              </GlassBox>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS PREVIEW ══════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16, direction: ar ? 'rtl' : 'ltr' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash)', marginBottom: 12 }}>
                  {ar ? 'برامج مختارة' : 'Featured programs'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', letterSpacing: '-0.025em', color: 'var(--chalk)', lineHeight: 1.15 }}>
                  {ar ? <>مبنية على <span style={{ color: 'var(--accent)' }}>نتائج حقيقية</span></> : <>Built for <span style={{ color: 'var(--accent)' }}>real results</span></>}
                </h2>
              </div>
              <Link href="/programs" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {ar ? 'كل البرامج' : 'All programs'} <ArrowIcon size={16} />
              </Link>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {programs.map((p, i) => <ProgramCard key={i} {...p} delay={i * 0.05} lang={lang} />)}
          </div>
        </div>
      </section>

      {/* ══ MUSCLE GROUPS ═════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <Reveal>
            <div style={{ direction: ar ? 'rtl' : 'ltr', marginBottom: 44 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash)', marginBottom: 12 }}>
                {ar ? 'استهدف أي عضلة' : 'Target any muscle'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', letterSpacing: '-0.025em', color: 'var(--chalk)', lineHeight: 1.15 }}>
                {ar ? <>كل <span style={{ color: 'var(--accent)' }}>المجموعات العضلية</span></> : <>Every <span style={{ color: 'var(--accent)' }}>muscle group</span></>}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {muscles.en.map((muscleEn, i) => (
              <Reveal key={muscleEn} delay={i * 0.025}>
                <Link href={`/exercises?muscle_group=${muscleEn}`} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ borderColor: 'var(--glass-border-hover)' }}
                    transition={{ duration: 0.12 }}
                    style={{ padding: '18px 16px', background: 'var(--carbon)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.95rem', color: 'var(--chalk)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', direction: ar ? 'rtl' : 'ltr' }}>
                    {ar ? muscles.ar[i] : muscleEn}
                    <ArrowIcon size={14} style={{ color: 'var(--ash)' }} />
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════ */}
      <section style={{ padding: '120px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Reveal>
            <GlassBox style={{ display: 'inline-block', padding: 'clamp(40px, 8vw, 70px) clamp(32px, 10vw, 90px)' }} hover={false}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash)', marginBottom: 18 }}>
                {ar ? 'مفيش أعذار. مفيش غداً.' : 'No excuses. No tomorrow.'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.025em', color: 'var(--chalk)', marginBottom: 32 }}>
                {ar ? 'جاهز تبدأ؟' : 'Ready to start?'}
              </h2>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={user ? "/programs" : "/register"} className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 30px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Flame size={15} />
                  {user ? (ar ? 'شوف البرامج' : 'Browse programs') : (ar ? 'ابدأ الآن مجاناً' : 'Start free now')}
                </Link>
                {!user && (
                  <Link href="/login" className="btn btn-outline" style={{ fontSize: '0.95rem', padding: '13px 30px' }}>
                    {ar ? 'عندي حساب' : 'I have an account'}
                  </Link>
                )}
              </div>
            </GlassBox>
          </Reveal>
        </div>
      </section>
    </>
  );
}
