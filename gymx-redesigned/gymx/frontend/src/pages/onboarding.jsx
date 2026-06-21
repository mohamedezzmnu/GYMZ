import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../lib/supabaseClient';

const STEPS = {
  ar: [
    {
      id: 'goal',
      question: 'إيه هدفك الأساسي؟',
      subtitle: 'اختار هدف واحد بس — هنبني عليه برنامجك.',
      options: [
        { id: 'burn',    icon: '🔥', label: 'حرق دهون',   desc: 'عايز تخس وتوضح العضل' },
        { id: 'muscle',  icon: '💪', label: 'بناء عضل',   desc: 'عايز تضخم وتكبر في الحجم' },
        { id: 'fitness', icon: '⚡', label: 'لياقة عامة', desc: 'عايز تبقى أحسن وأكتر نشاط' },
        { id: 'health',  icon: '❤️', label: 'صحة أفضل',  desc: 'عايز تعيش أفضل وتبعد عن الأمراض' },
      ],
    },
    {
      id: 'level',
      question: 'إيه مستواك دلوقتي؟',
      subtitle: 'مش مشكلة لو مبتدئ — كلنا بدأنا من الصفر.',
      options: [
        { id: 'beginner',      icon: '🌱', label: 'مبتدئ',       desc: 'أقل من 6 شهور في الجيم' },
        { id: 'intermediate',  icon: '🏋️', label: 'متوسط',       desc: 'من 6 شهور لسنتين' },
        { id: 'advanced',      icon: '🚀', label: 'متقدم',        desc: 'أكتر من سنتين وعارف إيه بيعمله' },
      ],
    },
    {
      id: 'days',
      question: 'قادر تيجي الجيم كام يوم في الأسبوع؟',
      subtitle: 'كن واقعي — الاستمرارية أهم من الشدة.',
      options: [
        { id: '2', icon: '📅', label: '2 أيام',  desc: 'وقت محدود — هنستغله صح' },
        { id: '3', icon: '📅', label: '3 أيام',  desc: 'الأمثل للأغلبية' },
        { id: '4', icon: '📅', label: '4 أيام',  desc: 'جدي ومتحمس' },
        { id: '5', icon: '📅', label: '5+ أيام', desc: 'مفيش وقت للراحة 😅' },
      ],
    },
  ],
  en: [
    {
      id: 'goal',
      question: 'What is your main goal?',
      subtitle: 'Pick one — we will build your program around it.',
      options: [
        { id: 'burn',    icon: '🔥', label: 'Burn Fat',        desc: 'Lose weight and get lean' },
        { id: 'muscle',  icon: '💪', label: 'Build Muscle',    desc: 'Get bigger and stronger' },
        { id: 'fitness', icon: '⚡', label: 'General Fitness', desc: 'Feel better and more active' },
        { id: 'health',  icon: '❤️', label: 'Better Health',   desc: 'Live healthier, avoid illness' },
      ],
    },
    {
      id: 'level',
      question: 'What is your current level?',
      subtitle: 'No worries if you are a beginner — we all started from zero.',
      options: [
        { id: 'beginner',     icon: '🌱', label: 'Beginner',     desc: 'Less than 6 months in the gym' },
        { id: 'intermediate', icon: '🏋️', label: 'Intermediate', desc: '6 months to 2 years' },
        { id: 'advanced',     icon: '🚀', label: 'Advanced',     desc: 'Over 2 years, knows what he is doing' },
      ],
    },
    {
      id: 'days',
      question: 'How many days per week can you train?',
      subtitle: 'Be realistic — consistency beats intensity.',
      options: [
        { id: '2', icon: '📅', label: '2 Days',  desc: 'Limited time — we will make it work' },
        { id: '3', icon: '📅', label: '3 Days',  desc: 'Ideal for most people' },
        { id: '4', icon: '📅', label: '4 Days',  desc: 'Serious and motivated' },
        { id: '5', icon: '📅', label: '5+ Days', desc: 'No rest days 😅' },
      ],
    },
  ],
};

const PROGRAM_MAP = {
  ar: {
    burn_beginner:      { name: 'كامل الجسم', sub: 'Full Body',      reason: 'الأفضل للحرق مع بناء قاعدة عضلية' },
    burn_intermediate:  { name: 'دفع وسحب وأرجل', sub: 'Push / Pull / Legs', reason: 'حجم تمرين أعلى = حرق أكتر' },
    burn_advanced:      { name: 'دفع وسحب وأرجل', sub: 'Push / Pull / Legs', reason: 'شدة عالية ومناسب لمستواك' },
    muscle_beginner:    { name: 'كامل الجسم', sub: 'Full Body', reason: 'تردد عالي على كل عضلة = نمو أسرع للمبتدئ' },
    muscle_intermediate:{ name: 'أعلى وأسفل', sub: 'Upper / Lower', reason: 'توازن ممتاز بين الحجم والتعافي' },
    muscle_advanced:    { name: 'دفع وسحب وأرجل', sub: 'Push / Pull / Legs', reason: 'الأكثر تخصصاً لبناء العضل' },
    fitness_beginner:   { name: 'كامل الجسم',      reason: 'شامل وبسيط ومثالي للبداية' },
    fitness_intermediate:{ name: 'أعلى وأسفل', sub: 'Upper / Lower', reason: 'تنوع ممتاز ومناسب لمستواك' },
    fitness_advanced:   { name: 'دفع وسحب وأرجل', sub: 'Push / Pull / Legs', reason: 'تنوع عالي وشدة مناسبة' },
    health_beginner:    { name: 'كامل الجسم',      reason: 'خفيف ومتوازن ومناسب للصحة العامة' },
    health_intermediate:{ name: 'كامل الجسم', sub: 'Full Body', reason: 'تردد عالي بشدة معتدلة' },
    health_advanced:    { name: 'أعلى وأسفل', sub: 'Upper / Lower', reason: 'متوازن ومناسب للحفاظ على الصحة' },
  },
  en: {
    burn_beginner:      { name: 'Full Body', nameAr: 'كامل الجسم',         reason: 'Best for burning fat while building a base' },
    burn_intermediate:  { name: 'Push Pull Legs',    reason: 'Higher volume = more calories burned' },
    burn_advanced:      { name: 'Push Pull Legs',    reason: 'High intensity, suits your level' },
    muscle_beginner:    { name: 'Full Body', nameAr: 'كامل الجسم',         reason: 'High frequency per muscle = faster gains' },
    muscle_intermediate:{ name: 'Upper Lower',       reason: 'Great balance between volume and recovery' },
    muscle_advanced:    { name: 'Push Pull Legs',    reason: 'Most specialized for muscle building' },
    fitness_beginner:   { name: 'Full Body', nameAr: 'كامل الجسم',         reason: 'Comprehensive, simple, perfect to start' },
    fitness_intermediate:{ name: 'Upper Lower',      reason: 'Great variety, suits your level' },
    fitness_advanced:   { name: 'Push Pull Legs',    reason: 'High variety and suitable intensity' },
    health_beginner:    { name: 'Full Body', nameAr: 'كامل الجسم',         reason: 'Light, balanced, great for general health' },
    health_intermediate:{ name: 'Full Body', nameAr: 'كامل الجسم',         reason: 'High frequency at moderate intensity' },
    health_advanced:    { name: 'Upper Lower',       reason: 'Balanced and great for maintaining health' },
  },
};

export default function OnboardingPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const steps = STEPS[lang];
  const programMap = PROGRAM_MAP[lang];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  // لو اليوزر عمل onboarding قبل كده — جيب بياناته
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAnswers({ goal: data.goal, level: data.level, days: data.days_per_week?.toString() });
          setDone(true);
        }
      });
  }, [user]);

  // احفظ في Supabase لما يخلص
  const saveOnboarding = async (finalAnswers, program) => {
    if (!user) return;
    setSaving(true);
    // احفظ الـ onboarding
    await supabase.from('user_onboarding').upsert({
      user_id: user.id,
      goal: finalAnswers.goal,
      level: finalAnswers.level,
      days_per_week: parseInt(finalAnswers.days),
      recommended_program: program.sub || program.name,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // سجّله في البرنامج تلقائياً
    const levelMap = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' };
    await supabase.from('user_programs').upsert({
      user_id: user.id,
      program_title: program.sub || program.name,
      program_title_ar: program.name,
      days_per_week: parseInt(finalAnswers.days),
      level: levelMap[finalAnswers.level] || finalAnswers.level,
      progress: 0,
      is_active: true,
    }, { onConflict: 'user_id,program_title' });

    setSaving(false);
  };

  const select = (optionId) => {
    const newAnswers = { ...answers, [steps[step].id]: optionId };
    setAnswers(newAnswers);
    if (step < steps.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      setTimeout(async () => {
        const key = `${newAnswers.goal}_${newAnswers.level}`;
        const program = programMap[key] || (lang === 'ar'
          ? { name: 'كامل الجسم', reason: 'الأنسب لبدايتك' }
          : { name: 'Full Body', reason: 'Best to start with' });
        await saveOnboarding(newAnswers, program);
        setDone(true);
      }, 300);
    }
  };

  const getProgram = () => {
    const key = `${answers.goal}_${answers.level}`;
    return programMap[key] || (lang === 'ar'
      ? { name: 'كامل الجسم', reason: 'الأنسب لبدايتك' }
      : { name: 'Full Body', nameAr: 'كامل الجسم', reason: 'Best to start with' });
  };

  const txt = {
    ar: {
      step: 'خطوة',
      of: 'من',
      back: 'رجوع',
      result: 'البرنامج المثالي ليك',
      reason: 'ليه البرنامج ده؟',
      go: 'روح البرامج',
      skip: 'تخطي',
    },
    en: {
      step: 'Step',
      of: 'of',
      back: 'Back',
      result: 'Your Perfect Program',
      reason: 'Why this program?',
      go: 'View Programs',
      skip: 'Skip',
    },
  }[lang];

  return (
    <>
      <Head><title>{lang === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey'} — GYMZ</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,77,46,0.08) 0%, transparent 60%)' }} />

        <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>

          {!done ? (
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Progress */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)', letterSpacing: '0.02em' }}>
                      {txt.step} {step + 1} {txt.of} {steps.length}
                    </span>
                    <button onClick={() => router.push('/programs?program=' + encodeURIComponent(getProgram().sub || getProgram().name))} style={{ background: 'none', border: 'none', color: 'var(--ash)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', cursor: 'pointer' }}>
                      {txt.skip} ←
                    </button>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <motion.div
                      animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', boxShadow: 'none' }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div style={{ marginBottom: 32, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.04em', marginBottom: 10 }}>
                    {steps[step].question}
                  </h1>
                  <p style={{ color: 'var(--ash-light)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
                    {steps[step].subtitle}
                  </p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {steps[step].options.map((opt, i) => (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => select(opt.id)}
                      whileHover={{ borderColor: 'rgba(255,77,46,0.5)', background: 'rgba(255,77,46,0.06)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 20px', borderRadius: 14, cursor: 'pointer', width: '100%',
                        background: answers[steps[step].id] === opt.id ? 'rgba(255,77,46,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${answers[steps[step].id] === opt.id ? 'rgba(255,77,46,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        direction: lang === 'ar' ? 'rtl' : 'ltr',
                        transition: 'all 200ms',
                      }}
                    >
                      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{opt.icon}</span>
                      <div style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--chalk)', letterSpacing: '0.03em' }}>{opt.label}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ash-light)', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      <span style={{ color: 'var(--ash)', fontSize: '1rem', flexShrink: 0 }}>{lang === 'ar' ? '←' : '→'}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Back */}
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} style={{
                    marginTop: 20, background: 'none', border: 'none',
                    color: 'var(--ash)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center',
                  }}>
                    {lang === 'ar' ? '→' : '←'} {txt.back}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,77,46,0.3)', borderRadius: 20,
                padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }} />

              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 8 }}>{txt.result}</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: 20 }}>
                {getProgram().name}
              </h2>

              {/* تفاصيل البرنامج */}
              <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,77,46,0.06)', border: '1px solid rgba(255,77,46,0.15)', marginBottom: 16, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.02em', marginBottom: 6 }}>{txt.reason}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ash-light)', lineHeight: 1.7, margin: 0 }}>
                  💡 {getProgram().reason}
                </p>
              </div>

              {/* تأكيد الانضمام التلقائي */}
              {user && (
                <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>✅</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#4ade80' }}>
                    {lang === 'ar' ? 'تم تسجيلك في البرنامج تلقائياً' : 'You have been enrolled automatically'}
                  </span>
                </div>
              )}

              {/* زرار ابدأ */}
              <motion.button
                onClick={() => router.push('/programs?program=' + encodeURIComponent(getProgram().sub || getProgram().name))}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '14px',
                  background: 'var(--accent)',
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem', letterSpacing: '0.02em', cursor: 'pointer',
                  boxShadow: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? '🏋️ شوف البرنامج' : '🏋️ View Program')}
              </motion.button>

              {/* زرار إعادة الاختيار */}
              <button
                onClick={() => { setDone(false); setStep(0); setAnswers({}); }}
                style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--ash)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer', width: '100%', textAlign: 'center' }}
              >
                {lang === 'ar' ? '↺ اختار برنامج تاني' : '↺ Choose a different program'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
