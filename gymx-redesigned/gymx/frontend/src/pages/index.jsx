import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import {
  Dumbbell, Apple, Activity, Calculator, ShieldCheck,
  ArrowRight, Zap, BarChart3, Trophy, ChevronRight,
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 1600 }) {
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
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   FLOATING CARD
───────────────────────────────────────────── */
function FloatCard({ style, animDelay = 0, animDuration = 4, children }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0], rotate: [0, 0.5, 0] }}
      transition={{ duration: animDuration, delay: animDelay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        background: 'rgba(11,11,11,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        zIndex: 10,
        boxShadow: '4px 4px 0 rgba(255,85,0,0.15), 0 8px 40px rgba(0,0,0,0.6)',
        border: '1px solid var(--iron-light)',
        borderLeft: '3px solid var(--volt)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PHONE MOCKUP — real programs
───────────────────────────────────────────── */
function PhoneMockup({ ar, programs }) {
  const demo = programs.length > 0 ? programs : [
    { title_ar: 'كامل الجسم',  title_en: 'Full Body',   days_per_week: 3, level: 'beginner'     },
    { title_ar: 'حرق الدهون',  title_en: 'Fat Loss',    days_per_week: 4, level: 'intermediate' },
    { title_ar: 'بناء العضل',  title_en: 'Muscle Gain', days_per_week: 5, level: 'advanced'     },
  ];
  const levelLabel = ar
    ? { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }
    : { beginner: 'BGNNR', intermediate: 'INTER', advanced: 'ADVNC' };

  return (
    <div className="phone-frame" style={{ width: 205, padding: '14px 12px', transform: 'rotate(-3deg)' }}>
      <div style={{ width: 50, height: 4, background: 'var(--iron-light)', borderRadius: 2, margin: '0 auto 12px' }} />
      <div className="phone-screen" style={{ padding: 13 }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--ash)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
              {ar ? 'اختار' : 'SELECT'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--chalk)', letterSpacing: '0.05em' }}>
              {ar ? 'البرامج' : 'PROGRAMS'}
            </div>
          </div>
          <div style={{ width: 28, height: 28, background: 'var(--volt)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: 14, color: '#fff' }}>G</div>
        </div>

        {/* orange divider */}
        <div style={{ height: 2, background: 'var(--volt)', borderRadius: 1, marginBottom: 10, width: '40%' }} />

        {/* programs */}
        {demo.slice(0, 3).map((p, i) => {
          const name  = ar ? (p.title_ar || p.program_title_ar || p.program_title) : (p.title_en || p.program_title || p.title_ar);
          const days  = p.days_per_week || p.days || 3;
          const level = p.level || 'beginner';
          return (
            <div key={i} style={{ background: '#111', borderLeft: i === 0 ? '3px solid var(--volt)' : '3px solid var(--iron-light)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: i === 0 ? 'var(--volt)' : 'var(--chalk)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--ash)', marginTop: 2 }}>{days}×{ar ? 'أسبوع' : 'WEEK'}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: i === 0 ? 'var(--volt)' : 'var(--ash)', border: `1px solid ${i === 0 ? 'var(--volt)' : 'var(--iron-light)'}`, padding: '2px 5px', borderRadius: 2 }}>
                {levelLabel[level]}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--volt)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#fff', letterSpacing: '0.1em' }}>
            {ar ? 'ابدأ مجاناً' : 'START FREE'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SERVICE ROW ITEM
───────────────────────────────────────────── */
function ServiceRow({ s, i, ar }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: ar ? 30 : -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.07 }}
    >
      <Link href={s.href}>
        <div className="service-row" style={{ direction: ar ? 'rtl' : 'ltr', cursor: 'pointer' }}>
          <div className="service-num">{s.num}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <s.icon size={16} color="var(--volt)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.05em', color: 'var(--chalk)', textTransform: 'uppercase' }}>{s.title}</h3>
              </div>
              <p style={{ color: 'var(--ash-light)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 500 }}>{s.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--volt)', flexShrink: 0, marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{ar ? 'اكتشف' : 'EXPLORE'}</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STEP CARD ITEM
───────────────────────────────────────────── */
function StepItem({ s, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      style={{ padding: '32px 28px', borderLeft: i > 0 ? '1px solid var(--iron-light)' : 'none', position: 'relative' }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'var(--volt)', lineHeight: 1, marginBottom: 16, opacity: 0.9 }}>{s.num}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.05em', color: 'var(--chalk)', textTransform: 'uppercase', marginBottom: 10 }}>{s.title}</h3>
      <p style={{ color: 'var(--ash-light)', fontSize: '0.85rem', lineHeight: 1.7 }}>{s.desc}</p>
      <div style={{ position: 'absolute', bottom: 0, left: 28, width: 24, height: 2, background: 'var(--volt)' }} />
    </motion.div>
  );
}
export default function HomePage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const ar = lang === 'ar';

  const [stats,    setStats]    = useState({ members: 0, exercises: 0, programs: 0 });
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    supabase.from('users').select('id', { count: 'exact', head: true }).then(({ count }) => setStats(s => ({ ...s, members: count || 0 })));
    supabase.from('exercises').select('id', { count: 'exact', head: true }).then(({ count }) => setStats(s => ({ ...s, exercises: count || 0 })));
    supabase.from('programs').select('id', { count: 'exact', head: true }).then(({ count }) => setStats(s => ({ ...s, programs: count || 0 })));
    supabase.from('programs').select('title_ar,title_en,days_per_week,level').limit(3).then(({ data }) => { if (data?.length) setPrograms(data); });
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  const services = ar ? [
    { num: '01', icon: Dumbbell,    title: 'برامج التدريب',    desc: 'برامج مبنية على هدفك ومستواك — خسارة وزن، بناء عضل، أو قوة. جدول أسبوعي واضح.',      href: '/programs'  },
    { num: '02', icon: Apple,       title: 'التغذية والوجبات', desc: 'خطط غذائية بمكونات مصرية جاهزة. اختار هدفك وعدّل الوجبات بحرية كاملة.',               href: '/nutrition' },
    { num: '03', icon: Activity,    title: 'تتبع التقدم',      desc: 'سجّل وزنك وقياساتك أسبوعياً. شوف كيف جسمك بيتغير بأرقام حقيقية على مدار الوقت.',      href: '/dashboard' },
    { num: '04', icon: Calculator,  title: 'حاسبات ذكية',     desc: 'TDEE وBMI و1RM والماكروز — كل الحاسبات اللي محتاجها في مكان واحد بدون تعقيد.',          href: '/tools'     },
    { num: '05', icon: ShieldCheck, title: 'مجاني 100%',       desc: 'مفيش اشتراكات ومفيش رسوم مخفية. انشئ حسابك في دقيقة وابدأ رحلتك فوراً.',             href: '/register'  },
  ] : [
    { num: '01', icon: Dumbbell,    title: 'Training Plans',    desc: 'Programs built for your exact goal and level — fat loss, muscle, or strength.',    href: '/programs'  },
    { num: '02', icon: Apple,       title: 'Nutrition',         desc: 'Egyptian meal plans with real ingredients. Pick your goal and swap freely.',        href: '/nutrition' },
    { num: '03', icon: Activity,    title: 'Progress Tracking', desc: 'Log weight and measurements. Watch your body change with real weekly data.',        href: '/dashboard' },
    { num: '04', icon: Calculator,  title: 'Smart Calculators', desc: 'TDEE, BMI, 1RM, and Macros — every tool you need in one sharp interface.',          href: '/tools'     },
    { num: '05', icon: ShieldCheck, title: '100% Free',         desc: 'No subscriptions, no hidden fees. One minute to sign up. Start immediately.',       href: '/register'  },
  ];

  const steps = ar ? [
    { num: '01', title: 'أنشئ حسابك',    desc: 'إيميل وباسورد بس — دقيقة واحدة.' },
    { num: '02', title: 'حدد هدفك',      desc: 'أسئلة بسيطة عن مستواك وجدولك الأسبوعي.' },
    { num: '03', title: 'ابدأ برنامجك',  desc: 'برنامج تدريبي وغذائي كامل مصمم ليك على طول.' },
  ] : [
    { num: '01', title: 'Create Account', desc: 'Email and password. One minute.' },
    { num: '02', title: 'Set Your Goal',  desc: 'Tell us your level and weekly schedule.' },
    { num: '03', title: 'Start Today',    desc: 'Full custom training and nutrition plan immediately.' },
  ];

  return (
    <>
      <Head>
        <title>GYMZ — {ar ? 'ابنِ جسمك بخطة مخصصة' : 'Build Your Body. No Excuses.'}</title>
        <meta name="description" content={ar ? 'برامج تدريب وغذاء مخصصة لك — مجاناً.' : 'Custom training and nutrition plans — free.'} />
      </Head>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', background: '#080808', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* scanlines */}
        <div className="hero-scanlines" />
        {/* noise */}
        <div className="hero-noise" />

        {/* orange diagonal glow — right side */}
        <div style={{
          position: 'absolute',
          right: ar ? 'auto' : 0, left: ar ? 0 : 'auto',
          top: 0, bottom: 0,
          width: '52%',
          background: 'radial-gradient(ellipse at center, rgba(255,85,0,0.13) 0%, rgba(255,85,0,0.04) 50%, transparent 75%)',
          clipPath: ar
            ? 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)'
            : 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
          pointerEvents: 'none',
        }} />

        {/* diagonal orange accent line */}
        <div style={{
          position: 'absolute',
          right: ar ? 'auto' : '48%', left: ar ? '48%' : 'auto',
          top: 0, bottom: 0,
          width: 2,
          background: 'linear-gradient(180deg, transparent 0%, var(--volt) 30%, var(--volt) 70%, transparent 100%)',
          opacity: 0.25,
          transform: 'skewX(-2deg)',
          pointerEvents: 'none',
        }} />

        {/* CONTENT */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2, padding: '80px 32px 32px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            direction: ar ? 'rtl' : 'ltr',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>

            {/* TEXT SIDE */}
            <div style={{ flex: '1 1 360px', minWidth: 280 }}>

              {/* pre-title */}
              <motion.div
                initial={{ opacity: 0, x: ar ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}
              >
                <div style={{ width: 0, height: 2, background: 'var(--volt)', animation: 'slideInRule 0.6s 0.3s ease-out forwards' }} className="rule-anim" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--volt)', textTransform: 'uppercase' }}>
                  {user ? (ar ? `أهلاً / ${userName}` : `WELCOME BACK / ${userName}`) : (ar ? 'GYMZ / 2026 / مجاناً' : 'GYMZ / 2026 / FREE')}
                </span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--volt)', animation: 'dotBlink 1.4s ease-in-out infinite' }} />
              </motion.div>

              {/* HERO HEADLINE — massive Bebas Neue */}
              {(() => {
                const lines = user
                  ? (ar ? ['أهلاً', `يا ${userName}`] : ['BACK,', userName.toUpperCase()])
                  : (ar ? ['ابنِ', 'جسمك', 'بخطة مخصصة'] : ['BUILD.', 'YOUR.', 'BODY.']);
                return (
                  <div style={{ overflow: 'hidden' }}>
                    {lines.filter(Boolean).map((line, i) => (
                      <motion.div key={i}
                        initial={{ y: '110%' }} animate={{ y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden', lineHeight: 1 }}
                      >
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(4.5rem, 11vw, 9.5rem)',
                          lineHeight: 0.9,
                          color: i === 2 ? 'transparent' : i === 1 ? 'var(--volt)' : 'var(--chalk)',
                          WebkitTextStroke: i === 2 ? '2px var(--volt)' : '0',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                          userSelect: 'none',
                        }}>
                          {line}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}

              {/* subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                style={{ color: 'var(--ash-light)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 380, margin: '20px 0 28px', fontFamily: 'var(--font-body)' }}
              >
                {user
                  ? (ar ? 'كمّل رحلتك من حيث وقفت 💪 — الداشبورد فيه كل حاجة محتاجها.' : "Continue your journey 💪 — your dashboard has everything you need.")
                  : (ar ? 'برامج تدريب وغذاء مصممة ليك أنت — مش نسخة من شخص تاني.' : 'Training and nutrition designed for you — not copied from someone else.')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}
              >
                {user ? (
                  <>
                    <Link href="/dashboard"><div className="btn btn-primary"><BarChart3 size={14} /> {ar ? 'الداشبورد' : 'DASHBOARD'}</div></Link>
                    <Link href="/workout"><div className="btn btn-outline"><Zap size={14} /> {ar ? 'ابدأ تمريني' : 'WORKOUT'}</div></Link>
                  </>
                ) : (
                  <>
                    <Link href="/register"><div className="btn btn-primary"><Zap size={14} /> {ar ? 'ابدأ مجاناً' : 'START FREE'}</div></Link>
                    <Link href="/programs"><div className="btn btn-outline">{ar ? 'استكشف البرامج' : 'EXPLORE'} <ArrowRight size={14} /></div></Link>
                  </>
                )}
              </motion.div>

              {/* REAL STATS */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                style={{ display: 'flex', gap: 0, paddingTop: 20, borderTop: '1px solid var(--iron)' }}
              >
                {[
                  { val: stats.members   || 5200, suf: '+', label: ar ? 'متدرب نشط'  : 'MEMBERS'   },
                  { val: stats.exercises || 120,  suf: '+', label: ar ? 'تمرين'       : 'EXERCISES' },
                  { val: stats.programs  || 15,   suf: '+', label: ar ? 'برنامج'      : 'PROGRAMS'  },
                ].map(({ val, suf, label }, i) => (
                  <div key={label} style={{ flex: 1, paddingLeft: i > 0 ? 20 : 0, borderLeft: i > 0 ? '1px solid var(--iron)' : 'none', marginLeft: i > 0 ? 20 : 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', color: 'var(--chalk)', lineHeight: 1 }}>
                      <AnimatedCounter target={val} suffix={suf} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--ash)', marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* PHONE + CARDS SIDE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              style={{ position: 'relative', flexShrink: 0, margin: '24px auto 0', paddingBottom: 20 }}
            >
              {/* STAT CARD: programs */}
              <FloatCard animDelay={0} animDuration={4.5} style={{ top: -10, right: ar ? 'auto' : -90, left: ar ? -90 : 'auto', minWidth: 138 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ash)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {ar ? 'البرامج المتاحة' : 'PROGRAMS'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--volt)', lineHeight: 1 }}>
                  {stats.programs || 15}<span style={{ fontSize: 14, color: 'var(--ash)' }}>+</span>
                </div>
                <div style={{ height: 2, background: 'var(--iron)', marginTop: 8, borderRadius: 1 }}>
                  <div style={{ height: '100%', background: 'var(--volt)', width: '80%', borderRadius: 1 }} />
                </div>
              </FloatCard>

              {/* STAT CARD: members */}
              <FloatCard animDelay={0.8} animDuration={5} style={{ bottom: 50, right: ar ? 'auto' : -95, left: ar ? -95 : 'auto', minWidth: 130 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ash)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {ar ? 'متدرب نشط' : 'MEMBERS'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--chalk)', lineHeight: 1 }}>
                  {stats.members > 999 ? `${(stats.members / 1000).toFixed(1)}K` : (stats.members || '5.2K')}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {['#FF5500', '#FF7A30', '#FF9960', '#FFC0A0'].map((c, i) => (
                    <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontFamily: 'var(--font-display)' }}>
                      {['م', 'أ', 'ك', '+'][i]}
                    </div>
                  ))}
                </div>
              </FloatCard>

              {/* STAT CARD: exercises */}
              <FloatCard animDelay={0.4} animDuration={3.8} style={{ top: 30, left: ar ? 'auto' : -105, right: ar ? -105 : 'auto', minWidth: 130 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ash)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {ar ? 'مكتبة التمارين' : 'EXERCISES'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--chalk)', lineHeight: 1 }}>
                  {stats.exercises || 120}<span style={{ fontSize: 14, color: 'var(--volt)' }}>+</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--ash)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {ar ? 'بالفيديو والشرح' : 'with video guides'}
                </div>
              </FloatCard>

              <PhoneMockup ar={ar} programs={programs} />
            </motion.div>

          </div>
        </motion.div>

        {/* BOTTOM STRIP */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid var(--iron)', background: 'rgba(8,8,8,0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 24px', gap: 'clamp(20px,5vw,56px)', flexWrap: 'wrap', direction: ar ? 'rtl' : 'ltr' }}>
            {[
              { icon: BarChart3,  label: ar ? 'تتبع التقدم' : 'PROGRESS', href: '/dashboard' },
              { icon: Trophy,     label: ar ? 'البرامج'    : 'PROGRAMS', href: '/programs'  },
              { icon: Apple,      label: ar ? 'التغذية'    : 'NUTRITION', href: '/nutrition' },
              { icon: Calculator, label: ar ? 'الحاسبات'  : 'CALCULATORS', href: '/tools'  },
              { icon: Dumbbell,   label: ar ? 'التمارين'   : 'EXERCISES', href: '/exercises'},
            ].map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ash)', transition: 'color 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--volt)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ash)'}
                >
                  <Icon size={14} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICES — editorial rows, not card grid
      ══════════════════════════════════════ */}
      <section style={{ padding: 'clamp(64px,10vw,120px) 32px', background: 'var(--bg)', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="rule-orange" />
                <span className="label-tag">{ar ? 'الخدمات' : 'FEATURES'}</span>
              </div>
              <h2 className="display-lg" style={{ color: 'var(--chalk)' }}>
                {ar ? 'كل اللي\nمحتاجه' : 'EVERYTHING\nYOU NEED'}
              </h2>
            </div>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.88rem', maxWidth: 340, lineHeight: 1.75 }}>
              {ar ? 'من التدريب للتغذية للحاسبات — GYMZ عنده كل أدواتك في مكان واحد.' : 'From training to nutrition to calculators — GYMZ has every tool you need.'}
            </p>
          </div>

          {/* service rows */}
          <div>
            {services.map((s, i) => <ServiceRow key={s.num} s={s} i={i} ar={ar} />)}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { href: '/workout',   emoji: '⚡', title: ar ? 'ابدأ جلستي'     : 'START WORKOUT',   desc: ar ? 'سجّل تمرين جديد دلوقتي'           : 'Log a new workout session now'      },
              { href: '/dashboard', emoji: '📊', title: ar ? 'تقدمي'           : 'MY PROGRESS',     desc: ar ? 'شوف أرقامك ومؤشراتك الأسبوعية'    : 'View your weekly stats and numbers'  },
              { href: '/programs',  emoji: '🏋️', title: ar ? 'برامجي'          : 'MY PROGRAMS',     desc: ar ? 'استكشف وغيّر برنامجك التدريبي'     : 'Explore and switch training programs' },
              { href: '/nutrition', emoji: '🥗', title: ar ? 'خطتي الغذائية'  : 'NUTRITION PLAN',  desc: ar ? 'اتابع وجباتك وسعراتك اليومية'      : 'Track your meals and daily calories'  },
            ].map(({ href, emoji, title, desc }) => (
              <Link key={href} href={href}>
                <div style={{ background: 'var(--iron)', border: '1px solid var(--iron-light)', borderLeft: '3px solid var(--volt)', borderRadius: 'var(--radius-md)', padding: '20px 18px', cursor: 'pointer', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--volt-bright)'; e.currentTarget.style.transform = 'translateX(-4px)'; e.currentTarget.style.background = 'var(--iron-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'var(--volt)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'var(--iron)'; }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.06em', color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ash-light)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* HOW IT WORKS — for new visitors only */}
      {!user && (
      <section style={{ padding: 'clamp(64px,10vw,120px) 32px', background: 'var(--carbon)', direction: ar ? 'rtl' : 'ltr', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-display)', fontSize: 'clamp(200px,30vw,300px)', color: 'rgba(255,85,0,0.03)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          GYMZ
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="rule-orange" />
            <span className="label-tag">{ar ? 'كيف تبدأ' : 'HOW IT WORKS'}</span>
          </div>
          <h2 className="display-lg" style={{ color: 'var(--chalk)', marginBottom: 56 }}>
            {ar ? '٣ خطوات\nبس وانت جاهز' : 'THREE STEPS.\nTHATS IT.'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            {steps.map((s, i) => <StepItem key={s.num} s={s} i={i} />)}
          </div>
        </div>
      </section>
      )}

      {/* ══════════════════════════════════════
          CTA — inverted (orange bg)
      ══════════════════════════════════════ */}
      {!user && (
        <section style={{ background: 'var(--volt)', padding: 'clamp(64px,10vw,100px) 32px', position: 'relative', overflow: 'hidden', direction: ar ? 'rtl' : 'ltr' }}>
          {/* diagonal stripe decoration */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 12px)', pointerEvents: 'none' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 3, background: '#fff', borderRadius: 2 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)' }}>
                    {ar ? 'مجاناً تماماً' : 'COMPLETELY FREE'}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,8vw,7rem)', lineHeight: 0.9, color: '#fff', textTransform: 'uppercase', marginBottom: 16 }}>
                  {ar ? 'ابدأ\nرحلتك\nدلوقتي' : 'START\nYOUR\nJOURNEY'}
                </h2>
                <p style={{ color: 'rgba(0,0,0,0.65)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 380 }}>
                  {ar ? 'انضم لآلاف المتدربين اللي بيحققوا نتائج حقيقية مع GYMZ.' : 'Join thousands of athletes achieving real results with GYMZ.'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/register">
                  <motion.div whileTap={{ scale: 0.97 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#000', color: '#fff', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)', textTransform: 'uppercase' }}
                  >
                    <Zap size={16} /> {ar ? 'أنشئ حسابك' : 'CREATE ACCOUNT'}
                  </motion.div>
                </Link>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase' }}>
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
