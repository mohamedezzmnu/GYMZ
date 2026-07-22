import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X, Crown, Play } from 'lucide-react';
import Head from 'next/head';

const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Glutes','Abs','Calves','Forearms'];
const EQUIPMENT_TYPES = ['Barbell','Dumbbells','Cable Machine','Bodyweight','Machine'];

const DIFF_COLOR = {
  beginner:     { bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.3)',  text:'#4ade80',  label:'مبتدئ' },
  intermediate: { bg:'rgba(250,204,21,0.12)',  border:'rgba(250,204,21,0.3)',  text:'#facc15',  label:'متوسط' },
  advanced:     { bg:'rgba(255,77,46,0.12)',   border:'rgba(255,77,46,0.3)',   text:'var(--accent)',  label:'متقدم' },
};

const MUSCLE_AR = {
  Chest:'الصدر', Back:'الظهر', Shoulders:'الأكتاف', Biceps:'البايسبس',
  Triceps:'التراسبس', Legs:'الأرجل', Glutes:'المؤخرة', Abs:'البطن',
  Calves:'السمانة', Forearms:'السواعد',
};

const EQUIP_AR = {
  'Barbell':'بار', 'Dumbbells':'دمبل', 'Cable Machine':'كيبل', 'Bodyweight':'بدون معدات', 'Machine':'ماكينة',
};

const EQUIP_ICON = {
  'Barbell':'🏋️','Dumbbells':'💪','Cable Machine':'🔗','Bodyweight':'🤸','Machine':'⚙️',
};

import { EXERCISES } from '../../data/exercises';

// ── Modal ─────────────────────────────────────────────────
function ExerciseModal({ exercise, onClose }) {
  const diff = DIFF_COLOR[exercise.difficulty] || DIFF_COLOR.beginner;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:999,
          background:'rgba(0,0,0,0.85)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={e => e.stopPropagation()}
          style={{
            width:'100%', maxWidth:560,
            background:'#0f0f1a',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:20, overflow:'hidden',
            maxHeight:'90vh', overflowY:'auto',
          }}
        >
          {/* صورة كبيرة */}
          <div style={{ position:'relative', height:260 }}>
            <img
              src={exercise.img}
              alt={exercise.name}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={e => { e.currentTarget.style.display='none'; }}
            />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, #0f0f1a 100%)' }} />
            {/* زرار إغلاق */}
            <button
              onClick={onClose}
              style={{
                position:'absolute', top:14, right:14,
                width:36, height:36, borderRadius:'50%',
                background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.15)',
                color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >
              <X size={16} />
            </button>
            {/* badge المستوى */}
            <span style={{
              position:'absolute', top:14, left:14,
              fontSize:'0.6rem', fontFamily:'var(--font-mono)',
              padding:'4px 10px', borderRadius:20,
              background:diff.bg, border:'1px solid '+diff.border, color:diff.text,
            }}>
              {diff.label}
            </span>
          </div>

          {/* محتوى */}
          <div style={{ padding:'24px 28px 32px' }}>
            {/* عضلة */}
            <div style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'var(--accent)', letterSpacing: '0.02em', marginBottom:8 }}>
              {MUSCLE_AR[exercise.muscle_group]} — {EQUIP_ICON[exercise.equipment]} {EQUIP_AR[exercise.equipment]}
            </div>

            {/* اسم */}
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', letterSpacing:'0.04em', color:'var(--chalk)', lineHeight:1.1, marginBottom:6 }}>
              {exercise.name}
            </div>
            <div style={{ fontSize:'1rem', color:'rgba(255,255,255,0.45)', marginBottom:24, direction:'rtl', fontFamily:'var(--font-body)' }}>
              {exercise.name_ar}
            </div>

            {/* خط فاصل */}
            <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:24 }} />

            {/* نصيحة */}
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'rgba(255,77,46,0.7)', letterSpacing: '0.02em', marginBottom:12 }}>
                💡 نصيحة الأداء
              </div>
              <div style={{
                fontSize:'0.92rem', color:'rgba(255,255,255,0.75)',
                lineHeight:1.85, direction:'rtl', fontFamily:'var(--font-body)',
                background:'rgba(255,77,46,0.05)',
                border:'1px solid rgba(255,77,46,0.12)',
                borderRadius:10, padding:'16px 18px',
              }}>
                {exercise.tips}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Exercise Card ─────────────────────────────────────────
function ExerciseCard({ exercise, index, onOpen }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const diff = DIFF_COLOR[exercise.difficulty] || DIFF_COLOR.beginner;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
    >
      <motion.div
        whileHover={{ borderColor: 'var(--glass-border-hover)' }}
        style={{
          position:'relative', overflow:'hidden',
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:16, transition:'all 300ms ease',
          height:'100%', display:'flex', flexDirection:'column',
        }}
      >
        {/* صورة */}
        <div style={{ position:'relative', height:180, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.03)' }}>
          <img
            src={exercise.img}
            alt={exercise.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 400ms ease' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            onError={e => { e.currentTarget.style.display='none'; }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(8,8,16,0.85) 100%)' }} />
          <span style={{ position:'absolute', top:12, right:12, fontSize:'0.6rem', fontFamily:'var(--font-mono)', padding:'3px 9px', borderRadius:20, background:diff.bg, border:'1px solid '+diff.border, color:diff.text, }}>
            {diff.label}
          </span>
          <span style={{ position:'absolute', bottom:10, left:12, fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:5 }}>
            {EQUIP_ICON[exercise.equipment]} {EQUIP_AR[exercise.equipment] || exercise.equipment}
          </span>
        </div>

        {/* محتوى الكارد */}
        <div style={{ padding:'18px 18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
          {/* عضلة */}
          <div style={{ marginBottom:8 }}>
            <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'rgba(255,77,46,0.8)', letterSpacing: '0.02em' }}>
              {MUSCLE_AR[exercise.muscle_group] || exercise.muscle_group}
            </span>
          </div>

          {/* اسم */}
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.04em', color:'var(--chalk)', lineHeight:1.2, marginBottom:4 }}>
            {exercise.name}
          </div>
          <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', marginBottom:12, direction:'rtl', fontFamily:'var(--font-body)' }}>
            {exercise.name_ar}
          </div>

          {/* شرح مختصر ظاهر على الكارد */}
          <div style={{
            fontSize:'0.76rem', color:'rgba(255,255,255,0.4)',
            lineHeight:1.6, direction:'rtl', fontFamily:'var(--font-body)',
            flex:1, marginBottom:16,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>
            {exercise.tips}
          </div>

          {/* زرار */}
          <motion.button
            whileHover={{ backgroundColor:'rgba(255,77,46,0.15)', borderColor:'rgba(255,77,46,0.5)' }}
            onClick={() => onOpen(exercise)}
            style={{ width:'100%', padding:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'var(--chalk)', fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing: '0.02em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 200ms' }}
          >
            عرض التفاصيل <ChevronRight size={13} color="var(--accent)" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function ExercisesPage() {
  const router = useRouter();
  const [search, setSearch]           = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty]   = useState('');
  const [equipment, setEquipment]     = useState('');
  const [selected, setSelected]       = useState(null);

  useEffect(() => {
    if (router.isReady && router.query.muscle_group) {
      setMuscleGroup(router.query.muscle_group);
    }
  }, [router.isReady, router.query.muscle_group]);

  // لو جاي من صفحة البرامج بلينك لتمرين معين، افتح المودال بتاعه على طول
  useEffect(() => {
    if (router.isReady && router.query.ex) {
      const exId = parseInt(router.query.ex, 10);
      const ex = EXERCISES.find(e => e.id === exId);
      if (ex) setSelected(ex);
    }
  }, [router.isReady, router.query.ex]);

  const filtered = EXERCISES.filter(ex => {
    const s = search.toLowerCase();
    return (
      (!search      || ex.name.toLowerCase().includes(s) || ex.name_ar.includes(search)) &&
      (!muscleGroup || ex.muscle_group === muscleGroup) &&
      (!difficulty  || ex.difficulty === difficulty) &&
      (!equipment   || ex.equipment === equipment)
    );
  });

  const hasFilters = search || muscleGroup || difficulty || equipment;

  return (
    <>
      <Head><title>التمارين — GYMZ</title></Head>

      {/* Modal */}
      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <section style={{ padding:'50px 0 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--ash)', marginBottom:12 }}>مكتبة التمارين</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,6vw,4.5rem)', letterSpacing:'0.03em', lineHeight:0.95, marginBottom:0 }}>
              كل<br /><span style={{ color:'var(--accent)' }}>التمارين</span>
            </h1>
          </motion.div>

          {/* بانر مكتبة التمارين المتحركة (بريميوم) */}
          <Link href="/exercises/videos" style={{ textDecoration: 'none' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ borderColor: 'rgba(250,204,21,0.4)' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 24, padding: '16px 20px', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 14, cursor: 'pointer', transition: 'all 250ms' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Play size={16} color="#facc15" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)', letterSpacing: '0.03em' }}>مكتبة التمارين المتحركة</span>
                    <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 20, background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.35)', color: '#facc15', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Crown size={9} /> PRO
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ash-light)' }}>شوف كل تمرين بشكل متحرك قبل ما تأديه</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--ash-light)" style={{ transform: 'rotate(180deg)' }} />
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding:'16px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:64, zIndex:50, background:'rgba(8,8,16,0.9)', }}>
        <div className="container">
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ position:'relative', flex:'1 1 200px' }}>
              <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)' }} />
              <input className="input" placeholder="ابحث عن تمرين..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38 }} />
            </div>
            <select className="input" value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} style={{ flex:'1 1 130px', cursor:'pointer' }}>
              <option value="">كل العضلات</option>
              {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{MUSCLE_AR[mg] || mg}</option>)}
            </select>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ flex:'1 1 120px', cursor:'pointer' }}>
              <option value="">كل المستويات</option>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
            <select className="input" value={equipment} onChange={e => setEquipment(e.target.value)} style={{ flex:'1 1 130px', cursor:'pointer' }}>
              <option value="">كل المعدات</option>
              {EQUIPMENT_TYPES.map(eq => <option key={eq} value={eq}>{EQUIP_AR[eq] || eq}</option>)}
            </select>
            {hasFilters && (
              <button className="btn btn-ghost" onClick={() => { setSearch(''); setMuscleGroup(''); setDifficulty(''); setEquipment(''); }} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem' }}>
                <X size={13} /> مسح
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding:'32px 0 80px' }}>
        <div className="container">
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.63rem', color:'rgba(255,255,255,0.3)', marginBottom:20, letterSpacing: '0.02em' }}>
            {filtered.length} تمرين
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {filtered.map((ex, i) => (
              <ExerciseCard key={ex.id} exercise={ex} index={i} onOpen={setSelected} />
            ))}
          </div>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'4rem', color:'rgba(255,77,46,0.15)', marginBottom:16 }}>X</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom:8 }}>مفيش نتائج</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>جرب فلتر تاني</div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
