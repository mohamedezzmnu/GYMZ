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
        {/* Ambient glow — one quiet source */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 50% 50% at 30% 40%, rgba(255,77,46,0.06) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '1.3rem',
            letterSpacing: '-0.02em',
            marginBottom: 32,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
            GYMZ
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--carbon)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '1.6rem',
              letterSpacing: '-0.025em',
              marginBottom: 8,
            }}>{title}</h1>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.875rem', marginBottom: 28 }}>
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
  const strengthColor = ['', '#f87171', '#facc15', '#4ade80', 'var(--accent)'][strength];

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('اكتب اسمك'); return; }
    if (!form.email) { toast.error('اكتب الإيميل'); return; }
    if (form.password.length < 8) { toast.error('الباسورد لازم 8 حروف على الأقل'); return; }
    if (form.password !== form.confirm) { toast.error('الباسوردين مش متطابقين'); return; }

    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.toLowerCase(), form.password);
      if (user.needsEmailConfirmation) {
        toast.success('تم إنشاء الحساب! تحقق من إيميلك عشان تفعّله، بعد كده سجّل دخول.');
        router.push('/login');
        return;
      }
      toast.success(`أهلاً بيك في GYMZ، ${user.name}! 💪`);
      router.push('/onboarding');
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
    letterSpacing: '0.02em',
    color: 'var(--ash-light)',
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
            onFocus={(e) => { e.target.style.borderColor = 'rgba(255,77,46,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,77,46,0.1)'; }}
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
            onFocus={(e) => { e.target.style.borderColor = 'rgba(255,77,46,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,77,46,0.1)'; }}
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
              onFocus={(e) => { e.target.style.borderColor = 'rgba(255,77,46,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,77,46,0.1)'; }}
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
              ? 'rgba(255,77,46,0.3)'
              : 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            letterSpacing: '0.02em',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: 'none',
            transition: 'all 200ms',
          }}
        >
          {loading ? 'جاري إنشاء الحساب...' : <><span>ابدأ دلوقتي</span><ArrowRight size={18} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          عندك حساب؟{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            سجل دخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
