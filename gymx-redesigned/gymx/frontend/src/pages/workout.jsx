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
import { PROGRAMS } from '../data/programs';

// ── بناء أيام وتمارين البرنامج من نفس بيانات صفحة البرامج ──
// (مصدر واحد: أي تعديل في صفحة البرامج بينعكس هنا تلقائي)
function getProgramDays(programTitle) {
  if (!programTitle) return null;
  const norm = (s) => (s || '').toLowerCase().trim();
  const t = norm(programTitle);

  // مطابقة دقيقة الأول (subtitle أو title)
  let prog = PROGRAMS.find(p => norm(p.subtitle) === t || norm(p.title) === t);

  // لو مفيش مطابقة دقيقة، جرب مطابقة مرنة
  if (!prog) {
    prog = PROGRAMS.find(p => t.includes(norm(p.subtitle)) || norm(p.subtitle).includes(t));
  }
  if (!prog) return null;

  const result = {};
  prog.days_detail.forEach((d) => {
    // كل تمرين بيفضل object {name, detail} — مش string مدموج — عشان نقدر نعرض
    // الاسم والـsets/reps والعضلة كل واحد في مكانه بدل سطر واحد طويل
    result[d.day] = d.exercises;
  });
  return result;
}

// ── عرض فقط: شيل أي emoji من نص اليوم (الداتا نفسها في data/programs.js
// فيها emoji متضمّن جوه الـstring — بنشيله وقت العرض بس، مش بنغيّر الداتا) ──
function stripEmoji(text) {
  return (text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

// ── عرض فقط: "يوم الدفع — Push 💥" → { primary: 'PUSH', subtitle: 'يوم الدفع' }
// "اليوم الأول — السبت" (مفيش نص إنجليزي) → { primary: 'اليوم الأول', subtitle: 'السبت' } ──
function parseDayLabel(raw) {
  const clean = stripEmoji(raw);
  const parts = clean.split('—').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2 && /[a-zA-Z]/.test(parts[1])) {
    return { primary: parts[1].toUpperCase(), subtitle: parts[0] };
  }
  return { primary: parts[0] || clean, subtitle: parts[1] || '' };
}

// ── عرض فقط: "4 سيتات × 8 رباعات — الصدر الأساسي" → { meta, muscle } ──
function parseExerciseDetail(detail) {
  const parts = (detail || '').split('—').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { meta: parts[0], muscle: parts[1] };
  return { meta: parts[0] || detail || '', muscle: '' };
}

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
      background: 'var(--carbon)',
      border: `1px solid ${accent ? accent + '40' : 'var(--iron-light)'}`,
      borderRadius: 10,
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── مكون تمرين واحد ──────────────────────────────────────
function ExerciseRow({ index, exercise, checked, onToggle, delay, isLast }) {
  const { meta, muscle } = parseExerciseDetail(exercise.detail);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 4px', cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--iron-light)',
        background: checked ? 'rgba(74,222,128,0.04)' : 'transparent',
        transition: 'background 0.2s',
        direction: 'rtl',
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ash)', width: 20, flexShrink: 0, textAlign: 'center' }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '0.98rem', letterSpacing: '0.02em',
          color: checked ? 'var(--ash-light)' : 'var(--chalk)',
          textDecoration: checked ? 'line-through' : 'none',
          transition: 'color 0.2s',
        }}>
          {exercise.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash)', marginTop: 3 }}>
          {meta}{muscle && <> <span style={{ opacity: 0.5 }}>·</span> {muscle}</>}
        </div>
      </div>

      {/* مساحة ضغط كبيرة حوالين الأيقونة، من غير Button ضخمة */}
      <motion.div
        animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.2 }}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        {checked
          ? <CheckCircle2 size={22} color="var(--volt)" />
          : <Circle size={22} color="var(--ash)" strokeWidth={1.6} />
        }
      </motion.div>
    </motion.div>
  );
}

// ── مكون يوم تمرين ───────────────────────────────────────
function DayCard({ dayIndex, dayLabel, exercises, isOpen, onToggle, onSave, isSaving, savedToday }) {
  const [checked, setChecked] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed]   = useState(0);

  // بدأ التايمر لما اليوم يتفتح
  useEffect(() => {
    if (isOpen && !startTime) setStartTime(Date.now());
    if (!isOpen) { setStartTime(null); setElapsed(0); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !startTime) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [isOpen, startTime]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const elapsedMin = Math.max(1, Math.round(elapsed / 60));

  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = exercises.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const toggleEx = (name) => setChecked(prev => ({ ...prev, [name]: !prev[name] }));

  const { primary, subtitle } = parseDayLabel(dayLabel);
  // active = اليوم مفتوح دلوقتي (هو التمرين النشط فعليًا في الواجهة) — Orange فقط للحالة دي
  const active = isOpen;

  return (
    <div style={{
      marginBottom: 0,
      borderBottom: '1px solid var(--iron-light)',
      background: active ? 'rgba(255,85,0,0.03)' : 'transparent',
      transition: 'background 0.2s',
    }}>
      <div
        onClick={onToggle}
        style={{ padding: '16px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, direction: 'rtl' }}
      >
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem',
          color: active ? 'var(--volt)' : 'var(--iron-light)', width: 34, flexShrink: 0, lineHeight: 1,
        }}>
          {String(dayIndex + 1).padStart(2, '0')}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em', color: active ? 'var(--volt)' : 'var(--chalk)', textTransform: 'uppercase' }}>
              {primary}
            </span>
            {savedToday && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.56rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 4, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', letterSpacing: '0.06em' }}>
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
            <div style={{ flex: 1, height: 2, borderRadius: 1, background: 'var(--iron-light)' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', borderRadius: 1, background: pct === 100 ? '#4ade80' : 'var(--volt)' }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)', whiteSpace: 'nowrap' }}>
              {doneCount}/{totalCount}
            </span>
          </div>
        </div>

        {isOpen && elapsed > 0 && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 2 }}>TIME</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)' }}>
              <Clock size={13} color="var(--ash-light)" /> {formatTime(elapsed)}
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
            transition={{ duration: 0.3 }}
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
                  delay={i * 0.04}
                  isLast={i === exercises.length - 1}
                />
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSave(dayLabel, Object.values(checked).filter(Boolean).length === totalCount, elapsedMin)}
                disabled={isSaving || doneCount === 0}
                style={{
                  width: '100%', marginTop: 16, padding: '15px',
                  borderRadius: 10, border: 'none', cursor: doneCount === 0 ? 'not-allowed' : 'pointer',
                  background: doneCount === 0 ? 'var(--iron)' : pct === 100 ? 'rgba(74,222,128,0.15)' : 'rgba(255,85,0,0.15)',
                  color: doneCount === 0 ? 'var(--ash)' : pct === 100 ? '#4ade80' : 'var(--volt)',
                  border: `1px solid ${doneCount === 0 ? 'var(--iron-light)' : pct === 100 ? 'rgba(74,222,128,0.3)' : 'rgba(255,85,0,0.35)'}`,
                  fontFamily: 'var(--font-display)', fontSize: '0.92rem', letterSpacing: '0.05em',
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
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetchAll();
  }, [user, authLoading]);

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
  const saveSession = async (dayLabel, done, durationMin = 0) => {
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
      duration_min:  durationMin,
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

  // البرنامج النشط وتمريناته — مطابقة مرنة
  const activeProgObj = userPrograms[activeProgram];
  const activeProgramName = activeProgObj?.program_title || '';
  const programDays = getProgramDays(activeProgramName);

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

      <div className="page-shell" style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>

          {/* ── HEADER ── */}
          <Reveal>
            <div className="section" style={{ direction: 'rtl' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,77,46,0.7)', letterSpacing: '0.02em', marginBottom: 6 }}>
                — جلسة اليوم
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,2.8rem)', letterSpacing: '0.03em', color: 'var(--chalk)', lineHeight: 1, marginBottom: 6 }}>
               وقت <span style={{ color: 'var(--accent)' }}>الجيم</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ash-light)' }}>
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </Reveal>

          {/* ── ثنائي الأعمدة على الديسكتوب: المحتوى الرئيسي + سايدبار — بيمنع الفراغ اللي كان بيحصل من عمود واحد ضيق وسط شاشة عريضة ── */}
          <div className="workout-grid">
          <div className="workout-grid__main">

          {/* ── أيام البرنامج ── */}
          <Reveal delay={0.15}>
            <div className="section">
              <div className="section-header" style={{ direction: 'rtl' }}>
                <span className="section-header__label">
                  {programDays ? 'اختار يوم تمرينك' : 'سجل جلسة سريعة'}
                </span>
              </div>

            {programDays ? (
              <div style={{ border: '1px solid var(--iron-light)', borderRadius: 'var(--radius-card)', background: 'var(--carbon)', padding: '0 20px', overflow: 'hidden' }}>
                {Object.entries(programDays).map(([dayLabel, exercises], i) => (
                  <DayCard
                    key={dayLabel}
                    dayIndex={i}
                    dayLabel={dayLabel}
                    exercises={exercises}
                    isOpen={openDay === dayLabel}
                    onToggle={() => setOpenDay(prev => prev === dayLabel ? null : dayLabel)}
                    onSave={saveSession}
                    isSaving={savingDay === dayLabel}
                    savedToday={savedTodayLabels.has(dayLabel)}
                  />
                ))}
              </div>
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
            </div>
          </Reveal>

          {/* ── آخر الجلسات ── */}
          {sessions.length > 0 && (
            <Reveal delay={0.2}>
              <div className="section">
                <div className="section-header" style={{ direction: 'rtl' }}>
                  <span className="section-header__label">آخر الجلسات</span>
                </div>
                <div style={{ border: '1px solid var(--iron-light)', borderRadius: 'var(--radius-card)', background: 'var(--carbon)', padding: '0 18px' }}>
                  {sessions.slice(0, 5).map((s, i, arr) => {
                    const { primary } = parseDayLabel(s.day_label || s.program_title || '');
                    return (
                      <div key={s.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 0',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--iron-light)',
                        direction: 'rtl',
                      }}>
                        <div className="no-shrink-text" style={{ minWidth: 0 }}>
                          <div className="truncate-1" style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', letterSpacing: '0.02em', color: 'var(--chalk)', textTransform: 'uppercase', marginBottom: 3 }}>
                            {primary}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash)', letterSpacing: '0.05em' }}>
                            {new Date(s.created_at).toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' })}
                            {s.duration_min > 0 && <> · {s.duration_min} دقيقة</>}
                          </div>
                        </div>
                        {s.done
                          ? <CheckCircle2 size={15} color="#4ade80" style={{ flexShrink: 0 }} />
                          : <Circle size={15} color="var(--ash)" style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          </div>{/* /workout-grid__main */}

          <div className="workout-grid__side">

          {/* ── STATS QUICK ── */}
          <Reveal delay={0.05}>
            <div className="section-tight workout-stats-grid">
              {[
                { icon: Flame,    label: 'النهارده',   value: todaySessions.length, color: 'var(--accent)' },
                { icon: Calendar, label: 'الشهر',       value: sessions.filter(s => new Date(s.created_at).getMonth() === new Date().getMonth()).length, color: '#FFFFFF' },
                { icon: Scale,    label: 'الوزن',       value: currentWeight ? `${currentWeight}kg` : '—', color: '#4ade80' },
              ].map(({ icon: Icon, label, value, color }) => (
                <GlassCard key={label} style={{ padding: '16px', textAlign: 'center' }}>
                  <Icon size={22} color={color} style={{ marginBottom: 8 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--chalk)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ash)', letterSpacing: '0.07em', marginTop: 4 }}>{label}</div>
                </GlassCard>
              ))}
            </div>
          </Reveal>

          {/* ── تسجيل الوزن ── */}
          <Reveal delay={0.1}>
            <GlassCard className="section-tight" style={{ padding: '20px' }} accent="#4ade80">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, direction: 'rtl' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={16} color="#4ade80" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--chalk)' }}>سجل وزنك</div>
                  {weightDiff !== null && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: +weightDiff < 0 ? '#4ade80' : '#FFFFFF', marginTop: 2 }}>
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
              <div className="section-tight" style={{ direction: 'rtl' }}>
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

          </div>{/* /workout-grid__side */}
          </div>{/* /workout-grid */}

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
