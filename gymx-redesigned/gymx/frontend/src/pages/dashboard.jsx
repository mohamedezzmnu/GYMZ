import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp, Dumbbell, Flame, Target, ChevronRight,
  Plus, BarChart2, Clock, CheckCircle, Zap, Scale, Activity
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

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

function GlassCard({ children, style = {}, accentColor }) {
  return (
    <motion.div
      whileHover={{ borderColor: accentColor ? `${accentColor}44` : 'rgba(255,77,46,0.25)', y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function StatBox({ icon: Icon, label, value, sub, accent = 'var(--accent)', delay = 0 }) {
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
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wg)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {weights.map((w, i) => {
          const x = (i / (weights.length - 1)) * W;
          const y = H - ((w - min) / (max - min)) * H;
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />;
        })}
      </svg>
    </div>
  );
}

function WeightEntry({ date, weight, change }) {
  const positive = change > 0;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
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
  const { user } = useAuth();
  const router   = useRouter();
  const [programs,   setPrograms]   = useState([]);
  const [sessions,   setSessions]   = useState([]);
  const [weightLog,  setWeightLog]  = useState([]);
  const [newWeight,  setNewWeight]  = useState('');
  const [loadingWeight, setLoadingWeight] = useState(false);
  const [weekDays,   setWeekDays]   = useState([]);
  const [streak,     setStreak]     = useState(0);
  const [goalWeight, setGoalWeight] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }

    supabase.from('user_programs').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) setPrograms(data);
    });

    supabase.from('workout_sessions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => {
        if (!data) return;
        setSessions(data);

        // ── calculate streak from real session dates ──────────────────
        const sessionDates = [...new Set(
          data.map(s => new Date(s.created_at).toDateString())
        )];
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (sessionDates.includes(d.toDateString())) {
            count++;
          } else if (i > 0) {
            break; // gap found — streak ends
          }
        }
        setStreak(count);
      });

    supabase.from('weight_log').select('*').eq('user_id', user.id)
      .order('logged_at', { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setWeightLog(data); });

    // ── fetch real goal weight from user record ──────────────────────
    supabase.from('users').select('goal_weight').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.goal_weight) setGoalWeight(data.goal_weight);
      });

    const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const today = new Date().getDay();
    setWeekDays(days.map((d, i) => ({ label: d, done: i < today, today: i === today })));
  }, [user]);

  const logWeight = async () => {
    if (!newWeight || isNaN(newWeight)) return;
    setLoadingWeight(true);
    await supabase.from('weight_log').insert({ user_id: user.id, weight: parseFloat(newWeight), logged_at: new Date().toISOString() });
    const { data } = await supabase.from('weight_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(10);
    if (data) setWeightLog(data);
    setNewWeight('');
    setLoadingWeight(false);
  };

  const totalSessions = sessions.length || 0;
  const currentWeight = weightLog[0]?.weight ?? '—';
  const weightChange  = weightLog.length >= 2 ? weightLog[0].weight - weightLog[1].weight : 0;

  // Goal progress — real data: goalWeight from profiles, startWeight = heaviest recorded
  const startWeight = weightLog.length ? Math.max(...weightLog.map(w => w.weight)) : null;
  const progressPct = startWeight && goalWeight && currentWeight !== '—'
    ? Math.min(100, Math.max(0, Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100)))
    : 0;

  const lastSession = sessions[0];

  if (!user) return null;

  return (
    <>
      <Head><title>داشبورد — GYMZ</title></Head>
      <div style={{ minHeight:'100vh', paddingTop:72, paddingBottom:80, position:'relative' }}>
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 55% 35% at 15% 25%, rgba(255,77,46,0.06) 0%,transparent 60%), radial-gradient(ellipse 40% 40% at 85% 75%, rgba(255,77,46,0.04) 0%,transparent 60%)' }} />

        <div style={{ maxWidth:960, margin:'0 auto', padding:'0 20px', position:'relative', zIndex:1 }}>

          {/* ── GREETING ── */}
          <Reveal>
            <div style={{ marginBottom:24, direction:'rtl' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'rgba(255,77,46,0.7)', letterSpacing: '0.02em', marginBottom:6 }}>
                — أهلاً بك
              </div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3rem)', letterSpacing:'0.03em', color:'var(--chalk)', lineHeight:1 }}>
                {user.email?.split('@')[0] || 'بطل'} <span style={{ color:'var(--accent)' }}>💪</span>
              </h1>
            </div>
          </Reveal>

          {/* ── WEEK STRIP ── */}
          <Reveal delay={0.05}>
            <GlassCard style={{ padding:'18px 22px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', letterSpacing:'0.05em' }}>أيام الأسبوع</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'rgba(255,77,46,0.7)', letterSpacing: '0.02em' }}>{streak} أيام متتالية 🔥</span>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ textAlign:'center', flex:1 }}>
                    <div style={{ width:'100%', aspectRatio:'1', borderRadius:8, border:`1px solid ${d.today ? 'var(--accent)' : d.done ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`, background: d.today ? 'rgba(255,77,46,0.15)' : d.done ? 'rgba(74,222,128,0.08)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:5 }}>
                      {d.done && !d.today && <span style={{ fontSize:'0.6rem', color:'#4ade80' }}>✓</span>}
                      {d.today && <span style={{ fontSize:'0.6rem', color:'var(--accent)' }}>●</span>}
                    </div>
                    <span style={{ fontSize:'0.5rem', fontFamily:'var(--font-mono)', color: d.today ? 'var(--accent)' : d.done ? '#4ade80' : 'var(--ash)', letterSpacing:'0.04em' }}>
                      {d.label.slice(0,3)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          {/* ── STATS GRID ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:14, marginBottom:20 }}>
            <StatBox icon={Flame}    label="الاستمرارية"     value={`${streak}d`}          sub="+1 اليوم" accent="var(--accent)"  delay={0.05} />
            <StatBox icon={Dumbbell} label="جلسات الشهر"     value={totalSessions || '—'}   accent="#FFFFFF"  delay={0.1}  />
            <StatBox icon={Scale}    label="الوزن الحالي"    value={currentWeight !== '—' ? `${currentWeight}` : '—'} accent="#4ade80" delay={0.15} />
            <StatBox icon={Target}   label="برامج نشطة"      value={programs.length || '—'} accent="#FFFFFF"  delay={0.2}  />
          </div>

          {/* ── LAST WORKOUT ── */}
          {lastSession && (
            <Reveal delay={0.08}>
              <GlassCard style={{ padding:'18px 22px', marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', direction:'rtl' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,77,46,0.12)', border:'1px solid rgba(255,77,46,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Dumbbell size={16} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--ash)', letterSpacing: '0.02em', marginBottom:3 }}>آخر تمرين</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--chalk)' }}>{lastSession.name || lastSession.program_name || 'جلسة تمرين'}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--ash-light)' }}>
                    {new Date(lastSession.created_at).toLocaleDateString('ar-EG', { month:'short', day:'numeric' })}
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
                  <Scale size={15} color="var(--accent)" />
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.05em' }}>سجل الوزن</h2>
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                  <input
                    type="number" placeholder="وزنك اليوم (kg)"
                    value={newWeight} onChange={e => setNewWeight(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && logWeight()}
                    style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'var(--chalk)', fontFamily:'var(--font-body)', fontSize:'0.875rem', outline:'none', direction:'rtl' }}
                  />
                  <motion.button onClick={logWeight} disabled={loadingWeight} whileTap={{ scale:0.95 }}
                    style={{ padding:'9px 14px', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', fontFamily:'var(--font-mono)' }}>
                    <Plus size={14} /> سجل
                  </motion.button>
                </div>

                {/* Chart */}
                <WeightChart data={weightLog} />

                {/* Goal progress bar */}
                {currentWeight !== '—' && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing:'0.07em' }}>تقدم نحو الهدف</span>
                      <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{progressPct}%</span>
                    </div>
                    <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${Math.max(progressPct,0)}%` }} transition={{ duration:1, delay:0.3 }}
                        style={{ height:'100%', borderRadius:2, background:'var(--accent)' }} />
                    </div>
                  </div>
                )}

                {weightLog.length === 0 ? (
                  <p style={{ color:'var(--ash)', fontSize:'0.78rem', textAlign:'center', padding:'16px 0', direction:'rtl' }}>
                    سجّل وزنك اليوم وابدأ تتابع!
                  </p>
                ) : weightLog.slice(0,5).map((entry, i) => (
                  <WeightEntry
                    key={entry.id || i}
                    date={new Date(entry.logged_at).toLocaleDateString('ar-EG', { month:'short', day:'numeric' })}
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
                      <BarChart2 size={15} color="var(--accent)" />
                      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.05em' }}>برامجي</h2>
                    </div>
                    <Link href="/programs" style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--accent)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                      كل البرامج <ChevronRight size={11} />
                    </Link>
                  </div>

                  {programs.length === 0 ? (
                    <Link href="/programs" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'14px', background:'rgba(255,77,46,0.06)', border:'1px dashed rgba(255,77,46,0.2)', borderRadius:10, color:'var(--accent)', fontSize:'0.8rem', textDecoration:'none' }}>
                      <Zap size={13} /> انضم لأول برنامج
                    </Link>
                  ) : programs.slice(0, 2).map((p, i) => (
                    <div key={i} style={{ padding:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, marginBottom:8 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', marginBottom:10, direction:'rtl' }}>{p.program_name || 'برنامج'}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing:'0.07em' }}>التقدم</span>
                        <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{p.progress || 20}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${p.progress || 20}%` }} transition={{ duration:0.8, delay:0.3 }}
                          style={{ height:'100%', borderRadius:2, background:'var(--accent)' }} />
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
                    <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.05em' }}>آخر الجلسات</h2>
                  </div>

                  {sessions.length === 0 ? (
                    <p style={{ color:'var(--ash)', fontSize:'0.78rem', textAlign:'center', padding:'16px 0', direction:'rtl' }}>
                      ما عندكش جلسات مسجلة لسه
                    </p>
                  ) : sessions.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', direction:'rtl' }}>
                      <CheckCircle size={14} color="#4ade80" style={{ flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.8rem', color:'var(--chalk)' }}>{s.name || s.program_name || 'جلسة تمرين'}</div>
                        <div style={{ fontSize:'0.62rem', color:'var(--ash)', fontFamily:'var(--font-mono)', marginTop:2 }}>
                          {new Date(s.created_at).toLocaleDateString('ar-EG', { month:'short', day:'numeric' })}
                        </div>
                      </div>
                      {s.duration_min && <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', flexShrink:0 }}>{s.duration_min}d</span>}
                    </div>
                  ))}
                </GlassCard>
              </Reveal>

              {/* QUICK ACTIONS */}
              <Reveal delay={0.25}>
                <GlassCard style={{ padding:'20px 24px' }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', letterSpacing:'0.05em', marginBottom:14 }}>روابط سريعة</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      { href:'/exercises', label:'التمارين', icon:'🏋️', color:'var(--accent)' },
                      { href:'/programs',  label:'البرامج',  icon:'📋', color:'#FFFFFF' },
                      { href:'/tools',     label:'الحاسبات', icon:'🧮', color:'#4ade80' },
                      { href:'/bmi',       label:'BMI',      icon:'📊', color:'#FFFFFF' },
                    ].map(({ href, label, icon, color }) => (
                      <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, textDecoration:'none', color:'var(--chalk)', fontSize:'0.8rem', fontFamily:'var(--font-body)', transition:'all 150ms' }}>
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
