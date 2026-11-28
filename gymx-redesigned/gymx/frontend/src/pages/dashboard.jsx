import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Dumbbell, Flame, Target, ChevronRight, Plus, BarChart2,
  Clock, CheckCircle, Zap, Scale, ClipboardList, Utensils, Calculator,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

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

function GlassCard({ children, style = {}, accentColor }) {
  return (
    <motion.div
      whileHover={{
        borderColor: accentColor ? `${accentColor}66` : 'var(--glass-border-hover)',
        y: -2,
      }}
      transition={{ duration: 0.2 }}
      className="glass-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function StatBox({ icon: Icon, label, value, sub, accent = 'var(--volt)', delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <GlassCard accentColor={accent} style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--volt-dim)',
              border: '1px solid rgba(255, 90, 31, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={17} color={accent} />
          </div>
          {sub && (
            <span
              style={{
                fontSize: '0.6rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--volt-bright)',
                padding: '2px 7px',
                borderRadius: 4,
                background: 'var(--volt-dim)',
                border: '1px solid rgba(255, 90, 31, 0.35)',
              }}
            >
              {sub}
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '2rem',
            color: 'var(--chalk)',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--ash-light)',
            marginTop: 6,
          }}
        >
          {label}
        </div>
      </GlassCard>
    </Reveal>
  );
}

function WeightChart({ data }) {
  if (!data || data.length < 2) return null;

  const weights = data.map((d) => Number(d.weight)).filter((n) => !Number.isNaN(n)).reverse();
  if (weights.length < 2) return null;

  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const range = Math.max(max - min, 0.5);
  const W = 260;
  const H = 80;

  const pts = weights.map((w, i) => {
    const x = (i / (weights.length - 1)) * W;
    const y = H - ((w - min) / range) * H;
    return `${x},${y}`;
  });

  const path = `M ${pts.join(' L ')}`;
  const areaPath = `M 0,${H} L ${pts.join(' L ')} L ${W},${H} Z`;

  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, overflow: 'visible' }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--volt)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--volt)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wg)" />
        <path d={path} fill="none" stroke="var(--volt)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {weights.map((w, i) => {
          const x = (i / (weights.length - 1)) * W;
          const y = H - ((w - min) / range) * H;
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--volt)" />;
        })}
      </svg>
    </div>
  );
}

function WeightEntry({ date, weight, change }) {
  const positive = change > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <span style={{ fontSize: '0.75rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)' }}>
        {date}
      </span>
      <span style={{ fontSize: '0.92rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--chalk)' }}>
        {weight} kg
      </span>
      {change !== 0 && (
        <span
          style={{
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            color: positive ? 'var(--volt-bright)' : 'var(--chalk)',
            padding: '2px 7px',
            borderRadius: 4,
            background: positive ? 'rgba(255, 90, 31, 0.14)' : 'rgba(255, 255, 255, 0.06)',
            border: positive ? '1px solid rgba(255, 90, 31, 0.3)' : '1px solid var(--glass-border)',
          }}
        >
          {positive ? '+' : ''}{change.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const router = useRouter();

  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [weightLog, setWeightLog] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [loadingWeight, setLoadingWeight] = useState(false);
  const [weekDays, setWeekDays] = useState([]);
  const [streak, setStreak] = useState(0);
  const [goalWeight, setGoalWeight] = useState(null);

  const dateLocale = ar ? 'ar-EG' : 'en-US';

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      router.push('/login?from=/dashboard');
      return;
    }

    let active = true;

    supabase
      .from('user_programs')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (active && data) setPrograms(data);
      });

    supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(90)
      .then(({ data }) => {
        if (!active || !data) return;
        setSessions(data);

        const sessionDates = [...new Set(data.map((s) => new Date(s.created_at).toDateString()))];
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (sessionDates.includes(d.toDateString())) {
            count++;
          } else if (i > 0) {
            break;
          }
        }
        setStreak(count);

        const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const daysEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const todayIdx = new Date().getDay();

        setWeekDays((ar ? daysAr : daysEn).map((label, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (todayIdx - i));
          return {
            label,
            today: i === todayIdx,
            done: i <= todayIdx && sessionDates.includes(d.toDateString()),
          };
        }));
      });

    supabase
      .from('weight_log')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (active && data) setWeightLog(data);
      });

    supabase
      .from('users')
      .select('goal_weight')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (active && data?.goal_weight) setGoalWeight(data.goal_weight);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading, ar, router]);

  const logWeight = async () => {
    const parsed = parseFloat(newWeight);
    if (!newWeight || Number.isNaN(parsed) || parsed <= 0) {
      toast.error(ar ? 'أدخل وزن صحيح' : 'Enter a valid weight');
      return;
    }
    if (!user?.id) return;

    setLoadingWeight(true);
    const { error } = await supabase.from('weight_log').insert({
      user_id: user.id,
      weight: parsed,
      logged_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(ar ? 'حصل خطأ، جرب تاني' : 'Something went wrong, try again');
      setLoadingWeight(false);
      return;
    }

    const { data } = await supabase
      .from('weight_log')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(10);

    if (data) setWeightLog(data);
    setNewWeight('');
    setLoadingWeight(false);
    toast.success(ar ? 'تم تسجيل الوزن' : 'Weight logged');
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalSessions = sessions.filter((s) => {
    const d = new Date(s.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const trainedToday = sessions.some((s) => new Date(s.created_at).toDateString() === now.toDateString());
  const currentWeight = weightLog[0]?.weight ?? '—';

  const startWeight = weightLog.length ? Math.max(...weightLog.map((w) => Number(w.weight))) : null;
  const progressPct =
    startWeight && goalWeight && currentWeight !== '—' && startWeight !== goalWeight
      ? Math.min(100, Math.max(0, Math.round(((startWeight - Number(currentWeight)) / (startWeight - Number(goalWeight))) * 100)))
      : 0;

  const lastSession = sessions[0];

  const quickLinks = [
    { href: '/exercises', label: ar ? 'التمارين' : 'Exercises', Icon: Dumbbell },
    { href: '/programs', label: ar ? 'البرامج' : 'Programs', Icon: ClipboardList },
    { href: '/nutrition', label: ar ? 'التغذية' : 'Nutrition', Icon: Utensils },
    { href: '/tools', label: ar ? 'الحاسبات' : 'Calculators', Icon: Calculator },
  ];

  if (!user) return null;

  return (
    <>
      <Head>
        <title>{ar ? 'صفحتي' : 'My Dashboard'} — GYMZ</title>
      </Head>

      <div
        style={{
          minHeight: '100vh',
          paddingTop: 72,
          paddingBottom: 80,
          position: 'relative',
          background: 'var(--bg)',
          direction: ar ? 'rtl' : 'ltr',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 55% 35% at 15% 25%, var(--volt-glow) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 85% 75%, var(--volt-glow) 0%, transparent 60%)',
          }}
        />

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          {/* GREETING */}
          <Reveal>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="rule-orange" />
              <span className="label-tag">{ar ? 'أهلاً بك' : 'WELCOME BACK'}</span>
            </div>
            <div style={{ marginBottom: 24, marginTop: -12 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(2rem,5vw,3rem)',
                  letterSpacing: ar ? 0 : '0.01em',
                  textTransform: ar ? 'none' : 'uppercase',
                  color: 'var(--chalk)',
                  lineHeight: 1.05,
                }}
              >
                {user.email?.split('@')[0] || (ar ? 'بطل' : 'CHAMP')}
              </h1>
            </div>
          </Reveal>

          {/* WEEK STRIP */}
          <Reveal delay={0.05}>
            <GlassCard style={{ padding: '18px 22px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {ar ? 'أيام الأسبوع' : 'THIS WEEK'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--volt)' }}>
                  {streak} {ar ? 'أيام متتالية' : 'DAY STREAK'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 8,
                        border: `1px solid ${d.today ? 'var(--volt)' : d.done ? 'rgba(255, 90, 31, 0.45)' : 'var(--glass-border)'}`,
                        background: d.today
                          ? 'var(--volt-dim)'
                          : d.done
                            ? 'rgba(255, 90, 31, 0.1)'
                            : 'rgba(255,255,255,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 5,
                      }}
                    >
                      {d.done && !d.today && <span style={{ fontSize: '0.65rem', color: 'var(--volt-bright)' }}>✓</span>}
                      {d.today && <span style={{ fontSize: '0.65rem', color: 'var(--volt)' }}>●</span>}
                    </div>
                    <span
                      className="truncate-1"
                      style={{
                        display: 'block',
                        fontSize: '0.56rem',
                        fontFamily: 'var(--font-mono)',
                        color: d.today ? 'var(--volt)' : d.done ? 'var(--volt-bright)' : 'var(--ash)',
                      }}
                    >
                      {d.label.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          {/* STATS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
            <StatBox
              icon={Flame}
              label={ar ? 'الاستمرارية' : 'STREAK'}
              value={streak ? `${streak} ${ar ? 'يوم' : 'd'}` : '—'}
              sub={trainedToday ? (ar ? '+1 اليوم' : '+1 today') : null}
              accent="var(--volt)"
              delay={0.05}
            />
            <StatBox icon={Dumbbell} label={ar ? 'جلسات الشهر' : 'SESSIONS/MO'} value={totalSessions || '—'} accent="var(--volt-bright)" delay={0.1} />
            <StatBox
              icon={Scale}
              label={ar ? 'الوزن الحالي' : 'CURRENT WEIGHT'}
              value={currentWeight !== '—' ? `${currentWeight}` : '—'}
              accent="var(--chalk)"
              delay={0.15}
            />
            <StatBox icon={Target} label={ar ? 'برامج نشطة' : 'ACTIVE PROGRAMS'} value={programs.length || '—'} accent="var(--volt)" delay={0.2} />
          </div>

          {/* LAST WORKOUT */}
          {lastSession && (
            <Reveal delay={0.08}>
              <GlassCard style={{ padding: '18px 22px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--volt-dim)',
                        border: '1px solid var(--glass-border-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Dumbbell size={16} color="var(--volt)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ash)', marginBottom: 3 }}>
                        {ar ? 'آخر تمرين' : 'LAST WORKOUT'}
                      </div>
                      <div className="truncate-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--chalk)' }}>
                        {lastSession.name || lastSession.program_name || (ar ? 'جلسة تمرين' : 'Workout session')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash-light)', flexShrink: 0 }}>
                    {new Date(lastSession.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </GlassCard>
            </Reveal>
          )}

          {/* BOTTOM GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {/* WEIGHT LOG */}
            <Reveal delay={0.1}>
              <GlassCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Scale size={15} color="var(--volt)" />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                    {ar ? 'سجل الوزن' : 'WEIGHT LOG'}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    placeholder={ar ? 'وزنك اليوم (kg)' : "Today's weight (kg)"}
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && logWeight()}
                    style={{ flex: 1, padding: '9px 12px', fontSize: '0.875rem' }}
                  />
                  <motion.button
                    type="button"
                    onClick={logWeight}
                    disabled={loadingWeight}
                    whileTap={{ scale: 0.96 }}
                    className="btn btn-primary"
                    style={{ padding: '9px 14px', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} /> {ar ? 'سجل' : 'LOG'}
                  </motion.button>
                </div>

                <WeightChart data={weightLog} />

                {currentWeight !== '—' && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>
                        {ar ? 'تقدم نحو الهدف' : 'PROGRESS TO GOAL'}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--volt)' }}>
                        {progressPct}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(progressPct, 0)}%` }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                        className="progress-fill"
                      />
                    </div>
                  </div>
                )}

                {weightLog.length === 0 ? (
                  <p style={{ color: 'var(--ash)', fontSize: '0.78rem', textAlign: 'center', padding: '16px 0' }}>
                    {ar ? 'سجّل وزنك اليوم وابدأ تتابع!' : 'Log your weight today and start tracking!'}
                  </p>
                ) : (
                  weightLog.slice(0, 5).map((entry, i) => (
                    <WeightEntry
                      key={entry.id || i}
                      date={new Date(entry.logged_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                      weight={entry.weight}
                      change={i < weightLog.length - 1 ? entry.weight - weightLog[i + 1].weight : 0}
                    />
                  ))
                )}
              </GlassCard>
            </Reveal>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* ENROLLED PROGRAMS */}
              <Reveal delay={0.15}>
                <GlassCard style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BarChart2 size={15} color="var(--volt)" />
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                        {ar ? 'برامجي' : 'MY PROGRAMS'}
                      </h2>
                    </div>
                    <Link
                      href="/programs"
                      style={{
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--volt)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {ar ? 'كل البرامج' : 'ALL PROGRAMS'}{' '}
                      <ChevronRight size={11} style={{ transform: ar ? 'rotate(180deg)' : 'none' }} />
                    </Link>
                  </div>

                  {programs.length === 0 ? (
                    <Link
                      href="/programs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '14px',
                        background: 'var(--volt-dim)',
                        border: '1px dashed var(--glass-border-hover)',
                        borderRadius: 10,
                        color: 'var(--volt)',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                      }}
                    >
                      <Zap size={13} /> {ar ? 'انضم لأول برنامج' : 'Join your first program'}
                    </Link>
                  ) : (
                    programs.slice(0, 2).map((p, i) => (
                      <div
                        key={p.id || i}
                        style={{
                          padding: '14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 10,
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>
                          {p.program_name || (ar ? 'برنامج' : 'Program')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>
                            {ar ? 'التقدم' : 'PROGRESS'}
                          </span>
                          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--volt)' }}>
                            {p.progress || 20}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.progress || 20}%` }}
                            transition={{ duration: 0.8, delay: 0.25 }}
                            className="progress-fill"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </GlassCard>
              </Reveal>

              {/* RECENT SESSIONS */}
              <Reveal delay={0.2}>
                <GlassCard style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <Clock size={15} color="var(--volt)" />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                      {ar ? 'آخر الجلسات' : 'RECENT SESSIONS'}
                    </h2>
                  </div>

                  {sessions.length === 0 ? (
                    <p style={{ color: 'var(--ash)', fontSize: '0.78rem', textAlign: 'center', padding: '16px 0' }}>
                      {ar ? 'ما عندكش جلسات مسجلة لسه' : 'No sessions logged yet'}
                    </p>
                  ) : (
                    sessions.slice(0, 5).map((s, i) => (
                      <div
                        key={s.id || i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 0',
                          borderBottom: '1px solid var(--glass-border)',
                        }}
                      >
                        <CheckCircle size={14} color="var(--volt)" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="truncate-1" style={{ fontSize: '0.8rem', color: 'var(--chalk)' }}>
                            {s.name || s.program_name || (ar ? 'جلسة تمرين' : 'Workout session')}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--ash)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                            {new Date(s.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        {s.duration_min && (
                          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', flexShrink: 0 }}>
                            {s.duration_min}{ar ? 'د' : 'm'}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </GlassCard>
              </Reveal>

              {/* QUICK ACTIONS */}
              <Reveal delay={0.25}>
                <GlassCard style={{ padding: '20px 24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>
                    {ar ? 'روابط سريعة' : 'QUICK LINKS'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {quickLinks.map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 10,
                          textDecoration: 'none',
                          color: 'var(--chalk)',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-body)',
                          transition: 'border-color 150ms, background 150ms',
                        }}
                      >
                        <Icon size={15} color="var(--volt)" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                </GlassCard>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
