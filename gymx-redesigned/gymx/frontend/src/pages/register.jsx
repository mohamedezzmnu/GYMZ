import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import AuthLayout from '../components/layout/AuthLayout';

/* 44px hit area, logical properties so it works in RTL and LTR */
const eyeBtnStyle = {
  position: 'absolute', insetInlineEnd: 2, top: '50%',
  transform: 'translateY(-50%)',
  background: 'none', border: 'none', padding: 0,
  width: 44, height: 44,
  color: 'var(--ash)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// red → orange → yellow → green: a strength meter should read as
// "danger to safe", not end on the brand's orange accent colour —
// that overloads the brand colour with an unrelated meaning.
const STRENGTH_COLORS = ['', '#f87171', '#fb923c', '#facc15', '#4ade80'];

export default function RegisterPage() {
  const { register } = useAuth();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  const strengthLabels = ar
    ? ['', 'ضعيف', 'مقبول', 'جيد', 'قوي']
    : ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthLabel = strengthLabels[strength];
  const strengthColor = STRENGTH_COLORS[strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(ar ? 'اكتب اسمك' : 'Enter your name'); return; }
    if (!form.email) { setError(ar ? 'اكتب الإيميل' : 'Enter your email'); return; }
    if (form.password.length < 8) { setError(ar ? 'الباسورد لازم 8 حروف على الأقل' : 'Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError(ar ? 'الباسوردين مش متطابقين' : "Passwords don't match"); return; }

    setError('');
    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.toLowerCase(), form.password);
      if (user.needsEmailConfirmation) {
        toast.success(ar ? 'تم إنشاء الحساب! تحقق من إيميلك عشان تفعّله، بعد كده سجّل دخول.' : 'Account created! Check your email to confirm it, then sign in.');
        router.push('/login');
        return;
      }
      toast.success(ar ? `أهلاً بيك في GYMZ، ${user.name}! 💪` : `Welcome to GYMZ, ${user.name}! 💪`);
      router.push('/onboarding');
    } catch (err) {
      setError(err.message || (ar ? 'مشكلة في التسجيل — جرّب تاني' : 'Registration failed — please try again'));
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
      eyebrow={ar ? 'حساب جديد' : 'NEW ACCOUNT'}
      title={ar ? 'انضم لـ GYMZ' : 'JOIN GYMZ'}
      subtitle={ar ? 'اعمل حسابك وابدأ رحلتك التدريبية النهارده.' : 'Create your account and start training today.'}
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Name */}
        <div>
          <label className="label" htmlFor="register-name">{ar ? 'الاسم' : 'NAME'}</label>
          <input
            className="input"
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={ar ? 'اسمك الكامل' : 'Your full name'}
            {...field('name')}
          />
        </div>

        {/* Email */}
        <div>
          <label className="label" htmlFor="register-email">{ar ? 'الإيميل' : 'EMAIL'}</label>
          <input
            className="input"
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="your@email.com"
            {...field('email')}
          />
        </div>

        {/* Password */}
        <div>
          <label className="label" htmlFor="register-password">{ar ? 'الباسورد' : 'PASSWORD'}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              id="register-password"
              name="password"
              style={{ paddingInlineEnd: 48 }}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={ar ? '8 حروف على الأقل' : 'At least 8 characters'}
              {...field('password')}
            />
            <button type="button" aria-label={showPass ? (ar ? 'إخفاء الباسورد' : 'Hide password') : (ar ? 'إظهار الباسورد' : 'Show password')} onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength */}
          {form.password.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }} aria-hidden="true">
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
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: strengthColor,
              }}>
                <span className="sr-only">{ar ? 'قوة الباسورد: ' : 'Password strength: '}</span>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label" htmlFor="register-confirm">{ar ? 'تأكيد الباسورد' : 'CONFIRM PASSWORD'}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              id="register-confirm"
              name="confirm"
              style={{
                paddingInlineEnd: 48,
                borderColor: form.confirm && form.password !== form.confirm
                  ? 'rgba(248,113,113,0.5)'
                  : form.confirm && form.password === form.confirm
                    ? 'rgba(74,222,128,0.5)'
                    : undefined,
              }}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={ar ? 'اكتب الباسورد تاني' : 'Re-enter your password'}
              {...field('confirm')}
            />
            {form.confirm && form.password === form.confirm && (
              <div style={{ position: 'absolute', insetInlineEnd: 14, top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }} aria-hidden="true">
                <Check size={16} />
              </div>
            )}
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

        {/* Submit */}
        <motion.button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
        >
          {loading
            ? (ar ? 'جاري إنشاء الحساب...' : 'Creating account...')
            : <>{ar ? 'ابدأ دلوقتي' : 'GET STARTED'} <ArrowRight size={16} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', color: 'var(--ash)', fontSize: '0.875rem' }}>
          {ar ? 'عندك حساب؟' : 'Already have an account?'}{' '}
          <Link href="/login" style={{ color: 'var(--volt)', textDecoration: 'none', fontWeight: 600 }}>
            {ar ? 'سجل دخول' : 'Sign in'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
