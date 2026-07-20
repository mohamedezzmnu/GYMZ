import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users, Dumbbell, LayoutGrid, ShieldAlert,
  TrendingUp, Trash2, Search, RefreshCw, Crown,
  UserCheck, UserX, ChevronDown, Activity, Apple, Plus, Play,
} from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────
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
      background: 'var(--glass-bg)',
      border: `1px solid ${accent ? accent + '30' : 'var(--glass-border)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--glass-shadow)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, accent = 'var(--accent)', delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <GlassCard accent={accent} style={{ padding: '20px 22px' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent + '18', border: `1px solid ${accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Icon size={17} color={accent} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.02em', color: 'var(--chalk)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.07em', marginTop: 6 }}>{label}</div>
      </GlassCard>
    </Reveal>
  );
}

// ── role badge ────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      fontSize: '0.6rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
      padding: '3px 8px', borderRadius: 4,
      background: isAdmin ? 'rgba(255,77,46,0.12)' : 'rgba(255,77,46,0.10)',
      border: `1px solid ${isAdmin ? 'rgba(255,77,46,0.35)' : 'rgba(255,77,46,0.25)'}`,
      color: isAdmin ? 'var(--accent)' : 'var(--accent)',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {isAdmin && <Crown size={9} />}
      {isAdmin ? 'ADMIN' : 'USER'}
    </span>
  );
}

// ── main ──────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPrograms: 0, totalSessions: 0, newToday: 0 });
  const [search, setSearch] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // ── nutrition premium ─────────────────────────────────────
  const [premiumEmails, setPremiumEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [removingEmail, setRemovingEmail] = useState(null);

  // ── exercise videos premium ────────────────────────────────
  const [exercisePremiumEmails, setExercisePremiumEmails] = useState([]);
  const [newExerciseEmail, setNewExerciseEmail] = useState('');
  const [addingExerciseEmail, setAddingExerciseEmail] = useState(false);
  const [removingExerciseEmail, setRemovingExerciseEmail] = useState(null);

  // ── guard ────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/login'); return; }
      if (user.role !== 'admin') { router.push('/dashboard'); return; }
    }
  }, [user, loading]);

  // ── fetch data ───────────────────────────────────────────
  async function fetchData() {
    setLoadingData(true);
    try {
      const [usersRes, programsRes, sessionsRes] = await Promise.all([
        supabase.from('users').select('id, email, name, role, created_at').order('created_at', { ascending: false }),
        supabase.from('user_programs').select('id', { count: 'exact', head: true }),
        supabase.from('workout_sessions').select('id', { count: 'exact', head: true }),
      ]);

      const allUsers = usersRes.data || [];
      const today = new Date().toISOString().split('T')[0];
      const newToday = allUsers.filter(u => u.created_at?.startsWith(today)).length;

      setUsers(allUsers);
      setStats({
        totalUsers: allUsers.length,
        totalPrograms: programsRes.count || 0,
        totalSessions: sessionsRes.count || 0,
        newToday,
      });

      fetchPremiumEmails();
      fetchExercisePremiumEmails();
    } catch (e) {
      toast.error('خطأ في جلب البيانات');
    }
    setLoadingData(false);
  }

  // ── nutrition premium emails ───────────────────────────────
  async function fetchPremiumEmails() {
    const { data } = await supabase
      .from('nutrition_premium')
      .select('id, email, added_at')
      .order('added_at', { ascending: false });
    setPremiumEmails(data || []);
  }

  // ── exercise videos premium emails ─────────────────────────
  async function fetchExercisePremiumEmails() {
    const { data } = await supabase
      .from('exercise_premium')
      .select('id, email, added_at')
      .order('added_at', { ascending: false });
    setExercisePremiumEmails(data || []);
  }

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  // ── toggle role ──────────────────────────────────────────
  async function toggleRole(uid, currentRole) {    if (uid === user.id) { toast.error('مش تقدر تغير role نفسك'); return; }
    setTogglingId(uid);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', uid);
    if (error) { toast.error('فشل تغيير الـ role'); }
    else {
      toast.success(`تم التغيير لـ ${newRole}`);
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
    }
    setTogglingId(null);
  }

  // ── delete user ──────────────────────────────────────────
  async function deleteUser(uid) {
    if (uid === user.id) { toast.error('مش تقدر تحذف نفسك'); return; }
    if (!confirm('متأكد إنك عايز تحذف اليوزر ده؟')) return;
    setDeletingId(uid);
    const { error } = await supabase.rpc('delete_user_permanently', { user_id: uid });
    if (error) { toast.error('فشل الحذف — تحقق من الـ RLS policies'); }
    else {
      toast.success('تم حذف اليوزر');
      setUsers(prev => prev.filter(u => u.id !== uid));
      setStats(s => ({ ...s, totalUsers: s.totalUsers - 1 }));
    }
    setDeletingId(null);
  }

  // ── nutrition premium handlers ────────────────────────────
  async function addPremiumEmail() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast.error('اكتب إيميل صحيح');
      return;
    }
    setAddingEmail(true);
    const { error } = await supabase.from('nutrition_premium').insert({ email });
    if (error) {
      if (error.code === '23505') toast.error('الإيميل ده مضاف قبل كده');
      else toast.error('فشلت الإضافة');
    } else {
      toast.success('تم تفعيل الاشتراك ✅');
      setNewEmail('');
      fetchPremiumEmails();
    }
    setAddingEmail(false);
  }

  async function removePremiumEmail(id) {
    setRemovingEmail(id);
    const { error } = await supabase.from('nutrition_premium').delete().eq('id', id);
    if (error) toast.error('فشل الحذف');
    else {
      toast.success('تم إلغاء الاشتراك');
      setPremiumEmails(prev => prev.filter(p => p.id !== id));
    }
    setRemovingEmail(null);
  }

  // ── exercise videos premium handlers ──────────────────────
  async function addExercisePremiumEmail() {
    const email = newExerciseEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast.error('اكتب إيميل صحيح');
      return;
    }
    setAddingExerciseEmail(true);
    const { error } = await supabase.from('exercise_premium').insert({ email });
    if (error) {
      if (error.code === '23505') toast.error('الإيميل ده مضاف قبل كده');
      else toast.error('فشلت الإضافة');
    } else {
      toast.success('تم تفعيل الاشتراك ✅');
      setNewExerciseEmail('');
      fetchExercisePremiumEmails();
    }
    setAddingExerciseEmail(false);
  }

  async function removeExercisePremiumEmail(id) {
    setRemovingExerciseEmail(id);
    const { error } = await supabase.from('exercise_premium').delete().eq('id', id);
    if (error) toast.error('فشل الحذف');
    else {
      toast.success('تم إلغاء الاشتراك');
      setExercisePremiumEmails(prev => prev.filter(p => p.id !== id));
    }
    setRemovingExerciseEmail(null);
  }

  // ── filter ───────────────────────────────────────────────
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── loading / guard states ────────────────────────────────
  if (loading || !user) return null;
  if (user.role !== 'admin') return null;

  return (
    <>
      <Head><title>Admin — GYMZ</title></Head>

      {/* ambient bg */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 20% 30%, rgba(255,77,46,0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(255,77,46,0.08) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ minHeight: '100vh', padding: '80px 24px 60px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,77,46,0.15)', border: '1px solid rgba(255,77,46,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={18} color="var(--accent)" />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.02em' }}>ADMIN PANEL</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1 }}>
                لوحة التحكم
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash-light)', marginTop: 6 }}>
                مرحباً {user.name} — كل البيانات من Supabase مباشرةً
              </p>
            </div>

            <motion.button
              onClick={fetchData}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--chalk)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer', }}
            >
              <RefreshCw size={13} />
              تحديث
            </motion.button>
          </div>
        </Reveal>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          <StatBox icon={Users}       label="إجمالي المستخدمين"   value={loadingData ? '—' : stats.totalUsers}    accent="#3D7FFF" delay={0} />
          <StatBox icon={Activity}    label="مشتركو البرامج"       value={loadingData ? '—' : stats.totalPrograms}  accent="var(--accent)" delay={0.05} />
          <StatBox icon={Dumbbell}    label="جلسات التدريب"        value={loadingData ? '—' : stats.totalSessions}  accent="#4ade80" delay={0.1} />
          <StatBox icon={TrendingUp}  label="مسجلين اليوم"         value={loadingData ? '—' : stats.newToday}       accent="#facc15" delay={0.15} />
        </div>

        {/* ── Nutrition Premium ── */}
        <Reveal delay={0.15}>
          <GlassCard accent="#FFFFFF" style={{ padding: '24px', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Apple size={16} color="#FFFFFF" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--chalk)', letterSpacing: '0.02em' }}>
                اشتراكات التغذية ({premiumEmails.length})
              </span>
            </div>

            {/* add email */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !addingEmail && addPremiumEmail()}
                style={{
                  flex: 1, minWidth: 220, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                  borderRadius: 8, color: 'var(--chalk)', fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem', outline: 'none', direction: 'ltr', textAlign: 'right',
                }}
              />
              <motion.button
                onClick={addPremiumEmail}
                disabled={addingEmail}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                  background: 'rgba(255,159,10,0.12)', border: '1px solid rgba(255,159,10,0.35)',
                  borderRadius: 8, color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  cursor: addingEmail ? 'not-allowed' : 'pointer', opacity: addingEmail ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {addingEmail ? <RefreshCw size={13} /> : <Plus size={13} />}
                تفعيل اشتراك
              </motion.button>
            </div>

            {/* list */}
            {premiumEmails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)' }}>
                مفيش مشتركين لسه
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {premiumEmails.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'rgba(255,159,10,0.06)',
                    border: '1px solid rgba(255,159,10,0.15)', borderRadius: 8,
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--chalk)', direction: 'ltr', textAlign: 'right' }}>{p.email}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)', marginTop: 2 }}>
                        {new Date(p.added_at).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => removePremiumEmail(p.id)}
                      whileTap={{ scale: 0.9 }}
                      disabled={removingEmail === p.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, background: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6,
                        cursor: 'pointer', color: '#f87171',
                      }}
                    >
                      {removingEmail === p.id ? <RefreshCw size={12} /> : <Trash2 size={12} />}
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </Reveal>

        {/* ── Exercise Videos Premium ── */}
        <Reveal delay={0.18}>
          <GlassCard accent="#facc15" style={{ padding: '24px', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Play size={16} color="#facc15" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--chalk)', letterSpacing: '0.02em' }}>
                اشتراكات مكتبة التمارين المتحركة ({exercisePremiumEmails.length})
              </span>
            </div>

            {/* add email */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={newExerciseEmail}
                onChange={e => setNewExerciseEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !addingExerciseEmail && addExercisePremiumEmail()}
                style={{
                  flex: 1, minWidth: 220, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                  borderRadius: 8, color: 'var(--chalk)', fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem', outline: 'none', direction: 'ltr', textAlign: 'right',
                }}
              />
              <motion.button
                onClick={addExercisePremiumEmail}
                disabled={addingExerciseEmail}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                  background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.35)',
                  borderRadius: 8, color: '#facc15', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  cursor: addingExerciseEmail ? 'not-allowed' : 'pointer', opacity: addingExerciseEmail ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {addingExerciseEmail ? <RefreshCw size={13} /> : <Plus size={13} />}
                تفعيل اشتراك
              </motion.button>
            </div>

            {/* list */}
            {exercisePremiumEmails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash)' }}>
                مفيش مشتركين لسه
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exercisePremiumEmails.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'rgba(250,204,21,0.06)',
                    border: '1px solid rgba(250,204,21,0.15)', borderRadius: 8,
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--chalk)', direction: 'ltr', textAlign: 'right' }}>{p.email}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash-light)', marginTop: 2 }}>
                        {new Date(p.added_at).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => removeExercisePremiumEmail(p.id)}
                      whileTap={{ scale: 0.9 }}
                      disabled={removingExerciseEmail === p.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, background: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6,
                        cursor: 'pointer', color: '#f87171',
                      }}
                    >
                      {removingExerciseEmail === p.id ? <RefreshCw size={12} /> : <Trash2 size={12} />}
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </Reveal>

        {/* ── Users Table ── */}
        <Reveal delay={0.2}>
          <GlassCard style={{ padding: '24px' }}>
            {/* table header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="var(--accent)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--chalk)', letterSpacing: '0.02em' }}>
                  المستخدمون ({filtered.length})
                </span>
              </div>

              {/* search */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الإيميل..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                    borderRadius: 8, color: 'var(--chalk)', fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem', outline: 'none', width: 220,
                  }}
                />
              </div>
            </div>

            {/* table */}
            {loadingData ? (
              <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ash)' }}>
                جاري التحميل...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ash)' }}>
                مفيش نتائج
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['الاسم', 'الإيميل', 'الدور', 'تاريخ التسجيل', 'إجراءات'].map(h => (
                        <th key={h} style={{ textAlign: 'right', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', letterSpacing: '0.02em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td style={{ padding: '12px 12px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--chalk)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.role === 'admin' ? 'rgba(255,77,46,0.2)' : 'rgba(255,77,46,0.15)', border: `1px solid ${u.role === 'admin' ? 'rgba(255,77,46,0.4)' : 'rgba(255,77,46,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                              {(u.name || u.email)?.[0]?.toUpperCase()}
                            </div>
                            {u.name || '—'}
                            {u.id === user.id && <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--ash)', padding: '1px 5px', border: '1px solid var(--glass-border)', borderRadius: 3 }}>أنت</span>}
                          </div>
                        </td>
                        <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ash-light)', whiteSpace: 'nowrap' }}>{u.email}</td>
                        <td style={{ padding: '12px 12px' }}><RoleBadge role={u.role} /></td>
                        <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ash)', whiteSpace: 'nowrap' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '—'}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {/* toggle role */}
                            <motion.button
                              onClick={() => toggleRole(u.id, u.role)}
                              disabled={togglingId === u.id || u.id === user.id}
                              whileTap={{ scale: 0.93 }}
                              title={u.role === 'admin' ? 'خفّض لـ user' : 'ارفع لـ admin'}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '5px 10px',
                                background: u.role === 'admin' ? 'rgba(255,77,46,0.1)' : 'rgba(255,77,46,0.1)',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(255,77,46,0.3)' : 'rgba(255,77,46,0.3)'}`,
                                borderRadius: 6, cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                                color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent)',
                                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                                opacity: u.id === user.id ? 0.4 : 1,
                              }}
                            >
                              {togglingId === u.id ? <RefreshCw size={10} /> : u.role === 'admin' ? <UserX size={10} /> : <UserCheck size={10} />}
                              {u.role === 'admin' ? 'user' : 'admin'}
                            </motion.button>

                            {/* delete */}
                            <motion.button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id || u.id === user.id}
                              whileTap={{ scale: 0.93 }}
                              title="حذف المستخدم"
                              style={{
                                display: 'flex', alignItems: 'center',
                                padding: '5px 8px',
                                background: 'rgba(248,113,113,0.08)',
                                border: '1px solid rgba(248,113,113,0.25)',
                                borderRadius: 6, cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                                color: '#f87171', opacity: u.id === user.id ? 0.3 : 1,
                              }}
                            >
                              {deletingId === u.id ? <RefreshCw size={10} /> : <Trash2 size={10} />}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </Reveal>

        {/* ── Footer note ── */}
        <Reveal delay={0.3}>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', marginTop: 28, letterSpacing: '0.07em' }}>
            ⚠️ صفحة Admin — الوصول محدود على المستخدمين اللي عندهم role = admin في Supabase
          </p>
        </Reveal>

      </div>
    </>
  );
}
