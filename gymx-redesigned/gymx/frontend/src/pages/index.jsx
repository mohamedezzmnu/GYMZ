cat > src/pages/exercises/index.jsx << 'EOF'
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search } from 'lucide-react';
import Head from 'next/head';

const MUSCLE_GROUPS = [
  'Chest','Back','Shoulders','Biceps','Triceps',
  'Legs','Glutes','Abs','Calves','Forearms',
];

const MUSCLE_ICON = {
  Chest:'🏋️', Back:'🔙', Shoulders:'🤸', Biceps:'💪',
  Triceps:'💪', Legs:'🦵', Glutes:'🍑', Abs:'🎯',
  Calves:'🦶', Forearms:'🤜',
};

const DIFF_COLOR = {
  beginner:     { bg:'rgba(74,222,128,0.12)', border:'rgba(74,222,128,0.3)',  text:'#4ade80' },
  intermediate: { bg:'rgba(250,204,21,0.12)', border:'rgba(250,204,21,0.3)', text:'#facc15' },
  advanced:     { bg:'rgba(248,113,113,0.12)',border:'rgba(248,113,113,0.3)',text:'#f87171' },
};

const EXERCISES = [
  { id:1,  name:'Barbell Bench Press',       name_ar:'ضغط بار علي البنش',       muscle_group:'Chest',     difficulty:'intermediate', equipment:'Barbell, Bench',           tips:'Keep feet flat, arch back slightly, grip wider than shoulders.' },
  { id:2,  name:'Incline Dumbbell Press',    name_ar:'ضغط دمبل مائل',           muscle_group:'Chest',     difficulty:'intermediate', equipment:'Dumbbells, Incline Bench', tips:'Set bench 30-45°, focus on upper chest squeeze at top.' },
  { id:3,  name:'Decline Bench Press',       name_ar:'ضغط بنش نازل',            muscle_group:'Chest',     difficulty:'intermediate', equipment:'Barbell, Decline Bench',   tips:'Keep lower back pressed into bench throughout.' },
  { id:4,  name:'Push-Up',                   name_ar:'تمرين الضغط',             muscle_group:'Chest',     difficulty:'beginner',     equipment:'Bodyweight',               tips:'Keep core tight, body straight from head to heels.' },
  { id:5,  name:'Cable Fly',                 name_ar:'فلاي كيبل',               muscle_group:'Chest',     difficulty:'beginner',     equipment:'Cable Machine',            tips:'Slight elbow bend, squeeze chest at center.' },
  { id:6,  name:'Dumbbell Fly',              name_ar:'فلاي دمبل',               muscle_group:'Chest',     difficulty:'beginner',     equipment:'Dumbbells, Bench',         tips:'Keep slight bend in elbows, stretch chest at bottom.' },
  { id:7,  name:'Chest Dip',                 name_ar:'دبس الصدر',               muscle_group:'Chest',     difficulty:'intermediate', equipment:'Dip Bars',                 tips:'Lean torso forward 30°, go deep for full chest stretch.' },
  { id:8,  name:'Pec Deck Machine',          name_ar:'ماكينة بيك ديك',         muscle_group:'Chest',     difficulty:'beginner',     equipment:'Pec Deck Machine',         tips:'Control the negative, squeeze at peak contraction.' },
  { id:9,  name:'Deadlift',                  name_ar:'ديد ليفت',                muscle_group:'Back',      difficulty:'advanced',     equipment:'Barbell',                  tips:'Neutral spine, push floor away, drive hips forward at top.' },
  { id:10, name:'Pull-Up',                   name_ar:'عقلة',                    muscle_group:'Back',      difficulty:'intermediate', equipment:'Pull-Up Bar',              tips:'Full dead hang at bottom, squeeze shoulder blades at top.' },
  { id:11, name:'Barbell Row',               name_ar:'رووينج بار',              muscle_group:'Back',      difficulty:'intermediate', equipment:'Barbell',                  tips:'Keep back flat, pull elbows back not up.' },
  { id:12, name:'Lat Pulldown',              name_ar:'لات بول داون',            muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine',            tips:'Lean back slightly, drive elbows down to lats.' },
  { id:13, name:'Seated Cable Row',          name_ar:'رووينج كيبل جالس',       muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine',            tips:'Keep chest tall, squeeze shoulder blades together.' },
  { id:14, name:'Single-Arm Dumbbell Row',   name_ar:'رووينج دمبل أحادي',      muscle_group:'Back',      difficulty:'beginner',     equipment:'Dumbbell, Bench',          tips:'Keep elbow close to body, full range of motion.' },
  { id:15, name:'T-Bar Row',                 name_ar:'تي بار رووينج',           muscle_group:'Back',      difficulty:'intermediate', equipment:'T-Bar Machine',            tips:'Keep back parallel to floor, arch lower back.' },
  { id:16, name:'Face Pull',                 name_ar:'فيس بول',                 muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine',            tips:'Great for rear delts and rotator cuff health.' },
  { id:17, name:'Overhead Press',            name_ar:'ضغط كتف بار',             muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Barbell',                  tips:'Brace core, squeeze glutes, bar path straight up.' },
  { id:18, name:'Dumbbell Shoulder Press',   name_ar:'ضغط كتف دمبل',           muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',                tips:'Control descent, keep wrists neutral.' },
  { id:19, name:'Lateral Raise',             name_ar:'رفع جانبي',               muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',                tips:'Slight elbow bend, lead with elbows, avoid swinging.' },
  { id:20, name:'Front Raise',               name_ar:'رفع أمامي',               muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',                tips:'Keep core tight, avoid using momentum.' },
  { id:21, name:'Rear Delt Fly',             name_ar:'رفع خلفي للكتف',         muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',                tips:'Focus on squeezing rear delts, slight bend in elbows.' },
  { id:22, name:'Arnold Press',              name_ar:'ضغط أرنولد',              muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Dumbbells',                tips:'Full rotation targets all three delt heads.' },
  { id:23, name:'Upright Row',               name_ar:'رووينج عمودي',            muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Barbell',                  tips:'Wide grip reduces shoulder impingement risk.' },
  { id:24, name:'Barbell Curl',              name_ar:'كيرل بار',                muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Barbell',                  tips:'Keep elbows pinned to sides, full ROM bottom to top.' },
  { id:25, name:'Dumbbell Curl',             name_ar:'كيرل دمبل',               muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',                tips:'Supinate wrist at top for peak contraction.' },
  { id:26, name:'Hammer Curl',               name_ar:'هامر كيرل',               muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',                tips:'Hits brachialis for arm thickness.' },
  { id:27, name:'Preacher Curl',             name_ar:'بريتشر كيرل',             muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Barbell, Preacher Bench',  tips:'Do not let elbows hyperextend at bottom.' },
  { id:28, name:'Incline Dumbbell Curl',     name_ar:'كيرل دمبل مائل',         muscle_group:'Biceps',    difficulty:'intermediate', equipment:'Dumbbells, Incline Bench', tips:'Long head gets maximum stretch in this position.' },
  { id:29, name:'Cable Curl',                name_ar:'كيرل كيبل',               muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Cable Machine',            tips:'Cable maintains tension at top unlike free weights.' },
  { id:30, name:'Concentration Curl',        name_ar:'كيرل تركيز',              muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbell',                 tips:'Full supination at top, slow controlled negatives.' },
  { id:31, name:'Close-Grip Bench Press',    name_ar:'بنش قبضة ضيقة',          muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Barbell, Bench',           tips:'Keep elbows tucked, hands shoulder-width apart.' },
  { id:32, name:'Tricep Dip',                name_ar:'دبس تراسبس',              muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Dip Bars',                 tips:'Keep torso vertical, elbows behind body.' },
  { id:33, name:'Skull Crusher',             name_ar:'سكال كراشر',              muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Barbell, Bench',           tips:'Keep upper arms vertical throughout movement.' },
  { id:34, name:'Tricep Pushdown',           name_ar:'تراسبس بوش داون',         muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Cable Machine',            tips:'Keep elbows pinned to sides, full extension at bottom.' },
  { id:35, name:'Overhead Tricep Extension', name_ar:'مط تراسبس فوق الرأس',    muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Dumbbell',                 tips:'Long head fully stretched overhead, keep elbows close.' },
  { id:36, name:'Diamond Push-Up',           name_ar:'ضغط الماسة',              muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Bodyweight',               tips:'Keep elbows tucked and pointing back.' },
  { id:37, name:'Tricep Kickback',           name_ar:'كيك باك تراسبس',         muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Dumbbell',                 tips:'Full extension locks out the tricep completely.' },
  { id:38, name:'Barbell Squat',             name_ar:'سكوات بار',               muscle_group:'Legs',      difficulty:'advanced',     equipment:'Barbell, Squat Rack',      tips:'Chest up, knees track toes, depth to parallel or below.' },
  { id:39, name:'Leg Press',                 name_ar:'ليج بريس',                muscle_group:'Legs',      difficulty:'beginner',     equipment:'Leg Press Machine',        tips:'Feet shoulder-width, do not lock knees at top.' },
  { id:40, name:'Romanian Deadlift',         name_ar:'رومانيان ديد ليفت',      muscle_group:'Legs',      difficulty:'intermediate', equipment:'Barbell',                  tips:'Feel hamstring stretch, push hips back not down.' },
  { id:41, name:'Leg Curl',                  name_ar:'كيرل همسترينج',           muscle_group:'Legs',      difficulty:'beginner',     equipment:'Leg Curl Machine',         tips:'Full extension at start, squeeze hamstrings at peak.' },
  { id:42, name:'Leg Extension',             name_ar:'ليج إكستنشن',             muscle_group:'Legs',      difficulty:'beginner',     equipment:'Leg Extension Machine',    tips:'Squeeze quads at top, control the negative.' },
  { id:43, name:'Lunge',                     name_ar:'لانج',                    muscle_group:'Legs',      difficulty:'beginner',     equipment:'Bodyweight / Dumbbells',   tips:'Front knee stays above ankle, keep torso upright.' },
  { id:44, name:'Bulgarian Split Squat',     name_ar:'سبليت سكوات بلغاري',     muscle_group:'Legs',      difficulty:'intermediate', equipment:'Bench, Dumbbells',         tips:'Knee does not pass toes, drive through heel.' },
  { id:45, name:'Hack Squat',                name_ar:'هاك سكوات',               muscle_group:'Legs',      difficulty:'intermediate', equipment:'Hack Squat Machine',       tips:'High foot placement targets glutes, low targets quads.' },
  { id:46, name:'Front Squat',               name_ar:'سكوات أمامي',             muscle_group:'Legs',      difficulty:'advanced',     equipment:'Barbell',                  tips:'Upright torso, elbows high, deep squat.' },
  { id:47, name:'Hip Thrust',                name_ar:'هيب ثراست',               muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Barbell, Bench',           tips:'Squeeze glutes hard at top, chin tucked.' },
  { id:48, name:'Glute Bridge',              name_ar:'جلوت بريدج',              muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Bodyweight',               tips:'Drive through heels, hold 2 seconds at top.' },
  { id:49, name:'Cable Kickback',            name_ar:'كيبل كيك باك',            muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Cable Machine',            tips:'Keep core stable, full hip extension at top.' },
  { id:50, name:'Sumo Deadlift',             name_ar:'سومو ديد ليفت',           muscle_group:'Glutes',    difficulty:'intermediate', equipment:'Barbell',                  tips:'Toes pointed out 45 degrees, push knees out.' },
  { id:51, name:'Crunch',                    name_ar:'كرانش',                   muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',               tips:'Do not pull neck, exhale on way up.' },
  { id:52, name:'Plank',                     name_ar:'بلانك',                   muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',               tips:'Squeeze everything — glutes, core, quads.' },
  { id:53, name:'Hanging Leg Raise',         name_ar:'رفع أرجل معلق',           muscle_group:'Abs',       difficulty:'intermediate', equipment:'Pull-Up Bar',              tips:'Avoid swinging, posterior pelvic tilt at top.' },
  { id:54, name:'Cable Crunch',              name_ar:'كرانش كيبل',              muscle_group:'Abs',       difficulty:'beginner',     equipment:'Cable Machine',            tips:'Round the spine, hips stay fixed.' },
  { id:55, name:'Russian Twist',             name_ar:'راشن تويست',              muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight / Plate',       tips:'Feet off floor for extra difficulty, slow and controlled.' },
  { id:56, name:'Ab Wheel Rollout',          name_ar:'أب ويل',                  muscle_group:'Abs',       difficulty:'advanced',     equipment:'Ab Wheel',                 tips:'Do not let lower back sag, brace hard throughout.' },
  { id:57, name:'Bicycle Crunch',            name_ar:'كرانش دراجة',             muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',               tips:'Slow down — quality reps beat speed.' },
  { id:58, name:'Mountain Climber',          name_ar:'متسلق الجبل',             muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',               tips:'Keep hips level, fast or slow both work.' },
  { id:59, name:'Standing Calf Raise',       name_ar:'رفع سمانة واقف',          muscle_group:'Calves',    difficulty:'beginner',     equipment:'Machine / Bodyweight',     tips:'Full stretch at bottom, squeeze at top, slow negative.' },
  { id:60, name:'Seated Calf Raise',         name_ar:'رفع سمانة جالس',          muscle_group:'Calves',    difficulty:'beginner',     equipment:'Seated Calf Machine',      tips:'Bent knee targets soleus more than gastrocnemius.' },
  { id:61, name:'Donkey Calf Raise',         name_ar:'رفع سمانة دونكي',         muscle_group:'Calves',    difficulty:'intermediate', equipment:'Machine',                  tips:'Best stretch position for calves.' },
  { id:62, name:'Wrist Curl',                name_ar:'كيرل معصم',               muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Barbell / Dumbbell',       tips:'Full range of motion, slow and controlled.' },
  { id:63, name:'Reverse Curl',              name_ar:'كيرل معكوس',              muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Barbell',                  tips:'Hits brachioradialis and forearm extensors.' },
  { id:64, name:'Farmers Walk',              name_ar:'مشية الفارمر',            muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Dumbbells / Kettlebells',  tips:'Keep shoulders packed, walk with purpose.' },
];

function ExerciseCard({ exercise, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const diff = DIFF_COLOR[exercise.difficulty] || DIFF_COLOR.beginner;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
    >
      <motion.div
        whileHover={{ y: -6, borderColor: 'rgba(61,127,255,0.45)', boxShadow: '0 16px 48px rgba(61,127,255,0.18)' }}
        style={{
          position: 'relative', overflow: 'hidden', cursor: 'default',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 20, transition: 'all 300ms ease',
          height: '100%',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)' }} />
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: '1.3rem' }}>
          {MUSCLE_ICON[exercise.muscle_group] || '💪'}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--chalk)', lineHeight: 1.2, marginBottom: 4 }}>
          {exercise.name}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 12, direction: 'rtl' }}>
          {exercise.name_ar}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 14 }}>
          {exercise.tips}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(61,127,255,0.7)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
          {exercise.equipment}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: diff.bg, border: '1px solid ' + diff.border, color: diff.text }}>
            {exercise.difficulty}
          </span>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(61,127,255,0.1)', border: '1px solid rgba(61,127,255,0.2)', color: 'rgba(61,127,255,0.9)' }}>
            {exercise.muscle_group}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const filtered = EXERCISES.filter(ex => {
    const s = search.toLowerCase();
    const matchSearch = !search || ex.name.toLowerCase().includes(s) || ex.name_ar.includes(search);
    const matchMuscle = !muscleGroup || ex.muscle_group === muscleGroup;
    const matchDiff   = !difficulty  || ex.difficulty === difficulty;
    return matchSearch && matchMuscle && matchDiff;
  });

  return (
    <>
      <Head><title>Exercises — GYMX</title></Head>
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mono" style={{ color: 'var(--volt)', marginBottom: 12 }}>— Exercise Library</div>
            <h1 className="display-lg" style={{ marginBottom: 0 }}>
              Every<br /><span style={{ color: 'var(--volt)' }}>Movement</span>
            </h1>
          </motion.div>
        </div>
      </section>
      <section style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 64, zIndex: 50, background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input className="input" placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
            </div>
            <select className="input" value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} style={{ flex: '1 1 160px', cursor: 'pointer' }}>
              <option value="">All Muscles</option>
              {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
            </select>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ flex: '1 1 140px', cursor: 'pointer' }}>
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {(search || muscleGroup || difficulty) && (
              <button className="btn btn-ghost" onClick={() => { setSearch(''); setMuscleGroup(''); setDifficulty(''); }}>Clear</button>
            )}
          </div>
        </div>
      </section>
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="mono" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>{filtered.length} exercises found</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((ex, i) => <ExerciseCard key={ex.id} exercise={ex} index={i} />)}
          </div>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'rgba(61,127,255,0.15)', marginBottom: 16 }}>X</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>No exercises found</div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>Try different filters</div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
EOF