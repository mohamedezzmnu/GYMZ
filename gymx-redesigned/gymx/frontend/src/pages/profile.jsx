import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Mail, Calendar, Target, Dumbbell, TrendingUp,
  Award, Clock, ChevronRight, LogOut, Shield,
  Zap, BarChart2, CheckCircle, Lock, Eye, EyeOff, ArrowRight, Flame, Loader,
  Trophy, Star, X,
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
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// ── glass card ───────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true }) {
  return (
    <motion.div
      className="glass-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      whileHover={
        hover
          ? {
              borderColor: 'rgba(255, 90, 31, 0.4)',
              boxShadow: 'var(--glass-shadow-hover)',
              y: -2,
            }
          : {}
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// ── الإنجازات: تعريف موحّد + مقدار التقدم لكل واحد ────────────
const ACHIEVEMENT_DEFS = [
  { key: 'first_workout', label: 'أول تمرين', target: 1, getCurrent: (d) => d.length },
  { key: 'streak_7', label: '7 أيام متتالية', target: 7, getCurrent: (d, streak) => streak },
  { key: 'sessions_10', label: '10 جلسات', target: 10, getCurrent: (d) => d.length },
  { key: 'sessions_30', label: '30 جلسة', target: 30, getCurrent: (d) => d.length },
  { key: 'full_session', label: 'أكملت جلسة كاملة', target: 1, getCurrent: (d) => d.filter((s) => s.done).length },
  { key: 'sessions_50', label: 'محترف (50 جلسة)', target: 50, getCurrent: (d) => d.length },
];

const ACHIEVEMENT_ICON_MAP = {
  first_workout: Flame,
  streak_7: Dumbbell,
  sessions_10: Zap,
  sessions_30: Trophy,
  full_session: Target,
  sessions_50: Star,
};

// ── كونفيتي خفيف بالهوية البرتقالية والداكنة ────────────────
function ConfettiBurst() {
  const colors = ['#FF5A1F', '#FF7A45', '#FF9A70', '#F5F0E8', '#D9430F'];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 260,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.15,
    color: colors[i % colors.length],
    size: 5 + Math.random() * 5,
    round: Math.random() > 0.5,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: '50%', y: '30%', rotate: 0, scale: 0 }}
          animate={{ opacity: 0, x: `calc(50% + ${p.x}px)`, y: '120%', rotate: p.rotate, scale: 1 }}
          transition={{ duration: 1.1 + Math.random() * 0.4, delay: p.delay, ease: [0.15, 0.6, 0.4, 1] }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
        />
      ))}
    </div>
  );
}

// ── مودال احتفال بإنجاز جديد ──────────────────────────────────
function AchievementCelebration({ achievement, onClose }) {
  if (!achievement) return null;
  const Icon = ACHIEVEMENT_ICON_MAP[achievement.key] || Award;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        cursor: 'pointer',
      }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(14, 14, 14, 0.96)',
          border: '1px solid rgba(255, 90, 31, 0.45)',
          padding: '40px 32px 32px',
          maxWidth: 340,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <ConfettiBurst />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--volt-dim)',
            border: '1px solid rgba(255, 90, 31, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <Icon size={28} color="var(--volt)" />
        </motion.div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--volt)', letterSpacing: '0.14em', marginBottom: 8 }}>
          إنجاز جديد
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--chalk)', letterSpacing: '0.02em', marginBottom: 20 }}>
          {achievement.label}
        </div>
        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
          تمام
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Calendar Heatmap للاستمرارية (زي GitHub) ──────────────────
function CalendarHeatmap({ sessions }) {
  const days = 84;
  const dateSet = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
  const cells = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    cells.push({ date: d, active: dateSet.has(d.toDateString()) });
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div dir="ltr" style={{ display: 'flex', gap: 3, overflowX: 'auto', padding: '2px 0' }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {week.map((cell, di) => (
            <div
              key={di}
              title={cell.date.toLocaleDateString('ar-EG')}
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                background: cell.active ? 'var(--volt)' : 'rgba(255, 255, 255, 0.05)',
                border: cell.active ? '1px solid rgba(255, 90, 31, 0.7)' : '1px solid var(--glass-border)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── CHANGE PASSWORD MODAL ────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.current || !form.next || !form.confirm) {
      toast.error('اكمل كل الحقول');
      return;
    }
    if (form.next.length < 8) {
      toast.error('الباسورد الجديد 8 حروف على الأقل');
      return;
    }
    if (form.next !== form.confirm) {
      toast.error('الباسوردين مش متطابقين');
      return;
    }
    setLoading(true);
    const { data: { user: u } } = await supabase.auth.getUser();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: u.email, password: form.current });
    if (signInErr) {
      toast.error('الباسورد الحالي غلط');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: form.next });
    if (error) {
      toast.error('فشل تغيير الباسورد');
      setLoading(false);
      return;
    }
    toast.success('تم تغيير الباسورد');
    setLoading(false);
    onClose();
  };

  const lbl = {
    display: 'block',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--ash-light)',
    letterSpacing: '0.02em',
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(14, 14, 14, 0.96)',
          padding: '32px 26px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--volt)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--volt-dim)',
              border: '1px solid rgba(255, 90, 31, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={16} color="var(--volt)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '0.02em', margin: 0 }}>
            تغيير الباسورد
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'current', label: 'الباسورد الحالي', ph: '••••••••' },
            { key: 'next', label: 'الباسورد الجديد', ph: 'min 8 chars' },
            { key: 'confirm', label: 'تأكيد الباسورد', ph: '••••••••' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  style={{ paddingRight: key === 'current' ? 42 : 14 }}
                  type={show ? 'text' : 'password'}
                  placeholder={ph}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
                {key === 'current' && (
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--ash)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1, padding: '11px', fontSize: '0.875rem' }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 2,
                padding: '11px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {loading ? 'جاري الحفظ...' : <><span>حفظ</span><ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── مودال الإحصائيات التفصيلية ────────────────────────────────
const WEEKDAY_AR = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function StatsModal({ sessions, onClose }) {
  const now = new Date();

  const inRange = (s, from, to) => {
    const t = new Date(s.created_at);
    return t >= from && t < to;
  };

  const last7 = sessions.filter((s) => inRange(s, daysAgo(6), new Date(now.getTime() + 86400000)));
  const prev7 = sessions.filter((s) => inRange(s, daysAgo(13), daysAgo(6)));
  const last30 = sessions.filter((s) => inRange(s, daysAgo(29), new Date(now.getTime() + 86400000)));
  const prev30 = sessions.filter((s) => inRange(s, daysAgo(59), daysAgo(29)));

  const pctChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };
  const weekChange = pctChange(last7.length, prev7.length);
  const monthChange = pctChange(last30.length, prev30.length);

  const weekdayCounts = new Array(7).fill(0);
  sessions.forEach((s) => weekdayCounts[new Date(s.created_at).getDay()]++);
  const bestDayIdx = weekdayCounts.reduce((best, v, i) => (v > weekdayCounts[best] ? i : best), 0);
  const hasAnyDay = weekdayCounts.some((v) => v > 0);

  const withDuration = sessions.filter((s) => s.duration_min > 0);
  const avgDuration = withDuration.length
    ? Math.round(withDuration.reduce((sum, s) => sum + s.duration_min, 0) / withDuration.length)
    : null;

  const tomorrowStart = new Date(now);
  tomorrowStart.setHours(24, 0, 0, 0);
  const weeklyBars = Array.from({ length: 8 }, (_, i) => {
    const weeksFromNow = 7 - i;
    const bucketEnd = new Date(tomorrowStart.getTime() - weeksFromNow * 7 * 86400000);
    const bucketStart = new Date(bucketEnd.getTime() - 7 * 86400000);
    return sessions.filter((s) => {
      const t = new Date(s.created_at);
      return t >= bucketStart && t < bucketEnd;
    }).length;
  });
  const maxBar = Math.max(1, ...weeklyBars);

  const Row = ({ icon: Icon, label, value, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={16} color="var(--volt)" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--chalk)' }}>{label}</span>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--chalk)' }}>{value}</div>
        {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--volt-bright)' }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          background: 'rgba(14, 14, 14, 0.96)',
          padding: 26,
          maxWidth: 420,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.02em', color: 'var(--chalk)', margin: 0 }}>
            <BarChart2 size={17} color="var(--volt)" /> إحصائياتي
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              color: 'var(--ash)',
              width: 28,
              height: 28,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', textAlign: 'center', padding: '30px 0' }}>
            لسه معملتش أي جلسة — سجل أول جلسة عشان تبدأ تشوف إحصائياتك هنا.
          </p>
        ) : (
          <>
            <Row
              icon={Calendar}
              label="الأسبوع ده"
              value={`${last7.length} جلسة`}
              sub={prev7.length > 0 || last7.length > 0 ? `${weekChange >= 0 ? '↑' : '↓'} ${Math.abs(weekChange)}% عن الأسبوع اللي فات` : null}
            />
            <Row
              icon={TrendingUp}
              label="الشهر ده"
              value={`${last30.length} جلسة`}
              sub={prev30.length > 0 || last30.length > 0 ? `${monthChange >= 0 ? '↑' : '↓'} ${Math.abs(monthChange)}% عن الشهر اللي فات` : null}
            />
            {hasAnyDay && (
              <Row icon={Flame} label="أكتر يوم بتتمرن فيه" value={WEEKDAY_AR[bestDayIdx]} sub={`${weekdayCounts[bestDayIdx]} جلسة إجمالي`} />
            )}
            {avgDuration && (
              <Row icon={Clock} label="متوسط مدة الجلسة" value={`${avgDuration} دقيقة`} />
            )}

            <div style={{ marginTop: 20 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.05em', marginBottom: 10 }}>
                جلسات آخر 8 أسابيع
              </p>
              <div dir="ltr" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 70 }}>
                {weeklyBars.map((count, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: '100%',
                        minHeight: 3,
                        height: `${(count / maxBar) * 54}px`,
                        background: i === weeklyBars.length - 1 ? 'var(--volt)' : 'rgba(255, 90, 31, 0.35)',
                        borderRadius: 3,
                      }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ash)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── مودال كل الإنجازات ─────────────────────────────────────────
function daysSince(isoDate) {
  if (!isoDate) return null;
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
  if (diff <= 0) return 'النهارده';
  if (diff === 1) return 'من يوم';
  return `من ${diff} يوم`;
}

function AllAchievementsModal({ achievements, onClose }) {
  const earnedCount = achievements.filter((a) => a.earned).length;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          background: 'rgba(14, 14, 14, 0.96)',
          padding: 26,
          maxWidth: 460,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.02em', color: 'var(--chalk)', margin: 0 }}>
            <Trophy size={17} color="var(--volt)" /> كل الإنجازات
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              color: 'var(--ash)',
              width: 28,
              height: 28,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.05em', marginBottom: 18 }}>
          فتحت {earnedCount} من {achievements.length}
        </p>

        {achievements.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ash-light)', textAlign: 'center', padding: '30px 0' }}>
            جاري تحميل إنجازاتك...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {achievements.map((ach) => {
              const AchIcon = ACHIEVEMENT_ICON_MAP[ach.key] || Award;
              return (
                <div
                  key={ach.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: ach.earned ? 'var(--volt-dim)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${ach.earned ? 'rgba(255, 90, 31, 0.35)' : 'var(--glass-border)'}`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: ach.earned ? 'rgba(255, 90, 31, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${ach.earned ? 'rgba(255, 90, 31, 0.35)' : 'var(--glass-border)'}`,
                    }}
                  >
                    <AchIcon size={16} color={ach.earned ? 'var(--volt)' : 'var(--ash)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: ach.earned ? 'var(--chalk)' : 'var(--ash-light)' }}>
                      {ach.label}
                    </div>
                    {ach.earned ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--volt-bright)', marginTop: 3 }}>
                        <CheckCircle size={10} /> فتحته {daysSince(ach.earnedAt) || ''}
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div style={{ width: `${Math.round((ach.current / ach.target) * 100)}%`, height: '100%', background: 'var(--volt)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', whiteSpace: 'nowrap' }}>
                          {ach.current}/{ach.target}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── قسم حذف الحساب المدمج داخل الصفحة ─────────────────────────
function InlineDeleteAccountSection({ user, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText.trim() !== 'DELETE') {
      toast.error('اكتب كلمة DELETE للتأكيد');
      return;
    }

    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'تعذر إتمام حذف الحساب');
      }

      toast.success('تم حذف الحساب بنجاح');
      if (onDeleted) await onDeleted();
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء حذف الحساب');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 18,
        padding: 14,
        borderRadius: 10,
        background: 'rgba(255, 90, 31, 0.05)',
        border: '1px solid rgba(255, 90, 31, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--volt-bright)', margin: 0 }}>
            حذف الحساب نهائياً
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ash-light)', marginTop: 2 }}>
            سيتم مسح بياناتك وجلساتك ولا يمكن التراجع
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="btn btn-outline"
          style={{
            padding: '7px 12px',
            fontSize: '0.7rem',
          }}
        >
          {open ? 'إغلاق' : 'حذف'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            className="input"
            placeholder="اكتب DELETE للتأكيد"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            style={{
              padding: '9px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            }}
          />
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="btn btn-primary"
            style={{
              padding: '9px 14px',
              fontSize: '0.9rem',
            }}
          >
            {deleting ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [realStats, setRealStats] = useState({ sessions: 0, streak: 0, programs: 0 });
  const [achievements, setAchievements] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    supabase
      .from('user_programs')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          setEnrolledPrograms(data);
          setRealStats((s) => ({ ...s, programs: data.length }));
        }
      });

    supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        if (!data) return;
        setRecentActivity(data.slice(0, 4));
        setAllSessions(data);
        setRealStats((s) => ({ ...s, sessions: data.length }));

        const dates = [...new Set(data.map((s) => new Date(s.created_at).toDateString()))];
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (dates.includes(d.toDateString())) streak++;
          else if (i > 0) break;
        }
        setRealStats((s) => ({ ...s, streak }));

        const computed = ACHIEVEMENT_DEFS.map((def) => {
          const current = def.getCurrent(data, streak);
          return { ...def, current: Math.min(current, def.target), earned: current >= def.target };
        });

        const { data: savedRows } = await supabase
          .from('user_achievements')
          .select('achievement_key, earned_at')
          .eq('user_id', user.id);
        const savedMap = new Map((savedRows || []).map((r) => [r.achievement_key, r.earned_at]));

        const newlyEarned = computed.filter((a) => a.earned && !savedMap.has(a.key));
        if (newlyEarned.length > 0) {
          const nowIso = new Date().toISOString();
          await supabase
            .from('user_achievements')
            .insert(newlyEarned.map((a) => ({ user_id: user.id, achievement_key: a.key, earned_at: nowIso })));
          await supabase.from('notifications').insert(
            newlyEarned.map((a) => ({
              user_id: user.id,
              title: `إنجاز جديد: ${a.label}`,
              body: `فتحت إنجاز "${a.label}"`,
            }))
          );
          newlyEarned.forEach((a) => savedMap.set(a.key, nowIso));
          setCelebrationQueue((q) => [...q, ...newlyEarned]);
        }

        setAchievements(computed.map((a) => ({ ...a, earnedAt: savedMap.get(a.key) || null })));
      });

    supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setOnboarding(data);
      });
  }, [user, authLoading]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="var(--volt)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ash-light)' }}>
          لازم تسجل دخول أولاً
        </p>
        <Link href="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem', textDecoration: 'none' }}>
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  const safeName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials =
    safeName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'GZ';

  return (
    <>
      <Head>
        <title>حسابي — GYMZ</title>
      </Head>
      {showPassModal && <ChangePasswordModal onClose={() => setShowPassModal(false)} />}
      <AnimatePresence>
        {showStatsModal && <StatsModal sessions={allSessions} onClose={() => setShowStatsModal(false)} />}
        {showAchievementsModal && (
          <AllAchievementsModal achievements={achievements} onClose={() => setShowAchievementsModal(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {celebrationQueue.length > 0 && (
          <AchievementCelebration
            achievement={celebrationQueue[0]}
            onClose={() => setCelebrationQueue((q) => q.slice(1))}
          />
        )}
      </AnimatePresence>

      <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80, paddingBottom: 60, position: 'relative' }}>
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

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          {/* ── HERO HEADER ─────────────────────── */}
          <Reveal>
            <GlassCard hover={false} style={{ padding: '32px', marginBottom: 24 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--volt)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--volt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: '#080808',
                    boxShadow: '0 0 0 3px rgba(255, 90, 31, 0.22)',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '0.02em', margin: 0 }}>
                      {safeName}
                    </h1>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.02em',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'var(--volt-dim)',
                        border: '1px solid rgba(255, 90, 31, 0.35)',
                        color: 'var(--volt-bright)',
                      }}
                    >
                      MEMBER
                    </span>
                  </div>
                  <p style={{ color: 'var(--ash-light)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Mail size={13} color="var(--volt)" /> {user.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    fontSize: '0.875rem',
                  }}
                >
                  <LogOut size={15} /> تسجيل خروج
                </button>
              </div>
            </GlassCard>
          </Reveal>

          {/* ── STATS ROW ────────────────────────── */}
          <Reveal delay={0.05}>
            <div
              className="glass-card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                marginBottom: 24,
                overflow: 'hidden',
              }}
            >
              {[
                { label: 'كل الجلسات', value: realStats.sessions },
                { label: 'البرامج', value: realStats.programs },
                { label: 'الاستمرارية', value: realStats.streak ? `${realStats.streak} يوم` : '—' },
                {
                  label: 'هدفك',
                  value: onboarding
                    ? { burn: 'حرق دهون', muscle: 'بناء عضل', fitness: 'لياقة', health: 'صحة' }[onboarding.goal] || '—'
                    : '—',
                },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    padding: '20px 22px',
                    borderInlineStart: i > 0 ? '1px solid var(--glass-border)' : 'none',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.9rem', letterSpacing: '0.01em', color: 'var(--chalk)', lineHeight: 1, margin: 0 }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--ash)', letterSpacing: '0.06em', marginTop: 8, marginBottom: 0, textTransform: 'uppercase' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* ── CONSISTENCY HEATMAP ──────────────── */}
          {allSessions.length > 0 && (
            <Reveal delay={0.22}>
              <GlassCard hover={false} style={{ padding: '20px 22px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', margin: 0 }}>
                    خريطة الاستمرارية — آخر 12 أسبوع
                  </p>
                  {realStats.streak > 0 && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--volt)', letterSpacing: '0.02em', margin: 0 }}>
                      <Flame size={11} /> {realStats.streak} يوم متتالي
                    </p>
                  )}
                </div>
                <CalendarHeatmap sessions={allSessions} />
              </GlassCard>
            </Reveal>
          )}

          {/* ── BOTTOM GRID ──────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* MY PROGRAMS */}
            <Reveal delay={0.1}>
              <GlassCard hover={false} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.02em', margin: 0 }}>
                    برامجي
                  </h2>
                  <Link
                    href="/programs"
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--volt)',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    كل البرامج <ChevronRight size={12} />
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {enrolledPrograms.length === 0 ? (
                    <div
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 10,
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)', marginBottom: 8 }}>
                        {onboarding ? `البرنامج المقترح ليك: ${onboarding.recommended_program}` : 'لسه ما اخترتش برنامج'}
                      </p>
                      <Link
                        href={onboarding ? `/programs?program=${encodeURIComponent(onboarding.recommended_program)}` : '/onboarding'}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--volt)', textDecoration: 'none' }}
                      >
                        {onboarding ? 'ابدأ البرنامج ←' : 'اختار برنامجك ←'}
                      </Link>
                    </div>
                  ) : (
                    enrolledPrograms.map((prog) => {
                      const primaryTitle = prog.program_title || prog.program_title_ar;
                      const secondaryTitle = prog.program_title && prog.program_title_ar && prog.program_title !== prog.program_title_ar
                        ? prog.program_title_ar
                        : null;
                      return (
                        <div
                          key={prog.id}
                          style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 10,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em', margin: 0 }}>
                                {primaryTitle}
                              </p>
                              {secondaryTitle && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--volt-bright)', marginTop: 2, marginBottom: 0 }}>
                                  {secondaryTitle}
                                </p>
                              )}
                              <p style={{ fontSize: '0.7rem', color: 'var(--ash-light)', marginTop: 4, marginBottom: 0 }}>
                                {prog.days_per_week} أيام/أسبوع · بدأ {new Date(prog.started_at).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: '0.6rem',
                                fontFamily: 'var(--font-mono)',
                                padding: '3px 7px',
                                borderRadius: 4,
                                background: 'var(--volt-dim)',
                                border: '1px solid rgba(255, 90, 31, 0.3)',
                                color: 'var(--volt-bright)',
                              }}
                            >
                              {prog.level || 'active'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${prog.progress || 0}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="progress-fill"
                              />
                            </div>
                            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', minWidth: 28 }}>
                              {prog.progress || 0}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <Link
                    href="/programs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px',
                      background: 'var(--volt-dim)',
                      border: '1px dashed rgba(255, 90, 31, 0.35)',
                      borderRadius: 10,
                      color: 'var(--volt)',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                    }}
                  >
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
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.02em', marginTop: 0, marginBottom: 18 }}>
                    آخر الجلسات
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentActivity.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)', textAlign: 'center', padding: '20px 0' }}>
                        لسه ما سجّلتش أي جلسة
                      </p>
                    ) : (
                      recentActivity.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 8,
                            border: '1px solid var(--glass-border)',
                            borderInlineStart: `3px solid ${a.done ? 'var(--volt)' : 'var(--glass-border)'}`,
                          }}
                        >
                          <div style={{ color: a.done ? 'var(--volt)' : 'var(--ash)', flexShrink: 0 }}>
                            {a.done ? <CheckCircle size={15} /> : <Clock size={15} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.8rem', color: a.done ? 'var(--chalk)' : 'var(--ash-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                              {a.day_label || a.program_title || 'جلسة تدريب'}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--ash)', fontFamily: 'var(--font-mono)', marginTop: 2, marginBottom: 0 }}>
                              {a.session_day || new Date(a.created_at).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          {!a.done && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--volt)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                              معلق
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </GlassCard>
              </Reveal>

              {/* ACHIEVEMENTS */}
              <Reveal delay={0.2}>
                <GlassCard hover={false} style={{ padding: '24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.02em', marginTop: 0, marginBottom: 18 }}>
                    الإنجازات
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {achievements.map((ach, i) => {
                      const AchIcon = ACHIEVEMENT_ICON_MAP[ach.key] || Award;
                      return (
                        <div
                          key={ach.key || i}
                          style={{
                            padding: '14px 12px',
                            borderRadius: 10,
                            textAlign: 'center',
                            background: ach.earned ? 'var(--volt-dim)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${ach.earned ? 'rgba(255, 90, 31, 0.35)' : 'var(--glass-border)'}`,
                            opacity: ach.earned ? 1 : 0.65,
                            transition: 'opacity 200ms',
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              margin: '0 auto 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: ach.earned ? 'rgba(255, 90, 31, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                              border: `1px solid ${ach.earned ? 'rgba(255, 90, 31, 0.35)' : 'var(--glass-border)'}`,
                            }}
                          >
                            <AchIcon size={14} color={ach.earned ? 'var(--volt)' : 'var(--ash)'} />
                          </div>
                          <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: ach.earned ? 'var(--chalk)' : 'var(--ash)', letterSpacing: '0.03em', margin: 0 }}>
                            {ach.label}
                          </p>
                          {ach.earned ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: '0.55rem', color: 'var(--volt-bright)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                              <CheckCircle size={9} /> محقق
                            </div>
                          ) : (
                            <div style={{ marginTop: 6 }}>
                              <div className="progress-bar">
                                <div style={{ width: `${Math.round((ach.current / ach.target) * 100)}%`, height: '100%', background: 'var(--volt)', borderRadius: 2 }} />
                              </div>
                              <div style={{ fontSize: '0.55rem', color: 'var(--ash)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                                {ach.current}/{ach.target}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </Reveal>

              {/* ACCOUNT SETTINGS */}
              <Reveal delay={0.25}>
                <GlassCard hover={false} style={{ padding: '24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.02em', marginTop: 0, marginBottom: 18 }}>
                    الحساب
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { icon: Shield, label: 'تغيير الباسورد', onClick: () => setShowPassModal(true) },
                      { icon: BarChart2, label: 'إحصائياتي', onClick: () => setShowStatsModal(true) },
                      { icon: Award, label: 'كل الإنجازات', onClick: () => setShowAchievementsModal(true) },
                    ].map(({ icon: Icon, label, onClick }) => (
                      <motion.button
                        key={label}
                        type="button"
                        onClick={onClick}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        whileHover={{ background: 'rgba(255, 90, 31, 0.08)', borderColor: 'rgba(255, 90, 31, 0.35)' }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 10,
                          color: 'var(--chalk)',
                          cursor: 'pointer',
                          textAlign: 'right',
                          width: '100%',
                          transition: 'background 200ms, border-color 200ms',
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: 'var(--volt-dim)',
                            border: '1px solid rgba(255, 90, 31, 0.28)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={14} color="var(--volt)" />
                        </div>
                        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>{label}</span>
                        <ChevronRight size={14} color="var(--ash)" />
                      </motion.button>
                    ))}
                  </div>

                  <InlineDeleteAccountSection user={user} onDeleted={handleLogout} />
                </GlassCard>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
