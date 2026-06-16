import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp, Dumbbell, Flame, Target, Calendar,
  ChevronRight, Plus, BarChart2, Award, Clock,
  CheckCircle, Circle, Zap, Scale, Activity
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// ── helpers ──────────────────────────────────────────────
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

function GlassCard({ children, style = {}, accent }) {
  return (
    <motion.div
      whileHover={{ borderColor: accent ? `${accent}44` : 'rgba(61,127,255,0.25)', y: -2 }}
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
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }} />
      {children}
    </motion.div>
  );
}

// ── mini stat ─────────────────────────────────────────────
function StatBox({ icon: Icon, label, value, sub, accent = 'var(--volt)', delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <GlassCard accent={accent} style={{ padding: '20px 22px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${accent}18`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={17} color={accent} />
          </div>
          {sub && <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'#4ade80', padding:'2px 7px', borderRadius:4, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)' }}>{sub}</span>}
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', letterSpacing:'0.02em', color:'var(--chalk)', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing:'0.07em', textTransform:'uppercase', marginTop:6 }}>{label}</div>
      </GlassCard>
    </Reveal>
  );
}

// ── weight log entry ──────────────────────────────────────
function WeightEntry({ date, weight, change }) {
  const positive = change > 0;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize:'0.78rem', color:'var(--ash-light)', fontFamily:'var(--font-mono)' }}>{date}</span>
      <span style={{ fontSize:'0.95rem', fontFamily:'var(--font-display)', letterSpacing:'0.05em', color:'var(--chalk)' }}>{weight} kg</span>
      {change !== 0 && (
        <span style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)', color: positive ? '#f87171' : '#4ade80', padding:'2px 7px', borderRadius:4, background: positive ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' }}>
          {positive ? '+' : ''}{change.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [weightLog, setWeightLog] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [loadingWeight, setLoadingWeight] = useState(false);
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }

    // enrolled programs
    supabase.from('user_programs').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) setPrograms(data);
    });

    // recent workout sessions
    supabase.from('workout_sessions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => { if (data) setSessions(data); });

    // weight log
    supabase.from('weight_log').select('*').eq('user_id', user.id)
      .order('logged_at', { ascending: false }).limit(7)
      .then(({ data }) => { if (data) setWeightLog(data); });

    // build this week grid
    const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const today = new Date().getDay();
    setWeekDays(days.map((d, i) => ({ label: d, done: i < today, today: i === today })));
  }, [user]);

  const logWeight = async () => {
    if (!newWeight || isNaN(newWeight)) return;
    setLoadingWeight(true);
    await supabase.from('weight_log').insert({ user_id: user.id, weight: parseFloat(newWeight), logged_at: new Date().toISOString() });
    const { data } = await supabase.from('weight_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(7);
    if (data) setWeightLog(data);
    setNewWeight('');
    setLoadingWeight(false);
  };

  // mock stats (replace with real aggregates)
  const totalSessions = sessions.length || 0;
  const streak = 3; // replace with real streak logic
  const currentWeight = weightLog[0]?.weight ?? '—';
  const weightChange = weightLog.length >= 2 ? weightLog[0].weight - weightLog[1].weight : 0;

  if (!user) return null;

  return (
    <>
      <Head><title>Dashboard — GYMZ</title></Head>
      <div style={{ minHeight:'100vh', paddingTop:88, paddingBottom:60, position:'relative' }}>
        {/* ambient */}
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 55% 35% at 15% 25%, rgba(61,127,255,0.07) 0%,transparent 60%), radial-gradient(ellipse 40% 40% at 85% 75%, rgba(255,107,43,0.05) 0%,transparent 60%)' }} />

        <div style={{ maxWidth:960, margin:'0 auto', padding:'0 20px', position:'relative', zIndex:1 }}>

          {/* ── GREETING ── */}
          <Reveal>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ color:'var(--volt)', marginBottom:6 }}>— Dashboard</div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3rem)', letterSpacing:'0.04em', lineHeight:1.1 }}>
                أهلاً، <span style={{ color:'var(--volt)' }}>{user.name?.split(' ')[0]}</span> 💪
              </h1>
              <p style={{ color:'var(--ash-light)', marginTop:8, fontSize:'0.875rem' }}>
                {new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </p>
            </div>
          </Reveal>

          {/* ── THIS WEEK ── */}
          <Reveal delay={0.05}>
            <GlassCard style={{ padding:'22px 24px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', letterSpacing:'0.05em' }}>هذا الأسبوع</h2>
                <span style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)' }}>{streak} أيام متتالية 🔥</span>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background: d.today ? 'linear-gradient(135deg,var(--volt),rgba(61,127,255,0.7))' : d.done ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                      border: d.today ? '2px solid var(--volt)' : d.done ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow: d.today ? '0 0 16px rgba(61,127,255,0.35)' : 'none',
                    }}>
                      {d.done && !d.today ? <CheckCircle size={14} color="#4ade80" /> : d.today ? <Zap size={14} color="#fff" /> : <Circle size={14} color="rgba(255,255,255,0.15)" />}
                    </div>
                    <span style={{ fontSize:'0.55rem', fontFamily:'var(--font-mono)', color: d.today ? 'var(--volt)' : d.done ? '#4ade80' : 'var(--ash)', letterSpacing:'0.05em' }}>
                      {d.label.slice(0,3)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          {/* ── STATS GRID ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:14, marginBottom:20 }}>
            <StatBox icon={Flame}     label="الاستمرارية" value={`${streak}d`}            sub="+1 اليوم"  accent="var(--fire)"  delay={0.05} />
            <StatBox icon={Dumbbell}  label="جلسات هذا الشهر" value={totalSessions || '—'} accent="var(--volt)"  delay={0.1}  />
            <StatBox icon={Scale}     label="الوزن الحالي" value={`${currentWeight}`}       accent="#4ade80"      delay={0.15} />
            <StatBox icon={Target}    label="برامج نشطة"   value={programs.length || '—'}   accent="#facc15"      delay={0.2}  />
          </div>

          {/* ── BOTTOM GRID ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:18 }}>

            {/* WEIGHT LOG */}
            <Reveal delay={0.1}>
              <GlassCard style={{ padding:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                  <Scale size={16} color="var(--volt)" />
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', letterSpacing:'0.05em' }}>سجل الوزن</h2>
                </div>

                {/* log input */}
                <div style={{ display:'flex', gap:8, marginBottom:18 }}>
                  <input
                    type="number"
                    placeholder="وزنك اليوم (kg)"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && logWeight()}
                    style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--radius-sm)', padding:'9px 12px', color:'var(--chalk)', fontFamily:'var(--font-body)', fontSize:'0.875rem', outline:'none', direction:'rtl' }}
                  />
                  <motion.button onClick={logWeight} disabled={loadingWeight} whileTap={{ scale:0.95 }}
                    style={{ padding:'9px 14px', background:'linear-gradient(135deg,var(--volt),rgba(61,127,255,0.7))', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', fontFamily:'var(--font-mono)' }}>
                    <Plus size={14} /> سجل
                  </motion.button>
                </div>

                {weightLog.length === 0 ? (
                  <p style={{ color:'var(--ash)', fontSize:'0.8rem', textAlign:'center', padding:'20px 0', direction:'rtl' }}>
                    ما سجلتش وزنك بعد — ابدأ دلوقتي!
                  </p>
                ) : weightLog.map((entry, i) => (
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
                      <BarChart2 size={16} color="var(--volt)" />
                      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', letterSpacing:'0.05em' }}>برامجي</h2>
                    </div>
                    <Link href="/programs" style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)', color:'var(--volt)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                      كل البرامج <ChevronRight size={11} />
                    </Link>
                  </div>

                  {programs.length === 0 ? (
                    <Link href="/programs" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'14px', background:'rgba(61,127,255,0.06)', border:'1px dashed rgba(61,127,255,0.2)', borderRadius:'var(--radius-sm)', color:'var(--volt)', fontSize:'0.8rem', textDecoration:'none' }}>
                      <Zap size={13} /> انضم لأول برنامج
                    </Link>
                  ) : programs.slice(0, 2).map((p, i) => (
                    <div key={i} style={{ padding:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-sm)', marginBottom:8 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', marginBottom:8 }}>{p.program_name || 'برنامج'}</div>
                      <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${p.progress || 20}%` }} transition={{ duration:0.8, delay:0.3 }}
                          style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,var(--volt),var(--fire))', boxShadow:'0 0 6px var(--volt-glow)' }} />
                      </div>
                      <div style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', marginTop:6 }}>{p.progress || 20}% مكتمل</div>
                    </div>
                  ))}
                </GlassCard>
              </Reveal>

              {/* RECENT SESSIONS */}
              <Reveal delay={0.2}>
                <GlassCard style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <Clock size={16} color="var(--fire)" />
                    <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', letterSpacing:'0.05em' }}>آخر الجلسات</h2>
                  </div>

                  {sessions.length === 0 ? (
                    <p style={{ color:'var(--ash)', fontSize:'0.8rem', textAlign:'center', padding:'16px 0', direction:'rtl' }}>
                      ما عندكش جلسات مسجلة لسه
                    </p>
                  ) : sessions.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <CheckCircle size={14} color="#4ade80" />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.8rem', color:'var(--chalk)' }}>{s.name || s.program_name || 'جلسة تمرين'}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--ash)', fontFamily:'var(--font-mono)', marginTop:2 }}>
                          {new Date(s.created_at).toLocaleDateString('ar-EG', { month:'short', day:'numeric' })}
                        </div>
                      </div>
                      {s.duration_min && <span style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)' }}>{s.duration_min}min</span>}
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
                      { href:'/exercises', label:'التمارين', icon:'🏋️', color:'var(--volt)' },
                      { href:'/programs',  label:'البرامج',  icon:'📋', color:'var(--fire)' },
                      { href:'/tools',     label:'الحاسبات', icon:'🧮', color:'#4ade80' },
                      { href:'/bmi',       label:'BMI',      icon:'📊', color:'#facc15' },
                    ].map(({ href, label, icon, color }) => (
                      <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-sm)', textDecoration:'none', color:'var(--chalk)', fontSize:'0.8rem', fontFamily:'var(--font-body)', transition:'background 200ms' }}>
                        <span style={{ fontSize:'1rem' }}>{icon}</span>
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
