import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Zap, Target, Scale, Activity } from 'lucide-react';
import Head from 'next/head';

// ── TDEE Calculator ────────────────────────────────────────
function TDEECalc() {
  const [form, setForm] = useState({ age:'', weight:'', height:'', gender:'male', activity:'1.55' });
  const [result, setResult] = useState(null);

  const activityLevels = [
    { value:'1.2',  label:'🛋️ خامل تماماً (بدون رياضة)' },
    { value:'1.375',label:'🚶 خفيف (1-3 أيام/أسبوع)' },
    { value:'1.55', label:'🏋️ معتدل (3-5 أيام/أسبوع)' },
    { value:'1.725',label:'🔥 نشيط (6-7 أيام/أسبوع)' },
    { value:'1.9',  label:'⚡ نشيط جداً (وظيفة جسدية)' },
  ];

  const calculate = () => {
    const { age, weight, height, gender, activity } = form;
    if (!age || !weight || !height) return;
    // Mifflin-St Jeor
    let bmr = gender === 'male'
      ? 10 * +weight + 6.25 * +height - 5 * +age + 5
      : 10 * +weight + 6.25 * +height - 5 * +age - 161;
    const tdee = Math.round(bmr * +activity);
    setResult({ maintenance: tdee, cut: Math.round(tdee * 0.8), bulk: Math.round(tdee * 1.1) });
  };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        {[
          { key:'age',    label:'العمر', ph:'25', type:'number' },
          { key:'weight', label:'الوزن (kg)', ph:'80', type:'number' },
          { key:'height', label:'الطول (cm)', ph:'175', type:'number' },
        ].map(({ key, label, ph, type }) => (
          <div key={key} style={key === 'height' ? { gridColumn:'1/-1' } : {}}>
            <label style={labelStyle}>{label}</label>
            <input type={type} placeholder={ph} value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom:10 }}>
        <label style={labelStyle}>الجنس</label>
        <div style={{ display:'flex', gap:8 }}>
          {[{ v:'male', l:'ذكر 👨' },{ v:'female', l:'أنثى 👩' }].map(({ v, l }) => (
            <motion.button key={v} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => setForm({ ...form, gender: v })}
              style={{ ...toggleStyle, ...(form.gender === v ? toggleActive : {}) }}>{l}</motion.button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>مستوى النشاط</label>
        <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} style={inputStyle}>
          {activityLevels.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>

      <motion.button onClick={calculate} whileTap={{ scale:0.97 }} style={calcBtn}>
        احسب TDEE
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              { label:'المحافظة', value: result.maintenance, color:'var(--accent)', icon:'⚖️' },
              { label:'التنشيف', value: result.cut,          color:'#f87171',       icon:'🔥' },
              { label:'التضخيم', value: result.bulk,         color:'#4ade80',       icon:'💪' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ padding:'14px', background:`${color}0f`, border:`1px solid ${color}25`, borderRadius:'var(--radius-sm)', textAlign:'center' }}>
                <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{icon}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color }}>{value}</div>
                <div style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', marginTop:2 }}>سعرة/يوم</div>
                <div style={{ fontSize:'0.7rem', color:'var(--ash-light)', marginTop:4 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 1RM Calculator ─────────────────────────────────────────
function OneRMCalc() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!weight || !reps) return;
    const w = +weight, r = +reps;
    // Epley formula
    const orm = r === 1 ? w : Math.round(w * (1 + r / 30));
    setResult({
      max: orm,
      p90: Math.round(orm * 0.9),
      p80: Math.round(orm * 0.8),
      p70: Math.round(orm * 0.7),
      p60: Math.round(orm * 0.6),
    });
  };

  return (
    <div>
      <p style={{ fontSize:'0.8rem', color:'var(--ash-light)', marginBottom:14, direction:'rtl', lineHeight:1.6 }}>
        اكتب الوزن اللي رفعته وعدد التكرارات، وهنحسبلك أقصى وزن تقدر ترفعه لتكرار واحد.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <div>
          <label style={labelStyle}>الوزن (kg)</label>
          <input type="number" placeholder="100" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>التكرارات</label>
          <input type="number" placeholder="8" value={reps} onChange={e => setReps(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <motion.button onClick={calculate} whileTap={{ scale:0.97 }} style={calcBtn}>
        احسب الـ 1RM
      </motion.button>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ marginTop:16 }}>
            <div style={{ textAlign:'center', padding:'16px', background:'rgba(255,77,46,0.08)', border:'1px solid rgba(255,77,46,0.25)', borderRadius:'var(--radius-sm)', marginBottom:12 }}>
              <div style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', marginBottom:4 }}>أقصى وزن (1RM)</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', color:'var(--accent)' }}>{result.max} <span style={{ fontSize:'1rem' }}>kg</span></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {[
                { pct:'90%', v:result.p90, reps:'3-5 تكرارات' },
                { pct:'80%', v:result.p80, reps:'8-10 تكرارات' },
                { pct:'70%', v:result.p70, reps:'12-15 تكرارات' },
                { pct:'60%', v:result.p60, reps:'15-20 تكرارات' },
              ].map(({ pct, v, reps: r }) => (
                <div key={pct} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-sm)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--chalk)' }}>{v} kg</div>
                    <div style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--ash)', marginTop:2 }}>{r}</div>
                  </div>
                  <span style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--accent)', padding:'3px 7px', borderRadius:4, background:'rgba(255,77,46,0.1)', border:'1px solid rgba(255,77,46,0.2)' }}>{pct}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Macro Calculator ───────────────────────────────────────
function MacroCalc() {
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState(null);

  const goals = [
    { v:'cut',      l:'تنشيف 🔥', protein:0.40, carbs:0.30, fat:0.30 },
    { v:'maintain', l:'محافظة ⚖️', protein:0.30, carbs:0.40, fat:0.30 },
    { v:'bulk',     l:'تضخيم 💪',  protein:0.30, carbs:0.45, fat:0.25 },
  ];

  const calculate = () => {
    if (!calories) return;
    const cal = +calories;
    const g = goals.find(x => x.v === goal);
    setResult({
      protein: Math.round((cal * g.protein) / 4),
      carbs:   Math.round((cal * g.carbs)   / 4),
      fat:     Math.round((cal * g.fat)     / 9),
      pPct: Math.round(g.protein * 100),
      cPct: Math.round(g.carbs   * 100),
      fPct: Math.round(g.fat     * 100),
    });
  };

  return (
    <div>
      <div style={{ marginBottom:12 }}>
        <label style={labelStyle}>السعرات اليومية</label>
        <input type="number" placeholder="2500" value={calories} onChange={e => setCalories(e.target.value)} style={inputStyle} />
        <p style={{ fontSize:'0.7rem', color:'var(--ash)', marginTop:4 }}>استخدم نتيجة الـ TDEE من فوق</p>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>الهدف</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {goals.map(({ v, l }) => (
            <motion.button key={v} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => setGoal(v)}
              style={{ ...toggleStyle, ...(goal === v ? toggleActive : {}), flex:'1 1 auto' }}>{l}</motion.button>
          ))}
        </div>
      </div>
      <motion.button onClick={calculate} whileTap={{ scale:0.97 }} style={calcBtn}>
        احسب الماكروز
      </motion.button>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ marginTop:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                { label:'بروتين',   value:result.protein, unit:'g', pct:result.pPct, color:'#f87171' },
                { label:'كارب',     value:result.carbs,   unit:'g', pct:result.cPct, color:'#facc15' },
                { label:'دهون',     value:result.fat,     unit:'g', pct:result.fPct, color:'#4ade80' },
              ].map(({ label, value, unit, pct, color }) => (
                <div key={label} style={{ padding:'14px', background:`${color}0f`, border:`1px solid ${color}22`, borderRadius:'var(--radius-sm)', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color }}>{value}<span style={{ fontSize:'0.8rem' }}>{unit}</span></div>
                  <div style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', marginTop:3 }}>{label}</div>
                  <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.07)', marginTop:8, overflow:'hidden' }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.6, delay:0.2 }}
                      style={{ height:'100%', borderRadius:2, background:color }} />
                  </div>
                  <div style={{ fontSize:'0.6rem', color, marginTop:3, fontFamily:'var(--font-mono)' }}>{pct}%</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-sm)', fontSize:'0.75rem', color:'var(--ash-light)', direction:'rtl', lineHeight:1.7 }}>
              💡 <strong style={{ color:'var(--chalk)' }}>نصيحة:</strong> اتأكد إن بروتينك على الأقل {Math.round((+calories * 0.25) / 4)}g يومياً للحفاظ على العضل.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── BMI Calculator ─────────────────────────────────────────
function BMICalc() {
  const [form, setForm] = useState({ weight: '', height: '' });
  const [result, setResult] = useState(null);

  const CATEGORIES = [
    { max: 18.5, label: 'ناقص وزن',  color: '#60a5fa', tip: 'ركز على تمارين المقاومة وزود السعرات عشان تبني عضل.' },
    { max: 25,   label: 'وزن تمام',  color: '#4ade80', tip: 'أنت في المنطقة المثالية! حافظ على مستواك وكمّل.' },
    { max: 30,   label: 'زيادة وزن', color: '#facc15', tip: 'اجمع بين الكارديو والمقاومة عشان توصل للوزن المثالي.' },
    { max: 999,  label: 'سمنة',      color: '#f87171', tip: 'ابدأ بخطوات صغيرة — الاستمرارية أهم من الشدة.' },
  ];

  const calculate = () => {
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height) / 100;
    if (!w || !h || w <= 0 || h <= 0) return;
    const bmi = w / (h * h);
    const cat = CATEGORIES.find(c => bmi < c.max);
    setResult({ bmi: bmi.toFixed(1), ...cat });
  };

  return (
    <div>
      <p style={{ fontSize:'0.8rem', color:'var(--ash-light)', marginBottom:14, direction:'rtl', lineHeight:1.6 }}>
        مؤشر كتلة الجسم — مقياس تقريبي سريع. للحصول على صورة أدق استخدم حاسبة الـ TDEE.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <div>
          <label style={labelStyle}>الوزن (kg)</label>
          <input type="number" placeholder="80" value={form.weight}
            onChange={e => setForm({ ...form, weight: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>الطول (cm)</label>
          <input type="number" placeholder="175" value={form.height}
            onChange={e => setForm({ ...form, height: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <motion.button onClick={calculate} whileTap={{ scale: 0.97 }} style={calcBtn}>
        احسب الـ BMI
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ marginTop:16 }}>
            <div style={{ textAlign:'center', padding:'20px', background:`${result.color}10`, border:`1px solid ${result.color}30`, borderRadius:'var(--radius-sm)', marginBottom:12 }}>
              <div style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', marginBottom:4 }}>مؤشر كتلة الجسم</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'3rem', color: result.color, lineHeight:1 }}>{result.bmi}</div>
              <div style={{ fontSize:'0.9rem', color: result.color, marginTop:6, fontWeight:600 }}>{result.label}</div>
            </div>
            {/* scale bar */}
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', height:6, borderRadius:3, overflow:'hidden', gap:2 }}>
                {[{ color:'#60a5fa', w:25 },{ color:'#4ade80', w:25 },{ color:'#facc15', w:25 },{ color:'#f87171', w:25 }].map((s, i) => (
                  <div key={i} style={{ flex:s.w, background:s.color, opacity:0.5 }} />
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--ash)', marginTop:4 }}>
                <span>{'< 18.5'}</span><span>18.5</span><span>25</span><span>30+</span>
              </div>
            </div>
            <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-sm)', fontSize:'0.78rem', color:'var(--ash-light)', direction:'rtl', lineHeight:1.7 }}>
              💡 {result.tip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── shared styles ──────────────────────────────────────────
const labelStyle = { display:'block', fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', letterSpacing: '0.02em', marginBottom:6 };
const inputStyle = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--radius-sm)', padding:'10px 12px', color:'var(--chalk)', fontFamily:'var(--font-body)', fontSize:'0.875rem', outline:'none', direction:'rtl' };
const calcBtn = { width:'100%', padding:'13px', background:'var(--accent)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontFamily:'var(--font-body)', fontWeight: 600, fontSize:'0.92rem', cursor:'pointer' };
const toggleStyle = { padding:'9px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--radius-sm)', color:'var(--ash-light)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', transition:'border-color 120ms, background 120ms' };
const toggleActive = { background:'var(--accent-dim)', border:'1px solid rgba(255,77,46,0.35)', color:'var(--chalk)' };

// ── TABS ──────────────────────────────────────────────────
const TABS = [
  { id:'tdee',  label:'TDEE',  icon:Zap,        desc:'احتياج السعرات',          component: TDEECalc },
  { id:'1rm',   label:'1RM',   icon:Scale,       desc:'أقصى وزن للتكرار',        component: OneRMCalc },
  { id:'macro', label:'Macro', icon:Target,      desc:'البروتين والكارب والدهون', component: MacroCalc },
  { id:'bmi',   label:'BMI',   icon:Activity,    desc:'مؤشر كتلة الجسم',         component: BMICalc },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('tdee');
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <>
      <Head><title>Tools — GYMZ</title></Head>
      <div style={{ minHeight:'100vh', paddingTop:88, paddingBottom:60, position:'relative' }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0 20px', position:'relative', zIndex:1 }}>

          {/* header */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} style={{ marginBottom:32 }}>
            <div className="mono" style={{ color:'var(--ash)', marginBottom:8 }}>Fitness tools</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight: 600, fontSize:'clamp(2rem,4.5vw,3rem)', letterSpacing:'-0.03em', lineHeight:1.05 }}>
              الحاسبات <span style={{ color:'var(--accent)' }}>الرياضية</span>
            </h1>
            <p style={{ color:'var(--ash-light)', marginTop:12, fontSize:'0.9rem', direction:'rtl' }}>
              احسب سعراتك، أقصى وزن، وماكروزك — كل حاجة في مكان واحد.
            </p>
          </motion.div>

          {/* tabs */}
          <div style={{ display:'flex', gap:6, marginBottom:24, background:'var(--carbon)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius-md)', padding:6 }}>
            {TABS.map(({ id, label, icon: Icon, desc }) => (
              <motion.button key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => setActiveTab(id)} style={{ flex:1, padding:'10px 8px', background: activeTab === id ? 'var(--iron)' : 'transparent', border: 'none', borderRadius:'var(--radius-sm)', cursor:'pointer', transition:'background 120ms', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <Icon size={16} color={activeTab === id ? 'var(--accent)' : 'var(--ash)'} />
                <span style={{ fontFamily:'var(--font-body)', fontWeight: 600, fontSize:'0.85rem', color: activeTab === id ? 'var(--chalk)' : 'var(--ash)' }}>{label}</span>
                <span style={{ fontSize:'0.55rem', fontFamily:'var(--font-mono)', color:'var(--ash)', display:'none' }} className="tab-desc">{desc}</span>
              </motion.button>
            ))}
          </div>

          {/* active calc */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.18 }}
              style={{ background:'var(--carbon)', border:'1px solid var(--glass-border)', borderRadius:'var(--radius-lg)', padding:'28px', position:'relative', overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
                {(() => { const t = TABS.find(x => x.id === activeTab); const Icon = t.icon; return <Icon size={18} color="var(--accent)" />; })()}
                <div>
                  <h2 style={{ fontFamily:'var(--font-display)', fontWeight: 600, fontSize:'1.2rem', letterSpacing:'-0.015em' }}>
                    {TABS.find(t => t.id === activeTab)?.label} Calculator
                  </h2>
                  <p style={{ fontSize:'0.75rem', fontFamily:'var(--font-mono)', color:'var(--ash-light)', marginTop:1 }}>
                    {TABS.find(t => t.id === activeTab)?.desc}
                  </p>
                </div>
              </div>
              {ActiveComponent && <ActiveComponent />}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}
