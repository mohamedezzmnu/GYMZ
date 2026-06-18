import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

// =============================================
// Auth Layout — Liquid Glass Card
// =============================================
function AuthLayout({ children, title, subtitle }) {
  return (
    <>
      <Head><title>{title} — GYMX</title></Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        {/* Background ambient glows */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 50% 50% at 30% 40%, rgba(61,127,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 70% 70%, rgba(255,107,43,0.07) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Background X */}
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(80vw, 80vh)',
          color: 'rgba(61,127,255,0.025)',
          userSelect: 'none', pointerEvents: 'none', zIndex: 0,
        }} aria-hidden>
          X
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '0.1em',
            marginBottom: 40,
            textAlign: 'center',
          }}>
            GYM<span style={{ color: 'var(--volt)', textShadow: '0 0 20px rgba(61,127,255,0.6)' }}>X</span>
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
            {/* Blue accent line */}
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
            }}>
              {title}
            </h1>
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

// =============================================
// LOGIN PAGE
// =============================================
export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(router.query.from || '/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Enter your credentials to continue training.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ paddingRight: 48 }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--ash)', cursor: 'pointer',
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Logging in...' : <>Login <ArrowRight size={16} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--volt)', textDecoration: 'none' }}>
            Join GYMX
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

// =============================================
// REGISTER PAGE
// =============================================
export function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

 const handleSubmit = async () => {
  if (!form.email || !form.password) { 
    toast.error('Please fill all fields'); 
    return; 
  }
  setLoading(true);
  try {
    const user = await login(form.email, form.password);
    toast.success(`Welcome back, ${user.name}!`);
    // redirect حسب الـ role
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push(router.query.from || '/dashboard');
    }
  } catch (err) {
    toast.error(err.message || 'Login failed');
    setLoading(false); // بس في حالة الـ error
  }
};
  const passStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passStrength();
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] || '';
  const strengthColor = ['#f87171', '#facc15', '#4ade80', 'var(--volt)'][strength - 1] || '';

  return (
    <AuthLayout title="Join GYMX" subtitle="Create your account and start training today.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="label">Name</label>
          <input className="input" type="text" placeholder="Your name"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="your@email.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div>
          <label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPass ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase & number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ paddingRight: 48 }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', color: 'var(--ash)', cursor: 'pointer',
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {strength !== null && (
            <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: i <= strength ? strengthColor : 'var(--iron-light)',
                  transition: 'background 200ms',
                  boxShadow: i <= strength ? `0 0 6px ${strengthColor}66` : 'none',
                }} />
              ))}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: strengthColor, marginLeft: 8, minWidth: 40,
              }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: 'var(--volt)', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
