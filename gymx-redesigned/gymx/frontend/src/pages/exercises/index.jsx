import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X } from 'lucide-react';
import Head from 'next/head';

const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Glutes','Abs','Calves','Forearms'];
const EQUIPMENT_TYPES = ['Barbell','Dumbbells','Cable Machine','Bodyweight','Machine'];

const DIFF_COLOR = {
  beginner:     { bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.3)',  text:'#4ade80',  label:'مبتدئ',     labelEn:'Beginner' },
  intermediate: { bg:'rgba(250,204,21,0.12)',  border:'rgba(250,204,21,0.3)',  text:'#facc15',  label:'متوسط',     labelEn:'Intermediate' },
  advanced:     { bg:'rgba(255,59,48,0.12)',   border:'rgba(255,59,48,0.3)',   text:'#FF3B30',  label:'متقدم',     labelEn:'Advanced' },
};

const MUSCLE_AR = {
  Chest:'الصدر', Back:'الظهر', Shoulders:'الأكتاف', Biceps:'البايسبس',
  Triceps:'التراسبس', Legs:'الأرجل', Glutes:'المؤخرة', Abs:'البطن',
  Calves:'السمانة', Forearms:'السواعد',
};

const EQUIP_AR = {
  'Barbell':'بار', 'Dumbbells':'دمبل', 'Cable Machine':'كيبل', 'Bodyweight':'بدون معدات', 'Machine':'ماكينة',
};

// صور من Unsplash — مجانية بالكامل
const EXERCISE_IMAGES = {
  Chest:     'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
  Back:      'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80',
  Shoulders: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
  Biceps:    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
  Triceps:   'https://images.unsplash.com/photo-1598971639058-c14ee16f9060?w=400&q=80',
  Legs:      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
  Glutes:    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
  Abs:       'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
  Calves:    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80',
  Forearms:  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
};

const EQUIP_ICON = {
  'Barbell':'🏋️','Dumbbells':'💪','Cable Machine':'🔗','Bodyweight':'🤸','Machine':'⚙️',
};

const EXERCISES = [
  { id:1,  name:'Barbell Bench Press',       name_ar:'ضغط بار على البنش',       muscle_group:'Chest',     difficulty:'intermediate', equipment:'Barbell',      tips:'خلي رجليك ثابتين على الارض، قوس بسيط في ضهرك، والقبضة اعرض شوية من الكتفين.' },
  { id:2,  name:'Incline Dumbbell Press',    name_ar:'ضغط دمبل مائل',           muscle_group:'Chest',     difficulty:'intermediate', equipment:'Dumbbells',    tips:'اضبط البنش من 30 لـ45 درجة، حاول تحس بضغط الصدر العلوي وانت بتطلع.' },
  { id:3,  name:'Decline Bench Press',       name_ar:'ضغط بنش نازل',            muscle_group:'Chest',     difficulty:'intermediate', equipment:'Barbell',      tips:'خلي ضهرك ملصق بالبنش طول الوقت.' },
  { id:4,  name:'Push-Up',                   name_ar:'تمرين الضغط',             muscle_group:'Chest',     difficulty:'beginner',     equipment:'Bodyweight',   tips:'شد بطنك كويس وجسمك يكون مستقيم من دماغك لكعبك.' },
  { id:5,  name:'Cable Fly',                 name_ar:'فلاي كيبل',               muscle_group:'Chest',     difficulty:'beginner',     equipment:'Cable Machine',tips:'ثني خفيف في الكوع وحاول تحس بعضلة الصدر وانت بتضمهم في النص.' },
  { id:6,  name:'Dumbbell Fly',              name_ar:'فلاي دمبل',               muscle_group:'Chest',     difficulty:'beginner',     equipment:'Dumbbells',    tips:'خلي كوعك متني شوية واحس بالمط في الصدر وانت نازل.' },
  { id:7,  name:'Chest Dip',                 name_ar:'دبس الصدر',               muscle_group:'Chest',     difficulty:'intermediate', equipment:'Bodyweight',   tips:'مل جسمك للامام 30 درجة وانزل كويس عشان الصدر يتمد صح.' },
  { id:8,  name:'Pec Deck Machine',          name_ar:'ماكينة بيك ديك',          muscle_group:'Chest',     difficulty:'beginner',     equipment:'Machine',      tips:'متسرعش في الرجعة واضغط الصدر كويس في اقصى نقطة.' },
  { id:9,  name:'Deadlift',                  name_ar:'ديد ليفت',                muscle_group:'Back',      difficulty:'advanced',     equipment:'Barbell',      tips:'ضهرك مستقيم، ادفع الارض من تحتك، وادفع وركيك للامام في الاعلى.' },
  { id:10, name:'Pull-Up',                   name_ar:'عقلة',                    muscle_group:'Back',      difficulty:'intermediate', equipment:'Bodyweight',   tips:'اتعلق كامل في الاسفل واضغط لوحي كتفك وانت طالع.' },
  { id:11, name:'Barbell Row',               name_ar:'رووينج بار',              muscle_group:'Back',      difficulty:'intermediate', equipment:'Barbell',      tips:'خلي ضهرك مستقيم واسحب المرفقين للخلف مش لفوق.' },
  { id:12, name:'Lat Pulldown',              name_ar:'لات بول داون',            muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine',tips:'مل للخلف شوية وادفع مرفقيك للاسفل ناحية الضلوع.' },
  { id:13, name:'Seated Cable Row',          name_ar:'رووينج كيبل جالس',        muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine',tips:'صدرك منتصب وضم لوحي كتفك مع بعض.' },
  { id:14, name:'Single-Arm Dumbbell Row',   name_ar:'رووينج دمبل أحادي',       muscle_group:'Back',      difficulty:'beginner',     equipment:'Dumbbells',    tips:'المرفق قريب من جسمك ومدى الحركة يكون كامل.' },
  { id:15, name:'T-Bar Row',                 name_ar:'تي بار رووينج',           muscle_group:'Back',      difficulty:'intermediate', equipment:'Machine',      tips:'ضهرك موازي للارض وخلي قوس بسيط في اسفل الضهر.' },
  { id:16, name:'Face Pull',                 name_ar:'فيس بول',                 muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine',tips:'تمرين ممتاز لصحة الكتف الخلفي ومنع الاصابات.' },
  { id:17, name:'Overhead Press',            name_ar:'ضغط كتف بار',             muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Barbell',      tips:'شد بطنك واضغط ارداف وخلي البار يطلع فوق بشكل مستقيم.' },
  { id:18, name:'Dumbbell Shoulder Press',   name_ar:'ضغط كتف دمبل',            muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',    tips:'نزل ببطء وخلي المعصمين محايدين.' },
  { id:19, name:'Lateral Raise',             name_ar:'رفع جانبي',               muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',    tips:'ثني خفيف في الكوع وابدا الحركة بالمرفق مش الايد.' },
  { id:20, name:'Front Raise',               name_ar:'رفع أمامي',               muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',    tips:'شد بطنك ومتستعنيش بالزخمة.' },
  { id:21, name:'Rear Delt Fly',             name_ar:'رفع خلفي للكتف',          muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',    tips:'ركز على ضغط الكتف الخلفي مع ثني خفيف في الكوع.' },
  { id:22, name:'Arnold Press',              name_ar:'ضغط أرنولد',              muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Dumbbells',    tips:'الدوران الكامل بيشتغل على الرؤوس التلاتة للكتف.' },
  { id:23, name:'Upright Row',               name_ar:'رووينج عمودي',            muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Barbell',      tips:'القبضة الواسعة بتقلل الضغط على الكتف.' },
  { id:24, name:'Barbell Curl',              name_ar:'كيرل بار',                muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Barbell',      tips:'المرفقين ثابتين جنب جسمك، مدى حركة كامل من تحت لفوق.' },
  { id:25, name:'Dumbbell Curl',             name_ar:'كيرل دمبل',               muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',    tips:'الف معصمك للخارج في الاعلى عشان تحس بانقباض اكبر.' },
  { id:26, name:'Hammer Curl',               name_ar:'هامر كيرل',               muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',    tips:'بيشتغل على البراكياليس وبيزود سماكة الدراع.' },
  { id:27, name:'Preacher Curl',             name_ar:'بريتشر كيرل',             muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Barbell',      tips:'متمدش المرفق اوي في الاسفل عشان متتاذيش.' },
  { id:28, name:'Incline Dumbbell Curl',     name_ar:'كيرل دمبل مائل',          muscle_group:'Biceps',    difficulty:'intermediate', equipment:'Dumbbells',    tips:'الوضع ده بيمد الرأس الطويل للبايسبس بشكل ممتاز.' },
  { id:29, name:'Cable Curl',                name_ar:'كيرل كيبل',               muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Cable Machine',tips:'الكيبل بيفضل شايل شد على العضلة حتى في الاعلى.' },
  { id:30, name:'Concentration Curl',        name_ar:'كيرل تركيز',              muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',    tips:'الف معصمك بالكامل في الاعلى وارجع ببطء.' },
  { id:31, name:'Close-Grip Bench Press',    name_ar:'بنش قبضة ضيقة',           muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Barbell',      tips:'المرفقين لازق بجسمك واليدين بعرض الكتفين.' },
  { id:32, name:'Tricep Dip',                name_ar:'دبس تراسبس',              muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Bodyweight',   tips:'جسمك عمودي والمرفقين وراك.' },
  { id:33, name:'Skull Crusher',             name_ar:'سكال كراشر',              muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Barbell',      tips:'الجزء العلوي من دراعك يفضل عمودي طول الوقت.' },
  { id:34, name:'Tricep Pushdown',           name_ar:'تراسبس بوش داون',         muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Cable Machine',tips:'المرفقين ثابتين جنب جسمك ومد كامل في الاسفل.' },
  { id:35, name:'Overhead Tricep Extension', name_ar:'مط تراسبس فوق الرأس',     muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Dumbbells',    tips:'الرأس الطويل بيتمد كامل فوق الراس، خلي المرفقين قريبين.' },
  { id:36, name:'Diamond Push-Up',           name_ar:'ضغط الماسة',              muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Bodyweight',   tips:'المرفقين لازقين وموجهين للخلف.' },
  { id:37, name:'Tricep Kickback',           name_ar:'كيك باك تراسبس',          muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Dumbbells',    tips:'مد الدراع بالكامل عشان التراسبس ينقبض صح.' },
  { id:38, name:'Barbell Squat',             name_ar:'سكوات بار',               muscle_group:'Legs',      difficulty:'advanced',     equipment:'Barbell',      tips:'صدرك لفوق وركبتيك تتبع اصابعك، انزل لحد الموازي او اقل.' },
  { id:39, name:'Leg Press',                 name_ar:'ليج بريس',                muscle_group:'Legs',      difficulty:'beginner',     equipment:'Machine',      tips:'رجليك بعرض الكتفين ومتقفلش ركبتيك في الاعلى.' },
  { id:40, name:'Romanian Deadlift',         name_ar:'رومانيان ديد ليفت',       muscle_group:'Legs',      difficulty:'intermediate', equipment:'Barbell',      tips:'حاول تحس بمط الهامسترينج وادفع وركيك للخلف مش للاسفل.' },
  { id:41, name:'Leg Curl',                  name_ar:'كيرل همسترينج',           muscle_group:'Legs',      difficulty:'beginner',     equipment:'Machine',      tips:'مد كامل في البداية واضغط الهامسترينج كويس في الاعلى.' },
  { id:42, name:'Leg Extension',             name_ar:'ليج اكستنشن',             muscle_group:'Legs',      difficulty:'beginner',     equipment:'Machine',      tips:'اضغط الكوادريسبس في الاعلى وارجع ببطء.' },
  { id:43, name:'Lunge',                     name_ar:'لانج',                    muscle_group:'Legs',      difficulty:'beginner',     equipment:'Bodyweight',   tips:'ركبتك الامامية فوق كاحلك وجسمك منتصب.' },
  { id:44, name:'Bulgarian Split Squat',     name_ar:'سبليت سكوات بلغاري',      muscle_group:'Legs',      difficulty:'intermediate', equipment:'Dumbbells',    tips:'الركبة ماتعدش الاصابع وادفع من الكعب.' },
  { id:45, name:'Hack Squat',                name_ar:'هاك سكوات',               muscle_group:'Legs',      difficulty:'intermediate', equipment:'Machine',      tips:'لو رجليك فوق بيشتغل على الارداف، لو تحت على الكواد.' },
  { id:46, name:'Front Squat',               name_ar:'سكوات أمامي',             muscle_group:'Legs',      difficulty:'advanced',     equipment:'Barbell',      tips:'جسمك منتصب والمرفقين عاليين وانزل عميق.' },
  { id:47, name:'Hip Thrust',                name_ar:'هيب ثراست',               muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Barbell',      tips:'اضغط الارداف بقوة في الاعلى وخلي دقنك في صدرك.' },
  { id:48, name:'Glute Bridge',              name_ar:'جلوت بريدج',              muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Bodyweight',   tips:'ادفع من كعبك واتحكم في الاعلى ثانيتين.' },
  { id:49, name:'Cable Kickback',            name_ar:'كيبل كيك باك',            muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Cable Machine',tips:'ثبت كورك ومد الورك بالكامل في الاعلى.' },
  { id:50, name:'Sumo Deadlift',             name_ar:'سومو ديد ليفت',           muscle_group:'Glutes',    difficulty:'intermediate', equipment:'Barbell',      tips:'اصابعك للخارج 45 درجة وادفع ركبتيك للخارج.' },
  { id:51, name:'Crunch',                    name_ar:'كرانش',                   muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',   tips:'ماتسحبش رقبتك وطلع النفس وانت طالع.' },
  { id:52, name:'Plank',                     name_ar:'بلانك',                   muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',   tips:'اضغط كل حاجة، الارداف والبطن والفخدين.' },
  { id:53, name:'Hanging Leg Raise',         name_ar:'رفع أرجل معلق',           muscle_group:'Abs',       difficulty:'intermediate', equipment:'Bodyweight',   tips:'ماتهزش جسمك وحاول تلف الحوض للخلف في الاعلى.' },
  { id:54, name:'Cable Crunch',              name_ar:'كرانش كيبل',              muscle_group:'Abs',       difficulty:'beginner',     equipment:'Cable Machine',tips:'قوس ضهرك كويس والحوض يفضل ثابت.' },
  { id:55, name:'Russian Twist',             name_ar:'راشن تويست',              muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',   tips:'ارفع رجليك للصعوبة اكتر وتحرك ببطء.' },
  { id:56, name:'Ab Wheel Rollout',          name_ar:'أب ويل',                  muscle_group:'Abs',       difficulty:'advanced',     equipment:'Machine',      tips:'ماتخليش ضهرك ينهار وشد بطنك طول الوقت.' },
  { id:57, name:'Bicycle Crunch',            name_ar:'كرانش دراجة',             muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',   tips:'بطيء افضل من سريع، ركز على الحركة الصح.' },
  { id:58, name:'Mountain Climber',          name_ar:'متسلق الجبل',             muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',   tips:'وركيك ثابت سواء اتحرك بسرعة او ببطء.' },
  { id:59, name:'Standing Calf Raise',       name_ar:'رفع سمانة واقف',          muscle_group:'Calves',    difficulty:'beginner',     equipment:'Machine',      tips:'مد كامل في الاسفل واضغط السمانة في الاعلى وارجع ببطء.' },
  { id:60, name:'Seated Calf Raise',         name_ar:'رفع سمانة جالس',          muscle_group:'Calves',    difficulty:'beginner',     equipment:'Machine',      tips:'الركبة المثنية بتشتغل على عضلة السولياس اكتر.' },
  { id:61, name:'Donkey Calf Raise',         name_ar:'رفع سمانة دونكي',         muscle_group:'Calves',    difficulty:'intermediate', equipment:'Machine',      tips:'افضل وضع لمد السمانة بشكل كامل.' },
  { id:62, name:'Wrist Curl',                name_ar:'كيرل معصم',               muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Barbell',      tips:'مدى حركة كامل وتحرك ببطء.' },
  { id:63, name:'Reverse Curl',              name_ar:'كيرل معكوس',              muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Barbell',      tips:'بيشتغل على عضلات السواعد الخارجية.' },
  { id:64, name:'Farmers Walk',              name_ar:'مشية الفارمر',            muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Dumbbells',    tips:'خلي كتفيك ثابتين وامشي بثقة.' },
];

// ── Exercise Card ─────────────────────────────────────────
function ExerciseCard({ exercise, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const diff = DIFF_COLOR[exercise.difficulty] || DIFF_COLOR.beginner;
  const imgSrc = EXERCISE_IMAGES[exercise.muscle_group];

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
    >
      <motion.div
        whileHover={{ y: -5, borderColor: 'rgba(255,59,48,0.35)', boxShadow: '0 16px 40px rgba(255,59,48,0.12)' }}
        style={{
          position:'relative', overflow:'hidden',
          background:'rgba(255,255,255,0.04)',
          backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:16, transition:'all 300ms ease',
          height:'100%', display:'flex', flexDirection:'column',
        }}
      >
        {/* Image */}
        <div style={{ position:'relative', height:160, overflow:'hidden', flexShrink:0 }}>
          <img
            src={imgSrc}
            alt={exercise.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 400ms ease' }}
            onMouseEnter={e => e.target.style.transform='scale(1.05)'}
            onMouseLeave={e => e.target.style.transform='scale(1)'}
          />
          {/* overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(8,8,16,0.85) 100%)' }} />
          {/* difficulty badge on image */}
          <span style={{ position:'absolute', top:12, right:12, fontSize:'0.6rem', fontFamily:'var(--font-mono)', textTransform:'uppercase', padding:'3px 9px', borderRadius:20, background:diff.bg, border:'1px solid '+diff.border, color:diff.text, backdropFilter:'blur(8px)' }}>
            {diff.label}
          </span>
          {/* equipment on image bottom-left */}
          <span style={{ position:'absolute', bottom:10, left:12, fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:5 }}>
            {EQUIP_ICON[exercise.equipment]} {EQUIP_AR[exercise.equipment] || exercise.equipment}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding:'18px 18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
          {/* Muscle group pill */}
          <div style={{ marginBottom:10 }}>
            <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)', color:'rgba(255,59,48,0.8)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {MUSCLE_AR[exercise.muscle_group] || exercise.muscle_group}
            </span>
          </div>

          {/* Names */}
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', letterSpacing:'0.04em', textTransform:'uppercase', color:'var(--chalk)', lineHeight:1.2, marginBottom:4 }}>
            {exercise.name}
          </div>
          <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', marginBottom:12, direction:'rtl', fontFamily:'var(--font-body)' }}>
            {exercise.name_ar}
          </div>

          {/* Tips */}
          <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.45)', lineHeight:1.65, direction:'rtl', fontFamily:'var(--font-body)', flex:1, marginBottom:16 }}>
            {exercise.tips}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ backgroundColor:'rgba(255,59,48,0.15)', borderColor:'rgba(255,59,48,0.5)' }}
            style={{ width:'100%', padding:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'var(--chalk)', fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 200ms' }}
          >
            عرض التفاصيل <ChevronRight size={13} color="#FF3B30" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function ExercisesPage() {
  const router = useRouter();
  const [search, setSearch]       = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty]   = useState('');
  const [equipment, setEquipment]     = useState('');

  useEffect(() => {
    if (router.isReady && router.query.muscle_group) {
      setMuscleGroup(router.query.muscle_group);
    }
  }, [router.isReady, router.query.muscle_group]);

  const filtered = EXERCISES.filter(ex => {
    const s = search.toLowerCase();
    return (
      (!search   || ex.name.toLowerCase().includes(s) || ex.name_ar.includes(search)) &&
      (!muscleGroup || ex.muscle_group === muscleGroup) &&
      (!difficulty  || ex.difficulty === difficulty) &&
      (!equipment   || ex.equipment === equipment)
    );
  });

  const hasFilters = search || muscleGroup || difficulty || equipment;

  return (
    <>
      <Head><title>التمارين — GYMZ</title></Head>

      {/* Header */}
      <section style={{ padding:'50px 0 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'#FF3B30', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>— مكتبة التمارين</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,6vw,4.5rem)', letterSpacing:'0.03em', lineHeight:0.95, marginBottom:0 }}>
              كل<br /><span style={{ color:'#FF3B30' }}>التمارين</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding:'16px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:64, zIndex:50, background:'rgba(8,8,16,0.9)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)' }}>
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
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.63rem', color:'rgba(255,255,255,0.3)', marginBottom:20, letterSpacing:'0.08em' }}>
            {filtered.length} تمرين
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {filtered.map((ex, i) => <ExerciseCard key={ex.id} exercise={ex} index={i} />)}
          </div>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'4rem', color:'rgba(255,59,48,0.15)', marginBottom:16 }}>X</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom:8 }}>مفيش نتائج</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>جرب فلتر تاني</div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
