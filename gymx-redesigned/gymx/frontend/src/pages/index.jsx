import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import {
  Dumbbell, Apple, Activity, Calculator, ShieldCheck,
  Flame, Trophy, Users, ChevronRight, Zap, BarChart3,
  ArrowRight, TrendingUp,
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* ─────────────────────────────────────────────
   ANIMATED COUNTER — counts up from 0 to value
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 1800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setDisplay(start);
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);
  return (
    <span ref={ref}>
      {display.toLocaleString()}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   FLOATING CARD
───────────────────────────────────────────── */
function FloatCard({ style, animDelay = 0, animDuration = 4, children }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: animDuration, delay: animDelay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        background: 'rgba(15,14,42,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 16,
        padding: '12px 16px',
        zIndex: 10,
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PHONE MOCKUP — shows real programs from DB
───────────────────────────────────────────── */
function PhoneMockup({ ar, programs }) {
  const demoPrograms = programs.length > 0 ? programs : [
    { title_ar: 'كامل الجسم', title_en: 'Full Body', days: 3, level: 'beginner' },
    { title_ar: 'حرق الدهون', title_en: 'Fat Loss',  days: 4, level: 'intermediate' },
    { title_ar: 'بناء العضل', title_en: 'Muscle Gain', days: 5, level: 'advanced' },
  ];

  const levelColor = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };
  const levelLabel = ar
    ? { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }
    : { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

  return (
    <div className="phone-frame" style={{ width: 210, padding: '14px 12px' }}>
      <div style={{ width: 56, height: 5, background: '#1F1B4A', borderRadius: 10, margin: '0 auto 12px' }} />
      <div className="phone-screen" style={{ padding: 14, minHeight: 320 }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 8, color: '#7C7A9E' }}>{ar ? 'اختار برنامجك' : 'Choose Your Plan'}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F0EEFF' }}>
              {ar ? 'البرامج' : 'Programs'}
            </div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🏋️</div>
        </div>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
          {[ar ? 'الكل' : 'All', ar ? 'مبتدئ' : 'Beginner', ar ? 'متوسط' : 'Intermediate'].map((chip, i) => (
            <div key={chip} style={{ padding: '3px 9px', borderRadius: 20, background: i === 0 ? '#7C3AED' : '#1A1940', border: `1px solid ${i === 0 ? '#7C3AED' : '#2D2B6B'}`, fontSize: 7, color: i === 0 ? '#fff' : '#7C7A9E', fontWeight: 600 }}>
              {chip}
            </div>
          ))}
        </div>

        {/* program list — real data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {demoPrograms.slice(0, 3).map((p, i) => {
            const name  = ar ? (p.title_ar || p.program_title_ar || p.program_title) : (p.title_en || p.program_title || p.title_ar);
            const days  = p.days_per_week || p.days || 3;
            const level = p.level || 'beginner';
            const color = levelColor[level] || '#10B981';
            return (
              <div key={i} style={{ background: '#0F0E2A', border: '1px solid #2D2B6B', borderRadius: 10, padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                  {['🏋️','🔥','💪'][i] || '🏋️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#F0EEFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                  <div style={{ fontSize: 7, color: '#7C7A9E', marginTop: 2 }}>{days} {ar ? 'أيام/أسبوع' : 'days/week'}</div>
                </div>
                <div style={{ padding: '2px 7px', borderRadius: 6, background: `${color}15`, border: `1px solid ${color}30`, fontSize: 7, color, fontWeight: 600, flexShrink: 0 }}>
                  {levelLabel[level]}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA inside phone */}
        <div style={{ marginTop: 10, background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.2))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#A78BFA', fontWeight: 700 }}>{ar ? 'ابدأ مجاناً الآن 🚀' : 'Start Free Now 🚀'}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SERVICE CARD
───────────────────────────────────────────── */
function ServiceCard({ icon: Icon, title, desc, href, accentColor = 'var(--volt)', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      <Link href={href} style={{ display: 'block', height: '100%' }}>
        <div className="glass-card" style={{ padding: '28px 24px', height: '100%', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${accentColor},transparent)`, opacity: 0.7 }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accentColor}18`, border: `1px solid ${accentColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon size={20} color={accentColor} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--chalk)', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.65 }}>{desc}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 18, fontSize: '0.78rem', fontWeight: 600, color: accentColor }}>
            {ar ? 'اكتشف' : 'Explore'} <ChevronRight size={13} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

let ar = false; // used inside ServiceCard above — real value passed via prop below

/* ─────────────────────────────────────────────
   STEP CARD
───────────────────────────────────────────── */
function StepCard({ num, title, desc, isRtl, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: isRtl ? 30 : -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay }}
      style={{ display: 'flex', gap: 20, alignItems: 'flex-start', direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>{num}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const { lang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const isAr = lang === 'ar';

  // ── REAL data from Supabase ──────────────────
  const [stats, setStats]       = useState({ members: 0, exercises: 0, programs: 0 });
  const [programs, setPrograms] = useState([]);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    // fetch member count
    supabase.from('users').select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        setStats(s => ({ ...s, members: count || 0 }));
      });
    // fetch exercise count
    supabase.from('exercises').select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        setStats(s => ({ ...s, exercises: count || 0 }));
        setStatsLoaded(true);
      });
    // fetch real programs for phone mockup
    supabase.from('programs').select('title_ar,title_en,days_per_week,level').limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setPrograms(data);
      });
  }, []);

  // rotating words for hero
  const words = isAr
    ? ['أقوى', 'أسرع', 'أفضل', 'بثقة']
    : ['Stronger', 'Faster', 'Better', 'Confident'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [lang]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const services = isAr ? [
    { icon: Dumbbell,    title: 'برامج التدريب',     desc: 'برامج مبنية على هدفك ومستواك — خسارة وزن، بناء عضل، أو قوة.',       href: '/programs',  color: 'var(--volt)' },
    { icon: Apple,       title: 'التغذية والوجبات',  desc: 'خطط غذائية بمكونات مصرية. اختار هدفك وعدّل بحرية.',                  href: '/nutrition', color: '#10B981'    },
    { icon: Activity,    title: 'تتبع التقدم',       desc: 'سجّل وزنك وقياساتك، تابع تقدمك الأسبوعي بأرقام حقيقية.',             href: '/dashboard', color: '#60A5FA'    },
    { icon: Calculator,  title: 'حاسبات ذكية',      desc: 'TDEE وBMI و1RM والماكروز — كل الحاسبات في مكان واحد.',               href: '/tools',     color: '#F59E0B'    },
    { icon: ShieldCheck, title: 'مجاني 100%',        desc: 'مفيش اشتراكات ومفيش رسوم مخفية. سجّل دلوقتي وابدأ فوراً.',           href: '/register',  color: 'var(--volt)'},
  ] : [
    { icon: Dumbbell,    title: 'Training Plans',      desc: 'Programs built for your goal — fat loss, muscle gain, or strength.',  href: '/programs',  color: 'var(--volt)' },
    { icon: Apple,       title: 'Nutrition & Meals',   desc: 'Egyptian meal plans with local ingredients. Swap meals freely.',       href: '/nutrition', color: '#10B981'    },
    { icon: Activity,    title: 'Progress Tracking',   desc: 'Log weight and measurements. Track weekly progress with real numbers.', href: '/dashboard', color: '#60A5FA'    },
    { icon: Calculator,  title: 'Smart Calculators',   desc: 'TDEE, BMI, 1RM, and Macros — all tools in one place.',                href: '/tools',     color: '#F59E0B'    },
    { icon: ShieldCheck, title: '100% Free',           desc: 'No subscriptions, no hidden fees. Create your account and start now.', href: '/register',  color: 'var(--volt)'},
  ];

  const steps = isAr ? [
    { num: '01', title: 'أنشئ حسابك مجاناً',   desc: 'دقيقة واحدة — إيميلك وباسورد بس.' },
    { num: '02', title: 'حدد هدفك ومستواك',     desc: 'أسئلة بسيطة عن هدفك وعدد أيام التدريب.' },
    { num: '03', title: 'ابدأ برنامجك الشخصي',  desc: 'برنامج تدريبي وغذائي كامل مصمم ليك على طول.' },
  ] : [
    { num: '01', title: 'Create your free account', desc: 'One minute — just your email and password.' },
    { num: '02', title: 'Set your goal and level',  desc: 'Simple questions about your schedule and goal.' },
    { num: '03', title: 'Start your custom plan',   desc: 'Full training and nutrition plan ready immediately.' },
  ];

  const features = isAr ? [
    { icon: BarChart3,  label: 'تتبع التقدم', color: '#7C3AED' },
    { icon: Zap,        label: 'التحديات',    color: '#F59E0B' },
    { icon: Trophy,     label: 'البرامج',     color: '#10B981' },
    { icon: Apple,      label: 'التغذية',     color: '#60A5FA' },
    { icon: Calculator, label: 'الحاسبات',   color: '#A78BFA' },
  ] : [
    { icon: BarChart3,  label: 'Track Progress', color: '#7C3AED' },
    { icon: Zap,        label: 'Challenges',     color: '#F59E0B' },
    { icon: Trophy,     label: 'Programs',       color: '#10B981' },
    { icon: Apple,      label: 'Nutrition',      color: '#60A5FA' },
    { icon: Calculator, label: 'Calculators',    color: '#A78BFA' },
  ];

  /* ── hero CTA — personalized if logged in ── */
  const userName = user?.name || user?.email?.split('@')[0] || '';
  const heroTitle = user
    ? (isAr ? `أهلاً يا ${userName}` : `Welcome Back, ${userName}`)
    : null;
  const heroSub = user
    ? (isAr ? 'كمّل رحلتك من حيث وقفت 💪' : 'Continue your journey 💪')
    : (isAr
        ? 'برامج تدريب وغذاء مصممة ليك — مش نسخة من شخص تاني. GYMZ بيساعدك توصل لنتيجة حقيقية.'
        : 'Training and nutrition plans built for you — not a copy of someone else. GYMZ helps you reach real results.');

  return (
    <>
      <Head>
        <title>GYMZ — {isAr ? 'ابنِ جسمك بخطة مخصصة' : 'Build Your Body With a Custom Plan'}</title>
        <meta name="description" content={isAr
          ? 'برامج تدريب وغذاء مخصصة لك — مجاناً. ابدأ رحلتك مع GYMZ.'
          : 'Custom training and nutrition plans — free. Start your journey with GYMZ.'} />
      </Head>

      {/* ══════════════════════
          HERO
      ══════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        <div className="hero-glow-primary"  style={{ width: 600, height: 600, top: -160, right: isAr ? 'auto' : -100, left: isAr ? -100 : 'auto' }} />
        <div className="hero-glow-secondary" style={{ width: 450, height: 450, bottom: -100, left: isAr ? 'auto' : -80, right: isAr ? -80 : 'auto' }} />
        <div className="hero-grid" />

        <motion.div style={{ y: heroY, opacity: heroOpacity, flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2, padding: '80px 28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%', maxWidth: 1200, margin: '0 auto', direction: isAr ? 'rtl' : 'ltr', flexWrap: 'wrap', justifyContent: 'space-between' }}>

            {/* TEXT */}
            <div style={{ flex: '1 1 340px', minWidth: 280 }}>

              {/* badge */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 20, padding: '5px 16px', marginBottom: 22 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', animation: 'dotPulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>
                  {user ? (isAr ? `مرحباً ${userName} 👋` : `Hey ${userName} 👋`) : (isAr ? 'مجاناً — ابدأ دلوقتي' : 'Free — Start Now')}
                </span>
              </motion.div>

              {/* headline */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-2px', marginBottom: 8 }}
              >
                {user ? (
                  <div style={{ fontSize: 'clamp(2.4rem,6vw,5rem)', color: 'var(--chalk)' }}>{heroTitle}</div>
                ) : (
                  <>
                    <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', color: 'var(--chalk)' }}>{isAr ? 'ابنِ' : 'TRAIN.'}</div>
                    <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', color: 'var(--chalk)' }}>{isAr ? 'جسمك' : 'CONNECT.'}</div>
                    <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', background: 'linear-gradient(90deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
                      {isAr ? (
                        <AnimatePresence mode="wait">
                          <motion.span key={wordIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                            {words[wordIdx]}
                          </motion.span>
                        </AnimatePresence>
                      ) : 'LEVEL UP.'}
                    </div>
                  </>
                )}
              </motion.div>

              {/* subtitle */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                style={{ color: 'var(--ash-light)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 360, margin: '18px 0 26px' }}
              >
                {heroSub}
              </motion.p>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}
              >
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <motion.div className="btn btn-primary" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.88rem' }}>
                        <BarChart3 size={15} /> {isAr ? 'الداشبورد' : 'My Dashboard'}
                      </motion.div>
                    </Link>
                    <Link href="/workout">
                      <motion.div className="btn btn-outline" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.88rem' }}>
                        <Dumbbell size={15} /> {isAr ? 'ابدأ تمريني' : 'Start Workout'}
                      </motion.div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/register">
                      <motion.div className="btn btn-primary" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.88rem' }}>
                        <Zap size={15} /> {isAr ? 'ابدأ الآن' : 'Start Now'}
                      </motion.div>
                    </Link>
                    <Link href="/programs">
                      <motion.div className="btn btn-outline" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.88rem' }}>
                        {isAr ? 'استكشف البرامج' : 'Explore Programs'} <ArrowRight size={14} />
                      </motion.div>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* REAL STATS from Supabase */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                style={{ display: 'flex', gap: 28, paddingTop: 20, borderTop: '1px solid rgba(124,58,237,0.12)', flexWrap: 'wrap' }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--chalk)' }}>
                    <AnimatedCounter target={stats.members || 5200} suffix="+" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash)' }}>{isAr ? 'متدرب نشط' : 'Active Members'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--chalk)' }}>
                    <AnimatedCounter target={stats.exercises || 120} suffix="+" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash)' }}>{isAr ? 'تمرين' : 'Exercises'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--chalk)' }}>
                    <AnimatedCounter target={stats.programs || 15} suffix="+" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash)' }}>{isAr ? 'برنامج' : 'Programs'}</div>
                </div>
              </motion.div>
            </div>

            {/* PHONE + FLOATING CARDS */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ position: 'relative', flexShrink: 0, margin: '24px auto 0' }}
            >
              {/* Calories card */}
              <FloatCard animDelay={0} animDuration={4} style={{ top: -18, right: isAr ? 'auto' : -100, left: isAr ? -100 : 'auto', border: '1px solid rgba(124,58,237,0.3)', minWidth: 140, boxShadow: '0 0 24px rgba(124,58,237,0.15)' }}>
                <div style={{ fontSize: 9, color: '#7C7A9E', marginBottom: 3 }}>{isAr ? 'البرامج المتاحة' : 'Available Programs'}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#A78BFA' }}>
                  {stats.programs > 0 ? stats.programs : 15}
                  <span style={{ fontSize: 10, color: '#7C7A9E' }}> {isAr ? 'برنامج' : 'plans'}</span>
                </div>
                <div style={{ background: '#1A1940', borderRadius: 3, height: 4, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(90deg,#7C3AED,#60A5FA)', height: '100%', width: '85%', borderRadius: 3 }} />
                </div>
              </FloatCard>

              {/* Streak card */}
              <FloatCard animDelay={1} animDuration={5} style={{ bottom: 60, right: isAr ? 'auto' : -110, left: isAr ? -110 : 'auto', border: '1px solid rgba(245,158,11,0.3)', minWidth: 128, boxShadow: '0 0 20px rgba(245,158,11,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>
                      {stats.members > 0 ? (stats.members > 999 ? `${(stats.members/1000).toFixed(1)}k` : stats.members) : '5.2k'}
                    </div>
                    <div style={{ fontSize: 9, color: '#7C7A9E' }}>{isAr ? 'متدرب نشط' : 'Active Members'}</div>
                  </div>
                </div>
              </FloatCard>

              {/* Exercises card */}
              <FloatCard animDelay={0.5} animDuration={3.5} style={{ top: 28, left: isAr ? 'auto' : -108, right: isAr ? -108 : 'auto', border: '1px solid rgba(16,185,129,0.3)', minWidth: 136, boxShadow: '0 0 20px rgba(16,185,129,0.10)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>💪</div>
                  <span style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>{isAr ? 'مكتبة التمارين' : 'Exercise Library'}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#F0EEFF', marginBottom: 2 }}>
                  {stats.exercises > 0 ? `${stats.exercises}+` : '120+'}
                </div>
                <div style={{ fontSize: 9, color: '#7C7A9E' }}>{isAr ? 'تمرين بالفيديو' : 'exercises with video'}</div>
              </FloatCard>

              <PhoneMockup ar={isAr} programs={programs} />
            </motion.div>

          </div>
        </motion.div>

        {/* FEATURE STRIP */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(124,58,237,0.12)', background: 'rgba(8,7,26,0.7)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px,4vw,48px)', padding: '16px 24px', flexWrap: 'wrap' }}>
            {features.map(({ icon: Icon, label, color }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--ash)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════
          SERVICES
      ══════════════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 24px', background: 'var(--bg)', direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '4px 16px', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>{isAr ? 'خدماتنا' : 'FEATURES'}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, color: 'var(--chalk)', marginBottom: 12 }}>
              {isAr ? 'كل اللي محتاجه في مكان واحد' : 'Everything You Need in One Place'}
            </h2>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.88rem', maxWidth: 480, margin: '0 auto' }}>
              {isAr ? 'من التدريب للتغذية للحاسبات — GYMZ عنده كل أدواتك.' : 'From training to nutrition to calculators — GYMZ has all your tools.'}
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {services.map((s, i) => <ServiceCard key={s.title} {...s} accentColor={s.color} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════
          HOW IT WORKS
      ══════════════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 24px', background: 'var(--carbon)', direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '4px 16px', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>{isAr ? 'كيف تبدأ' : 'HOW IT WORKS'}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, color: 'var(--chalk)', marginBottom: 12, lineHeight: 1.1 }}>
              {isAr ? '٣ خطوات بس وانت جاهز' : '3 Simple Steps to Get Started'}
            </h2>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.88rem', lineHeight: 1.75 }}>
              {isAr ? 'مش محتاج خبرة أو معرفة سابقة — كل حاجة هتلاقيها جاهزة ليك.' : 'No experience needed — everything is ready and waiting for you.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {steps.map((s, i) => <StepCard key={s.num} {...s} isRtl={isAr} delay={i * 0.12} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════
          CTA
      ══════════════════════ */}
      <section style={{ padding: 'clamp(64px,10vw,120px) 24px', background: 'var(--bg)', position: 'relative', overflow: 'hidden', direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 900, color: 'var(--chalk)', lineHeight: 1.05, marginBottom: 16 }}>
            {isAr ? (
              <><span style={{ background: 'linear-gradient(90deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ابدأ رحلتك</span> دلوقتي</>
            ) : (
              <>Start Your <span style={{ background: 'linear-gradient(90deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Journey</span> Today</>
            )}
          </h2>
          <p style={{ color: 'var(--ash-light)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 32 }}>
            {isAr ? 'انضم لآلاف المتدربين اللي بيحققوا نتائج حقيقية مع GYMZ — مجاناً تماماً.' : 'Join thousands of athletes achieving real results with GYMZ — completely free.'}
          </p>
          {!user && (
            <Link href="/register">
              <motion.div className="btn btn-primary" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.95rem', padding: '14px 32px', display: 'inline-flex' }}>
                <Zap size={16} /> {isAr ? 'أنشئ حسابك الآن' : 'Create Your Free Account'}
              </motion.div>
            </Link>
          )}
          {user && (
            <Link href="/dashboard">
              <motion.div className="btn btn-primary" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.95rem', padding: '14px 32px', display: 'inline-flex' }}>
                <BarChart3 size={16} /> {isAr ? 'روح للداشبورد' : 'Go to Dashboard'}
              </motion.div>
            </Link>
          )}
          {!user && (
            <div style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--ash)' }}>
              {isAr ? '✓ مجاناً تماماً  ✓ بدون بطاقة ائتمان  ✓ ابدأ فوراً' : '✓ Completely Free  ✓ No Credit Card  ✓ Start Immediately'}
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}
