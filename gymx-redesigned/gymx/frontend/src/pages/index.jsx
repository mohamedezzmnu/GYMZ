import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import {
  Dumbbell, Apple, Activity, Calculator, ShieldCheck,
  Flame, Trophy, Users, ChevronRight, Zap, BarChart3,
  ArrowRight, Target, TrendingUp,
} from 'lucide-react';
import { useLang } from '../context/LangContext';

/* ─────────────────────────────────────────────────────────
   FLOATING STAT CARD
───────────────────────────────────────────────────────── */
function FloatCard({ style, animDelay = 0, animDuration = 4, children }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: animDuration, delay: animDelay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        background: 'rgba(15,14,42,0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 16,
        padding: '12px 16px',
        zIndex: 10,
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PHONE MOCKUP
───────────────────────────────────────────────────────── */
function PhoneMockup({ ar }) {
  return (
    <div className="phone-frame" style={{ width: 210, padding: '14px 12px' }}>
      <div style={{ width: 56, height: 5, background: '#1F1B4A', borderRadius: 10, margin: '0 auto 12px' }} />
      <div className="phone-screen" style={{ padding: 14, minHeight: 320 }}>
        <div style={{ fontSize: 9, color: '#A78BFA', fontWeight: 700, marginBottom: 2 }}>
          {ar ? 'مرحباً 👋' : 'Hey, Champ! 👋'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#F0EEFF', marginBottom: 14 }}>
          Keep Pushing!
        </div>

        {/* Progress card */}
        <div style={{ background: '#0F0E2A', border: '1px solid #2D2B6B', borderRadius: 12, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: '#7C7A9E', marginBottom: 6 }}>
            {ar ? 'تقدم هذا الأسبوع' : 'Weekly Progress'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#A78BFA' }}>4</div>
              <div style={{ fontSize: 7, color: '#7C7A9E' }}>{ar ? 'تمارين' : 'Sessions'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F0EEFF' }}>2,450</div>
              <div style={{ fontSize: 7, color: '#7C7A9E' }}>kcal</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>3h</div>
              <div style={{ fontSize: 7, color: '#7C7A9E' }}>{ar ? 'وقت' : 'Active'}</div>
            </div>
          </div>
          <div style={{ background: '#1F1B4A', borderRadius: 4, height: 5, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg,#7C3AED,#60A5FA)', height: '100%', width: '75%', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 7, color: '#7C7A9E', textAlign: 'left', marginTop: 3 }}>
            {ar ? '75% الهدف' : '75% of goal'}
          </div>
        </div>

        {/* Mini leaderboard */}
        <div style={{ fontSize: 8, color: '#7C7A9E', marginBottom: 5 }}>
          {ar ? 'المتصدرون' : 'Leaderboard'}
        </div>
        {[
          { rank: '1', name: 'Mohamed', pts: '12,450', color: '#A78BFA', rankColor: '#F59E0B', me: false },
          { rank: '2', name: 'Ahmed',   pts: '9,870',  color: '#10B981', rankColor: '#9CA3AF', me: false },
          { rank: '3', name: ar ? 'أنت' : 'You', pts: '8,450', color: '#F59E0B', rankColor: '#9CA3AF', me: true },
        ].map(({ rank, name, pts, color, rankColor, me }) => (
          <div key={rank} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: me ? 'rgba(124,58,237,0.15)' : '#0F0E2A',
            border: me ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
            borderRadius: 8, padding: '6px 8px', marginBottom: 4,
          }}>
            <span style={{ fontSize: 9, color: rankColor, fontWeight: 700, minWidth: 10 }}>{rank}</span>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#000', fontWeight: 700 }}>
              {name[0]}
            </div>
            <span style={{ fontSize: 9, color: me ? '#A78BFA' : '#F0EEFF', flex: 1 }}>{name}</span>
            <span style={{ fontSize: 8, color: me ? '#A78BFA' : '#7C7A9E' }}>{pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SERVICE CARD
───────────────────────────────────────────────────────── */
function ServiceCard({ icon: Icon, title, desc, href, accentColor = 'var(--volt)', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} style={{ display: 'block', height: '100%' }}>
        <div className="glass-card" style={{ padding: '28px 24px', height: '100%', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accentColor}, transparent)`, opacity: 0.6 }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accentColor}18`, border: `1px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon size={20} color={accentColor} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--chalk)', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.65, flex: 1 }}>{desc}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 18, fontSize: '0.78rem', fontWeight: 600, color: accentColor }}>
            {accentColor === 'var(--volt)' ? 'اكتشف' : 'Explore'} <ChevronRight size={13} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP CARD
───────────────────────────────────────────────────────── */
function StepCard({ num, title, desc, ar, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: ar ? 30 : -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      style={{ display: 'flex', gap: 20, alignItems: 'flex-start', direction: ar ? 'rtl' : 'ltr' }}
    >
      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>{num}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--chalk)', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--ash-light)', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function HomePage() {
  const { lang, t } = useLang();
  const ar = lang === 'ar';

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* rotating headline words */
  const words = ar
    ? ['قوياً', 'سريعاً', 'أفضل', 'بثقة']
    : ['Stronger', 'Faster', 'Better', 'Confident'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, []);

  const services = ar ? [
    { icon: Dumbbell,    title: 'برامج التدريب',    desc: 'برامج مبنية على هدفك ومستواك — خسارة وزن، بناء عضل، أو قوة. جدول أسبوعي واضح.',       href: '/programs',   color: 'var(--volt)' },
    { icon: Apple,       title: 'التغذية والوجبات', desc: 'خطط غذائية جاهزة بمكونات مصرية — فراخ وأرز وبيض وقريش. اختار هدفك وعدّل بحرية.', href: '/nutrition',   color: '#10B981' },
    { icon: Activity,    title: 'تتبع التقدم',      desc: 'سجّل وزنك وقياساتك، تابع تقدمك الأسبوعي. شوف نتائج حقيقية بأرقام حقيقية.',           href: '/dashboard',  color: '#60A5FA' },
    { icon: Calculator,  title: 'حاسبات ذكية',     desc: 'TDEE وBMI و1RM والماكروز — كل الحاسبات اللي محتاجها في مكان واحد.',                    href: '/tools',      color: '#F59E0B' },
    { icon: ShieldCheck, title: 'مجاني 100%',       desc: 'مفيش اشتراكات ومفيش رسوم مخفية. سجّل حسابك دلوقتي وابدأ رحلتك فوراً.',             href: '/register',   color: 'var(--volt)' },
  ] : [
    { icon: Dumbbell,    title: 'Training Plans',      desc: 'Programs built for your goal and level — fat loss, muscle gain, or strength.',     href: '/programs',   color: 'var(--volt)' },
    { icon: Apple,       title: 'Nutrition & Meals',   desc: 'Egyptian meal plans with local ingredients. Pick your goal and swap meals freely.', href: '/nutrition',  color: '#10B981' },
    { icon: Activity,    title: 'Progress Tracking',   desc: 'Log weight and measurements. Track weekly progress with real numbers.',              href: '/dashboard',  color: '#60A5FA' },
    { icon: Calculator,  title: 'Smart Calculators',   desc: 'TDEE, BMI, 1RM, and Macros — all tools in one place.',                             href: '/tools',      color: '#F59E0B' },
    { icon: ShieldCheck, title: '100% Free',           desc: 'No subscriptions, no hidden fees. Create your account and start immediately.',      href: '/register',   color: 'var(--volt)' },
  ];

  const steps = ar ? [
    { num: '01', title: 'أنشئ حسابك مجاناً',        desc: 'دقيقة واحدة — إيميلك وباسورد بس.' },
    { num: '02', title: 'حدد هدفك ومستواك',          desc: 'أسئلة بسيطة عن هدفك وعدد أيام التدريب.' },
    { num: '03', title: 'ابدأ برنامجك الشخصي',       desc: 'برنامج تدريبي وغذائي كامل مصمم ليك على طول.' },
  ] : [
    { num: '01', title: 'Create your free account', desc: 'One minute — just your email and password.' },
    { num: '02', title: 'Set your goal and level',  desc: 'Simple questions about your goal and schedule.' },
    { num: '03', title: 'Start your custom plan',   desc: 'Full training and nutrition plan ready immediately.' },
  ];

  const features = ar ? [
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

  return (
    <>
      <Head>
        <title>GYMZ — {ar ? 'ابنِ جسمك بخطة مخصصة' : 'Build Your Body With a Custom Plan'}</title>
        <meta name="description" content={ar
          ? 'برامج تدريب وغذاء مخصصة لك — مجاناً. ابدأ رحلتك مع GYMZ.'
          : 'Custom training and nutrition plans — free. Start your journey with GYMZ.'} />
      </Head>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}>
        {/* glow orbs */}
        <div className="hero-glow-primary" style={{ width: 600, height: 600, top: -160, right: ar ? 'auto' : -100, left: ar ? -100 : 'auto' }} />
        <div className="hero-glow-secondary" style={{ width: 450, height: 450, bottom: -100, left: ar ? 'auto' : -80, right: ar ? -80 : 'auto' }} />
        <div className="hero-grid" />

        {/* hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2, padding: '80px 28px 28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            direction: ar ? 'rtl' : 'ltr',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>

            {/* ── LEFT: TEXT ── */}
            <div style={{ flex: '1 1 340px', minWidth: 280 }}>
              {/* pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 20, padding: '5px 16px', marginBottom: 22 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', animation: 'dotPulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>
                  {ar ? 'مجاناً — ابدأ دلوقتي' : 'Free — Start Now'}
                </span>
              </motion.div>

              {/* headline */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-2px', marginBottom: 8 }}
              >
                <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', color: 'var(--chalk)' }}>
                  {ar ? 'ابنِ' : 'TRAIN.'}
                </div>
                <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', color: 'var(--chalk)' }}>
                  {ar ? 'جسمك' : 'CONNECT.'}
                </div>
                <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', background: 'linear-gradient(90deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
                  {ar ? (
                    <AnimatePresence mode="wait">
                      <motion.span key={wordIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                        {words[wordIdx]}
                      </motion.span>
                    </AnimatePresence>
                  ) : 'LEVEL UP.'}
                </div>
              </motion.div>

              {/* subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ color: 'var(--ash-light)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 360, margin: '18px 0 26px' }}
              >
                {ar
                  ? 'برامج تدريب وغذاء مصممة ليك أنت — مش نسخة من شخص تاني. GYMZ بيساعدك توصل لنتيجة حقيقية.'
                  : 'Training and nutrition plans built for you — not a copy of someone else. GYMZ helps you reach real results.'}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}
              >
                <Link href="/register">
                  <motion.div className="btn btn-primary" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.88rem' }}>
                    <Zap size={15} /> {ar ? 'ابدأ الآن' : 'Start Now'}
                  </motion.div>
                </Link>
                <Link href="/programs">
                  <motion.div className="btn btn-outline" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.88rem' }}>
                    {ar ? 'استكشف البرامج' : 'Explore Programs'} <ArrowRight size={14} />
                  </motion.div>
                </Link>
              </motion.div>

              {/* stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                style={{ display: 'flex', gap: 28, paddingTop: 20, borderTop: '1px solid rgba(124,58,237,0.12)', flexWrap: 'wrap' }}
              >
                {[
                  { val: '5,200+', label: ar ? 'متدرب نشط'  : 'Active Members' },
                  { val: '120+',   label: ar ? 'تمرين'       : 'Exercises' },
                  { val: '15+',    label: ar ? 'برنامج'      : 'Programs' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--chalk)' }}>{val}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ash)' }}>{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: PHONE + FLOATING CARDS ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ position: 'relative', flexShrink: 0, margin: '24px auto 0' }}
            >
              {/* Calories card */}
              <FloatCard animDelay={0} animDuration={4} style={{
                top: -18, right: ar ? 'auto' : -100, left: ar ? -100 : 'auto',
                border: '1px solid rgba(124,58,237,0.3)', minWidth: 140,
                boxShadow: '0 0 24px rgba(124,58,237,0.15)',
              }}>
                <div style={{ fontSize: 9, color: '#7C7A9E', marginBottom: 3 }}>{ar ? 'السعرات المحروقة' : 'Calories Burned'}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#A78BFA' }}>2,450 <span style={{ fontSize: 10, color: '#7C7A9E' }}>kcal</span></div>
                <div style={{ background: '#1A1940', borderRadius: 3, height: 4, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(90deg,#7C3AED,#60A5FA)', height: '100%', width: '72%', borderRadius: 3 }} />
                </div>
              </FloatCard>

              {/* Streak card */}
              <FloatCard animDelay={1} animDuration={5} style={{
                bottom: 60, right: ar ? 'auto' : -110, left: ar ? -110 : 'auto',
                border: '1px solid rgba(245,158,11,0.3)', minWidth: 128,
                boxShadow: '0 0 20px rgba(245,158,11,0.12)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔥</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>12</div>
                    <div style={{ fontSize: 9, color: '#7C7A9E' }}>{ar ? 'يوم على التوالي' : 'Day Streak'}</div>
                  </div>
                </div>
              </FloatCard>

              {/* Challenge card */}
              <FloatCard animDelay={0.5} animDuration={3.5} style={{
                top: 28, left: ar ? 'auto' : -108, right: ar ? -108 : 'auto',
                border: '1px solid rgba(16,185,129,0.3)', minWidth: 136,
                boxShadow: '0 0 20px rgba(16,185,129,0.10)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🏆</div>
                  <span style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>{ar ? 'تحدي مكتمل!' : 'Challenge Done!'}</span>
                </div>
                <div style={{ fontSize: 9, color: '#7C7A9E', marginBottom: 7 }}>{ar ? 'حصلت على 500 XP' : 'You earned 500 XP'}</div>
                <div style={{ display: 'flex' }}>
                  {['#7C3AED', '#10B981', '#F59E0B', '#60A5FA'].map((c, i) => (
                    <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '2px solid #0F0E2A', marginRight: i > 0 ? -6 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700 }}>
                      {['م','أ','ك','+'][i]}
                    </div>
                  ))}
                </div>
              </FloatCard>

              <PhoneMockup ar={ar} />
            </motion.div>
          </div>
        </motion.div>

        {/* ── FEATURE STRIP ── */}
        <div style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid rgba(124,58,237,0.12)',
          background: 'rgba(8,7,26,0.7)',
          backdropFilter: 'blur(12px)',
        }}>
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

      {/* ══════════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 24px', background: 'var(--bg)', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '4px 16px', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>{ar ? 'خدماتنا' : 'FEATURES'}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, color: 'var(--chalk)', marginBottom: 12 }}>
              {ar ? 'كل اللي محتاجه في مكان واحد' : 'Everything You Need in One Place'}
            </h2>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.88rem', maxWidth: 480, margin: '0 auto' }}>
              {ar
                ? 'من التدريب للتغذية للحاسبات — GYMZ عنده كل أدواتك.'
                : 'From training to nutrition to calculators — GYMZ has all your tools.'}
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {services.map((s, i) => (
              <ServiceCard key={s.title} {...s} accentColor={s.color} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) 24px', background: 'var(--carbon)', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '4px 16px', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>{ar ? 'كيف تبدأ' : 'HOW IT WORKS'}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, color: 'var(--chalk)', marginBottom: 12, lineHeight: 1.1 }}>
              {ar ? '٣ خطوات بس وانت جاهز' : '3 Simple Steps to Get Started'}
            </h2>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.88rem', lineHeight: 1.75 }}>
              {ar
                ? 'مش محتاج خبرة أو معرفة سابقة — كل حاجة هتلاقيها جاهزة ليك.'
                : 'No experience needed — everything is ready and waiting for you.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {steps.map((s, i) => <StepCard key={s.num} {...s} ar={ar} delay={i * 0.12} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(64px,10vw,120px) 24px', background: 'var(--bg)', position: 'relative', overflow: 'hidden', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 900, color: 'var(--chalk)', lineHeight: 1.05, marginBottom: 16 }}>
            {ar ? (
              <><span style={{ background: 'linear-gradient(90deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ابدأ رحلتك</span> دلوقتي</>
            ) : (
              <>Start Your <span style={{ background: 'linear-gradient(90deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Journey</span> Today</>
            )}
          </h2>
          <p style={{ color: 'var(--ash-light)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 32 }}>
            {ar
              ? 'انضم لآلاف المتدربين اللي بيحققوا نتائج حقيقية مع GYMZ — مجاناً تماماً.'
              : 'Join thousands of athletes achieving real results with GYMZ — completely free.'}
          </p>
          <Link href="/register">
            <motion.div className="btn btn-primary" whileTap={{ scale: 0.97 }} style={{ fontSize: '0.95rem', padding: '14px 32px', display: 'inline-flex' }}>
              <Zap size={16} /> {ar ? 'أنشئ حسابك الآن' : 'Create Your Free Account'}
            </motion.div>
          </Link>
          <div style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--ash)' }}>
            {ar ? '✓ مجاناً تماماً  ✓ بدون بطاقة ائتمان  ✓ ابدأ فوراً' : '✓ Completely Free  ✓ No Credit Card  ✓ Start Immediately'}
          </div>
        </motion.div>
      </section>
    </>
  );
}
