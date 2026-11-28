import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import AuthLayout from '../components/layout/AuthLayout';

/* 44px hit area, positioned with logical properties so it lands
   on the correct side in both RTL and LTR */
const eyeBtnStyle = {
  position: 'absolute', insetInlineEnd: 2, top: '50%',
  transform: 'translateY(-50%)',
  background: 'none', border: 'none', padding: 0,
  width: 44, height: 44,
  color: 'var(--ash)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default function LoginPage() {
  const { login } = useAuth();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError(ar ? 'من فضلك اكتب الإيميل والباسورد' : 'Please enter your email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(ar ? `أهلاً بيك تاني، ${user.name}! 💪` : `Welcome back, ${user.name}! 💪`);
      const dest = typeof router.query.from === 'string' && router.query.from.startsWith('/') && !router.query.from.startsWith('//') ? router.query.from : '/';
      router.push(dest);
    } catch (err) {
      setError(err.message || (ar ? 'فشل تسجيل الدخول — تأكد من الإيميل والباسورد وحاول تاني' : 'Login failed — check your email and password and try again'));
    } finally {
      setLoading(false);
    }
  };

  const field =
    (key) => ({
      value: form[key],
      onChange: (e) => {
        setForm({ ...form, [key]: e.target.value });
        if (error) setError('');
      },
    });

  return (
    <AuthLayout
      ar={ar}
      eyebrow={ar ? 'دخول' : 'SIGN IN'}
      title={ar ? 'أهلاً بيك تاني' : 'WELCOME BACK'}
      subtitle={ar ? 'سجّل دخولك عشان تكمل رحلتك التدريبية.' : 'Sign in to continue your training journey.'}
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {typeof router.query.from === 'string' && router.query.from.startsWith('/') && (
          <div role="status" style={{
            background: 'var(--volt-dim)', border: '1px solid var(--volt)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            color: 'var(--chalk)', fontSize: '0.82rem', lineHeight: 1.7,
            fontFamily: 'var(--font-body)',
          }}>
            {ar
              ? 'الصفحة اللي كنت رايحها محتاجة تسجيل دخول — سجّل وهنرجّعك ليها على طول.'
              : 'The page you were heading to needs sign-in — sign in and we will take you right back.'}
          </div>
        )}
        <div>
          <label className="label" htmlFor="login-email">{ar ? 'الإيميل' : 'EMAIL'}</label>
          <input
            className="input"
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="your@email.com"
            {...field('email')}
          />
        </div>

        <div>
          <label className="label" htmlFor="login-password">{ar ? 'الباسورد' : 'PASSWORD'}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              id="login-password"
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...field('password')}
              style={{ paddingInlineEnd: 48 }}
            />
            <button type="button" aria-label={showPass ? (ar ? 'إخفاء الباسورد' : 'Hide password') : (ar ? 'إظهار الباسورد' : 'Show password')} onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" style={{
            margin: 0, color: '#f87171', fontSize: '0.85rem',
            lineHeight: 1.6, fontFamily: 'var(--font-body)',
          }}>
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading
            ? (ar ? 'جاري تسجيل الدخول...' : 'Signing in...')
            : <>{ar ? 'تسجيل الدخول' : 'SIGN IN'} <ArrowRight size={16} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          {ar ? 'معاك حساب لسه؟' : "Don't have an account?"}{' '}
          <Link href="/register" style={{ color: 'var(--volt)', textDecoration: 'none', fontWeight: 600 }}>
            {ar ? 'انضم لـ GYMZ' : 'Join GYMZ'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
