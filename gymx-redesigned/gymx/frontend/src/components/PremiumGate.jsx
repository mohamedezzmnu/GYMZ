// src/components/PremiumGate.jsx
// شاشة الاشتراك الموحّدة (التغذية + مكتبة التمارين).
// بتشرح طريقة الدفع، وبتبعت طلب اشتراك جوه الموقع، وبتستنى تفعيل الأدمن
// من غير ما المستخدم يعمل refresh.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Loader, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const CASH_NUMBER = '01097931713';
const WHATSAPP_NUMBER = '201097931713';
const PRICE = 99;

export default function PremiumGate({
  user,
  accent = '#facc15',
  title = 'للمشتركين فقط',
  description,
  product = 'videos',
}) {
  const { premium, refreshPremium } = useAuth();
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');

  // آخر طلب اشتراك لليوزر (لو الجدول لسه مش موجود منكسرش الصفحة)
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase
      .from('payment_requests')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error: err }) => {
        if (!active || err) return;
        setRequest((data && data[0]) || null);
      });
    return () => { active = false; };
  }, [user?.id]);

  // استنى التفعيل من غير refresh
  useEffect(() => {
    if (premium) return undefined;
    const tick = () => { refreshPremium?.(); };
    const timer = setInterval(tick, 25000);
    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [premium, refreshPremium]);

  const submit = async () => {
    if (!user?.id || sending) return;
    setSending(true);
    setError('');
    const { error: err } = await supabase.from('payment_requests').insert({
      user_id: user.id,
      email: (user.email || '').toLowerCase(),
      phone: phone.trim() || null,
      plan: 'all',
      amount: PRICE,
    });
    setSending(false);
    if (err) {
      setError('مقدرناش نبعت الطلب دلوقتي. حوّل المبلغ وابعت السكرين شوت على واتساب.');
      return;
    }
    setRequest({ status: 'pending', created_at: new Date().toISOString() });
  };

  const waText = encodeURIComponent(
    `عايز اشتراك ${product === 'nutrition' ? 'الأنظمة الغذائية' : 'مكتبة التمارين'} - إيميلي: ${user?.email || ''}`
  );
  const pending = request?.status === 'pending';
  const rejected = request?.status === 'rejected';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', direction: 'rtl' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 440, background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
          padding: '36px 28px', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${accent},transparent)` }} />
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(250,204,21,0.1)', border: `1px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Crown size={26} color={accent} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 8 }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 20 }}>
          {description || 'اشترك دلوقتي عن طريق فودافون كاش، والاشتراك بيفتح كل حاجة في الموقع.'}
        </p>

        {/* طريقة الدفع */}
        <div style={{ padding: 16, background: 'rgba(250,204,21,0.07)', border: `1px solid ${accent}33`, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 8 }}>
            ابعت على فودافون كاش
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--chalk)', letterSpacing: '0.06em', direction: 'ltr' }}>
              {CASH_NUMBER}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: accent, lineHeight: 1 }}>{PRICE}</div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>جنيه</div>
            </div>
          </div>
        </div>

        {pending ? (
          <div style={{ padding: 16, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: 6 }}>
              <CheckCircle2 size={16} /> طلبك وصل
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ash-light)', lineHeight: 1.7, margin: 0 }}>
              أول ما نتأكد من التحويل هيتفعّل حسابك، والصفحة هتتحدث لوحدها من غير ما تعمل refresh.
            </p>
          </div>
        ) : (
          <>
            <input
              type="tel"
              inputMode="tel"
              placeholder="رقم فودافون كاش اللي حوّلت منه (اختياري)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '11px 14px', marginBottom: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--chalk)',
                fontFamily: 'var(--font-mono)', fontSize: '0.82rem', outline: 'none', direction: 'rtl',
              }}
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              disabled={sending}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', marginBottom: 12, cursor: sending ? 'not-allowed' : 'pointer',
                background: 'rgba(250,204,21,0.14)', border: `1px solid ${accent}66`,
                borderRadius: 'var(--radius-sm)', color: accent,
                fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em',
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
              ابعت طلب الاشتراك
            </motion.button>
          </>
        )}

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: 'var(--radius-sm)', marginBottom: 12, textDecoration: 'none', color: '#25D166',
            fontFamily: 'var(--font-display)', fontSize: '0.95rem', letterSpacing: '0.04em',
          }}
        >
          <MessageCircle size={16} /> ابعت السكرين شوت على واتساب
        </a>

        {(error || rejected) && (
          <p style={{ fontSize: '0.72rem', color: rejected ? '#f87171' : '#facc15', textAlign: 'center', lineHeight: 1.6, marginBottom: 8 }}>
            {error || 'الطلب اتقفل. كلّمنا على واتساب لو حوّلت المبلغ.'}
          </p>
        )}

        <p style={{ fontSize: '0.72rem', color: 'var(--ash)', textAlign: 'center', lineHeight: 1.6 }}>
          الاشتراك بيتفتح على إيميلك
          <br />
          <span style={{ color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{user?.email}</span>
        </p>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
