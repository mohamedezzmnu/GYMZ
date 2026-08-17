import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
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

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error(ar ? 'اكتب اسمك' : 'Enter your name'); return; }
    if (!form.email) { toast.error(ar ? 'اكتب الإيميل' : 'Enter your email'); return; }
    if (form.password.length < 8) { toast.error(ar ? 'الباسورد لازم 8 حروف على الأقل' : 'Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { toast.error(ar ? 'الباسوردين مش متطابقين' : "Passwords don't match"); return; }

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
      toast.error(err.message || (ar ? 'مشكلة في التسجيل' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      ar={ar}
      eyebrow={ar ? 'حساب جديد' : 'NEW ACCOUNT'}
      title={ar ? 'انضم لـ GYMZ' : 'JOIN GYMZ'}
      subtitle={ar ? 'اعمل حسابك وابدأ رحلتك التدريبية النهارده.' : 'Create your account and start training today.'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Name */}
        <div>
          <label className="label">{ar ? 'الاسم' : 'NAME'}</label>
          <input
            className="input"
            type="text"
            placeholder={ar ? 'اسمك الكامل' : 'Your full name'}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">{ar ? 'الإيميل' : 'EMAIL'}</label>
          <input
            className="input"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div>
          <label className="label">{ar ? 'الباسورد' : 'PASSWORD'}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              style={{ paddingRight: 48 }}
              type={showPass ? 'text' : 'password'}
              placeholder={ar ? '8 حروف على الأقل' : 'At least 8 characters'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
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
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: strengthColor,
              }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label">{ar ? 'تأكيد الباسورد' : 'CONFIRM PASSWORD'}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              style={{
                paddingRight: 48,
                borderColor: form.confirm && form.password !== form.confirm
                  ? 'rgba(248,113,113,0.5)'
                  : form.confirm && form.password === form.confirm
                    ? 'rgba(74,222,128,0.5)'
                    : undefined,
              }}
              type={showPass ? 'text' : 'password'}
              placeholder={ar ? 'اكتب الباسورد تاني' : 'Re-enter your password'}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {form.confirm && form.password === form.confirm && (
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }}>
                <Check size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          className="btn btn-primary"
          onClick={handleSubmit}
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
      </div>
    </AuthLayout>
  );
}
