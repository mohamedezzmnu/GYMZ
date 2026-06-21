// src/pages/workout.jsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// صفحة سجل الجلسة — GYMZ
// بتخلي المستخدم يسجل جلسة تمرين كاملة مع الوزن
// الجداول المستخدمة: workout_sessions + weight_log
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  CheckCircle2, Circle, Dumbbell, Scale, Flame,
  ChevronDown, ChevronUp, Plus, Save, TrendingUp,
  Calendar, ArrowRight, BarChart2, Clock,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// ── بيانات التمارين لكل برنامج ───────────────────────────
const PROGRAM_EXERCISES = {
  'Full Body': {
    'اليوم الأول': [
      'إحماء 10 دقايق', 'بنش برس 4×8', 'سكوات 4×10',
      'رووينج بار 3×10', 'ضغط كتف 3×10', 'كيرل بايسبس 3×12', 'تبريد وإطالات',
    ],
    'اليوم التاني': [
      'إحماء 10 دقايق', 'ضغط بنش مائل 4×8', 'ديد ليفت رومانيان 4×10',
      'لات بول داون 3×12', 'رفع جانبي 3×15', 'تراسبس بوش داون 3×12', 'تبريد وإطالات',
    ],
    'اليوم التالت': [
      'إحماء 10 دقايق', 'فلاي كيبل 3×15', 'ليج برس 4×12',
      'سيتد رووينج 3×12', 'أرنولد برس 3×10', 'هامر كيرل 3×12', 'تبريد وإطالات',
    ],
  },
  'PPL': {
    'دفع (Chest/Shoulder/Triceps)': [
      'إحماء 10 دقايق', 'بنش برس 4×8', 'ضغط كتف 4×8',
      'فلاي دمبل 3×12', 'رفع جانبي 3×15', 'تراسبس بوش داون 3×12', 'سكال كراشر 3×10',
    ],
    'سحب (Back/Biceps)': [
      'إحماء 10 دقايق', 'ديد ليفت 4×5', 'لات بول داون 4×10',
      'رووينج بار 3×10', 'فيس بول 3×15', 'كيرل بايسبس 3×12', 'هامر كيرل 3×12',
    ],
    'أرجل (Legs)': [
      'إحماء 10 دقايق', 'سكوات 4×8', 'ليج برس 4×12',
      'ديد ليفت رومانيان 3×10', 'ليج كيرل 3×12', 'ليج إكستنشن 3×15', 'كالف ريز 4×15',
    ],
  },
  'Upper/Lower': {
    'جزء علوي (أ)': [
      'إحماء 10 دقايق', 'بنش برس 4×6', 'رووينج دمبل 4×8',
      'ضغط كتف 3×10', 'لات بول داون 3×10', 'كيرل بار 3×10', 'تراسبس 3×12',
    ],
    'جزء سفلي (أ)': [
      'إحماء 10 دقايق', 'سكوات 4×6', 'ليج كيرل 4×10',
      'ليج إكستنشن 3×12', 'كالف ريز 4×15', 'هيب ثرست 3×12', 'تبريد وإطالات',
    ],
  },
};

// ── helpers ───────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >{children}</motion.div>
  );
}

function GlassCard({ children, style = {}, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent ? accent + '30' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── مكون تمرين واحد ──────────────────────────────────────
function ExerciseRow({ name, checked, onToggle, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
        background: checked ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${checked ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)'}`,
        marginBottom: 8, transition: 'all 0.2s',
        direction: 'rtl',
      }}
    >
      <motion.div animate={{ scale: checked ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.2 }}>
        {checked
          ? <CheckCircle2 size={18} color="#4ade80" />
          : <Circle size={18} color="rgba(255,255,255,0.2)" />
        }
      </motion.div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '0.88rem',
        color: checked ? 'rgba(255,255,255,0.5)' : 'var(--chalk)',
        textDecoration: checked ? 'line-through' : 'none',
        flex: 1, transition: 'all 0.2s',
      }}>
        {name}
      </span>
    </motion.div>
  );
}

// ── مكون يوم تمرين ───────────────────────────────────────
function DayCard({ dayLabel, exercises, isOpen, onToggle, onSave, isSaving, savedToday }) {
  const [checked, setChecked] = useState({});
  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = exercises.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const toggleEx = (name) => setChecked(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <GlassCard style={{ marginBottom: 12 }} accent={savedToday ? '#4ade80' : null}>
      {savedToday && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#4ade80,transparent)' }} />
      )}
      <div
        onClick={onToggle}
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em', color: 'var(--chalk)' }}>
              {dayLabel}
            </span>
            {savedToday && (
              <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', letterSpacing: '0.06em' }}>
                ✓ اتسجل
              </span>
            )}
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', borderRadius: 2, background: pct === 100 ? '#4ade80' : 'var(--accent)' }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)', whiteSpace: 'nowrap' }}>
              {doneCount}/{totalCount}
            </span>
          </div>
        </div>
        <div style={{ marginRight: 16 }}>
          {isOpen ? <ChevronUp size={16} color="var(--ash)" /> : <ChevronDown size={16} color="var(--ash)" />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', direction: 'rtl' }}>
              {exercises.map((ex, i) => (
                <ExerciseRow
                  key={ex}
                  name={ex}
                  checked={!!checked[ex]}
                  onToggle={() => toggleEx(ex)}
                  delay={i * 0.04}
                />
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSave(dayLabel, Object.values(checked).filter(Boolean).length === totalCount)}
                disabled={isSaving || doneCount === 0}
                style={{
                  width: '100%', marginTop: 12, padding: '13px',
                  borderRadius: 10, border: 'none', cursor: doneCount === 0 ? 'not-allowed' : 'pointer',
                  background: doneCount === 0 ? 'rgba(255,255,255,0.05)' : pct === 100 ? 'rgba(74,222,128,0.15)' : 'rgba(255,77,46,0.15)',
                  color: doneCount === 0 ? 'var(--ash)' : pct === 100 ? '#4ade80' : 'var(--accent)',
                  border: `1px solid ${doneCount === 0 ? 'rgba(255,255,255,0.06)' : pct === 100 ? 'rgba(74,222,128,0.3)' : 'rgba(255,77,46,0.3)'}`,
                  fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {isSaving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Flame size={15} />
                  </motion.div>
                ) : (
                  <Save size={15} />
                )}
                {isSaving ? 'بيتسجل...' : doneCount === 0 ? 'فعّل تمرين أول' : `سجل الجلسة (${doneCount}/${totalCount})`}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// الصفحة الرئيسية
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function WorkoutPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [userPrograms, setUserPrograms]   = useState([]);
  const [sessions, setSessions]           = useState([]);   // آخر 20 جلسة
  const [weightLog, setWeightLog]         = useState([]);
  const [newWeight, setNewWeight]         = useState('');
  const [openDay, setOpenDay]             = useState(null);
  const [savingDay, setSavingDay]         = useState(null);
  const [logingWeight, setLogingWeight]   = useState(false);
  const [activeProgram, setActiveProgram] = useState(0);
  const [loading, setLoading]             = useState(true);

  // ── جلب البيانات ─────────────────────────────────────
  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: progs }, { data: sess }, { data: wlog }] = await Promise.all([
      supabase.from('user_programs').select('*').eq('user_id', user.id),
      supabase.from('workout_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('weight_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(14),
    ]);
    if (progs) setUserPrograms(progs);
    if (sess)  setSessions(sess);
    if (wlog)  setWeightLog(wlog);
    setLoading(false);
  };

  // ── حفظ جلسة ─────────────────────────────────────────
  const saveSession = async (dayLabel, done) => {
    setSavingDay(dayLabel);
    const program = userPrograms[activeProgram];
    const programTitle = program?.program_title || 'برنامج مخصص';
    const sessionDay = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });

    const { error } = await supabase.from('workout_sessions').insert({
      user_id:       user.id,
      program_title: programTitle,
      day_label:     dayLabel,
      done:          done,
      session_day:   sessionDay,
      created_at:    new Date().toISOString(),
    });

    if (error) {
      toast.error('حصل خطأ، جرب تاني');
    } else {
      toast.success(done ? '🔥 جلسة كاملة! عظيم' : '✅ اتسجلت الجلسة');
      await fetchAll();
    }
    setSavingDay(null);
  };

  // ── تسجيل الوزن ──────────────────────────────────────
  const logWeight = async () => {
    if (!newWeight || isNaN(newWeight) || +newWeight < 30 || +newWeight > 300) {
      toast.error('أدخل وزن صحيح');
      return;
    }
    setLogingWeight(true);
    const { error } = await supabase.from('weight_log').insert({
      user_id:   user.id,
      weight:    parseFloat(newWeight),
      logged_at: new Date().toISOString(),
    });
    if (error) toast.error('حصل خطأ');
    else {
      toast.success('✅ اتسجل الوزن');
      setNewWeight('');
      await fetchAll();
    }
    setLogingWeight(false);
  };

  // ── حسابات ────────────────────────────────────────────
  const todayStr = new Date().toDateString();
  const todaySessions = sessions.filter(s => new Date(s.created_at).toDateString() === todayStr);
  const currentWeight = weightLog[0]?.weight;
  const prevWeight = weightLog[1]?.weight;
  const weightDiff = currentWeight && prevWeight ? (currentWeight - prevWeight).toFixed(1) : null;

  // الجلسات اللي اتسجلت النهارده
  const savedTodayLabels = new Set(todaySessions.map(s => s.day_label));

  // البرنامج النشط وتمريناته
  const activeProgObj = userPrograms[activeProgram];
  const activeProgramName = activeProgObj?.program_title || '';
  const programDays = PROGRAM_EXERCISES[activeProgramName] || null;

  // آخر 7 أيام للرسم
  const last7 = [...weightLog].reverse().slice(-7);

  if (!user || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Dumbbell size={30} color="var(--accent)" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head><title>سجل الجلسة — GYMZ</title></Head>

      {/* خلفية */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 20% 20%, rgba(255,77,46,0.07) 0%,transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(74,222,128,0.04) 0%,transparent 60%)' }} />

      <div style={{ minHeight: '100vh', paddingTop: 72, paddingBottom: 100, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>

          {/* ── HEADER ── */}
          <Reveal>
            <div style={{ marginBottom: 24, direction: 'rtl' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,77,46,0.7)', letterSpacing: '0.02em', marginBottom: 6 }}>
                — جلسة اليوم
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,2.8rem)', letterSpacing: '0.03em', color: 'var(--chalk)', lineHeight: 1, marginBottom: 6 }}>
                وقت الجيم <span style={{ color: 'var(--accent)' }}>💪</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ash-light)' }}>
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </Reveal>

          {/* ── STATS QUICK ── */}
          <Reveal delay={0.05}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { icon: Flame,    label: 'النهارده',   value: todaySessions.length, color: 'var(--accent)' },
                { icon: Calendar, label: 'الشهر',       value: sessions.filter(s => new Date(s.created_at).getMonth() === new Date().getMonth()).length, color: '#FF6B00' },
                { icon: Scale,    label: 'الوزن',       value: currentWeight ? `${currentWeight}kg` : '—', color: '#4ade80' },
              ].map(({ icon: Icon, label, value, color }) => (
                <GlassCard key={label} style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <Icon size={18} color={color} style={{ marginBottom: 6 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--chalk)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ash)', letterSpacing: '0.07em', marginTop: 4 }}>{label}</div>
                </GlassCard>
              ))}
            </div>
          </Reveal>

          {/* ── تسجيل الوزن ── */}
          <Reveal delay={0.1}>
            <GlassCard style={{ padding: '20px', marginBottom: 20 }} accent="#4ade80">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, direction: 'rtl' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={16} color="#4ade80" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--chalk)' }}>سجل وزنك</div>
                  {weightDiff !== null && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: +weightDiff < 0 ? '#4ade80' : '#FF6B00', marginTop: 2 }}>
                      {+weightDiff < 0 ? '↓' : '↑'} {Math.abs(weightDiff)} kg عن آخر مرة
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, direction: 'rtl' }}>
                <input
                  type="number"
                  placeholder="الوزن بالكيلو"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && logWeight()}
                  style={{
                    flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--chalk)',
                    fontFamily: 'var(--font-display)', fontSize: '1rem', outline: 'none',
                    direction: 'rtl',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logWeight}
                  disabled={logingWeight}
                  style={{
                    padding: '11px 18px', borderRadius: 10, border: '1px solid rgba(74,222,128,0.3)',
                    background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={15} />
                  سجل
                </motion.button>
              </div>

              {/* Mini weight history */}
              {last7.length > 1 && (
                <div style={{ marginTop: 14, display: 'flex', gap: 6, alignItems: 'flex-end', direction: 'ltr', height: 40 }}>
                  {last7.map((w, i) => {
                    const min = Math.min(...last7.map(x => x.weight));
                    const max = Math.max(...last7.map(x => x.weight));
                    const range = max - min || 1;
                    const h = 10 + ((w.weight - min) / range) * 28;
                    return (
                      <div key={i} title={`${w.weight}kg`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: '100%', height: h, borderRadius: 4, background: i === last7.length - 1 ? '#4ade80' : 'rgba(74,222,128,0.25)', transition: 'all 0.3s' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ash)' }}>
                          {new Date(w.logged_at).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </Reveal>

          {/* ── اختيار البرنامج ── */}
          {userPrograms.length > 0 && (
            <Reveal delay={0.12}>
              <div style={{ marginBottom: 16, direction: 'rtl' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.02em', marginBottom: 10 }}>
                  برنامجك
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {userPrograms.map((p, i) => (
                    <motion.button
                      key={p.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { setActiveProgram(i); setOpenDay(null); }}
                      style={{
                        padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: activeProgram === i ? 'rgba(255,77,46,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${activeProgram === i ? 'rgba(255,77,46,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: activeProgram === i ? 'var(--accent)' : 'var(--ash-light)',
                        fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '0.03em',
                        transition: 'all 0.2s',
                      }}
                    >
                      {p.program_title}
                    </motion.button>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* ── أيام البرنامج ── */}
          <Reveal delay={0.15}>
            <div style={{ marginBottom: 8, direction: 'rtl' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.02em', marginBottom: 12 }}>
                {programDays ? 'اختار يوم تمرينك' : 'سجل جلسة سريعة'}
              </div>
            </div>

            {programDays ? (
              Object.entries(programDays).map(([dayLabel, exercises], i) => (
                <DayCard
                  key={dayLabel}
                  dayLabel={dayLabel}
                  exercises={exercises}
                  isOpen={openDay === dayLabel}
                  onToggle={() => setOpenDay(prev => prev === dayLabel ? null : dayLabel)}
                  onSave={saveSession}
                  isSaving={savingDay === dayLabel}
                  savedToday={savedTodayLabels.has(dayLabel)}
                />
              ))
            ) : (
              /* لو البرنامج مش في القائمة أو مش مسجل — سجل جلسة سريعة */
              <GlassCard style={{ padding: 20 }}>
                <div style={{ direction: 'rtl' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', marginBottom: 14, lineHeight: 1.6 }}>
                    {userPrograms.length === 0
                      ? 'مش مسجل في برنامج لسه — روح صفحة البرامج واختار برنامجك أولاً.'
                      : 'تمارين برنامجك مش متاحة في القائمة، بس قدر تسجل الجلسة.'}
                  </p>
                  {userPrograms.length === 0 ? (
                    <Link href="/programs" style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ x: -4 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.02em', cursor: 'pointer' }}
                      >
                        اختار برنامج <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => saveSession(activeProgramName || 'جلسة', true)}
                      disabled={!!savingDay}
                      style={{
                        padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(255,77,46,0.3)',
                        background: 'rgba(255,77,46,0.1)', color: 'var(--accent)',
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <CheckCircle2 size={16} />
                      سجل جلسة اليوم
                    </motion.button>
                  )}
                </div>
              </GlassCard>
            )}
          </Reveal>

          {/* ── آخر الجلسات ── */}
          {sessions.length > 0 && (
            <Reveal delay={0.2}>
              <div style={{ marginTop: 28, direction: 'rtl' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.02em', marginBottom: 12 }}>
                  آخر الجلسات
                </div>
                {sessions.slice(0, 5).map((s, i) => (
                  <GlassCard key={s.id} style={{ padding: '14px 18px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--chalk)', marginBottom: 3 }}>
                          {s.day_label || s.program_title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', letterSpacing: '0.05em' }}>
                          {new Date(s.created_at).toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.program_title && (
                          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'rgba(255,77,46,0.08)', border: '1px solid rgba(255,77,46,0.2)', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                            {s.program_title}
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', color: s.done ? '#4ade80' : '#FF6B00' }}>
                          {s.done ? '✓' : '~'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </Reveal>
          )}

        </div>
      </div>
    </>
  );
}
