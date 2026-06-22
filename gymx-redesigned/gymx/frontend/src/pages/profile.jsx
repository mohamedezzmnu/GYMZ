import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  User, Mail, Calendar, Target, Dumbbell, TrendingUp,
  Award, Clock, ChevronRight, Edit3, LogOut, Shield,
  Zap, BarChart2, CheckCircle, Lock, Eye, EyeOff, ArrowRight, Flame,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// ── helper ──────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >{children}</motion.div>
  );
}

// ── glass card ───────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true }) {
  return (
    <motion.div
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      whileHover={hover ? {
        borderColor: 'rgba(255,77,46,0.3)',
        boxShadow: 'var(--glass-shadow-hover)',
        y: -2,
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// ── stat card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = 'var(--accent)', delay }) {
  return (
    <Reveal delay={delay}>
      <GlassCard style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 8 }}>
              {label}
            </p>
            <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', letterSpacing: '0.02em', color: 'var(--chalk)' }}>
              {value}
            </p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${accent}1A`,
            border: `1px solid ${accent}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={accent} />
          </div>
        </div>
      </GlassCard>
    </Reveal>
  );
}

// ── mock data (replace with real API calls) ──────────────────

// ── CHANGE PASSWORD MODAL ────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.current || !form.next || !form.confirm) { toast.error('اكمل كل الحقول'); return; }
    if (form.next.length < 8) { toast.error('الباسورد الجديد 8 حروف على الأقل'); return; }
    if (form.next !== form.confirm) { toast.error('الباسوردين مش متطابقين'); return; }
    setLoading(true);
    // تأكد إن الباسورد الحالي صح عن طريق re-login
    const { data: { user: u } } = await supabase.auth.getUser();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: u.email, password: form.current });
    if (signInErr) { toast.error('الباسورد الحالي غلط'); setLoading(false); return; }
    // غيّر الباسورد
    const { error } = await supabase.auth.updateUser({ password: form.next });
    if (error) { toast.error('فشل تغيير الباسورد'); setLoading(false); return; }
    toast.success('تم تغيير الباسورد ✅');
    setLoading(false);
    onClose();
  };

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)',
    padding: '11px 14px', color: 'var(--chalk)', fontFamily: 'var(--font-body)',
    fontSize: '0.875rem', outline: 'none',
  };
  const lbl = {
    display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
    color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 6,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'rgba(0,0,0,0.6)',
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(13,13,26,0.95)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)', borderRadius: '22px 22px 0 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,77,46,0.12)', border: '1px solid rgba(255,77,46,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={16} color="var(--accent)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>تغيير الباسورد</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'current', label: 'الباسورد الحالي', ph: '••••••••' },
            { key: 'next',    label: 'الباسورد الجديد',  ph: 'min 8 chars' },
            { key: 'confirm', label: 'تأكيد الباسورد',   ph: '••••••••' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: 42 }}
                  type={show ? 'text' : 'password'}
                  placeholder={ph}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
                {key === 'current' && (
                  <button onClick={() => setShow(!show)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--ash)', cursor: 'pointer', padding: 0,
                  }}>
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--ash-light)', fontFamily: 'var(--font-body)', cursor: 'pointer', fontSize: '0.875rem',
            }}>إلغاء</button>
            <motion.button onClick={handleSave} disabled={loading} whileTap={{ scale: 0.97 }} style={{
              flex: 2, padding: '11px',
              background: 'var(--accent)',
              border: 'none', borderRadius: 'var(--radius-sm)',
              color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.02em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {loading ? 'جاري الحفظ...' : <><span>حفظ</span><ArrowRight size={14} /></>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [recentActivity, setRecentActivity]     = useState([]);
  const [onboarding, setOnboarding]             = useState(null);
  const [realStats, setRealStats]               = useState({ sessions: 0, streak: 0, programs: 0 });
  const [achievements, setAchievements]         = useState([]);
  const [showPassModal, setShowPassModal]        = useState(false);

  useEffect(() => {
    if (!user) return;

    // برامج اليوزر
    supabase.from('user_programs').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) {
        setEnrolledPrograms(data);
        setRealStats(s => ({ ...s, programs: data.length }));
      }
    });

    // كل الجلسات — للإحصائيات الحقيقية
    supabase.from('workout_sessions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setRecentActivity(data.slice(0, 4));
        setRealStats(s => ({ ...s, sessions: data.length }));

        // ── streak حقيقي ─────────────────────────────────────────────
        const dates = [...new Set(data.map(s => new Date(s.created_at).toDateString()))];
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const d = new Date(today); d.setDate(today.getDate() - i);
          if (dates.includes(d.toDateString())) streak++;
          else if (i > 0) break;
        }
        setRealStats(s => ({ ...s, streak }));

        // ── إنجازات حقيقية ───────────────────────────────────────────
        const completedPrograms = data.filter(s => s.done).length;
        setAchievements([
          { icon: '🔥', label: 'أول تمرين',       earned: data.length >= 1 },
          { icon: '💪', label: '7 أيام متتالية',  earned: streak >= 7 },
          { icon: '⚡', label: '10 جلسات',         earned: data.length >= 10 },
          { icon: '🏆', label: '30 جلسة',          earned: data.length >= 30 },
          { icon: '🎯', label: 'أكملت جلسة كاملة', earned: completedPrograms >= 1 },
          { icon: '🌟', label: 'محترف (50 جلسة)',  earned: data.length >= 50 },
        ]);
      });

    // بيانات الـ onboarding
    supabase.from('user_onboarding').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setOnboarding(data); });

  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ash-light)' }}>
          لازم تسجل دخول أولاً
        </p>
        <Link href="/login" style={{
          padding: '12px 28px',
          background: 'var(--accent)',
          border: 'none', borderRadius: 'var(--radius-sm)',
          color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1rem',
          textDecoration: 'none', letterSpacing: '0.02em',
        }}>تسجيل الدخول</Link>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'GZ';

  return (
    <>
      <Head><title>حسابي — GYMZ</title></Head>
      {showPassModal && <ChangePasswordModal onClose={() => setShowPassModal(false)} />}

      <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 60, position: 'relative' }}>
        {/* Ambient */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 40% at 20% 20%, rgba(255,77,46,0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,77,46,0.05) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

          {/* ── HERO HEADER ─────────────────────── */}
          <Reveal>
            <GlassCard hover={false} style={{ padding: '32px', marginBottom: 24 }}>
              {/* volt accent top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff',
                  boxShadow: '0 0 0 3px rgba(255,77,46,0.15)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em' }}>
                      {user.name}
                    </h1>
                    <span style={{
                      fontSize: '0.65rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
                      padding: '3px 8px', borderRadius: 4,
                      background: 'rgba(255,77,46,0.12)', border: '1px solid rgba(255,77,46,0.3)',
                      color: 'var(--accent)',
                    }}>MEMBER</span>
                  </div>
                  <p style={{ color: 'var(--ash-light)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} /> {user.email}
                  </p>
                </div>

                {/* Logout */}
                <motion.button
                  onClick={handleLogout}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px',
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f87171', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} /> تسجيل خروج
                </motion.button>
              </div>
            </GlassCard>
          </Reveal>

          {/* ── STATS ROW ────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard icon={Dumbbell}   label="كل الجلسات"    value={realStats.sessions}  accent="var(--accent)"  delay={0.05} />
            <StatCard icon={TrendingUp} label="البرامج"        value={realStats.programs}  accent="#4ade80"        delay={0.1}  />
            <StatCard icon={Flame}      label="الاستمرارية"    value={realStats.streak ? `${realStats.streak} يوم` : '—'} accent="#facc15" delay={0.15} />
            <StatCard icon={Target}     label="هدفك"           value={onboarding ? { burn: '🔥 حرق', muscle: '💪 ضخامة', fitness: '⚡ لياقة', health: '❤️ صحة' }[onboarding.goal] || '—' : '—'} accent="var(--accent)" delay={0.2} />
          </div>

          {/* ── BOTTOM GRID ──────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

            {/* MY PROGRAMS */}
            <Reveal delay={0.1}>
              <GlassCard hover={false} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                    برامجي
                  </h2>
                  <Link href="/programs" style={{
                    fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    كل البرامج <ChevronRight size={12} />
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {enrolledPrograms.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)', marginBottom: 8 }}>
                        {onboarding ? `البرنامج المقترح ليك: ${onboarding.recommended_program}` : 'لسه ما اخترتش برنامج'}
                      </p>
                      <Link href={onboarding ? `/programs?program=${encodeURIComponent(onboarding.recommended_program)}` : '/onboarding'} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)', textDecoration: 'none' }}>
                        {onboarding ? 'ابدأ البرنامج ←' : 'اختار برنامجك ←'}
                      </Link>
                    </div>
                  ) : enrolledPrograms.map((prog) => (
                    <div key={prog.id} style={{
                      padding: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.03em' }}>
                            {prog.program_title_ar || prog.program_title}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--ash-light)', marginTop: 2 }}>
                            {prog.days_per_week} أيام/أسبوع · بدأ {new Date(prog.started_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
                          padding: '3px 7px', borderRadius: 4,
                          background: 'rgba(255,77,46,0.1)',
                          border: '1px solid rgba(255,77,46,0.25)',
                          color: 'var(--accent)',
                        }}>{prog.level || 'active'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prog.progress || 0}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{ height: '100%', borderRadius: 2, background: 'var(--accent)' }}
                          />
                        </div>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', minWidth: 28 }}>
                          {prog.progress || 0}%
                        </span>
                      </div>
                    </div>
                  ))}

                  <Link href="/programs" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px',
                    background: 'rgba(255,77,46,0.06)',
                    border: '1px dashed rgba(255,77,46,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent)', fontSize: '0.8rem',
                    textDecoration: 'none',
                  }}>
                    <Zap size={13} /> انضم لبرنامج جديد
                  </Link>
                </div>
              </GlassCard>
            </Reveal>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ACTIVITY LOG */}
              <Reveal delay={0.15}>
                <GlassCard hover={false} style={{ padding: '24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: 18 }}>
                    آخر الجلسات
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentActivity.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)', textAlign: 'center', padding: '20px 0' }}>
                        لسه ما سجّلتش أي جلسة
                      </p>
                    ) : recentActivity.map((a, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.025)',
                        borderRadius: 8,
                        borderLeft: `3px solid ${a.done ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                        <div style={{ color: a.done ? '#4ade80' : 'var(--ash)', flexShrink: 0 }}>
                          {a.done ? <CheckCircle size={15} /> : <Clock size={15} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8rem', color: a.done ? 'var(--chalk)' : 'var(--ash-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {a.day_label || a.program_title || 'جلسة تدريب'}
                          </p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--ash)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                            {a.session_day || new Date(a.created_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        {!a.done && (
                          <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                            معلق
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </Reveal>

              {/* ACHIEVEMENTS */}
              <Reveal delay={0.2}>
                <GlassCard hover={false} style={{ padding: '24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: 18 }}>
                    الإنجازات
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {achievements.map((ach, i) => (
                      <div key={i} style={{
                        padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                        background: ach.earned ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${ach.earned ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                        opacity: ach.earned ? 1 : 0.35,
                        transition: 'opacity 200ms',
                      }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{ach.icon}</div>
                        <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: ach.earned ? 'var(--chalk)' : 'var(--ash)', letterSpacing: '0.05em' }}>
                          {ach.label}
                        </p>
                        {ach.earned && <div style={{ fontSize: '0.55rem', color: '#4ade80', marginTop: 4, fontFamily: 'var(--font-mono)' }}>✓ محقق</div>}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </Reveal>

              {/* ACCOUNT SETTINGS */}
              <Reveal delay={0.25}>
                <GlassCard hover={false} style={{ padding: '24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: 18 }}>
                    الحساب
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { icon: Shield, label: 'تغيير الباسورد', onClick: () => setShowPassModal(true), accent: 'var(--accent)' },
                      { icon: BarChart2, label: 'إحصائياتي', onClick: () => toast('قريباً! 📊'), accent: '#facc15' },
                      { icon: Award, label: 'كل الإنجازات', onClick: () => toast('قريباً! 🏆'), accent: '#4ade80' },
                    ].map(({ icon: Icon, label, onClick, accent }) => (
                      <motion.button
                        key={label}
                        onClick={onClick}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--chalk)', cursor: 'pointer',
                          textAlign: 'right', width: '100%',
                          transition: 'background 200ms, border-color 200ms',
                        }}
                        whileHover={{ background: 'rgba(255,255,255,0.06)', borderColor: `${accent}33` }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: `${accent}15`, border: `1px solid ${accent}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={14} color={accent} />
                        </div>
                        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>{label}</span>
                        <ChevronRight size={14} color="var(--ash)" />
                      </motion.button>
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
