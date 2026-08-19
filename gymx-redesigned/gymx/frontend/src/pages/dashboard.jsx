import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Dumbbell, Flame, Target, ChevronRight,
  Plus, BarChart2, Clock, CheckCircle, Zap, Scale
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
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >{children}</motion.div>
  );
}

// Reuses the site's own glass-card tokens (--glass-bg/--glass-border/--glass-shadow)
// instead of re-inventing hand-rolled rgba values that drift from the design system.
function GlassCard({ children, style = {}, accentColor }) {
  return (
    <motion.div
      whileHover={{ borderColor: accentColor ? `${accentColor}44` : 'var(--glass-border-hover)', y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 12, boxShadow: 'var(--glass-shadow)',
        position: 'relative', overflow: 'hidden',
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
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${accent}18`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={17} color={accent} />
          </div>
          {sub && <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'#4ade80', padding:'2px 7px', borderRadius:4, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)' }}>{sub}</span>}
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', letterSpacing:'0.02em', color:'var(--chalk)', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing:'0.07em', marginTop:6 }}>{label}</div>
      </GlassCard>
    </Reveal>
  );
}

// ── Mini Weight Chart (SVG) ────────────────────────────────
function WeightChart({ data }) {
  if (!data || data.length < 2) return null;
  const weights = data.map(d => d.weight).reverse();
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const W = 260, H = 80;
  const pts = weights.map((w, i) => {
    const x = (i / (weights.length - 1)) * W;
    const y = H - ((w - min) / (max - min)) * H;
    return `${x},${y}`;
  });
  const path = 'M ' + pts.join(' L ');
  const areaPath = `M 0,${H} L ` + pts.join(' L ') + ` L ${W},${H} Z`;

  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:80, overflow:'visible' }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--volt)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--volt)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wg)" />
        <path d={path} fill="none" stroke="var(--volt)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {weights.map((w, i) => {
          const x = (i / (weights.length - 1)) * W;
          const y = H - ((w - min) / (max - min)) * H;
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--volt)" />;
        })}
      </svg>
    </div>
  );
}

function WeightEntry({ date, weight, change }) {
  const positive = change > 0;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--glass-border)' }}>
      <span style={{ fontSize:'0.75rem', color:'var(--ash-light)', fontFamily:'var(--font-mono)' }}>{date}</span>
      <span style={{ fontSize:'0.92rem', fontFamily:'var(--font-display)', letterSpacing:'0.05em', color:'var(--chalk)' }}>{weight} kg</span>
      {change !== 0 && (
        <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color: positive ? '#f87171' : '#4ade80', padding:'2px 7px', borderRadius:4, background: positive ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' }}>
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
  const router   = useRouter();
  const [programs,   setPrograms]   = useState([]);
  const [sessions,   setSessions]   = useState([]);
  const [weightLog,  setWeightLog]  = useState([]);
  const [newWeight,  setNewWeight]  = useState('');
  const [loadingWeight, setLoadingWeight] = useState(false);
  const [weekDays,   setWeekDays]   = useState([]);
  const [streak,     setStreak]     = useState(0);
  const [goalWeight, setGoalWeight] = useState(null);

  const dateLocale = ar ? 'ar-EG' : 'en-US';

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    supabase.from('user_programs').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) setPrograms(data);
    });

    supabase.from('workout_sessions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(90)
      .then(({ data }) => {
        if (!data) return;
        setSessions(data);

        // ── calculate streak from real session dates ──────────────────
        const sessionDates = [...new Set(
          data.map(s => new Date(s.created_at).toDateString())
        )];
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

        // ── week strip reflects REAL trained days, not "any day before today" ──
        const daysAr = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        const daysEn = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
        const todayIdx = new Date().getDay();
        const trainedSet = sessionDates;
        setWeekDays((ar ? daysAr : daysEn).map((label, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (todayIdx - i));
          return {
            label,
            today: i === todayIdx,
            done: i <= todayIdx && trainedSet.includes(d.toDateString()),
          };
        }));
      });

    supabase.from('weight_log').select('*').eq('user_id', user.id)
      .order('logged_at', { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setWeightLog(data); });

    // ── fetch real goal weight from user record ──────────────────────
    supabase.from('users').select('goal_weight').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.goal_weight) setGoalWeight(data.goal_weight);
      });
  }, [user, authLoading, ar]);

  const logWeight = async () => {
    if (!newWeight || isNaN(newWeight)) { toast.error(ar ? 'أدخل وزن صحيح' : 'Enter a valid weight'); return; }
    setLoadingWeight(true);
    const { error } = await supabase.from('weight_log').insert({ user_id: user.id, weight: parseFloat(newWeight), logged_at: new Date().toISOString() });
    if (error) { toast.error(ar ? 'حصل خطأ، جرب تاني' : 'Something went wrong, try again'); setLoadingWeight(false); return; }
    const { data } = await supabase.from('weight_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(10);
    if (data) setWeightLog(data);
    setNewWeight('');
    setLoadingWeight(false);
    toast.success(ar ? '✅ اتسجل الوزن' : '✅ Weight logged');
  };

  const thisMonth = new Date().getMonth();
  const thisYear  = new Date().getFullYear();
  const totalSessions = sessions.filter(s => {
    const d = new Date(s.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const trainedToday  = sessions.some(s => new Date(s.created_at).toDateString() === new Date().toDateString());
  const currentWeight = weightLog[0]?.weight ?? '—';
  const weightChange  = weightLog.length >= 2 ? weightLog[0].weight - weightLog[1].weight : 0;

  // Goal progress — real data: goalWeight from profiles, startWeight = heaviest recorded
  const startWeight = weightLog.length ? Math.max(...weightLog.map(w => w.weight)) : null;
  const progressPct = startWeight && goalWeight && currentWeight !== '—'
    ? Math.min(100, Math.max(0, Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100)))
    : 0;

  const lastSession = sessions[0];

  const quickLinks = [
    { href: '/exercises', label: ar ? 'التمارين'  : 'Exercises',    icon: '🏋️', color: 'var(--volt)' },
    { href: '/programs',  label: ar ? 'البرامج'   : 'Programs',     icon: '📋', color: '#FFFFFF'     },
    { href: '/nutrition', label: ar ? 'التغذية'   : 'Nutrition',    icon: '🥗', color: '#4ade80'     },
    { href: '/tools',     label: ar ? 'الحاسبات'  : 'Calculators',  icon: '🧮', color: '#FFFFFF'     },
  ];

  if (!user) return null;

  return (
    <>
      <Head><title>{ar ? 'صفحتي' : 'My Dashboard'} — GYMZ</title></Head>
      <div style={{ minHeight:'100vh', paddingTop:72, paddingBottom:80, position:'relative', direction: ar ? 'rtl' : 'ltr' }}>
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 55% 35% at 15% 25%, var(--volt-glow) 0%,transparent 60%), radial-gradient(ellipse 40% 40% at 85% 75%, var(--volt-glow) 0%,transparent 60%)' }} />

        <div style={{ maxWidth:960, margin:'0 auto', padding:'0 20px', position:'relative', zIndex:1 }}>

          {/* ── GREETING ── */}
          <Reveal>
            <div style={{ marginBottom:24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="rule-orange" />
              <span className="label-tag">{ar ? 'أهلاً بك' : 'WELCOME BACK'}</span>
            </div>
            <div style={{ marginBottom: 24, marginTop: -12 }}>
              <h1 style={{ fontFamily:'var(--font-display)', fontWeight: 800, fontSize:'clamp(2rem,5vw,3rem)', letterSpacing:'0.01em', textTransform: 'uppercase', color:'var(--chalk)', lineHeight:1 }}>
                {user.email?.split('@')[0] || (ar ? 'بطل' : 'CHAMP')} <span style={{ color:'var(--volt)' }}>💪</span>
              </h1>
            </div>
          </Reveal>

          {/* ── WEEK STRIP ── */}
          <Reveal delay={0.05}>
            <GlassCard style={{ padding:'18px 22px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', letterSpacing:'0.05em' }}>{ar ? 'أيام الأسبوع' : 'THIS WEEK'}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--volt)', letterSpacing: '0.05em' }}>{streak} {ar ? 'أيام متتالية' : 'DAY STREAK'} 🔥</span>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ textAlign:'center', flex:1 }}>
                    <div style={{ width:'100%', aspectRatio:'1', borderRadius:8, border:`1px solid ${d.today ? 'var(--volt)' : d.done ? 'rgba(74,222,128,0.4)' : 'var(--iron-light)'}`, background: d.today ? 'var(--volt-dim)' : d.done ? 'rgba(74,222,128,0.08)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:5 }}>
                      {d.done && !d.today && <span style={{ fontSize:'0.6rem', color:'#4ade80' }}>✓</span>}
                      {d.today && <span style={{ fontSize:'0.6rem', color:'var(--volt)' }}>●</span>}
                    </div>
                    <span style={{ fontSize:'0.5rem', fontFamily:'var(--font-mono)', color: d.today ? 'var(--volt)' : d.done ? '#4ade80' : 'var(--ash)', letterSpacing:'0.04em' }}>
                      {d.label.slice(0,3)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          {/* ── STATS GRID ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:14, marginBottom:20 }}>
            <StatBox icon={Flame}    label={ar ? 'الاستمرارية' : 'STREAK'}     value={streak ? `${streak} ${ar ? 'يوم' : 'd'}` : '—'} sub={trainedToday ? (ar ? '+1 اليوم 🔥' : '+1 today 🔥') : null} accent="var(--volt)"  delay={0.05} />
            <StatBox icon={Dumbbell} label={ar ? 'جلسات الشهر' : 'SESSIONS/MO'}   value={totalSessions || '—'}   accent="#FFFFFF"  delay={0.1}  />
            <StatBox icon={Scale}    label={ar ? 'الوزن الحالي' : 'CURRENT WEIGHT'}    value={currentWeight !== '—' ? `${currentWeight}` : '—'} accent="#4ade80" delay={0.15} />
            <StatBox icon={Target}   label={ar ? 'برامج نشطة' : 'ACTIVE PROGRAMS'}      value={programs.length || '—'} accent="#FFFFFF"  delay={0.2}  />
          </div>

          {/* ── LAST WORKOUT ── */}
          {lastSession && (
            <Reveal delay={0.08}>
              <GlassCard style={{ padding:'18px 22px', marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'var(--volt-dim)', border:'1px solid rgba(255,85,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Dumbbell size={16} color="var(--volt)" />
                    </div>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--ash)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom:3 }}>{ar ? 'آخر تمرين' : 'LAST WORKOUT'}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--chalk)' }}>{lastSession.name || lastSession.program_name || (ar ? 'جلسة تمرين' : 'Workout session')}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--ash-light)' }}>
                    {new Date(lastSession.created_at).toLocaleDateString(dateLocale, { month:'short', day:'numeric' })}
                  </span>
                </div>
              </GlassCard>
            </Reveal>
          )}

          {/* ── BOTTOM GRID ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:18 }}>

            {/* WEIGHT LOG */}
            <Reveal delay={0.1}>
              <GlassCard style={{ padding:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <Scale size={15} color="var(--volt)" />
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.05em' }}>{ar ? 'سجل الوزن' : 'WEIGHT LOG'}</h2>
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                  <input
                    className="input"
                    type="number" placeholder={ar ? 'وزنك اليوم (kg)' : "Today's weight (kg)"}
                    value={newWeight} onChange={e => setNewWeight(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && logWeight()}
                    style={{ flex:1, padding:'9px 12px', fontSize:'0.875rem' }}
                  />
                  <motion.button onClick={logWeight} disabled={loadingWeight} whileTap={{ scale:0.95 }}
                    style={{ padding:'9px 14px', background:'var(--volt)', border:'none', borderRadius:8, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', fontFamily:'var(--font-mono)' }}>
                    <Plus size={14} /> {ar ? 'سجل' : 'LOG'}
                  </motion.button>
                </div>

                {/* Chart */}
                <WeightChart data={weightLog} />

                {/* Goal progress bar */}
                {currentWeight !== '—' && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing:'0.07em' }}>{ar ? 'تقدم نحو الهدف' : 'PROGRESS TO GOAL'}</span>
                      <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--volt)' }}>{progressPct}%</span>
                    </div>
                    <div style={{ height:4, borderRadius:2, background:'var(--iron-light)', overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${Math.max(progressPct,0)}%` }} transition={{ duration:1, delay:0.3 }}
                        style={{ height:'100%', borderRadius:2, background:'var(--volt)' }} />
                    </div>
                  </div>
                )}

                {weightLog.length === 0 ? (
                  <p style={{ color:'var(--ash)', fontSize:'0.78rem', textAlign:'center', padding:'16px 0' }}>
                    {ar ? 'سجّل وزنك اليوم وابدأ تتابع!' : 'Log your weight today and start tracking!'}
                  </p>
                ) : weightLog.slice(0,5).map((entry, i) => (
                  <WeightEntry
                    key={entry.id || i}
                    date={new Date(entry.logged_at).toLocaleDateString(dateLocale, { month:'short', day:'numeric' })}
                    weight={entry.weight}
                    change={i < weightLog.length - 1 ? entry.weight - weightLog[i + 1].weight : 0}
                  />
                ))}
              </GlassCard>
            </Reveal>

            {/* RIGHT COLUMN */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* ENROLLED PROGRAMS */}
              <Reveal delay={0.15}>
                <GlassCard style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <BarChart2 size={15} color="var(--volt)" />
                      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.05em' }}>{ar ? 'برامجي' : 'MY PROGRAMS'}</h2>
                    </div>
                    <Link href="/programs" style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--volt)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                      {ar ? 'كل البرامج' : 'ALL PROGRAMS'} <ChevronRight size={11} />
                    </Link>
                  </div>

                  {programs.length === 0 ? (
                    <Link href="/programs" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'14px', background:'var(--volt-dim)', border:'1px dashed rgba(255,85,0,0.3)', borderRadius:10, color:'var(--volt)', fontSize:'0.8rem', textDecoration:'none' }}>
                      <Zap size={13} /> {ar ? 'انضم لأول برنامج' : 'Join your first program'}
                    </Link>
                  ) : programs.slice(0, 2).map((p, i) => (
                    <div key={i} style={{ padding:'14px', background:'var(--iron)', border:'1px solid var(--iron-light)', borderRadius:10, marginBottom:8 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', marginBottom:10 }}>{p.program_name || (ar ? 'برنامج' : 'Program')}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing:'0.07em' }}>{ar ? 'التقدم' : 'PROGRESS'}</span>
                        <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--volt)' }}>{p.progress || 20}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:2, background:'var(--iron-light)', overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${p.progress || 20}%` }} transition={{ duration:0.8, delay:0.3 }}
                          style={{ height:'100%', borderRadius:2, background:'var(--volt)' }} />
                      </div>
                    </div>
                  ))}
                </GlassCard>
              </Reveal>

              {/* RECENT SESSIONS */}
              <Reveal delay={0.2}>
                <GlassCard style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <Clock size={15} color="#FFFFFF" />
                    <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.05em' }}>{ar ? 'آخر الجلسات' : 'RECENT SESSIONS'}</h2>
                  </div>

                  {sessions.length === 0 ? (
                    <p style={{ color:'var(--ash)', fontSize:'0.78rem', textAlign:'center', padding:'16px 0' }}>
                      {ar ? 'ما عندكش جلسات مسجلة لسه' : "No sessions logged yet"}
                    </p>
                  ) : sessions.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--glass-border)' }}>
                      <CheckCircle size={14} color="#4ade80" style={{ flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.8rem', color:'var(--chalk)' }}>{s.name || s.program_name || (ar ? 'جلسة تمرين' : 'Workout session')}</div>
                        <div style={{ fontSize:'0.62rem', color:'var(--ash)', fontFamily:'var(--font-mono)', marginTop:2 }}>
                          {new Date(s.created_at).toLocaleDateString(dateLocale, { month:'short', day:'numeric' })}
                        </div>
                      </div>
                      {s.duration_min && <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', flexShrink:0 }}>{s.duration_min}{ar ? 'د' : 'm'}</span>}
                    </div>
                  ))}
                </GlassCard>
              </Reveal>

              {/* QUICK ACTIONS */}
              <Reveal delay={0.25}>
                <GlassCard style={{ padding:'20px 24px' }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', letterSpacing:'0.05em', marginBottom:14 }}>{ar ? 'روابط سريعة' : 'QUICK LINKS'}</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {quickLinks.map(({ href, label, icon, color }) => (
                      <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px', background:'var(--iron)', border:'1px solid var(--iron-light)', borderRadius:10, textDecoration:'none', color:'var(--chalk)', fontSize:'0.8rem', fontFamily:'var(--font-body)', transition:'all 150ms' }}>
                        <span>{icon}</span>
                        <span style={{ color }}>{label}</span>
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
