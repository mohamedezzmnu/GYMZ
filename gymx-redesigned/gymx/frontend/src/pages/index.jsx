import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import {
  Dumbbell, Apple, Activity, Calculator, ShieldCheck,
  ArrowRight, Zap, BarChart3, Trophy, ChevronRight,
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { EXERCISES } from '../data/exercises';
import PROGRAMS from '../data/programs';

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 1600 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !target) return;
    let current = 0;
    const totalFrames = Math.max(1, Math.round(duration / 16));
    const step = Math.max(1, Math.ceil(target / totalFrames));
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplay(current);
      if (current >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target, duration]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   SERVICE ROW ITEM
───────────────────────────────────────────── */
function ServiceRow({ s, i, ar }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: ar ? 24 : -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: i * 0.06 }}
    >
      <Link href={s.href}>
        <div className="service-row" style={{ direction: ar ? 'rtl' : 'ltr', cursor: 'pointer' }}>
          <div className="service-num">{s.num}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <s.icon size={16} color="var(--volt)" />
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1.35rem',
                    letterSpacing: ar ? 0 : '0.04em',
                    color: 'var(--chalk)',
                    textTransform: ar ? 'none' : 'uppercase',
                  }}
                >
                  {s.title}
                </h3>
              </div>
              <p style={{ color: 'var(--ash-light)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 500 }}>
                {s.desc}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--volt)', flexShrink: 0, marginTop: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: ar ? 0 : '0.14em',
                  textTransform: ar ? 'none' : 'uppercase',
                }}
              >
                {ar ? 'اكتشف' : 'EXPLORE'}
              </span>
              <ChevronRight size={14} style={{ transform: ar ? 'rotate(180deg)' : 'none' }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STEP ITEM — timeline marker on a connecting rail
───────────────────────────────────────────── */
function StepItem({ s, i, ar }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: i * 0.1 }}
      style={{ position: 'relative', paddingTop: 50 }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: ar ? 'auto' : 0,
          right: ar ? 0 : 'auto',
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '2px solid var(--volt)',
          boxShadow: '0 8px 24px rgba(255, 90, 31, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.2rem',
          color: 'var(--volt)',
          zIndex: 2,
        }}
      >
        {s.num}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.3rem',
          letterSpacing: ar ? 0 : '0.03em',
          color: 'var(--chalk)',
          textTransform: ar ? 'none' : 'uppercase',
          marginBottom: 10,
        }}
      >
        {s.title}
      </h3>
      <p style={{ color: 'var(--ash-light)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 260 }}>
        {s.desc}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MARQUEE STRIP — editorial ticker texture
───────────────────────────────────────────── */
function MarqueeStrip({ items, style, itemStyle, duration = '26s' }) {
  const doubled = [...items, ...items];

  return (
    <div className="marquee-strip" style={style}>
      <div className="marquee-track" style={{ animationDuration: duration }}>
        {doubled.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', ...itemStyle }}>
            {t}
            <span aria-hidden="true" style={{ margin: '0 24px', opacity: 0.45 }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const ar = lang === 'ar';

  const [stats,    setStats]    = useState({ members: 0, exercises: 0, programs: 0 });
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    let active = true;
    supabase.from('users').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (active) setStats(s => ({ ...s, members: count || 0 }));
    });
    supabase.from('programs').select('title_ar,title_en,days_per_week,level').limit(3).then(({ data }) => {
      if (active && data?.length) setPrograms(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  const services = ar ? [
    { num: '01', icon: Dumbbell,    title: 'برامج التدريب',    desc: 'برامج مبنية على هدفك ومستواك — خسارة وزن، بناء عضل، أو قوة. جدول أسبوعي واضح.',            href: '/programs'  },
    { num: '02', icon: Apple,       title: 'التغذية والوجبات', desc: 'خطط غذائية بمكونات مصرية جاهزة. اختار هدفك وعدّل الوجبات بحرية كاملة.',                     href: '/nutrition' },
    { num: '03', icon: Activity,    title: 'تتبع التقدم',      desc: 'سجّل وزنك وقياساتك أسبوعياً. شوف كيف جسمك بيتغير بأرقام حقيقية على مدار الوقت.',            href: '/dashboard' },
    { num: '04', icon: Calculator,  title: 'حاسبات ذكية',     desc: 'احسب احتياجك من الأكل، وزنك المثالي، أقصى قوتك، وتوزيع أكلك — كل حاجة في مكان واحد بدون تعقيد.', href: '/tools'     },
    { num: '05', icon: ShieldCheck, title: 'مجاني 100%',       desc: 'مفيش اشتراكات ومفيش رسوم مخفية. انشئ حسابك في دقيقة وابدأ رحلتك فوراً.',                   href: '/register'  },
  ] : [
    { num: '01', icon: Dumbbell,    title: 'Training Plans',    desc: 'Programs built for your exact goal and level — fat loss, muscle, or strength.', href: '/programs'  },
    { num: '02', icon: Apple,       title: 'Nutrition',         desc: 'Egyptian meal plans with real ingredients. Pick your goal and swap freely.',     href: '/nutrition' },
    { num: '03', icon: Activity,    title: 'Progress Tracking', desc: 'Log weight and measurements. Watch your body change with real weekly data.',     href: '/dashboard' },
    { num: '04', icon: Calculator,  title: 'Smart Calculators', desc: 'TDEE, BMI, 1RM, and Macros — every tool you need in one sharp interface.',       href: '/tools'     },
    { num: '05', icon: ShieldCheck, title: '100% Free',         desc: 'No subscriptions, no hidden fees. One minute to sign up. Start immediately.',    href: '/register'  },
  ];

  const steps = ar ? [
    { num: '01', title: 'أنشئ حسابك',   desc: 'إيميل وباسورد بس — دقيقة واحدة.' },
    { num: '02', title: 'حدد هدفك',     desc: 'أسئلة بسيطة عن مستواك وجدولك الأسبوعي.' },
    { num: '03', title: 'ابدأ برنامجك', desc: 'برنامج تدريبي وغذائي كامل مصمم ليك على طول.' },
  ] : [
    { num: '01', title: 'Create Account', desc: 'Email and password. One minute.' },
    { num: '02', title: 'Set Your Goal',  desc: 'Tell us your level and weekly schedule.' },
    { num: '03', title: 'Start Today',    desc: 'Full custom training and nutrition plan immediately.' },
  ];

  const valueProps = ar
    ? ['بدون اشتراكات نهائي', 'بدون إعلانات', 'مبني في مصر', 'تتبع حقيقي أسبوعي', 'خطط أكل مصرية']
    : ['NO SUBSCRIPTIONS', 'NO ADS', 'BUILT IN EGYPT', 'REAL WEEKLY TRACKING', 'EGYPTIAN MEAL PLANS'];

  return (
    <>
      <Head>
        <title>GYMZ — {ar ? 'ابنِ جسمك بخطة مخصصة' : 'Build Your Body. No Excuses.'}</title>
        <meta name="description" content={ar ? 'برامج تدريب وغذاء مخصصة لك — مجاناً.' : 'Custom training and nutrition plans — free.'} />
        <meta name="keywords" content="GYMZ, Gymez, جيمز, جيمس, جيم, gym app, تمارين, نظام غذائي, برامج تدريب, جيم مصر, fitness app Egypt" />
        <link rel="canonical" href="https://gymez.vercel.app/" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GYMZ" />
        <meta property="og:title" content="GYMZ — ابنِ جسمك بخطة مخصصة" />
        <meta property="og:description" content="برامج تدريب وغذاء مخصصة لك — مجاناً." />
        <meta property="og:url" content="https://gymez.vercel.app/" />
        <meta property="og:locale" content="ar_EG" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'GYMZ',
              alternateName: ['Gymez', 'Gymz', 'جيمز', 'جيمس', 'جيم زد'],
              url: 'https://gymez.vercel.app/',
              description: 'برامج تدريب وغذاء مخصصة — مجاناً',
              inLanguage: 'ar',
            }),
          }}
        />
      </Head>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: 'var(--bg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="bg-grid" />
        <div
          className="bg-glow-blur"
          style={{
            width: 420,
            height: 420,
            top: -120,
            right: ar ? 'auto' : '10%',
            left: ar ? '10%' : 'auto',
          }}
        />
        <div className="hero-scanlines" />
        <div className="hero-noise" />

        <div
          style={{
            position: 'absolute',
            right: ar ? 'auto' : 0,
            left: ar ? 0 : 'auto',
            top: 0,
            bottom: 0,
            width: '52%',
            background: 'radial-gradient(ellipse at center, rgba(255,90,31,0.07) 0%, rgba(255,90,31,0.015) 50%, transparent 75%)',
            clipPath: ar
              ? 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)'
              : 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: ar ? 'auto' : '48%',
            left: ar ? '48%' : 'auto',
            top: 0,
            bottom: 0,
            width: 2,
            background: 'linear-gradient(180deg, transparent 0%, var(--volt) 30%, var(--volt) 70%, transparent 100%)',
            opacity: 0.16,
            transform: 'skewX(-2deg)',
            pointerEvents: 'none',
          }}
        />

        {/* CONTENT */}
        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            padding: '84px 32px 36px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 44,
              width: '100%',
              maxWidth: 1200,
              margin: '0 auto',
              direction: ar ? 'rtl' : 'ltr',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {/* TEXT SIDE */}
            <div style={{ flex: '1 1 380px', minWidth: 280 }}>
              <motion.div
                initial={{ opacity: 0, x: ar ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}
              >
                <div className="rule-anim" style={{ width: 0, height: 2, background: 'var(--volt)' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: ar ? 0 : '0.18em',
                    color: 'var(--volt)',
                    textTransform: ar ? 'none' : 'uppercase',
                  }}
                >
                  {user
                    ? (ar ? `أهلاً / ${userName}` : `WELCOME BACK / ${userName}`)
                    : (ar ? 'GYMZ / 2026 / مجاناً' : 'GYMZ / 2026 / FREE')}
                </span>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--volt)',
                    animation: 'dotBlink 1.4s ease-in-out infinite',
                  }}
                />
              </motion.div>

              {/* HERO HEADLINE */}
              {(() => {
                const lines = user
                  ? (ar ? ['أهلاً', `يا ${userName}`] : ['BACK,', userName.toUpperCase()])
                  : (ar ? ['اتدرّب بذكاء.', 'سجّل كل عدة.', 'اسبق صحابك.'] : ['TRAIN SMARTER.', 'TRACK EVERY REP.', 'BEAT YOUR FRIENDS.']);

                return (
                  <h1 style={{ overflow: 'hidden', margin: 0, padding: 0 }}>
                    {lines.filter(Boolean).map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden', lineHeight: 1 }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: user ? 'clamp(2.6rem, 6vw, 4.6rem)' : 'clamp(3.5rem, 8.8vw, 7.2rem)',
                            lineHeight: 1.08,
                            color: i === 2 ? 'transparent' : i === 1 ? 'var(--volt)' : 'var(--chalk)',
                            WebkitTextStroke: i === 2 ? '2px var(--volt)' : '0',
                            letterSpacing: ar ? 0 : '-0.015em',
                            textTransform: ar ? 'none' : 'uppercase',
                            userSelect: 'none',
                          }}
                        >
                          {line}
                        </div>
                      </motion.div>
                    ))}
                  </h1>
                );
              })()}

              {/* SUBTITLE */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  color: 'var(--ash-light)',
                  fontSize: '0.88rem',
                  lineHeight: 1.75,
                  maxWidth: 390,
                  margin: '20px 0 28px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {user
                  ? (ar ? 'كمّل رحلتك من حيث وقفت — صفحتك فيها كل حاجة محتاجها.' : 'Continue your journey — your dashboard has everything you need.')
                  : (ar ? 'برنامج تدريب وتغذية ذكي، بيتابع كل تقدمك، وبيخليك ملتزم خطوة بخطوة.' : 'Smart programs, real-time rep tracking, and structured progress to keep you consistent.')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}
              >
                {user ? (
                  <>
                    <Link href="/workout">
                      <div className="btn btn-primary">
                        <Zap size={14} /> {ar ? 'ابدأ تمريني' : 'START WORKOUT'}
                        <ArrowRight size={14} style={{ transform: ar ? 'rotate(180deg)' : 'none' }} />
                      </div>
                    </Link>
                    <Link href="/dashboard">
                      <div className="btn btn-outline">
                        <BarChart3 size={14} /> {ar ? 'صفحتي' : 'DASHBOARD'}
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/register">
                      <div className="btn btn-primary">
                        <Zap size={14} /> {ar ? 'ابدأ مجاناً' : 'START FREE'}
                      </div>
                    </Link>
                    <Link href="/programs">
                      <div className="btn btn-outline">
                        {ar ? 'استكشف البرامج' : 'EXPLORE'}
                        <ArrowRight size={14} style={{ transform: ar ? 'rotate(180deg)' : 'none' }} />
                      </div>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* REAL STATS */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.68 }}
                style={{ display: 'flex', gap: 0, paddingTop: 20, borderTop: '1px solid var(--glass-border)' }}
              >
                {[
                  { val: stats.members,          suf: '',  label: ar ? 'متدرب مسجل' : 'MEMBERS'   },
                  { val: EXERCISES.length,       suf: '+', label: ar ? 'تمرين'      : 'EXERCISES' },
                  { val: PROGRAMS.length,        suf: '',  label: ar ? 'برامج'      : 'PROGRAMS'  },
                ].filter(({ val }) => val > 0).map(({ val, suf, label }, i) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      paddingInlineStart: i > 0 ? 20 : 0,
                      borderInlineStart: i > 0 ? '1px solid var(--glass-border)' : 'none',
                      marginInlineStart: i > 0 ? 20 : 0,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(1.6rem,3.5vw,2.8rem)',
                        color: 'var(--chalk)',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      <AnimatedCounter target={val} suffix={suf} />
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        letterSpacing: ar ? 0 : '0.14em',
                        color: 'var(--ash)',
                        marginTop: 4,
                        textTransform: ar ? 'none' : 'uppercase',
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* TRAINING PREVIEW — liquid glass editorial panel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.65 }}
              style={{ flexShrink: 0, width: '100%', maxWidth: 320, margin: '24px auto 0' }}
            >
              <div
                className="glass-card"
                style={{
                  padding: '22px 22px 18px',
                  direction: ar ? 'rtl' : 'ltr',
                }}
              >
                <span className="label-tag" style={{ color: 'var(--volt)' }}>
                  {ar ? 'ابدأ من هنا' : 'YOUR TRAINING'}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    letterSpacing: ar ? 0 : '0.03em',
                    color: 'var(--chalk)',
                    textTransform: ar ? 'none' : 'uppercase',
                    margin: '8px 0 16px',
                  }}
                >
                  {ar ? 'البرامج المتاحة' : 'AVAILABLE PROGRAMS'}
                </h3>

                {(() => {
                  const demo = programs.length > 0 ? programs : [
                    { title_ar: 'كامل الجسم', title_en: 'Full Body',   days_per_week: 3, level: 'beginner'     },
                    { title_ar: 'حرق الدهون', title_en: 'Fat Loss',    days_per_week: 4, level: 'intermediate' },
                    { title_ar: 'بناء العضل', title_en: 'Muscle Gain', days_per_week: 5, level: 'advanced'     },
                  ];
                  const levelLabel = ar
                    ? { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }
                    : { beginner: 'BEGINNER', intermediate: 'INTERMEDIATE', advanced: 'ADVANCED' };

                  return demo.slice(0, 3).map((p, i) => {
                    const name = ar
                      ? (p.title_ar || p.program_title_ar || p.program_title)
                      : (p.title_en || p.program_title || p.title_ar);
                    const days = p.days_per_week || p.days || 3;
                    const level = p.level || 'beginner';

                    return (
                      <Link key={i} href="/programs">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '12px 6px',
                            borderTop: i > 0 ? '1px solid var(--glass-border)' : 'none',
                            borderRadius: 6,
                            transition: 'background var(--transition-fast)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 600,
                                fontSize: '0.92rem',
                                color: 'var(--chalk)',
                              }}
                            >
                              {name}
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.62rem',
                                color: 'var(--ash)',
                                marginTop: 3,
                                textTransform: ar ? 'none' : 'uppercase',
                                letterSpacing: ar ? 0 : '0.08em',
                              }}
                            >
                              {days}× {ar ? 'أسبوعياً' : 'WEEK'} · {levelLabel[level] || level}
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            color="var(--ash)"
                            style={{ flexShrink: 0, transform: ar ? 'rotate(180deg)' : 'none' }}
                          />
                        </div>
                      </Link>
                    );
                  });
                })()}

                <Link href="/programs">
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 14,
                      borderTop: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--volt)',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: ar ? 0 : '0.12em',
                        textTransform: ar ? 'none' : 'uppercase',
                      }}
                    >
                      {ar ? 'شوف كل البرامج' : 'VIEW ALL PROGRAMS'}
                    </span>
                    <ArrowRight size={13} style={{ transform: ar ? 'rotate(180deg)' : 'none' }} />
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* BOTTOM STRIP */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(8, 8, 8, 0.80)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '14px 24px',
              gap: 'clamp(20px,5vw,56px)',
              flexWrap: 'wrap',
              direction: ar ? 'rtl' : 'ltr',
            }}
          >
            {[
              { icon: BarChart3,  label: ar ? 'تتبع التقدم' : 'PROGRESS',    href: '/dashboard' },
              { icon: Trophy,     label: ar ? 'البرامج'    : 'PROGRAMS',    href: '/programs'  },
              { icon: Apple,      label: ar ? 'التغذية'    : 'NUTRITION',   href: '/nutrition' },
              { icon: Calculator, label: ar ? 'الحاسبات'  : 'CALCULATORS', href: '/tools'     },
              { icon: Dumbbell,   label: ar ? 'التمارين'   : 'EXERCISES',   href: '/exercises' },
            ].map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    color: 'var(--ash)',
                    transition: 'color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--volt)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ash)'; }}
                >
                  <Icon size={14} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      letterSpacing: ar ? 0 : '0.14em',
                      textTransform: ar ? 'none' : 'uppercase',
                    }}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          VALUE STRIP
      ══════════════════════════════════════ */}
      <MarqueeStrip
        items={valueProps}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '16px 0',
        }}
        itemStyle={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: ar ? 0 : '0.16em',
          textTransform: ar ? 'none' : 'uppercase',
          color: 'var(--ash-light)',
          padding: '0 8px',
        }}
        duration="30s"
      />

      {/* ══════════════════════════════════════
          SERVICES — editorial rows
      ══════════════════════════════════════ */}
      <section style={{ padding: 'clamp(64px,10vw,120px) 32px', background: 'var(--bg)', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="rule-orange" />
                <span className="label-tag">{ar ? 'الخدمات' : 'FEATURES'}</span>
              </div>
              <h2 className="display-lg" style={{ color: 'var(--chalk)', whiteSpace: 'pre-line' }}>
                {ar ? 'كل اللي\nمحتاجه' : 'EVERYTHING\nYOU NEED'}
              </h2>
            </div>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.88rem', maxWidth: 340, lineHeight: 1.75 }}>
              {ar
                ? 'من التدريب للتغذية للحاسبات — GYMZ عنده كل أدواتك في مكان واحد.'
                : 'From training to nutrition to calculators — GYMZ has every tool you need.'}
            </p>
          </div>

          <div>
            {services.map((s, i) => (
              <ServiceRow key={s.num} s={s} i={i} ar={ar} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LOGGED-IN QUICK ACTIONS
      ══════════════════════════════════════ */}
      {user && (
        <section style={{ padding: 'clamp(48px,8vw,80px) 32px', background: 'var(--carbon)', direction: ar ? 'rtl' : 'ltr' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div className="rule-orange" />
              <span className="label-tag">{ar ? `أهلاً يا ${userName}` : `HEY, ${userName.toUpperCase()}`}</span>
            </div>

            <div
              className="quick-actions-grid"
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 12, alignItems: 'stretch' }}
            >
              <Link href="/workout">
                <div
                  className="glass-card card-hover"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: 220,
                    padding: '28px 26px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 'clamp(90px,10vw,140px)',
                      lineHeight: 1,
                      color: 'rgba(255, 255, 255, 0.04)',
                      position: 'absolute',
                      top: -10,
                      [ar ? 'left' : 'right']: 10,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    01
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span className="label-tag" style={{ color: 'var(--volt)' }}>
                      {ar ? 'الجلسة القادمة' : 'NEXT UP'}
                    </span>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(1.8rem,3vw,2.6rem)',
                        letterSpacing: ar ? 0 : '0.02em',
                        color: 'var(--chalk)',
                        textTransform: ar ? 'none' : 'uppercase',
                        margin: '10px 0 8px',
                      }}
                    >
                      {ar ? 'ابدأ جلستي' : 'START WORKOUT'}
                    </h3>
                    <p style={{ color: 'var(--ash-light)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 320 }}>
                      {ar ? 'سجّل تمرين جديد وتابع كل عدة دلوقتي.' : 'Log a new session and track every rep now.'}
                    </p>
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--volt)' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: ar ? 0 : '0.14em',
                        textTransform: ar ? 'none' : 'uppercase',
                      }}
                    >
                      {ar ? 'ابدأ الآن' : 'BEGIN NOW'}
                    </span>
                    <ArrowRight size={16} style={{ transform: ar ? 'rotate(180deg)' : 'none' }} />
                  </div>
                </div>
              </Link>

              <div
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {[
                  { href: '/dashboard', icon: BarChart3, title: ar ? 'تقدمي'         : 'MY PROGRESS',    desc: ar ? 'أرقامك ومؤشراتك الأسبوعية' : 'Weekly stats and numbers'    },
                  { href: '/programs',  icon: Dumbbell,  title: ar ? 'برامجي'         : 'MY PROGRAMS',    desc: ar ? 'استكشف وغيّر برنامجك'       : 'Explore and switch programs' },
                  { href: '/nutrition', icon: Apple,     title: ar ? 'خطتي الغذائية' : 'NUTRITION PLAN', desc: ar ? 'وجباتك وسعراتك اليومية'     : 'Meals and daily calories'    },
                ].map(({ href, icon: Icon, title, desc }, i) => (
                  <Link key={href} href={href}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 18px',
                        borderTop: i > 0 ? '1px solid var(--glass-border)' : 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'background var(--transition-base)',
                        direction: ar ? 'rtl' : 'ltr',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon size={17} color="var(--volt)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--chalk)' }}>
                          {title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ash)', marginTop: 2 }}>{desc}</div>
                      </div>
                      <ChevronRight
                        size={14}
                        color="var(--ash)"
                        style={{ flexShrink: 0, transform: ar ? 'rotate(180deg)' : 'none' }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <style>{`
              @media (max-width: 720px) {
                .quick-actions-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        </section>
      )}

      {/* HOW IT WORKS — for new visitors only */}
      {!user && (
        <section
          style={{
            padding: 'clamp(64px,10vw,120px) 32px',
            background: 'var(--carbon)',
            direction: ar ? 'rtl' : 'ltr',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(200px,30vw,300px)',
              color: 'rgba(255,90,31,0.03)',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            GYMZ
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="rule-orange" />
              <span className="label-tag">{ar ? 'كيف تبدأ' : 'HOW IT WORKS'}</span>
            </div>
            <h2 className="display-lg" style={{ color: 'var(--chalk)', marginBottom: 64, whiteSpace: 'pre-line' }}>
              {ar ? '٣ خطوات\nبس وانت جاهز' : 'THREE STEPS.\nTHATS IT.'}
            </h2>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 34,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'var(--glass-border)',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 40,
                  position: 'relative',
                }}
              >
                {steps.map((s, i) => (
                  <StepItem key={s.num} s={s} i={i} ar={ar} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          CTA — inverted (#FF5A1F bg)
      ══════════════════════════════════════ */}
      {!user && (
        <section
          style={{
            background: 'var(--volt)',
            padding: 'clamp(64px,10vw,100px) 32px',
            position: 'relative',
            overflow: 'hidden',
            direction: ar ? 'rtl' : 'ltr',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(8,8,8,0.05) 0, rgba(8,8,8,0.05) 1px, transparent 1px, transparent 12px)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 3, background: '#fff', borderRadius: 2 }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: ar ? 0 : '0.16em',
                      textTransform: ar ? 'none' : 'uppercase',
                      color: '#080808',
                    }}
                  >
                    {ar ? 'مجاناً تماماً • بدون أعذار' : 'COMPLETELY FREE • NO EXCUSES'}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(3rem,8vw,6.8rem)',
                    lineHeight: 0.96,
                    color: '#fff',
                    textTransform: ar ? 'none' : 'uppercase',
                    marginBottom: 16,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {ar ? 'ابدأ\nرحلتك\nدلوقتي' : 'START\nYOUR\nJOURNEY'}
                </h2>
                <p style={{ color: '#080808', fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 390 }}>
                  {ar
                    ? 'انضم لآلاف المتدربين اللي بيحققوا نتائج حقيقية مع GYMZ.'
                    : 'Join thousands of athletes achieving real results with GYMZ.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/register">
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      background: '#080808',
                      color: '#fff',
                      padding: '16px 32px',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      letterSpacing: ar ? 0 : '0.06em',
                      cursor: 'pointer',
                      boxShadow: '4px 4px 0 rgba(8, 8, 8, 0.28)',
                      textTransform: ar ? 'none' : 'uppercase',
                    }}
                  >
                    <Zap size={16} /> {ar ? 'أنشئ حسابك' : 'CREATE ACCOUNT'}
                  </motion.div>
                </Link>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: ar ? 0 : '0.1em',
                    color: '#080808',
                    textTransform: ar ? 'none' : 'uppercase',
                  }}
                >
                  {ar ? '✓ مجاناً  ✓ بدون بطاقة  ✓ دقيقة واحدة' : '✓ FREE  ✓ NO CARD  ✓ ONE MINUTE'}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      <style>{`
        .rule-anim { animation: slideInRule 0.6s 0.3s ease-out forwards; }
        @keyframes slideInRule { from { width: 0; } to { width: 32px; } }
      `}</style>
    </>
  );
}
