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
      <Head><title>{title} — GYMZ</title></Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        {/* Background ambient glow — one quiet source */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 50% 50% at 30% 40%, rgba(255,77,46,0.06) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
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
            }}>
              {title}
            </h1>
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
    if (!form.email || !form.password) { toast.error('من فضلك اكتب الإيميل والباسورد'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`أهلاً بيك تاني، ${user.name}! 💪`);
      router.push(router.query.from || '/');
    } catch (err) {
      toast.error(err.message || 'فشل تسجيل الدخول');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="أهلاً بيك تاني" subtitle="سجّل دخولك عشان تكمل رحلتك التدريبية.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="label">الإيميل</label>
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
          <label className="label">الباسورد</label>
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
          {loading ? 'جاري تسجيل الدخول...' : <>تسجيل الدخول <ArrowRight size={16} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          معاك حساب لسه؟{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            انضم لـ GYMZ
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
