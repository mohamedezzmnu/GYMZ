import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ChevronDown, Dumbbell, LayoutGrid, Calculator,
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

function FeatureCard({ icon: Icon, title, desc, accent, delay }) {
  return (
    <Reveal delay={delay}>
      <GlassBox style={{ padding: '28px 24px', height: '100%' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '18', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={20} color={accent} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.03em', color: 'var(--chalk)', marginBottom: 10 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{desc}</div>
      </GlassBox>
    </Reveal>
  );
}

function Step({ num, title, desc, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--volt)' }}>{num}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{desc}</div>
        </div>
      </div>
    </Reveal>
  );
}

function ProgramCard({ title, days, level, goal, delay, lang }) {
  const colors = { beginner: '#4ade80', intermediate: '#facc15', advanced: 'var(--fire)' };
  const accent = colors[level] || 'var(--volt)';
  const levelLabel = lang === 'ar'
    ? { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[level]
    : { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[level];
  const goalLabel = lang === 'ar'
    ? { Strength: 'قوة', 'Fat Loss': 'تخسيس', General: 'عام', Hypertrophy: 'ضخامة' }[goal] || goal
    : goal;
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <Reveal delay={delay}>
      <Link href="/programs" style={{ textDecoration: 'none' }}>
        <GlassBox style={{ padding: 0, cursor: 'pointer' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          <div style={{ padding: '24px 20px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              {levelLabel} · {goalLabel}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 16, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--volt)' }}>{days}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', marginRight: 4, marginLeft: 4 }}>
                  {lang === 'ar' ? 'يوم/أسبوع' : 'days/wk'}
                </span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowIcon size={15} color="var(--volt)" />
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
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const features = [
    {
      icon: LayoutGrid, accent: '#3D7FFF',
      title: ar ? 'برامج تدريب متكاملة' : 'Complete Training Programs',
      desc: ar
        ? 'اختار من برامج مصممة لكل مستوى — مبتدئ أو متقدم، تخسيس أو ضخامة. كل برنامج فيه جدول أسبوعي واضح.'
        : 'Choose from programs designed for every level — beginner to advanced, cutting or bulking. Each has a clear weekly schedule.',
    },
    {
      icon: Dumbbell, accent: '#FF6B2B',
      title: ar ? 'مكتبة تمارين شاملة' : 'Full Exercise Library',
      desc: ar
        ? 'أكتر من 50 تمرين مع شرح كامل لكل مجموعة عضلية. فلتر بسهولة حسب المعدات أو العضلة المستهدفة.'
        : 'Over 50 exercises with full instructions for every muscle group. Filter easily by equipment or target muscle.',
    },
    {
      icon: Calculator, accent: '#4ade80',
      title: ar ? 'حاسبات ذكية' : 'Smart Calculators',
      desc: ar
        ? 'احسب BMI، TDEE، وكمية السعرات اللي محتاجها يومياً عشان توصل لهدفك بالضبط.'
        : 'Calculate your BMI, TDEE, and daily calorie needs to hit your goals with precision.',
    },
    {
      icon: Activity, accent: '#facc15',
      title: ar ? 'داشبورد شخصي' : 'Personal Dashboard',
      desc: ar
        ? 'تابع وزنك وتقدمك عبر الوقت. كل بياناتك في مكان واحد — واضحة وسهلة.'
        : 'Track your weight and progress over time. All your data in one place — clear and simple.',
    },
    {
      icon: Zap, accent: '#a78bfa',
      title: ar ? 'اختيار ذكي للبرنامج' : 'Smart Program Picker',
      desc: ar
        ? 'جاوب على 3 أسئلة بسيطة عن هدفك ومستواك والموقع يقترح لك البرنامج الأنسب تلقائياً.'
        : 'Answer 3 simple questions about your goal and level, and GYMZ picks the best program for you automatically.',
    },
    {
      icon: User, accent: '#f472b6',
      title: ar ? 'ملف شخصي كامل' : 'Full Profile',
      desc: ar
        ? 'احفظ بياناتك وبرنامجك المفضل. الموقع بيتذكر تقدمك في كل مرة بتدخل.'
        : 'Save your data and favorite program. GYMZ remembers your progress every time you log in.',
    },
    {
      icon: Target, accent: '#34d399',
      title: ar ? 'أشكال الجسم' : 'Body Shapes',
      desc: ar
        ? 'تعرّف على شكل جسمك واعرف ايه أفضل طريقة تتدرب وتاكل عشان توصل لشكلك المثالي.'
        : 'Discover your body type and learn the best way to train and eat to reach your ideal physique.',
    },
    {
      icon: ShieldCheck, accent: '#60a5fa',
      title: ar ? 'حساب آمن ومحمي' : 'Safe & Secure Account',
      desc: ar
        ? 'بياناتك محفوظة وآمنة. سجّل بإيميلك وابدأ رحلتك — مجاناً تماماً.'
        : 'Your data is safe and secure. Sign up with your email and start your journey — completely free.',
    },
  ];

  const programs = [
    { title: 'Power Builder', days: 5, level: 'intermediate', goal: 'Strength' },
    { title: 'Shred Protocol', days: 4, level: 'advanced', goal: 'Fat Loss' },
    { title: 'First Steps', days: 3, level: 'beginner', goal: 'General' },
    { title: 'Mass Phase', days: 6, level: 'advanced', goal: 'Hypertrophy' },
  ];

  const muscles = {
    ar: ['صدر', 'ظهر', 'أكتاف', 'أذرع', 'أرجل', 'بطن', 'مؤخرة', 'جسم كامل'],
    en: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'],
  };

  const steps = ar ? [
    { num: '١', title: 'سجّل حساب مجاناً', desc: 'دقيقة واحدة بس — إيميلك وكلمة سر وخلاص.' },
    { num: '٢', title: 'اختار برنامجك', desc: 'جاوب على 3 أسئلة بسيطة عن هدفك ومستواك والموقع يقترح لك الأنسب.' },
    { num: '٣', title: 'ابدأ التدريب', desc: 'اتبع البرنامج يوم بيوم، تابع تقدمك، وشوف النتيجة.' },
  ] : [
    { num: '1', title: 'Create a free account', desc: 'Takes one minute — just your email and password.' },
    { num: '2', title: 'Pick your program', desc: 'Answer 3 quick questions and GYMZ recommends the best fit for you.' },
    { num: '3', title: 'Start training', desc: 'Follow the program day by day, track your progress, and see results.' },
  ];

  const whyPoints = ar ? [
    'برامج مصممة بواسطة متخصصين',
    'مناسب لكل المستويات — من الصفر للمتقدم',
    'شغّال على موبايل وكمبيوتر',
    'حاسبات دقيقة للسعرات والـ BMI',
    'مجاناً تماماً — مفيش اشتراكات',
    'واجهة عربية وإنجليزية',
  ] : [
    'Programs designed by fitness professionals',
    'Suitable for all levels — beginner to advanced',
    'Works on mobile and desktop',
    'Accurate calorie and BMI calculators',
    'Completely free — no subscriptions',
    'Arabic and English interface',
  ];

  return (
    <>
      <Head>
        <title>GYMZ — {ar ? 'ابدأ رحلتك الآن' : 'Start Your Journey'}</title>
        <meta name="description" content={ar ? 'برامج تدريب احترافية، تمارين شاملة، وأدوات ذكية.' : 'Professional training programs, full exercise library, and smart tools.'} />
      </Head>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 15% 50%, rgba(61,127,255,0.13) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 85% 30%, rgba(255,107,43,0.09) 0%, transparent 60%)', zIndex: 1 }} />

        <motion.div style={{ position: 'absolute', inset: 0, opacity: 0.035, y: heroY }} aria-hidden>
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i / 14) * 100}%`, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent 0%, var(--volt) 50%, transparent 100%)' }} />
          ))}
        </motion.div>

        <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5vw', fontFamily: 'var(--font-display)', fontSize: 'clamp(280px, 40vw, 600px)', color: 'rgba(61,127,255,0.04)', userSelect: 'none', pointerEvents: 'none', zIndex: 1, y: heroY }} aria-hidden>Z</motion.div>

        <motion.div style={{ position: 'relative', zIndex: 2, maxWidth: 820, y: heroY, opacity: heroOpacity, direction: ar ? 'rtl' : 'ltr' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.25)', borderRadius: 100, padding: '6px 14px', marginBottom: 32 }}>
            <Star size={11} color="var(--volt)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.1em' }}>
              {ar ? 'مجاناً — ابدأ دلوقتي' : 'Free — Start Now'}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 0.95, marginBottom: 0 }}>
            {ar ? 'غيّر' : 'Transform'}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '0.04em', color: 'var(--volt)', lineHeight: 0.95, textShadow: '0 0 60px rgba(61,127,255,0.4)', marginBottom: 0 }}>
            {ar ? 'جسمك' : 'Your Body'}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 0.95, marginBottom: 32 }}>
            {ar ? 'دلوقتي' : 'Now'}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--ash-light)', maxWidth: 480, lineHeight: 1.8, marginBottom: 40 }}>
            {ar
              ? 'GYMZ منصة تدريب متكاملة — برامج احترافية، تمارين موضّحة، وأدوات ذكية تساعدك توصل لجسمك المثالي.'
              : 'GYMZ is a complete training platform — professional programs, detailed exercises, and smart tools to help you reach your ideal physique.'}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LayoutGrid size={16} /> {ar ? 'داشبورد' : 'Dashboard'}
              </Link>
            ) : (
              <Link href="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} /> {ar ? 'ابدأ مجاناً' : 'Start Free'}
              </Link>
            )}
            <Link href="/programs" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={16} /> {ar ? 'شوف البرامج' : 'Browse Programs'}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
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
              { target: 50, suffix: '+', ar: 'تمرين', en: 'Exercises', icon: Dumbbell },
              { target: 12, suffix: '', ar: 'برنامج', en: 'Programs', icon: LayoutGrid },
              { target: 3, suffix: '', ar: 'مستويات', en: 'Levels', icon: TrendingUp },
              { target: 8, suffix: '', ar: 'مجموعة عضلية', en: 'Muscle Groups', icon: Target },
            ].map(({ target, suffix, ar: arLabel, en: enLabel, icon: Icon }, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                  <Icon size={18} color="var(--volt)" style={{ marginBottom: 12, opacity: 0.7 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'var(--volt)', lineHeight: 1, textShadow: '0 0 30px rgba(61,127,255,0.4)' }}>
                    <Counter target={target} suffix={suffix} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--ash-light)', marginTop: 8, textTransform: 'uppercase' }}>
                    {ar ? arLabel : enLabel}
                  </div>
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
            <div style={{ textAlign: 'center', marginBottom: 64, direction: ar ? 'rtl' : 'ltr' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                {ar ? '— كل اللي محتاجه في مكان واحد' : '— Everything you need, in one place'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1 }}>
                {ar ? 'مميزات ' : 'Why '}<span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.35)' }}>GYMZ</span>{!ar && '?'}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.06} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <div style={{ direction: ar ? 'rtl' : 'ltr' }}>
              <Reveal>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  {ar ? '— ازاي تبدأ' : '— How it works'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1, marginBottom: 48 }}>
                  {ar ? <>٣ خطوات<br /><span style={{ color: 'var(--volt)' }}>وتبدأ</span></> : <>3 Steps to<br /><span style={{ color: 'var(--volt)' }}>Get Started</span></>}
                </h2>
              </Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                {steps.map((s, i) => <Step key={i} {...s} delay={i * 0.1} />)}
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
                    <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--chalk)' }}>{item}</span>
                  </motion.div>
                ))}
                <Link href={user ? "/programs" : "/register"} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 28, fontSize: '0.9rem' }}>
                  {user ? (ar ? 'اكتشف البرامج' : 'Explore Programs') : (ar ? 'ابدأ دلوقتي — مجاناً' : 'Start Now — Free')}
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
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--volt)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                  {ar ? '— برامج مختارة' : '— Featured Programs'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--chalk)', lineHeight: 1.1 }}>
                  {ar ? <>مبنية على<br /><span style={{ color: 'var(--volt)' }}>نتائج حقيقية</span></> : <>Built for<br /><span style={{ color: 'var(--volt)' }}>Real Results</span></>}
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
                {ar ? <>كل<br /><span style={{ color: 'var(--volt)' }}>المجموعات العضلية</span></> : <>Every<br /><span style={{ color: 'var(--volt)' }}>Muscle Group</span></>}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {muscles.en.map((muscleEn, i) => (
              <Reveal key={muscleEn} delay={i * 0.05}>
                <Link href={`/exercises?muscle_group=${muscleEn}`} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ backgroundColor: 'rgba(61,127,255,0.1)', borderColor: 'rgba(61,127,255,0.4)', color: 'var(--volt)', y: -2 }}
                    style={{ padding: '20px 16px', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em', color: 'var(--chalk)', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', direction: ar ? 'rtl' : 'ltr' }}>
                    {ar ? muscles.ar[i] : muscleEn}
                    <ArrowIcon size={14} style={{ color: 'var(--volt)', opacity: 0.5 }} />
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 20 }}>
                {ar ? '— مفيش أعذار. مفيش غداً.' : '— No excuses. No shortcuts.'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 36 }}>
                {ar ? 'جاهز تبدأ؟' : 'Ready to Start?'}
              </h2>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={user ? "/programs" : "/register"} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} />
                  {user ? (ar ? 'شوف البرامج' : 'Browse Programs') : (ar ? 'سجّل مجاناً' : 'Join Free')}
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
