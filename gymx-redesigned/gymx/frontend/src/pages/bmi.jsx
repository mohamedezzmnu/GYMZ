import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >{children}</motion.div>
  );
}

const CATEGORIES = [
  { max: 18.5, label: 'ناقص وزن',   color: '#60a5fa', program: 'كامل الجسم',      tip: 'ركز على تمارين المقاومة وزود السعرات الحرارية عشان تبني عضل.' },
  { max: 25,   label: 'وزن تمام',   color: '#4ade80', program: 'أعلى وأسفل',      tip: 'أنت في المنطقة المثالية! حافظ على مستواك وكمّل.' },
  { max: 30,   label: 'زيادة وزن',  color: '#facc15', program: 'دفع وسحب وأرجل', tip: 'اجمع بين الكارديو والمقاومة عشان توصل للوزن المثالي.' },
  { max: 999,  label: 'سمنة',       color: '#f87171', program: 'كامل الجسم',      tip: 'ابدأ بخطوات صغيرة — الاستمرارية أهم من الشدة.' },
];

export default function BMIPage() {
  const [form, setForm] = useState({ weight: '', height: '', gender: 'male' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height) / 100;
    if (!w || !h || w <= 0 || h <= 0) return;
    const bmi = w / (h * h);
    const cat = CATEGORIES.find(c => bmi < c.max);
    setResult({ bmi: bmi.toFixed(1), ...cat });
  };

  const reset = () => { setForm({ weight: '', height: '', gender: 'male' }); setResult(null); };

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '13px 16px', color: 'var(--chalk)',
    fontFamily: 'sans-serif', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
    color: 'var(--ash-light)', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 8,
  };

  return (
    <>
      <Head><title>حاسبة الـ BMI — GYMZ</title></Head>
      <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 60, position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 40% at 30% 30%, rgba(61,127,255,0.08) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

          <Reveal>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--volt)', letterSpacing: '0.15em', marginBottom: 12 }}>— BMI CALCULATOR</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.05em', marginBottom: 12 }}>
                احسب الـ <span style={{ color: 'var(--volt)' }}>BMI</span> بتاعك
              </h1>
              <p style={{ color: 'var(--ash-light)', fontSize: '0.9rem', lineHeight: 1.7, direction: 'rtl', fontFamily: 'sans-serif' }}>
                اعرف وزنك المثالي وإيه البرنامج الأنسب ليك دلوقتي.
              </p>
            </div>
          </Reveal>

          {!result ? (
            <Reveal delay={0.1}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
                padding: '32px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--volt), var(--fire), transparent)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* الوزن */}
                  <div>
                    <label style={lbl}>الوزن (كيلو)</label>
                    <input style={inp} type="number" placeholder="مثال: 75"
                      value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = 'rgba(61,127,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(61,127,255,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* الطول */}
                  <div>
                    <label style={lbl}>الطول (سم)</label>
                    <input style={inp} type="number" placeholder="مثال: 175"
                      value={form.height} onChange={e => setForm({ ...form, height: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = 'rgba(61,127,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(61,127,255,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* الجنس */}
                  <div>
                    <label style={lbl}>الجنس</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[{ val: 'male', label: 'ذكر' }, { val: 'female', label: 'أنثى' }].map(g => (
                        <button key={g.val} onClick={() => setForm({ ...form, gender: g.val })} style={{
                          flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                          fontFamily: 'sans-serif', fontSize: '0.9rem',
                          background: form.gender === g.val ? 'rgba(61,127,255,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${form.gender === g.val ? 'rgba(61,127,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: form.gender === g.val ? 'var(--volt)' : 'var(--ash-light)',
                          transition: 'all 200ms',
                        }}>{g.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* زرار الحساب */}
                  <motion.button
                    onClick={calculate}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '14px', marginTop: 8,
                      background: 'linear-gradient(135deg, var(--volt), rgba(61,127,255,0.8))',
                      border: 'none', borderRadius: 10,
                      color: '#fff', fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem', letterSpacing: '0.1em', cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(61,127,255,0.35)',
                    }}
                  >
                    احسب دلوقتي
                  </motion.button>
                </div>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={0.1}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                border: `1px solid ${result.color}44`, borderRadius: 20,
                padding: '36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${result.color}, transparent)` }} />

                {/* الـ BMI */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash-light)', letterSpacing: '0.1em', marginBottom: 8 }}>BMI بتاعك</p>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: result.color, lineHeight: 1, marginBottom: 8 }}
                  >
                    {result.bmi}
                  </motion.div>
                  <div style={{
                    display: 'inline-block', padding: '6px 18px', borderRadius: 20,
                    background: result.color + '18', border: `1px solid ${result.color}44`,
                    color: result.color, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em',
                  }}>
                    {result.label}
                  </div>
                </div>

                {/* النصيحة */}
                <div style={{
                  padding: '16px 20px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: 24, direction: 'rtl',
                }}>
                  <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', color: 'var(--ash-light)', lineHeight: 1.7, margin: 0 }}>
                    💡 {result.tip}
                  </p>
                </div>

                {/* البرنامج المقترح */}
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em', marginBottom: 10 }}>البرنامج المقترح ليك</p>
                  <Link href="/programs" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px',
                    background: result.color + '15',
                    border: `1px solid ${result.color}33`,
                    borderRadius: 10, textDecoration: 'none',
                    color: result.color, fontFamily: 'var(--font-display)',
                    fontSize: '1rem', letterSpacing: '0.08em',
                    transition: 'all 200ms',
                  }}>
                    {result.program} ←
                  </Link>
                </div>

                {/* Scale */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    {['ناقص', 'تمام', 'زيادة', 'سمنة'].map((l, i) => (
                      <span key={i} style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: CATEGORIES[i].color }}>{l}</span>
                    ))}
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #60a5fa, #4ade80, #facc15, #f87171)', position: 'relative' }}>
                    <motion.div
                      initial={{ left: '0%' }}
                      animate={{ left: `${Math.min(Math.max((parseFloat(result.bmi) - 10) / 30 * 100, 0), 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                        width: 14, height: 14, borderRadius: '50%',
                        background: '#fff', border: `3px solid ${result.color}`,
                        boxShadow: `0 0 10px ${result.color}`,
                      }}
                    />
                  </div>
                </div>

                {/* Reset */}
                <motion.button
                  onClick={reset}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '11px 28px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: 'var(--ash-light)',
                    fontFamily: 'sans-serif', fontSize: '0.9rem', cursor: 'pointer',
                  }}
                >
                  ↩ احسب تاني
                </motion.button>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </>
  );
}
