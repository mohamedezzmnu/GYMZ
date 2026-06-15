import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

function AuthLayout({ children, title, subtitle }) {
  return (
    <>
      <Head><title>{title} — GYMZ</title></Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        {/* Ambient glows */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 50% 50% at 30% 40%, rgba(61,127,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 70% 70%, rgba(255,107,43,0.07) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Background Z */}
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(80vw, 80vh)',
          color: 'rgba(61,127,255,0.025)',
          userSelect: 'none', pointerEvents: 'none', zIndex: 0,
        }} aria-hidden>Z</div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '0.1em',
            marginBottom: 40,
            textAlign: 'center',
          }}>
            GYM<span style={{ color: 'var(--volt)', textShadow: '0 0 20px rgba(61,127,255,0.6)' }}>Z</span>
          </div>

          {/* Glass Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 32px',
            boxShadow: '0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top shimmer */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
            }} />
            {/* Accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, var(--volt), var(--fire), transparent)',
              opacity: 0.7,
            }} />

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>{title}</h1>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.875rem', marginBottom: 32 }}>
              {subtitle}
            </p>

            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const passStrength = () => {
    const p = form.password;
    if (!p.length) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passStrength();
  const strengthLabel = ['', 'ضعيف', 'مقبول', 'جيد', 'قوي'][strength];
  const strengthColor = ['', '#f87171', '#facc15', '#4ade80', 'var(--volt)'][strength];

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('اكتب اسمك'); return; }
    if (!form.email) { toast.error('اكتب الإيميل'); return; }
    if (form.password.length < 8) { toast.error('الباسورد لازم 8 حروف على الأقل'); return; }
    if (form.password !== form.confirm) { toast.error('الباسوردين مش متطابقين'); return; }

    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.toLowerCase(), form.password);
      toast.success(`أهلاً بيك في GYMZ، ${user.name}! 💪`);
      router.push('/');
    } catch (err) {
      toast.error(err.message || 'مشكلة في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    color: 'var(--chalk)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 200ms, box-shadow 200ms',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.08em',
    color: 'var(--ash-light)',
    textTransform: 'uppercase',
    marginBottom: 8,
  };

  return (
    <AuthLayout title="انضم لـ GYMZ" subtitle="اعمل حسابك وابدأ رحلتك التدريبية النهارده.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Name */}
        <div>
          <label style={labelStyle}>الاسم</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="اسمك الكامل"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(61,127,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(61,127,255,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>الإيميل</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(61,127,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(61,127,255,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>الباسورد</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 48 }}
              type={showPass ? 'text' : 'password'}
              placeholder="8 حروف على الأقل"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(61,127,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(61,127,255,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--ash)', cursor: 'pointer', padding: 0,
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength */}
          {form.password.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    height: 3, flex: 1, borderRadius: 2,
                    background: i <= strength ? strengthColor : 'var(--iron-light)',
                    transition: 'background 250ms, box-shadow 250ms',
                    boxShadow: i <= strength ? `0 0 6px ${strengthColor}66` : 'none',
                  }} />
                ))}
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: strengthColor,
                letterSpacing: '0.05em',
              }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={labelStyle}>تأكيد الباسورد</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{
                ...inputStyle,
                paddingRight: 48,
                borderColor: form.confirm && form.password !== form.confirm
                  ? 'rgba(248,113,113,0.5)'
                  : form.confirm && form.password === form.confirm
                    ? 'rgba(74,222,128,0.5)'
                    : 'var(--glass-border)',
              }}
              type={showPass ? 'text' : 'password'}
              placeholder="اكتب الباسورد تاني"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {form.confirm && form.password === form.confirm && (
              <div style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: '#4ade80',
              }}>
                <Check size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '14px',
            background: loading
              ? 'rgba(61,127,255,0.3)'
              : 'linear-gradient(135deg, var(--volt), rgba(61,127,255,0.8))',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            letterSpacing: '0.1em',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: loading ? 'none' : '0 4px 20px rgba(61,127,255,0.35)',
            transition: 'all 200ms',
          }}
        >
          {loading ? 'جاري إنشاء الحساب...' : <><span>ابدأ دلوقتي</span><ArrowRight size={18} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          عندك حساب؟{' '}
          <Link href="/login" style={{ color: 'var(--volt)', textDecoration: 'none', fontWeight: 500 }}>
            سجل دخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
