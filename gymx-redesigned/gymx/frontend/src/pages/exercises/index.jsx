import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X, Crown, Play, SlidersHorizontal, ChevronDown, ChevronUp, Check, Dumbbell, Cable, PersonStanding, Settings, Gauge, TrendingUp, Rocket } from 'lucide-react';
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

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const EXERCISES = [
  { id:1,  name:'Barbell Bench Press',      name_ar:'ضغط بار على البنش',     muscle_group:'Chest',     difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,                       tips:'خلي رجليك ثابتين على الارض، قوس بسيط في ضهرك، والقبضة اعرض شوية من الكتفين.' },
  { id:2,  name:'Incline Dumbbell Press',   name_ar:'ضغط دمبل مائل',         muscle_group:'Chest',     difficulty:'intermediate', equipment:'Dumbbells',     img:`${BASE_URL}/Incline_Dumbbell_Press/0.jpg`,                                  tips:'اضبط البنش من 30 لـ45 درجة، حاول تحس بضغط الصدر العلوي وانت بتطلع.' },
  { id:3,  name:'Push-Up',                  name_ar:'تمرين الضغط',           muscle_group:'Chest',     difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Pushups/0.jpg`,                                                 tips:'شد بطنك كويس وجسمك يكون مستقيم من دماغك لكعبك.' },
  { id:4,  name:'Cable Fly',                name_ar:'فلاي كيبل',             muscle_group:'Chest',     difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Cable_Chest_Press/0.jpg`,                                       tips:'ثني خفيف في الكوع وحاول تحس بعضلة الصدر وانت بتضمهم في النص.' },
  { id:5,  name:'Dumbbell Fly',             name_ar:'فلاي دمبل',             muscle_group:'Chest',     difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Dumbbell_Flyes/0.jpg`,                                          tips:'خلي كوعك متني شوية واحس بالمط في الصدر وانت نازل.' },
  { id:6,  name:'Chest Dip',                name_ar:'دبس الصدر',             muscle_group:'Chest',     difficulty:'intermediate', equipment:'Bodyweight',    img:`${BASE_URL}/Dips_-_Chest_Version/0.jpg`,                                    tips:'مل جسمك للامام 30 درجة وانزل كويس عشان الصدر يتمد صح.' },
  { id:7,  name:'Deadlift',                 name_ar:'ديد ليفت',              muscle_group:'Back',      difficulty:'advanced',     equipment:'Barbell',       img:`${BASE_URL}/Barbell_Deadlift/0.jpg`,                                        tips:'ضهرك مستقيم، ادفع الارض من تحتك، وادفع وركيك للامام في الاعلى.' },
  { id:8,  name:'Pull-Up',                  name_ar:'عقلة',                  muscle_group:'Back',      difficulty:'intermediate', equipment:'Bodyweight',    img:`${BASE_URL}/Pullups/0.jpg`,                                                 tips:'اتعلق كامل في الاسفل واضغط لوحي كتفك وانت طالع.' },
  { id:9,  name:'Barbell Row',              name_ar:'رووينج بار',            muscle_group:'Back',      difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Bent_Over_Barbell_Row/0.jpg`,                                   tips:'خلي ضهرك مستقيم واسحب المرفقين للخلف مش لفوق.' },
  { id:10, name:'Lat Pulldown',             name_ar:'لات بول داون',          muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`,                                  tips:'مل للخلف شوية وادفع مرفقيك للاسفل ناحية الضلوع.' },
  { id:11, name:'Seated Cable Row',         name_ar:'رووينج كيبل جالس',      muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Seated_Cable_Rows/0.jpg`,                                       tips:'صدرك منتصب وضم لوحي كتفك مع بعض.' },
  { id:12, name:'One-Arm Dumbbell Row',     name_ar:'رووينج دمبل أحادي',     muscle_group:'Back',      difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/One-Arm_Dumbbell_Row/0.jpg`,                                    tips:'المرفق قريب من جسمك ومدى الحركة يكون كامل.' },
  { id:13, name:'Face Pull',                name_ar:'فيس بول',               muscle_group:'Back',      difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Face_Pull/0.jpg`,                                               tips:'تمرين ممتاز لصحة الكتف الخلفي ومنع الاصابات.' },
  { id:14, name:'Overhead Press',           name_ar:'ضغط كتف بار',           muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Barbell_Shoulder_Press/0.jpg`,                                  tips:'شد بطنك واضغط ارداف وخلي البار يطلع فوق بشكل مستقيم.' },
  { id:15, name:'Dumbbell Shoulder Press',  name_ar:'ضغط كتف دمبل',          muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Dumbbell_Shoulder_Press/0.jpg`,                                 tips:'نزل ببطء وخلي المعصمين محايدين.' },
  { id:16, name:'Lateral Raise',            name_ar:'رفع جانبي',             muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Side_Lateral_Raise/0.jpg`,                                      tips:'ثني خفيف في الكوع وابدا الحركة بالمرفق مش الايد.' },
  { id:17, name:'Front Raise',              name_ar:'رفع أمامي',             muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Front_Dumbbell_Raise/0.jpg`,                                    tips:'شد بطنك ومتستعنيش بالزخمة.' },
  { id:18, name:'Rear Delt Fly',            name_ar:'رفع خلفي للكتف',        muscle_group:'Shoulders', difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg`, tips:'ركز على ضغط الكتف الخلفي مع ثني خفيف في الكوع.' },
  { id:19, name:'Arnold Press',             name_ar:'ضغط أرنولد',            muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Dumbbells',     img:`${BASE_URL}/Arnold_Dumbbell_Press/0.jpg`,                                   tips:'الدوران الكامل بيشتغل على الرؤوس التلاتة للكتف.' },
  { id:20, name:'Upright Row',              name_ar:'رووينج عمودي',          muscle_group:'Shoulders', difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Upright_Barbell_Row/0.jpg`,                                     tips:'القبضة الواسعة بتقلل الضغط على الكتف.' },
  { id:21, name:'Barbell Curl',             name_ar:'كيرل بار',              muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Barbell',       img:`${BASE_URL}/Barbell_Curl/0.jpg`,                                            tips:'المرفقين ثابتين جنب جسمك، مدى حركة كامل من تحت لفوق.' },
  { id:22, name:'Dumbbell Curl',            name_ar:'كيرل دمبل',             muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Dumbbell_Bicep_Curl/0.jpg`,                                     tips:'الف معصمك للخارج في الاعلى عشان تحس بانقباض اكبر.' },
  { id:23, name:'Hammer Curl',              name_ar:'هامر كيرل',             muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Hammer_Curls/0.jpg`,                                            tips:'بيشتغل على البراكياليس وبيزود سماكة الدراع.' },
  { id:24, name:'Preacher Curl',            name_ar:'بريتشر كيرل',           muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Barbell',       img:`${BASE_URL}/Preacher_Curl/0.jpg`,                                           tips:'متمدش المرفق اوي في الاسفل عشان متتاذيش.' },
  { id:25, name:'Incline Dumbbell Curl',    name_ar:'كيرل دمبل مائل',        muscle_group:'Biceps',    difficulty:'intermediate', equipment:'Dumbbells',     img:`${BASE_URL}/Incline_Dumbbell_Curl/0.jpg`,                                   tips:'الوضع ده بيمد الرأس الطويل للبايسبس بشكل ممتاز.' },
  { id:26, name:'Cable Curl',               name_ar:'كيرل كيبل',             muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg`,                    tips:'الكيبل بيفضل شايل شد على العضلة حتى في الاعلى.' },
  { id:27, name:'Concentration Curl',       name_ar:'كيرل تركيز',            muscle_group:'Biceps',    difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Concentration_Curls/0.jpg`,                                     tips:'الف معصمك بالكامل في الاعلى وارجع ببطء.' },
  { id:28, name:'Close-Grip Bench Press',   name_ar:'بنش قبضة ضيقة',         muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Close-Grip_Barbell_Bench_Press/0.jpg`,                          tips:'المرفقين لازق بجسمك واليدين بعرض الكتفين.' },
  { id:29, name:'Tricep Kickback',          name_ar:'كيك باك تراسبس',        muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Tricep_Dumbbell_Kickback/0.jpg`,                                tips:'مد الدراع بالكامل عشان التراسبس ينقبض صح.' },
  { id:30, name:'Skull Crusher',            name_ar:'سكال كراشر',            muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/EZ-Bar_Skullcrusher/0.jpg`,                                     tips:'الجزء العلوي من دراعك يفضل عمودي طول الوقت.' },
  { id:31, name:'Tricep Pushdown',          name_ar:'تراسبس بوش داون',       muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Triceps_Pushdown/0.jpg`,                                        tips:'المرفقين ثابتين جنب جسمك ومد كامل في الاسفل.' },
  { id:32, name:'Overhead Tricep Extension',name_ar:'مط تراسبس فوق الرأس',   muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Dumbbells',     img:`${BASE_URL}/Dumbbell_One-Arm_Triceps_Extension/0.jpg`,                      tips:'الرأس الطويل بيتمد كامل فوق الراس، خلي المرفقين قريبين.' },
  { id:33, name:'Diamond Push-Up',          name_ar:'ضغط الماسة',            muscle_group:'Triceps',   difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg`,                   tips:'المرفقين لازقين وموجهين للخلف.' },
  { id:34, name:'Tricep Dip',               name_ar:'دبس تراسبس',            muscle_group:'Triceps',   difficulty:'intermediate', equipment:'Bodyweight',    img:`${BASE_URL}/Bench_Dips/0.jpg`,                                              tips:'جسمك عمودي والمرفقين وراك.' },
  { id:35, name:'Barbell Squat',            name_ar:'سكوات بار',             muscle_group:'Legs',      difficulty:'advanced',     equipment:'Barbell',       img:`${BASE_URL}/Barbell_Squat/0.jpg`,                                           tips:'صدرك لفوق وركبتيك تتبع اصابعك، انزل لحد الموازي او اقل.' },
  { id:36, name:'Leg Press',                name_ar:'ليج بريس',              muscle_group:'Legs',      difficulty:'beginner',     equipment:'Machine',       img:`${BASE_URL}/Leg_Press/0.jpg`,                                               tips:'رجليك بعرض الكتفين ومتقفلش ركبتيك في الاعلى.' },
  { id:37, name:'Romanian Deadlift',        name_ar:'رومانيان ديد ليفت',     muscle_group:'Legs',      difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Romanian_Deadlift/0.jpg`,                                       tips:'حاول تحس بمط الهامسترينج وادفع وركيك للخلف مش للاسفل.' },
  { id:38, name:'Leg Curl',                 name_ar:'كيرل همسترينج',         muscle_group:'Legs',      difficulty:'beginner',     equipment:'Machine',       img:`${BASE_URL}/Lying_Leg_Curls/0.jpg`,                                         tips:'مد كامل في البداية واضغط الهامسترينج كويس في الاعلى.' },
  { id:39, name:'Leg Extension',            name_ar:'ليج اكستنشن',           muscle_group:'Legs',      difficulty:'beginner',     equipment:'Machine',       img:`${BASE_URL}/Leg_Extensions/0.jpg`,                                          tips:'اضغط الكوادريسبس في الاعلى وارجع ببطء.' },
  { id:40, name:'Lunge',                    name_ar:'لانج',                  muscle_group:'Legs',      difficulty:'beginner',     equipment:'Barbell',       img:`${BASE_URL}/Barbell_Lunge/0.jpg`,                                           tips:'ركبتك الامامية فوق كاحلك وجسمك منتصب.' },
  { id:41, name:'Bulgarian Split Squat',    name_ar:'سبليت سكوات بلغاري',    muscle_group:'Legs',      difficulty:'intermediate', equipment:'Dumbbells',     img:`${BASE_URL}/Split_Squats/0.jpg`,                                            tips:'الركبة ماتعدش الاصابع وادفع من الكعب.' },
  { id:42, name:'Hack Squat',               name_ar:'هاك سكوات',             muscle_group:'Legs',      difficulty:'intermediate', equipment:'Machine',       img:`${BASE_URL}/Hack_Squat/0.jpg`,                                              tips:'لو رجليك فوق بيشتغل على الارداف، لو تحت على الكواد.' },
  { id:43, name:'Front Squat',              name_ar:'سكوات أمامي',           muscle_group:'Legs',      difficulty:'advanced',     equipment:'Barbell',       img:`${BASE_URL}/Front_Barbell_Squat/0.jpg`,                                     tips:'جسمك منتصب والمرفقين عاليين وانزل عميق.' },
  { id:44, name:'Hip Thrust',               name_ar:'هيب ثراست',             muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Barbell',       img:`${BASE_URL}/Barbell_Hip_Thrust/0.jpg`,                                      tips:'اضغط الارداف بقوة في الاعلى وخلي دقنك في صدرك.' },
  { id:45, name:'Glute Bridge',             name_ar:'جلوت بريدج',            muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Barbell_Glute_Bridge/0.jpg`,                                    tips:'ادفع من كعبك واتحكم في الاعلى ثانيتين.' },
  { id:46, name:'Cable Kickback',           name_ar:'كيبل كيك باك',          muscle_group:'Glutes',    difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Cable_Hip_Adduction/0.jpg`,                                     tips:'ثبت كورك ومد الورك بالكامل في الاعلى.' },
  { id:47, name:'Sumo Deadlift',            name_ar:'سومو ديد ليفت',         muscle_group:'Glutes',    difficulty:'intermediate', equipment:'Barbell',       img:`${BASE_URL}/Sumo_Deadlift/0.jpg`,                                           tips:'اصابعك للخارج 45 درجة وادفع ركبتيك للخارج.' },
  { id:48, name:'Crunch',                   name_ar:'كرانش',                 muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Crunches/0.jpg`,                                                tips:'ماتسحبش رقبتك وطلع النفس وانت طالع.' },
  { id:49, name:'Plank',                    name_ar:'بلانك',                 muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Plank/0.jpg`,                                                   tips:'اضغط كل حاجة، الارداف والبطن والفخدين.' },
  { id:50, name:'Hanging Leg Raise',        name_ar:'رفع أرجل معلق',         muscle_group:'Abs',       difficulty:'intermediate', equipment:'Bodyweight',    img:`${BASE_URL}/Hanging_Leg_Raise/0.jpg`,                                       tips:'ماتهزش جسمك وحاول تلف الحوض للخلف في الاعلى.' },
  { id:51, name:'Cable Crunch',             name_ar:'كرانش كيبل',            muscle_group:'Abs',       difficulty:'beginner',     equipment:'Cable Machine', img:`${BASE_URL}/Cable_Crunch/0.jpg`,                                            tips:'قوس ضهرك كويس والحوض يفضل ثابت.' },
  { id:52, name:'Russian Twist',            name_ar:'راشن تويست',            muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Russian_Twist/0.jpg`,                                           tips:'ارفع رجليك للصعوبة اكتر وتحرك ببطء.' },
  { id:53, name:'Ab Wheel Rollout',         name_ar:'أب ويل',                muscle_group:'Abs',       difficulty:'advanced',     equipment:'Machine',       img:`${BASE_URL}/Ab_Roller/0.jpg`,                                               tips:'ماتخليش ضهرك ينهار وشد بطنك طول الوقت.' },
  { id:54, name:'Bicycle Crunch',           name_ar:'كرانش دراجة',           muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Cross-Body_Crunch/0.jpg`,                                       tips:'بطيء افضل من سريع، ركز على الحركة الصح.' },
  { id:55, name:'Mountain Climber',         name_ar:'متسلق الجبل',           muscle_group:'Abs',       difficulty:'beginner',     equipment:'Bodyweight',    img:`${BASE_URL}/Mountain_Climbers/0.jpg`,                                       tips:'وركيك ثابت سواء اتحرك بسرعة او ببطء.' },
  { id:56, name:'Standing Calf Raise',      name_ar:'رفع سمانة واقف',        muscle_group:'Calves',    difficulty:'beginner',     equipment:'Machine',       img:`${BASE_URL}/Standing_Calf_Raises/0.jpg`,                                    tips:'مد كامل في الاسفل واضغط السمانة في الاعلى وارجع ببطء.' },
  { id:57, name:'Seated Calf Raise',        name_ar:'رفع سمانة جالس',        muscle_group:'Calves',    difficulty:'beginner',     equipment:'Machine',       img:`${BASE_URL}/Seated_Calf_Raise/0.jpg`,                                       tips:'الركبة المثنية بتشتغل على عضلة السولياس اكتر.' },
  { id:58, name:'Donkey Calf Raise',        name_ar:'رفع سمانة دونكي',       muscle_group:'Calves',    difficulty:'intermediate', equipment:'Machine',       img:`${BASE_URL}/Donkey_Calf_Raises/0.jpg`,                                      tips:'افضل وضع لمد السمانة بشكل كامل.' },
  { id:59, name:'Wrist Curl',               name_ar:'كيرل معصم',             muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Barbell',       img:`${BASE_URL}/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg`,                      tips:'مدى حركة كامل وتحرك ببطء.' },
  { id:60, name:'Reverse Curl',             name_ar:'كيرل معكوس',            muscle_group:'Forearms',  difficulty:'beginner',     equipment:'Barbell',       img:`${BASE_URL}/Reverse_Barbell_Curl/0.jpg`,                                    tips:'بيشتغل على عضلات السواعد الخارجية.' },
];

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
    <button
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        padding: '12px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'right',
        background: selected ? 'rgba(255,77,46,0.08)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(255,77,46,0.55)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? '0 0 0 1px rgba(255,77,46,0.15), 0 0 16px rgba(255,77,46,0.15)' : 'none',
        transition: 'all 180ms',
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
    </button>
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
          style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px 20px 0 0', direction: 'rtl', padding: '20px 18px 96px' }}
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
            <button
              onClick={() => { setDraftMuscle(''); setDraftEquipment(''); setDraftDifficulty(''); }}
              style={{ padding: '13px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              مسح الكل
            </button>
            <button
              onClick={() => onApply({ muscleGroup: draftMuscle, equipment: draftEquipment, difficulty: draftDifficulty })}
              style={{ flex: 1, padding: '13px 18px', borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.95rem', letterSpacing: '0.03em', cursor: 'pointer' }}
            >
              تطبيق الفلاتر
            </button>
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
            <button
              onClick={() => setFiltersOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: activeFilterCount ? 'rgba(255,77,46,0.1)' : 'rgba(255,255,255,0.04)', border: activeFilterCount ? '1px solid rgba(255,77,46,0.35)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: activeFilterCount ? 'var(--accent)' : 'var(--chalk)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={13} /> الفلاتر
              {activeFilterCount > 0 && (
                <span style={{ minWidth: 16, height: 16, borderRadius: 8, background: 'var(--accent)', color: '#000', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
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
