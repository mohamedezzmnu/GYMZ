import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import AuthLayout from '../components/layout/AuthLayout';

const eyeBtnStyle = {
  position: 'absolute', right: 14, top: '50%',
  transform: 'translateY(-50%)',
  background: 'none', border: 'none', padding: 0,
  color: 'var(--ash)', cursor: 'pointer',
  display: 'flex', alignItems: 'center',
};

export default function LoginPage() {
  const { login } = useAuth();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error(ar ? 'من فضلك اكتب الإيميل والباسورد' : 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(ar ? `أهلاً بيك تاني، ${user.name}! 💪` : `Welcome back, ${user.name}! 💪`);
      router.push(router.query.from || '/');
    } catch (err) {
      toast.error(err.message || (ar ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      ar={ar}
      eyebrow={ar ? 'دخول' : 'SIGN IN'}
      title={ar ? 'أهلاً بيك تاني' : 'WELCOME BACK'}
      subtitle={ar ? 'سجّل دخولك عشان تكمل رحلتك التدريبية.' : 'Sign in to continue your training journey.'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="label">{ar ? 'الإيميل' : 'EMAIL'}</label>
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
          <label className="label">{ar ? 'الباسورد' : 'PASSWORD'}</label>
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
            <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
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
      </div>
    </AuthLayout>
  );
}
