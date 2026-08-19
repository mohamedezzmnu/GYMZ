import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X, Crown, Play, SlidersHorizontal, ChevronDown, ChevronUp, Check, Dumbbell, Cable, PersonStanding, Settings, Gauge, TrendingUp, Rocket } from 'lucide-react';
import Head from 'next/head';
import { EXERCISES, BASE_URL } from '../../data/exercises';
import { normalizeArabic } from '../../utils/arabic';

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
  'Barbell':'بار', 'Dumbbells':'دمبل', 'Cable Machine':'كيبل', 'Bodyweight':'بدون معدات', 'Machine':'ماشين',
};

const EQUIP_ICON = {
  'Barbell':'🏋️','Dumbbells':'💪','Cable Machine':'🔗','Bodyweight':'🤸','Machine':'⚙️',
};

// ── أيقونات كروت الفلتر — رسمة عضلة مبسّطة لكل مجموعة (سيلويت خط واحد) ─
function MuscleIconBase({ children, size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
function ChestIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M12 4c-2.2 0-3.6 1-4.2 2.2C7 8 6 9 5 9.6c-.9.5-1.5 1.6-1.5 3 0 2.4 1.8 4 3.8 4 1.4 0 2.3-.7 2.7-1.6" />
      <path d="M12 4c2.2 0 3.6 1 4.2 2.2C17 8 18 9 19 9.6c.9.5 1.5 1.6 1.5 3 0 2.4-1.8 4-3.8 4-1.4 0-2.3-.7-2.7-1.6" />
      <path d="M12 4v6.4M9.5 10.5c0 1.3 1.1 2.3 2.5 2.3s2.5-1 2.5-2.3" />
    </MuscleIconBase>
  );
}
function BackIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M12 3c-1 0-1.8.7-1.8 1.8 0 .8-.3 1.4-1 1.9-2 1.5-3.7 3.5-3.7 6.6 0 3 1.6 5.2 3.6 6.4M12 3c1 0 1.8.7 1.8 1.8 0 .8.3 1.4 1 1.9 2 1.5 3.7 3.5 3.7 6.6 0 3-1.6 5.2-3.6 6.4" />
      <path d="M12 3v6M9 9h6M8.5 13.5h7M9 17.5h6" />
    </MuscleIconBase>
  );
}
function ShoulderIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M4 15c0-4 2.5-7 5.5-8 .6-.2 1-.7 1-1.4C10.5 4.7 11.2 4 12 4s1.5.7 1.5 1.6c0 .7.4 1.2 1 1.4 3 1 5.5 4 5.5 8" />
      <path d="M4 15c0 2.5 1.6 4.3 3.6 4.3S11 17.5 11 15M13 15c0 2.5 1.6 4.3 3.6 4.3S20 17.5 20 15" />
    </MuscleIconBase>
  );
}
function BicepIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M7 20c-1.2-2-1.8-4.3-1.8-7 0-3 1-5.6 2.7-7.2" />
      <path d="M7.9 5.8c1-.9 2.3-1.4 3.8-1.4 3.6 0 6.3 2.8 6.3 6.5 0 1.7-.5 3-1.5 4" />
      <path d="M10 9.2c.5 1.3 1.7 2.2 3.1 2.2s2.6-.9 3.1-2.2M12 11.4c-.4 2-.2 4 .6 6" />
    </MuscleIconBase>
  );
}
function TricepIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M9 4c3.6 0 6 2.6 6 6.2 0 1.9-.7 3.3-1.8 4.4" />
      <path d="M13.2 14.6c1 1.7 1.5 3.6 1.4 5.6" />
      <path d="M9 4c-2 0-3.6.9-4.5 2.3M8.6 8.4c-.3 1.2-.1 2.3.5 3.2" />
    </MuscleIconBase>
  );
}
function LegIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M9.5 3h5l.4 6.5c.15 2.3.6 4.5 1.4 6.6l1.1 3.4" />
      <path d="M9.5 3l-.4 6.5c-.15 2.3-.6 4.5-1.4 6.6L6.6 19.5" />
      <path d="M9.3 9.5h5.4M8.9 14.5h6.3" />
    </MuscleIconBase>
  );
}
function GluteIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M12 4c-3 0-5 2-5 5 0 2 1 3.3 1 5 0 2.4-1 4-2 6M12 4c3 0 5 2 5 5 0 2-1 3.3-1 5 0 2.4 1 4 2 6" />
      <path d="M7 10.5h10" />
    </MuscleIconBase>
  );
}
function AbsIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M8 4h8l.6 8c.3 3.4-1.4 7-4.6 8-3.2-1-4.9-4.6-4.6-8L8 4Z" />
      <path d="M8.4 9h7.2M8.7 13h6.6" />
      <path d="M12 4v16" />
    </MuscleIconBase>
  );
}
function CalfIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M10 3c-.5 3-.5 5.6.3 7.8.9 2.5 1 5 .3 7.2M14 3c.7 3 .9 5.7.2 8-.7 2.2-.9 4.6-.2 7" />
      <path d="M9 20h6" />
    </MuscleIconBase>
  );
}
function ForearmIcon(props) {
  return (
    <MuscleIconBase {...props}>
      <path d="M9 4c-.6 2.6-.6 5 .4 7.2 1 2.2 1 4.5 0 6.8M15 4c.6 2.6.6 5-.4 7.2-1 2.2-1 4.5 0 6.8" />
      <path d="M9.3 10.5h5.4" />
    </MuscleIconBase>
  );
}

const MUSCLE_ICON = {
  Chest: ChestIcon, Back: BackIcon, Shoulders: ShoulderIcon, Biceps: BicepIcon,
  Triceps: TricepIcon, Legs: LegIcon, Glutes: GluteIcon, Abs: AbsIcon,
  Calves: CalfIcon, Forearms: ForearmIcon,
};
const EQUIP_ICON_SVG = {
  Barbell: Dumbbell, Dumbbells: Dumbbell, 'Cable Machine': Cable, Bodyweight: PersonStanding, Machine: Settings,
};
const DIFFICULTY_ICON = { beginner: Gauge, intermediate: TrendingUp, advanced: Rocket };



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
            borderRadius:10, overflow:'hidden',
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
              padding:'4px 10px', borderRadius:10,
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
          borderRadius:12, transition:'all 300ms ease',
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
          <span style={{ position:'absolute', top:12, right:12, fontSize:'0.6rem', fontFamily:'var(--font-mono)', padding:'3px 9px', borderRadius:10, background:diff.bg, border:'1px solid '+diff.border, color:diff.text, }}>
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

// ── قسم واحد جوه درج الفلاتر (أكورديون بيفتح ويقفل) ─────────
function FilterSection({ title, isOpen, onToggle, children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)', letterSpacing: '0.02em' }}>{title}</span>
        {isOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.5)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.5)" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 14px 16px' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── كارت أيقونة داخل الفلتر ──────────────────────────────────
function FilterIconCard({ Icon, label, selected, onClick }) {
  return (
    <motion.button
      layout
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.9 }}
      animate={selected ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        padding: '12px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'right',
        background: selected ? 'rgba(255,77,46,0.08)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(255,77,46,0.55)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? '0 0 0 1px rgba(255,77,46,0.15), 0 0 16px rgba(255,77,46,0.15)' : 'none',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: selected ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.15)', position: 'absolute', top: 10, left: 10,
      }}>
        {selected && <Check size={13} color="var(--accent)" />}
      </span>
      <Icon size={22} color={selected ? 'var(--accent)' : 'rgba(255,255,255,0.6)'} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--chalk)' }}>{label}</div>
    </motion.button>
  );
}

// ── درج الفلاتر بالكامل ──────────────────────────────────────
function FiltersDrawer({ open, onClose, muscleGroup, equipment, difficulty, onApply }) {
  const [openSection, setOpenSection] = useState('muscle');
  const [draftMuscle, setDraftMuscle] = useState(muscleGroup);
  const [draftEquipment, setDraftEquipment] = useState(equipment);
  const [draftDifficulty, setDraftDifficulty] = useState(difficulty);

  useEffect(() => {
    if (open) {
      setDraftMuscle(muscleGroup);
      setDraftEquipment(equipment);
      setDraftDifficulty(difficulty);
      setOpenSection('muscle');
    }
  }, [open, muscleGroup, equipment, difficulty]);

  if (!open) return null;

  const toggleSection = (key) => setOpenSection(prev => (prev === key ? '' : key));
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px 20px 0 0', direction: 'rtl', padding: '20px 18px 96px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.03em', color: 'var(--chalk)' }}>الفلاتر</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--chalk)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FilterSection title="العضلات" isOpen={openSection === 'muscle'} onToggle={() => toggleSection('muscle')}>
              <div style={grid}>
                {MUSCLE_GROUPS.map(mg => {
                  const Icon = MUSCLE_ICON[mg] || AbsIcon;
                  return (
                    <FilterIconCard
                      key={mg} Icon={Icon} label={MUSCLE_AR[mg] || mg}
                      selected={draftMuscle === mg}
                      onClick={() => setDraftMuscle(prev => (prev === mg ? '' : mg))}
                    />
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="المعدات" isOpen={openSection === 'equipment'} onToggle={() => toggleSection('equipment')}>
              <div style={grid}>
                {EQUIPMENT_TYPES.map(eq => {
                  const Icon = EQUIP_ICON_SVG[eq] || Dumbbell;
                  return (
                    <FilterIconCard
                      key={eq} Icon={Icon} label={EQUIP_AR[eq] || eq}
                      selected={draftEquipment === eq}
                      onClick={() => setDraftEquipment(prev => (prev === eq ? '' : eq))}
                    />
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="المستوى" isOpen={openSection === 'difficulty'} onToggle={() => toggleSection('difficulty')}>
              <div style={grid}>
                {['beginner', 'intermediate', 'advanced'].map(d => {
                  const Icon = DIFFICULTY_ICON[d] || Gauge;
                  return (
                    <FilterIconCard
                      key={d} Icon={Icon} label={DIFF_COLOR[d].label}
                      selected={draftDifficulty === d}
                      onClick={() => setDraftDifficulty(prev => (prev === d ? '' : d))}
                    />
                  );
                })}
              </div>
            </FilterSection>
          </div>

          <div style={{ position: 'sticky', bottom: 0, marginTop: 20, display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
              onClick={() => { setDraftMuscle(''); setDraftEquipment(''); setDraftDifficulty(''); }}
              style={{ padding: '13px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              مسح الكل
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
              onClick={() => onApply({ muscleGroup: draftMuscle, equipment: draftEquipment, difficulty: draftDifficulty })}
              style={{ flex: 1, padding: '13px 18px', borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.95rem', letterSpacing: '0.03em', cursor: 'pointer' }}
            >
              تطبيق الفلاتر
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [muscleGroup, equipment, difficulty].filter(Boolean).length;

  useEffect(() => {
    if (router.isReady && router.query.muscle_group) {
      setMuscleGroup(router.query.muscle_group);
    }
  }, [router.isReady, router.query.muscle_group]);

  const filtered = EXERCISES.filter(ex => {
    const nq = normalizeArabic(search);
    return (
      (!search      || ex.name.toLowerCase().includes(search.toLowerCase()) || normalizeArabic(ex.name_ar).includes(nq)) &&
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
                    <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 10, background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.35)', color: '#facc15', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Crown size={9} /> مميز
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
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }}
              onClick={() => setFiltersOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: activeFilterCount ? 'rgba(255,77,46,0.1)' : 'rgba(255,255,255,0.04)', border: activeFilterCount ? '1px solid rgba(255,77,46,0.35)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: activeFilterCount ? 'var(--accent)' : 'var(--chalk)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={13} /> الفلاتر
              {activeFilterCount > 0 && (
                <motion.span
                  key={activeFilterCount}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ minWidth: 16, height: 16, borderRadius: 8, background: 'var(--accent)', color: '#000', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}
                >
                  {activeFilterCount}
                </motion.span>
              )}
            </motion.button>
            {hasFilters && (
              <button className="btn btn-ghost" onClick={() => { setSearch(''); setMuscleGroup(''); setDifficulty(''); setEquipment(''); }} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem' }}>
                <X size={13} /> مسح
              </button>
            )}
          </div>
        </div>
      </section>

      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        muscleGroup={muscleGroup} equipment={equipment} difficulty={difficulty}
        onApply={({ muscleGroup: mg, equipment: eq, difficulty: d }) => {
          setMuscleGroup(mg); setEquipment(eq); setDifficulty(d);
          setFiltersOpen(false);
        }}
      />

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
