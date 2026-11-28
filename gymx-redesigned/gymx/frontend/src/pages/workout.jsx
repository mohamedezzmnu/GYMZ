// src/pages/workout.jsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// صفحة سجل الجلسة — GYMZ
// بتخلي المستخدم يسجل جلسة تمرين كاملة مع الوزن
// الجداول المستخدمة: workout_sessions + weight_log
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  CheckCircle2, Circle, Dumbbell, Scale, Flame,
  ChevronDown, ChevronUp, Plus, Save,
  Calendar, ArrowRight, Clock,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { PROGRAMS } from '../data/programs';
import { EXERCISES } from '../data/exercises';

const PROGRAM_EXERCISE_ID_MAP = {
  'أرنولد برس': 19,
  'أوفر هيد برس': 14,
  'أوفر هيد برس بار': 14,
  'بريتشر كيرل': 24,
  'بنش برس': 1,
  'بنش برس بار': 1,
  'تراسبس بوش داون': 31,
  'ديد ليفت': 7,
  'ديد ليفت رومانيان': 37,
  'رفع أمامي': 17,
  'رفع جانبي': 16,
  'رفع سمانة': 56,
  'رفع سمانة جالس': 57,
  'رفع سمانة واقف': 56,
  'رومانيان ديد ليفت': 37,
  'رووينج بار': 9,
  'سبليت سكوات بلغاري': 41,
  'سكال كراشر': 30,
  'سكوات': 35,
  'سكوات بار': 35,
  'سيتد رووينج': 11,
  'ضغط بنش مائل': 2,
  'ضغط بنش مائل دمبل': 2,
  'ضغط كتف': 14,
  'ضغط مائل دمبل': 2,
  'عقلة': 8,
  'عقلة أو كيبل': 8,
  'فلاي دمبل': 5,
  'فلاي كيبل': 4,
  'فيس بولز': 13,
  'كيبل كيك باك': 46,
  'كيرل بار': 21,
  'كيرل بايسبس': 22,
  'لات بول داون': 10,
  'ليج اكستنشن': 39,
  'ليج برس': 36,
  'ليج كيرل': 38,
  'مط تراسبس فوق الرأس': 32,
  'هامر كيرل': 23,
  'هيب ثراست': 44,
};

const PROGRAM_EXERCISE_EN_MAP = {
  'إحماء': 'Warm-up',
  'تبريد وإطالات': 'Cool-down & Stretch',
  'أرنولد برس': 'Arnold Press',
  'أوفر هيد برس': 'Overhead Press',
  'أوفر هيد برس بار': 'Barbell Overhead Press',
  'بريتشر كيرل': 'Preacher Curl',
  'بنش برس': 'Bench Press',
  'بنش برس بار': 'Barbell Bench Press',
  'تراسبس بوش داون': 'Tricep Pushdown',
  'ديد ليفت': 'Deadlift',
  'ديد ليفت رومانيان': 'Romanian Deadlift',
  'رفع أمامي': 'Front Raise',
  'رفع جانبي': 'Lateral Raise',
  'رفع سمانة': 'Calf Raise',
  'رفع سمانة جالس': 'Seated Calf Raise',
  'رفع سمانة واقف': 'Standing Calf Raise',
  'رومانيان ديد ليفت': 'Romanian Deadlift',
  'رووينج بار': 'Barbell Row',
  'سبليت سكوات بلغاري': 'Bulgarian Split Squat',
  'سكال كراشر': 'Skull Crusher',
  'سكوات': 'Squat',
  'سكوات بار': 'Barbell Squat',
  'سيتد رووينج': 'Seated Row',
  'ضغط بنش مائل': 'Incline Bench Press',
  'ضغط بنش مائل دمبل': 'Incline Dumbbell Press',
  'ضغط كتف': 'Shoulder Press',
  'ضغط مائل دمبل': 'Incline Dumbbell Press',
  'عقلة': 'Pull-ups',
  'عقلة أو كيبل': 'Pull-ups / Lat Pulldown',
  'فلاي دمبل': 'Dumbbell Fly',
  'فلاي كيبل': 'Cable Fly',
  'فيس بولز': 'Face Pulls',
  'كيبل كيك باك': 'Cable Kickback',
  'كيرل بار': 'Barbell Curl',
  'كيرل بايسبس': 'Bicep Curl',
  'لات بول داون': 'Lat Pulldown',
  'ليج اكستنشن': 'Leg Extension',
  'ليج برس': 'Leg Press',
  'ليج كيرل': 'Leg Curl',
  'مط تراسبس فوق الرأس': 'Overhead Tricep Extension',
  'هامر كيرل': 'Hammer Curl',
  'هيب ثراست': 'Hip Thrust',
};

function getEnglishExerciseName(rawName) {
  const id = PROGRAM_EXERCISE_ID_MAP[rawName];
  const exObj = id ? EXERCISES.find((e) => e.id === id) : null;
  if (exObj?.name_en) return exObj.name_en;
  if (exObj?.name && !/[\u0600-\u06FF]/.test(exObj.name)) return exObj.name;
  if (PROGRAM_EXERCISE_EN_MAP[rawName]) return PROGRAM_EXERCISE_EN_MAP[rawName];
  return rawName;
}

// ── بناء أيام وتمارين البرنامج من نفس بيانات صفحة البرامج ──
function getProgramDays(programTitle) {
  if (!programTitle) return null;
  const norm = (s) => (s || '').toLowerCase().trim();
  const t = norm(programTitle);

  let prog = PROGRAMS.find((p) => norm(p.subtitle) === t || norm(p.title) === t);
  if (!prog) {
    prog = PROGRAMS.find((p) => t.includes(norm(p.subtitle)) || norm(p.subtitle).includes(t));
  }
  if (!prog) return null;

  const result = {};
  prog.days_detail.forEach((d) => {
    result[d.day] = d.exercises;
  });
  return result;
}

// ── عرض فقط: إزالة الإيموجي وقت العرض دون تعديل البيانات الأصلية ──
function stripEmoji(text) {
  return (text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

function parseDayLabel(raw) {
  const clean = stripEmoji(raw);
  const parts = clean.split('—').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2 && /[a-zA-Z]/.test(parts[1])) {
    return { primary: parts[1].toUpperCase(), subtitle: parts[0] };
  }
  return { primary: parts[0] || clean, subtitle: parts[1] || '' };
}

function parseExerciseDetail(detail) {
  const parts = (detail || '').split('—').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { meta: parts[0], muscle: parts[1] };
  return { meta: parts[0] || detail || '', muscle: '' };
}

// ── helpers ───────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({ children, style = {}, accent }) {
  return (
    <div
      className="glass-card"
      style={{
        borderColor: accent ? 'var(--glass-border-hover)' : 'var(--glass-border)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── مكون تمرين واحد ──────────────────────────────────────
function ExerciseRow({ index, exercise, checked, onToggle, delay, isLast }) {
  const { meta, muscle } = parseExerciseDetail(exercise.detail);
  const enName = getEnglishExerciseName(exercise.name);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.28 }}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 4px',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--glass-border)',
        background: checked ? 'var(--volt-dim)' : 'transparent',
        transition: 'background 0.2s',
        direction: 'rtl',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: checked ? 'var(--volt)' : 'var(--ash)',
          width: 20,
          flexShrink: 0,
          textAlign: 'center',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          dir="ltr"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.96rem',
            color: checked ? 'var(--volt-bright)' : 'var(--chalk)',
            textDecoration: checked ? 'line-through' : 'none',
            textAlign: 'left',
            transition: 'color 0.2s',
          }}
        >
          {enName}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash)', marginTop: 3 }}>
          {meta}
          {muscle && (
            <>
              {' '}
              <span style={{ opacity: 0.5 }}>·</span> {muscle}
            </>
          )}
        </div>
      </div>

      <motion.div
        animate={{ scale: checked ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked
          ? <CheckCircle2 size={22} color="var(--volt)" />
          : <Circle size={22} color="var(--ash)" strokeWidth={1.6} />}
      </motion.div>
    </motion.div>
  );
}

// ── مكون يوم تمرين ───────────────────────────────────────
function DayCard({ dayIndex, dayLabel, exercises, isOpen, onToggle, onSave, isSaving, savedToday }) {
  const [checked, setChecked] = useState({});
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      return;
    }
    const startedAt = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const elapsedMin = Math.max(1, Math.round(elapsed / 60));

  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = exercises.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const toggleEx = (name) => setChecked((prev) => ({ ...prev, [name]: !prev[name] }));

  const { primary, subtitle } = parseDayLabel(dayLabel);
  const active = isOpen;

  return (
    <div
      style={{
        marginBottom: 0,
        borderBottom: '1px solid var(--glass-border)',
        background: active ? 'var(--volt-dim)' : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: '16px 4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          direction: 'rtl',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.5rem',
            color: active ? 'var(--volt)' : 'var(--iron-light)',
            width: 34,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {String(dayIndex + 1).padStart(2, '0')}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.02rem',
                color: active ? 'var(--volt)' : 'var(--chalk)',
              }}
            >
              {primary}
            </span>
            {savedToday && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.58rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: 'var(--volt-dim)',
                  border: '1px solid rgba(255, 90, 31, 0.35)',
                  color: 'var(--volt-bright)',
                }}
              >
                <CheckCircle2 size={9} /> اتسجل
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--ash-light)', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.35 }}
                style={{
                  height: '100%',
                  borderRadius: 2,
                  background: pct === 100 ? 'var(--volt-bright)' : 'var(--volt)',
                }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', whiteSpace: 'nowrap' }}>
              {doneCount}/{totalCount}
            </span>
          </div>
        </div>

        {isOpen && elapsed > 0 && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ash)', marginBottom: 2 }}>
              TIME
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.98rem', color: 'var(--chalk)' }}>
              <Clock size={13} color="var(--volt)" /> {formatTime(elapsed)}
            </div>
          </div>
        )}

        <div>
          {isOpen ? <ChevronUp size={18} color="var(--ash)" /> : <ChevronDown size={18} color="var(--ash)" />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 4px 20px', direction: 'rtl' }}>
              {exercises.map((ex, i) => (
                <ExerciseRow
                  key={ex.name}
                  index={i}
                  exercise={ex}
                  checked={!!checked[ex.name]}
                  onToggle={() => toggleEx(ex.name)}
                  delay={i * 0.03}
                  isLast={i === exercises.length - 1}
                />
              ))}

              <motion.button
                type="button"
                whileHover={doneCount === 0 ? undefined : { scale: 1.01 }}
                whileTap={doneCount === 0 ? undefined : { scale: 0.98 }}
                onClick={() => onSave(dayLabel, doneCount === totalCount, elapsedMin)}
                disabled={isSaving || doneCount === 0}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '14px',
                  borderRadius: 10,
                  cursor: doneCount === 0 ? 'not-allowed' : 'pointer',
                  background: doneCount === 0
                    ? 'rgba(255, 255, 255, 0.03)'
                    : pct === 100
                      ? 'rgba(255, 90, 31, 0.18)'
                      : 'var(--volt-dim)',
                  color: doneCount === 0
                    ? 'var(--ash)'
                    : 'var(--volt-bright)',
                  border: `1px solid ${
                    doneCount === 0
                      ? 'var(--glass-border)'
                      : pct === 100
                        ? 'rgba(255, 90, 31, 0.5)'
                        : 'var(--glass-border-hover)'
                  }`,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
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
                {isSaving
                  ? 'بيتسجل...'
                  : doneCount === 0
                    ? 'فعّل تمرين أول'
                    : `سجل الجلسة (${doneCount}/${totalCount})`}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// الصفحة الرئيسية
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function WorkoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userPrograms, setUserPrograms]   = useState([]);
  const [sessions, setSessions]           = useState([]);
  const [weightLog, setWeightLog]         = useState([]);
  const [newWeight, setNewWeight]         = useState('');
  const [openDay, setOpenDay]             = useState(null);
  const [savingDay, setSavingDay]         = useState(null);
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [activeProgram, setActiveProgram] = useState(0);
  const [loading, setLoading]             = useState(true);

  const fetchAll = useCallback(async (isMounted = () => true) => {
    if (!user?.id) return;
    setLoading(true);
    const [{ data: progs }, { data: sess }, { data: wlog }] = await Promise.all([
      supabase.from('user_programs').select('*').eq('user_id', user.id),
      supabase.from('workout_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('weight_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(14),
    ]);
    if (!isMounted()) return;
    if (progs) setUserPrograms(progs);
    if (sess)  setSessions(sess);
    if (wlog)  setWeightLog(wlog);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      router.push('/login?from=/workout');
      return;
    }
    let active = true;
    fetchAll(() => active);
    return () => {
      active = false;
    };
  }, [user?.id, authLoading, router, fetchAll]);

  const saveSession = async (dayLabel, done, durationMin = 0) => {
    if (!user?.id) return;
    setSavingDay(dayLabel);
    const program = userPrograms[activeProgram];
    const programTitle = program?.program_title || 'برنامج مخصص';
    const sessionDay = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });

    const { error } = await supabase.from('workout_sessions').insert({
      user_id:       user.id,
      program_title: programTitle,
      day_label:     dayLabel,
      done,
      session_day:   sessionDay,
      duration_min:  durationMin,
      created_at:    new Date().toISOString(),
    });

    if (error) {
      toast.error('حصل خطأ، جرب تاني');
    } else {
      toast.success(done ? 'جلسة كاملة — عظيم' : 'اتسجلت الجلسة');
      await fetchAll();
    }
    setSavingDay(null);
  };

  const logWeight = async () => {
    if (!user?.id) return;
    const parsed = parseFloat(newWeight);
    if (!newWeight || Number.isNaN(parsed) || parsed < 30 || parsed > 300) {
      toast.error('أدخل وزن صحيح');
      return;
    }
    setLoggingWeight(true);
    const { error } = await supabase.from('weight_log').insert({
      user_id:   user.id,
      weight:    parsed,
      logged_at: new Date().toISOString(),
    });
    if (error) {
      toast.error('حصل خطأ');
    } else {
      toast.success('اتسجل الوزن');
      setNewWeight('');
      await fetchAll();
    }
    setLoggingWeight(false);
  };

  const now = new Date();
  const todayStr = now.toDateString();
  const todaySessions = sessions.filter((s) => new Date(s.created_at).toDateString() === todayStr);
  const currentWeight = weightLog[0]?.weight;
  const prevWeight = weightLog[1]?.weight;
  const weightDiff = currentWeight && prevWeight ? (currentWeight - prevWeight).toFixed(1) : null;

  const savedTodayLabels = new Set(todaySessions.map((s) => s.day_label));

  const activeProgObj = userPrograms[activeProgram];
  const activeProgramName = activeProgObj?.program_title || '';
  const programDays = getProgramDays(activeProgramName);

  const last7 = [...weightLog].reverse().slice(-7);

  if (!user || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Dumbbell size={30} color="var(--volt)" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>سجل الجلسة — GYMZ</title>
      </Head>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 40% at 20% 20%, var(--volt-glow) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, var(--volt-glow) 0%, transparent 60%)',
        }}
      />

      <div className="page-shell" style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>
          {/* HEADER */}
          <Reveal>
            <div className="section" style={{ direction: 'rtl' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="rule-orange" />
                <span className="label-tag">جلسة اليوم</span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(2rem,5vw,2.8rem)',
                  color: 'var(--chalk)',
                  lineHeight: 1.05,
                  marginBottom: 6,
                }}
              >
                وقت <span style={{ color: 'var(--volt)' }}>الجيم</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ash-light)' }}>
                {now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </Reveal>

          <div className="workout-grid">
            <div className="workout-grid__main">
              {/* أيام البرنامج */}
              <Reveal delay={0.12}>
                <div className="section">
                  <div className="section-header" style={{ direction: 'rtl' }}>
                    <span className="section-header__label">
                      {programDays ? 'اختار يوم تمرينك' : 'سجل جلسة سريعة'}
                    </span>
                  </div>

                  {programDays ? (
                    <GlassCard style={{ padding: '0 20px' }}>
                      {Object.entries(programDays).map(([dayLabel, exercises], i) => (
                        <DayCard
                          key={dayLabel}
                          dayIndex={i}
                          dayLabel={dayLabel}
                          exercises={exercises}
                          isOpen={openDay === dayLabel}
                          onToggle={() => setOpenDay((prev) => (prev === dayLabel ? null : dayLabel))}
                          onSave={saveSession}
                          isSaving={savingDay === dayLabel}
                          savedToday={savedTodayLabels.has(dayLabel)}
                        />
                      ))}
                    </GlassCard>
                  ) : (
                    <GlassCard style={{ padding: 20 }}>
                      <div style={{ direction: 'rtl' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', marginBottom: 14, lineHeight: 1.6 }}>
                          {userPrograms.length === 0
                            ? 'مش مسجل في برنامج لسه — روح صفحة البرامج واختار برنامجك أولاً.'
                            : 'تمارين برنامجك مش متاحة في القائمة، بس تقدر تسجل الجلسة.'}
                        </p>
                        {userPrograms.length === 0 ? (
                          <Link href="/programs" style={{ textDecoration: 'none' }}>
                            <motion.div
                              whileHover={{ x: -4 }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                color: 'var(--volt)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              اختار برنامج <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
                            </motion.div>
                          </Link>
                        ) : (
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => saveSession(activeProgramName || 'جلسة', true)}
                            disabled={!!savingDay}
                            className="btn btn-primary"
                            style={{ padding: '11px 20px', fontSize: '0.88rem' }}
                          >
                            <CheckCircle2 size={16} />
                            سجل جلسة اليوم
                          </motion.button>
                        )}
                      </div>
                    </GlassCard>
                  )}
                </div>
              </Reveal>

              {/* آخر الجلسات */}
              {sessions.length > 0 && (
                <Reveal delay={0.18}>
                  <div className="section">
                    <div className="section-header" style={{ direction: 'rtl' }}>
                      <span className="section-header__label">آخر الجلسات</span>
                    </div>
                    <GlassCard style={{ padding: '0 18px' }}>
                      {sessions.slice(0, 5).map((s, i, arr) => {
                        const { primary } = parseDayLabel(s.day_label || s.program_title || '');
                        return (
                          <div
                            key={s.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '13px 0',
                              borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--glass-border)',
                              direction: 'rtl',
                            }}
                          >
                            <div className="no-shrink-text" style={{ minWidth: 0 }}>
                              <div
                                className="truncate-1"
                                style={{
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 700,
                                  fontSize: '0.88rem',
                                  color: 'var(--chalk)',
                                  marginBottom: 3,
                                }}
                              >
                                {primary}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)' }}>
                                {new Date(s.created_at).toLocaleDateString('ar-EG', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                                {s.duration_min > 0 && <> · {s.duration_min} دقيقة</>}
                              </div>
                            </div>
                            {s.done
                              ? <CheckCircle2 size={15} color="var(--volt)" style={{ flexShrink: 0 }} />
                              : <Circle size={15} color="var(--ash)" style={{ flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </GlassCard>
                  </div>
                </Reveal>
              )}
            </div>

            <div className="workout-grid__side">
              {/* STATS QUICK */}
              <Reveal delay={0.06}>
                <div className="section-tight workout-stats-grid">
                  {[
                    { icon: Flame,    label: 'النهارده', value: todaySessions.length, color: 'var(--volt)' },
                    {
                      icon: Calendar,
                      label: 'الشهر',
                      value: sessions.filter((s) => new Date(s.created_at).getMonth() === now.getMonth()).length,
                      color: 'var(--volt-bright)',
                    },
                    {
                      icon: Scale,
                      label: 'الوزن',
                      value: currentWeight ? `${currentWeight}kg` : '—',
                      color: 'var(--chalk)',
                    },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <GlassCard key={label} style={{ padding: '16px', textAlign: 'center' }}>
                      <Icon size={20} color={color} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.45rem', color: 'var(--chalk)', lineHeight: 1 }}>
                        {value}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ash)', marginTop: 4 }}>
                        {label}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </Reveal>

              {/* تسجيل الوزن */}
              <Reveal delay={0.1}>
                <GlassCard className="section-tight" style={{ padding: '20px' }} accent="var(--volt)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, direction: 'rtl' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'var(--volt-dim)',
                        border: '1px solid rgba(255, 90, 31, 0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Scale size={16} color="var(--volt)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--chalk)' }}>
                        سجل وزنك
                      </div>
                      {weightDiff !== null && (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.62rem',
                            color: 'var(--volt-bright)',
                            marginTop: 2,
                          }}
                        >
                          {+weightDiff < 0 ? '↓' : '↑'} {Math.abs(weightDiff)} kg عن آخر مرة
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, direction: 'rtl' }}>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="الوزن بالكيلو"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && logWeight()}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                      }}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={logWeight}
                      disabled={loggingWeight}
                      className="btn btn-primary"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Plus size={15} />
                      سجل
                    </motion.button>
                  </div>

                  {last7.length > 1 && (
                    <div style={{ marginTop: 14, display: 'flex', gap: 6, alignItems: 'flex-end', direction: 'ltr', height: 40 }}>
                      {last7.map((w, i) => {
                        const min = Math.min(...last7.map((x) => Number(x.weight)));
                        const max = Math.max(...last7.map((x) => Number(x.weight)));
                        const range = max - min || 1;
                        const h = 10 + ((Number(w.weight) - min) / range) * 28;
                        return (
                          <div key={w.id || i} title={`${w.weight}kg`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div
                              style={{
                                width: '100%',
                                height: h,
                                borderRadius: 4,
                                background: i === last7.length - 1 ? 'var(--volt)' : 'rgba(255, 90, 31, 0.25)',
                                transition: 'all 0.3s',
                              }}
                            />
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

              {/* اختيار البرنامج */}
              {userPrograms.length > 0 && (
                <Reveal delay={0.12}>
                  <div className="section-tight" style={{ direction: 'rtl' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', marginBottom: 10 }}>
                      برنامجك
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {userPrograms.map((p, i) => {
                        const selected = activeProgram === i;
                        return (
                          <motion.button
                            type="button"
                            key={p.id}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              setActiveProgram(i);
                              setOpenDay(null);
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              background: selected ? 'var(--volt-dim)' : 'var(--glass-bg)',
                              border: `1px solid ${selected ? 'var(--glass-border-hover)' : 'var(--glass-border)'}`,
                              color: selected ? 'var(--volt)' : 'var(--ash-light)',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              transition: 'all 0.2s',
                            }}
                          >
                            {p.program_title}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .workout-grid { display: block; }
        .workout-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (min-width: 900px) {
          .workout-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: var(--space-7); align-items: start; }
          .workout-grid__side { position: sticky; top: calc(var(--page-top-desktop) + 4px); display: flex; flex-direction: column; }
        }
      `}</style>
    </>
  );
}
