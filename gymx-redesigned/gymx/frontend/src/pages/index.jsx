import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ChevronDown, Dumbbell, LayoutGrid, Calculator,
  Activity, Zap, User, ShieldCheck, TrendingUp, Target,
  CheckCircle2, Star, Play, Flame, Apple, ChevronRight,
} from 'lucide-react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

// Three.js needs a real window/canvas, so it's loaded client-side only.
const ParticleAthlete = dynamic(() => import('../components/layout/three/ParticleAthlete'), { ssr: false });

// ── helpers ───────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >{children}</motion.div>
  );
}

function GlassBox({ children, style = {}, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: 'rgba(255,59,48,0.35)' } : {}}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }} />
      {children}
    </motion.div>
  );
}

function ServiceCard({ icon: Icon, title, desc, accent, delay, ar, linkHref }) {
  return (
    <Reveal delay={delay}>
      <GlassBox style={{ padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: accent + '18', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon size={22} color={accent} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.03em', color: 'var(--chalk)', marginBottom: 12 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: 'var(--ash-light)', lineHeight: 1.75, flex: 1 }}>{desc}</div>
        <Link href={linkHref || '/programs'} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ x: ar ? -4 : 4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', color: accent, textTransform: 'uppercase', cursor: 'pointer' }}
          >
            {ar ? 'عرض التفاصيل' : 'View Details'}
            {ar ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
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
        <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--accent)' }}>{num}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{desc}</div>
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
          <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          <div style={{ padding: '24px 20px', direction: ar ? 'rtl' : 'ltr' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              {levelLabel} · {goalLabel}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 16, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent)' }}>{days}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', marginRight: 4, marginLeft: 4 }}>
                  {ar ? 'يوم/أسبوع' : 'days/wk'}
                </span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowIcon size={15} color="var(--accent)" />
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
      icon: Dumbbell, accent: '#FF3B30', linkHref: '/programs',
      title: 'برامج تدريب مخصصة',
      desc: 'خطط تدريب مصممة خصيصاً لمستواك وهدفك — تخسيس أو ضخامة أو قوة. كل برنامج بجدول أسبوعي واضح.',
    },
    {
      icon: Apple, accent: '#FF9F0A', linkHref: '/nutrition',
      title: 'تغذية وسعرات دقيقة',
      desc: 'أنظمة غذائية مصرية جاهزة بأكل بتعرفه — فراخ، أرز، قريش، بيض. اختار هدفك وبدّل الوجبات زي ما تحب.',
    },
    {
      icon: Activity, accent: '#30D158', linkHref: '/dashboard',
      title: 'تتبع التقدم',
      desc: 'سجّل وزنك وقياساتك وتابع تطورك أسبوع بأسبوع. شوف النتيجة الحقيقية بالأرقام.',
    },
    {
      icon: Calculator, accent: '#64D2FF', linkHref: '/bmi',
      title: 'حاسبات ذكية',
      desc: 'BMI، TDEE، ومعدل الحرق — كل الأدوات اللي محتاجها في مكان واحد بدون تعقيد.',
    },
    {
      icon: Target, accent: '#BF5AF2', linkHref: '/shapes',
      title: 'تحليل شكل الجسم',
      desc: 'اعرف نوع جسمك واتعلم أفضل أسلوب تدريب وتغذية يناسب تركيبتك الطبيعية.',
    },
    {
      icon: ShieldCheck, accent: '#FF375F', linkHref: '/register',
      title: 'مجاني 100%',
      desc: 'مفيش اشتراكات ومفيش رسوم مخفية. سجّل حسابك دلوقتي وابدأ رحلتك فوراً.',
    },
  ] : [
    {
      icon: Dumbbell, accent: '#FF3B30', linkHref: '/programs',
      title: 'Custom Training Plans',
      desc: 'Programs built for your level and goal — fat loss, muscle gain, or strength. Clear weekly schedules included.',
    },
    {
      icon: Apple, accent: '#FF9F0A', linkHref: '/nutrition',
      title: 'Nutrition & Meal Plans',
      desc: 'Ready-made Egyptian meal plans — chicken, rice, eggs, cottage cheese. Pick your goal and swap meals freely.',
    },
    {
      icon: Activity, accent: '#30D158', linkHref: '/dashboard',
      title: 'Progress Tracking',
      desc: 'Log your weight and measurements, track your weekly progress. See real results in real numbers.',
    },
    {
      icon: Calculator, accent: '#64D2FF', linkHref: '/bmi',
      title: 'Smart Calculators',
      desc: 'BMI, TDEE, and burn rate — all the tools you need in one place, no complexity.',
    },
    {
      icon: Target, accent: '#BF5AF2', linkHref: '/shapes',
      title: 'Body Type Analysis',
      desc: 'Discover your body type and learn the best training and nutrition approach for your natural build.',
    },
    {
      icon: ShieldCheck, accent: '#FF375F', linkHref: '/register',
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

        {/* Background image overlay — kept very faint now that the particle athlete is the focal element */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80") center/cover no-repeat',
          filter: 'brightness(0.08) saturate(1.1)',
        }} />

        {/* Giant floating 3D particle athlete + glowing dumbbells (Three.js, client-only) */}
        <ParticleAthlete style={{ zIndex: 1, opacity: 0.9 }} />

        {/* Red glow overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse 70% 60% at 20% 60%, rgba(255,59,48,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 20%, rgba(255,59,48,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Vertical lines */}
        <motion.div style={{ position: 'absolute', inset: 0, opacity: 0.025, y: heroY, zIndex: 1 }} aria-hidden>
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i / 14) * 100}%`, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent 0%, #FF3B30 50%, transparent 100%)' }} />
          ))}
        </motion.div>

        {/* Big BG letter */}
        <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '3vw', fontFamily: 'var(--font-display)', fontSize: 'clamp(300px, 42vw, 650px)', color: 'rgba(255,59,48,0.04)', userSelect: 'none', pointerEvents: 'none', zIndex: 1, y: heroY }} aria-hidden>G</motion.div>

        {/* Hero Content */}
        <motion.div style={{ position: 'relative', zIndex: 2, maxWidth: 860, y: heroY, opacity: heroOpacity, direction: ar ? 'rtl' : 'ltr' }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 36 }}>
            <Flame size={12} color="#FF3B30" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#FF6B60', letterSpacing: '0.1em' }}>
              {ar ? 'مجاناً — ابدأ دلوقتي' : 'Free — Start Today'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '0.03em', color: 'var(--chalk)', lineHeight: 0.95, marginBottom: 0 }}>
            {ar ? 'ابنِ' : 'BUILD'}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '0.03em', lineHeight: 0.95, marginBottom: 0, background: 'linear-gradient(90deg, #FF7A1A, #FF2B30)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 40px rgba(255,43,48,0.35))' }}>
            {ar ? 'جسمك' : 'YOUR BODY'}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '0.03em', color: 'var(--chalk)', lineHeight: 0.95, marginBottom: 36 }}>
            {ar ? 'بخطة مخصصة' : 'YOUR PLAN'}
          </motion.h1>

          {/* Subtext */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--ash-light)', maxWidth: 500, lineHeight: 1.85, marginBottom: 44 }}>
            {ar
              ? 'خطة تدريب وغذاء مصممة لجسمك وهدفك — مش نسخة من شخص تاني. GYMZ بيساعدك توصل لنتيجة حقيقية.'
              : 'A training and nutrition plan built for your body and your goal — not someone else\'s. GYMZ helps you reach real results.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn" style={{ fontSize: '1rem', padding: '15px 36px', background: 'linear-gradient(135deg, #FF3B30, #FF6B60)', color: '#fff', boxShadow: '0 4px 24px rgba(255,59,48,0.35)', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6 }}>
                <Zap size={16} /> {ar ? 'داشبورد' : 'Dashboard'}
              </Link>
            ) : (
              <Link href="/register" className="btn" style={{ fontSize: '1rem', padding: '15px 36px', background: 'linear-gradient(135deg, #FF3B30, #FF6B60)', color: '#fff', boxShadow: '0 4px 24px rgba(255,59,48,0.35)', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6 }}>
                <Zap size={16} /> {ar ? 'ابدأ الآن' : 'Start Now'}
              </Link>
            )}
            <Link href="/programs" className="btn btn-outline" style={{ fontSize: '1rem', padding: '15px 36px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={16} /> {ar ? 'استكشف البرامج' : 'Explore Programs'}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} style={{ color: 'var(--ash)' }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ STATS STRIP ════════════════════════════════════ */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
            {[
              { num: '+50', label: ar ? 'تمرين موثّق' : 'Documented Exercises' },
              { num: '12', label: ar ? 'برنامج تدريب' : 'Training Programs' },
              { num: '3', label: ar ? 'مستويات تدريب' : 'Fitness Levels' },
              { num: '8', label: ar ? 'مجموعة عضلية' : 'Muscle Groups' },
            ].map(({ num, label }, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ textAlign: 'center', padding: '32px 16px', direction: ar ? 'rtl' : 'ltr' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', color: '#FF3B30', lineHeight: 1, textShadow: '0 0 30px rgba(255,59,48,0.4)' }}>{num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', letterSpacing: '0.08em', color: 'var(--ash-light)', marginTop: 10, textTransform: 'uppercase' }}>{label}</div>
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
            <div style={{ textAlign: 'center', marginBottom: 64, direction: ar ? 'rtl' : 'ltr' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#FF3B30', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                {ar ? '— كل اللي محتاجه في مكان واحد' : '— Everything you need, in one place'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1 }}>
                {ar ? 'خدمات ' : 'What '}<span style={{ color: '#FF3B30', textShadow: '0 0 40px rgba(255,59,48,0.35)' }}>GYMZ</span>{ar ? '' : ' Offers'}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {services.map((s, i) => <ServiceCard key={i} {...s} delay={i * 0.06} ar={ar} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <div style={{ direction: ar ? 'rtl' : 'ltr' }}>
              <Reveal>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#FF3B30', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  {ar ? '— ازاي تبدأ' : '— How it works'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1, marginBottom: 48 }}>
                  {ar ? <>٣ خطوات<br /><span style={{ color: '#FF3B30' }}>وتبدأ</span></> : <>3 Steps to<br /><span style={{ color: '#FF3B30' }}>Get Started</span></>}
                </h2>
              </Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                {steps.map((s, i) => <Step key={i} {...s} delay={i * 0.1} ar={ar} />)}
              </div>
            </div>

            <Reveal delay={0.15}>
              <GlassBox style={{ padding: '40px 32px', direction: ar ? 'rtl' : 'ltr' }} hover={false}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 24 }}>
                  {ar ? '— ليه GYMZ؟' : '— Why GYMZ?'}
                </div>
                {whyPoints.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: ar ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < whyPoints.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <CheckCircle2 size={16} color="#FF3B30" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--chalk)' }}>{item}</span>
                  </motion.div>
                ))}
                <Link href={user ? "/programs" : "/register"} className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 28, fontSize: '0.9rem', background: 'linear-gradient(135deg, #FF3B30, #FF6B60)', color: '#fff', boxShadow: '0 4px 20px rgba(255,59,48,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {user ? (ar ? 'اكتشف البرامج' : 'Explore Programs') : (ar ? 'ابدأ الآن — مجاناً' : 'Start Now — Free')}
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
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16, direction: ar ? 'rtl' : 'ltr' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#FF3B30', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                  {ar ? '— برامج مختارة' : '— Featured Programs'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--chalk)', lineHeight: 1.1 }}>
                  {ar ? <>مبنية على<br /><span style={{ color: '#FF3B30' }}>نتائج حقيقية</span></> : <>Built for<br /><span style={{ color: '#FF3B30' }}>Real Results</span></>}
                </h2>
              </div>
              <Link href="/programs" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {ar ? 'كل البرامج' : 'All Programs'} <ArrowIcon size={16} />
              </Link>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {programs.map((p, i) => <ProgramCard key={i} {...p} delay={i * 0.08} lang={lang} />)}
          </div>
        </div>
      </section>

      {/* ══ MUSCLE GROUPS ═════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <Reveal>
            <div style={{ direction: ar ? 'rtl' : 'ltr', marginBottom: 48 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 14 }}>
                {ar ? '— استهدف أي عضلة' : '— Target any muscle'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--chalk)', lineHeight: 1.1 }}>
                {ar ? <>كل<br /><span style={{ color: '#FF3B30' }}>المجموعات العضلية</span></> : <>Every<br /><span style={{ color: '#FF3B30' }}>Muscle Group</span></>}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {muscles.en.map((muscleEn, i) => (
              <Reveal key={muscleEn} delay={i * 0.05}>
                <Link href={`/exercises?muscle_group=${muscleEn}`} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ backgroundColor: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.4)', color: '#FF3B30', y: -2 }}
                    style={{ padding: '20px 16px', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em', color: 'var(--chalk)', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', direction: ar ? 'rtl' : 'ltr' }}>
                    {ar ? muscles.ar[i] : muscleEn}
                    <ArrowIcon size={14} style={{ color: '#FF3B30', opacity: 0.5 }} />
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
            <GlassBox style={{ display: 'inline-block', padding: 'clamp(40px, 8vw, 70px) clamp(32px, 10vw, 90px)', background: 'linear-gradient(135deg, rgba(255,59,48,0.08), rgba(255,107,43,0.05))' }} hover={false}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 20 }}>
                {ar ? '— مفيش أعذار. مفيش غداً.' : '— No excuses. No tomorrow.'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 36 }}>
                {ar ? 'جاهز تبدأ؟' : 'Ready to Start?'}
              </h2>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={user ? "/programs" : "/register"} className="btn" style={{ fontSize: '1rem', padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #FF3B30, #FF6B60)', color: '#fff', boxShadow: '0 4px 24px rgba(255,59,48,0.35)', borderRadius: 6 }}>
                  <Flame size={16} />
                  {user ? (ar ? 'شوف البرامج' : 'Browse Programs') : (ar ? 'ابدأ الآن مجاناً' : 'Start Free Now')}
                </Link>
                {!user && (
                  <Link href="/login" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 36px' }}>
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
