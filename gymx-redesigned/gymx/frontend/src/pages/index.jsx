import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronDown, Dumbbell, LayoutGrid, Calculator,
  Activity, Zap, User, ShieldCheck, TrendingUp, Target,
  CheckCircle2, Star, Play,
} from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

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
      whileHover={hover ? { y: -4, borderColor: 'rgba(61,127,255,0.35)' } : {}}
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

// ── animated counter ──────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target);
    const dur = 1200;
    const step = Math.ceil(dur / end);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ── feature card ──────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, accent, delay }) {
  return (
    <Reveal delay={delay}>
      <GlassBox style={{ padding: '28px 24px', height: '100%' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '18', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={20} color={accent} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '0.03em', color: 'var(--chalk)', marginBottom: 10 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{desc}</div>
      </GlassBox>
    </Reveal>
  );
}

// ── step ──────────────────────────────────────────────────
function Step({ num, title, desc, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--volt)' }}>{num}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{desc}</div>
        </div>
      </div>
    </Reveal>
  );
}

// ── program card ──────────────────────────────────────────
function ProgramCard({ title, days, level, goal, delay }) {
  const colors = { beginner: '#4ade80', intermediate: '#facc15', advanced: 'var(--fire)' };
  const accent = colors[level] || 'var(--volt)';
  const arabicLevel = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[level];
  const arabicGoal = { Strength: 'قوة', 'Fat Loss': 'تخسيس', General: 'عام', Hypertrophy: 'ضخامة' }[goal] || goal;

  return (
    <Reveal delay={delay}>
      <Link href="/programs" style={{ textDecoration: 'none' }}>
        <GlassBox style={{ padding: 0, cursor: 'pointer' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          <div style={{ padding: '24px 20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              {arabicLevel} · {arabicGoal}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 16, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--volt)' }}>{days}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', marginRight: 4 }}> يوم/أسبوع</span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={15} color="var(--volt)" />
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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const features = [
    {
      icon: LayoutGrid, accent: '#3D7FFF',
      title: 'برامج تدريب متكاملة',
      desc: 'اختار من برامج مصممة لكل مستوى — مبتدئ أو متقدم، تخسيس أو ضخامة. كل برنامج فيه جدول أسبوعي واضح.',
    },
    {
      icon: Dumbbell, accent: '#FF6B2B',
      title: 'مكتبة تمارين شاملة',
      desc: 'أكتر من 50 تمرين مع شرح كامل لكل مجموعة عضلية. فلتر بسهولة حسب المعدات أو العضلة المستهدفة.',
    },
    {
      icon: Calculator, accent: '#4ade80',
      title: 'حاسبات ذكية',
      desc: 'احسب BMI، TDEE، وكمية السعرات اللي محتاجها يومياً عشان توصل لهدفك بالضبط.',
    },
    {
      icon: Activity, accent: '#facc15',
      title: 'داشبورد شخصي',
      desc: 'تابع وزنك وتقدمك عبر الوقت. كل بياناتك في مكان واحد — واضحة وسهلة.',
    },
    {
      icon: Zap, accent: '#a78bfa',
      title: 'اختيار ذكي للبرنامج',
      desc: 'جاوب على 3 أسئلة بسيطة عن هدفك ومستواك، والموقع هيقترح لك البرنامج الأنسب تلقائياً.',
    },
    {
      icon: User, accent: '#f472b6',
      title: 'ملف شخصي كامل',
      desc: 'احفظ بياناتك وبرنامجك المفضل. الموقع بيتذكر تقدمك في كل مرة بتدخل.',
    },
    {
      icon: Target, accent: '#34d399',
      title: 'أشكال الجسم',
      desc: 'تعرّف على شكل جسمك واعرف ايه أفضل طريقة تتدرب وتاكل عشان توصل لشكلك المثالي.',
    },
    {
      icon: ShieldCheck, accent: '#60a5fa',
      title: 'حساب آمن ومحمي',
      desc: 'بياناتك محفوظة وآمنة. سجّل بإيميلك وابدأ رحلتك — مجاناً تماماً.',
    },
  ];

  const programs = [
    { title: 'Power Builder', days: 5, level: 'intermediate', goal: 'Strength' },
    { title: 'Shred Protocol', days: 4, level: 'advanced', goal: 'Fat Loss' },
    { title: 'First Steps', days: 3, level: 'beginner', goal: 'General' },
    { title: 'Mass Phase', days: 6, level: 'advanced', goal: 'Hypertrophy' },
  ];

  const muscles = ['صدر', 'ظهر', 'أكتاف', 'أذرع', 'أرجل', 'بطن', 'مؤخرة', 'جسم كامل'];
  const muscleEn = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'];

  return (
    <>
      <Head>
        <title>GYMZ — ابدأ رحلتك الآن</title>
        <meta name="description" content="برامج تدريب احترافية، تمارين شاملة، وأدوات ذكية تساعدك توصل لجسمك المثالي." />
        <meta name="theme-color" content="#3D7FFF" />
      </Head>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', overflow: 'hidden' }}>

        {/* bg glows */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 15% 50%, rgba(61,127,255,0.13) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 85% 30%, rgba(255,107,43,0.09) 0%, transparent 60%)', zIndex: 1 }} />

        {/* grid lines */}
        <motion.div style={{ position: 'absolute', inset: 0, opacity: 0.035, y: heroY }} aria-hidden>
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i / 14) * 100}%`, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent 0%, var(--volt) 50%, transparent 100%)' }} />
          ))}
        </motion.div>

        {/* big Z watermark */}
        <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5vw', fontFamily: 'var(--font-display)', fontSize: 'clamp(280px, 40vw, 600px)', color: 'rgba(61,127,255,0.04)', userSelect: 'none', pointerEvents: 'none', zIndex: 1, y: heroY }} aria-hidden>Z</motion.div>

        {/* content */}
        <motion.div style={{ position: 'relative', zIndex: 2, maxWidth: 820, y: heroY, opacity: heroOpacity }}>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.25)', borderRadius: 100, padding: '6px 14px', marginBottom: 32 }}>
            <Star size={11} color="var(--volt)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.1em' }}>مجاناً — ابدأ دلوقتي</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 0.95, marginBottom: 0 }}>
            غيّر
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '0.04em', color: 'var(--volt)', lineHeight: 0.95, textShadow: '0 0 60px rgba(61,127,255,0.4)', marginBottom: 0 }}>
            جسمك
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 0.95, marginBottom: 32 }}>
            دلوقتي
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--ash-light)', maxWidth: 480, lineHeight: 1.8, marginBottom: 40, direction: 'rtl' }}>
            GYMZ منصة تدريب متكاملة — برامج احترافية، تمارين موضّحة، وأدوات ذكية تساعدك توصل لجسمك المثالي بدون تعقيد.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', direction: 'rtl' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LayoutGrid size={16} /> داشبورد
              </Link>
            ) : (
              <Link href="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} /> ابدأ مجاناً
              </Link>
            )}
            <Link href="/programs" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={16} /> شوف البرامج
            </Link>
          </motion.div>
        </motion.div>

        {/* scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} style={{ color: 'var(--ash)' }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
            {[
              { target: 50, suffix: '+', label: 'تمرين', icon: Dumbbell },
              { target: 12, suffix: '', label: 'برنامج', icon: LayoutGrid },
              { target: 3, suffix: '', label: 'مستويات', icon: TrendingUp },
              { target: 8, suffix: '', label: 'مجموعة عضلية', icon: Target },
            ].map(({ target, suffix, label, icon: Icon }, i) => (
              <Reveal key={label} delay={i * 0.08}>
                <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                  <Icon size={18} color="var(--volt)" style={{ marginBottom: 12, opacity: 0.7 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'var(--volt)', lineHeight: 1, textShadow: '0 0 30px rgba(61,127,255,0.4)' }}>
                    <Counter target={target} suffix={suffix} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--ash-light)', marginTop: 8, textTransform: 'uppercase' }}>{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 64, direction: 'rtl' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>— كل اللي محتاجه في مكان واحد</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1 }}>
                مميزات <span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.35)' }}>GYMZ</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>

            <div style={{ direction: 'rtl' }}>
              <Reveal>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>— ازاي تبدأ</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1, marginBottom: 48 }}>
                  3 خطوات<br /><span style={{ color: 'var(--volt)' }}>وتبدأ</span>
                </h2>
              </Reveal>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                <Step num="١" title="سجّل حساب مجاناً" desc="دقيقة واحدة بس — إيميلك وكلمة سر وخلاص." delay={0.1} />
                <Step num="٢" title="اختار برنامجك" desc="جاوب على 3 أسئلة بسيطة عن هدفك ومستواك والموقع يقترح لك البرنامج الأنسب." delay={0.2} />
                <Step num="٣" title="ابدأ التدريب" desc="اتبع البرنامج يوم بيوم، تابع تقدمك، وشوف النتيجة." delay={0.3} />
              </div>
            </div>

            <Reveal delay={0.15}>
              <GlassBox style={{ padding: '40px 32px', direction: 'rtl' }} hover={false}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 24 }}>— ليه GYMZ؟</div>
                {[
                  'برامج مصممة بواسطة متخصصين',
                  'مناسب لكل مستويات — من الصفر للمتقدم',
                  'شغّال على موبايل وكمبيوتر',
                  'حاسبات دقيقة للسعرات والـ BMI',
                  'مجاناً تماماً — مفيش اشتراكات',
                  'واجهة عربية وإنجليزية',
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--chalk)' }}>{item}</span>
                  </motion.div>
                ))}
                <Link href={user ? "/programs" : "/register"} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 28, fontSize: '0.9rem' }}>
                  {user ? 'اكتشف البرامج' : 'ابدأ دلوقتي — مجاناً'}
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
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16, direction: 'rtl' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>— برامج مختارة</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--chalk)', lineHeight: 1.1 }}>
                  مبنية على<br /><span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.3)' }}>نتائج حقيقية</span>
                </h2>
              </div>
              <Link href="/programs" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                كل البرامج <ArrowLeft size={16} />
              </Link>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {programs.map((p, i) => <ProgramCard key={i} {...p} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ══ MUSCLE GROUPS ═════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <Reveal>
            <div style={{ direction: 'rtl', marginBottom: 48 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 14 }}>— استهدف أي عضلة</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--chalk)', lineHeight: 1.1 }}>
                كل<br /><span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.3)' }}>المجموعات العضلية</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {muscles.map((muscle, i) => (
              <Reveal key={muscle} delay={i * 0.05}>
                <Link href={`/exercises?muscle_group=${muscleEn[i]}`} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ backgroundColor: 'rgba(61,127,255,0.1)', borderColor: 'rgba(61,127,255,0.4)', color: 'var(--volt)', y: -2 }}
                    style={{ padding: '20px 16px', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.04em', color: 'var(--chalk)', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', direction: 'rtl' }}>
                    {muscle}
                    <ArrowLeft size={14} style={{ color: 'var(--volt)', opacity: 0.5 }} />
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
            <GlassBox style={{ display: 'inline-block', padding: 'clamp(40px, 8vw, 70px) clamp(32px, 10vw, 90px)', background: 'linear-gradient(135deg, rgba(61,127,255,0.08), rgba(255,107,43,0.05))' }} hover={false}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 20 }}>— مفيش أعذار. مفيش غداً.</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 36 }}>
                جاهز تبدأ؟
              </h2>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={user ? "/programs" : "/register"} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} />
                  {user ? 'شوف البرامج' : 'سجّل مجاناً'}
                </Link>
                {!user && (
                  <Link href="/login" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                    عندي حساب
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
