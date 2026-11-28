// ربط تمارين صفحة البرامج بفيديوهات مكتبة التمارين (57 فيديو).
// المفتاح = id التمرين في data/exercises.js
// الفيديوهات اللي نفس الحركة بالظبط، والفيديوهات القريبة (بأداة أو وضع مختلف)
// اللي بتظهر مع سطر توضيحي صغير عشان محدش يتلخبط.
export const EXERCISE_VIDEOS = {
  // ── نفس الحركة ──────────────────────────────────────────
  14: { video: '/exercises/videos/military-press.mp4',            name: 'Overhead Press' },
  16: { video: '/exercises/videos/dumbbell-lateral-raise.mp4',    name: 'Dumbbell Lateral Raise' },
  56: { video: '/exercises/videos/standing-machine-calf-raise.mp4', name: 'Standing Calf Raise' },
  57: { video: '/exercises/videos/seated-calf-raise.mp4',         name: 'Seated Calf Raise' },
  9:  { video: '/exercises/videos/bent-over-row.mp4',             name: 'Barbell Bent-Over Row' },
  30: { video: '/exercises/videos/ez-bar-skullcrusher.mp4',       name: 'EZ Bar Skullcrusher' },
  35: { video: '/exercises/videos/barbell-back-squat.mp4',        name: 'Barbell Back Squat' },
  11: { video: '/exercises/videos/seated-cable-row.mp4',          name: 'Seated Cable Row' },
  8:  { video: '/exercises/videos/wide-grip-pull-up.mp4',         name: 'Wide-Grip Pull-Up' },
  21: { video: '/exercises/videos/standing-barbell-curl.mp4',     name: 'Standing Barbell Curl' },
  10: { video: '/exercises/videos/lat-pull-down.mp4',             name: 'Lat Pulldown' },
  36: { video: '/exercises/videos/leg-press.mp4',                 name: 'Leg Press' },
  44: { video: '/exercises/videos/barbell-hip-thrust.mp4',        name: 'Barbell Hip Thrust' },

  // ── نفس الحركة بأداة أو وضع مختلف (مع سطر توضيحي) ────────
  1:  { video: '/exercises/videos/dumbbell-bench-press.mp4',      name: 'Dumbbell Bench Press',
        note: 'الفيديو بالدمبل - نفس حركة البنش بالبار' },
  2:  { video: '/exercises/videos/incline-bench-press.mp4',       name: 'Incline Bench Press',
        note: 'الفيديو بالبار على بنش مائل - نفس الحركة' },
  37: { video: '/exercises/videos/stiff-leg-deadlift.mp4',        name: 'Stiff-Leg Deadlift',
        note: 'الفيديو بساق مستقيمة - نفس فكرة الرومانيان، بس خلي ركبتك متنية شوية' },
  24: { video: '/exercises/videos/dumbbell-hammer-preacher-curl.mp4', name: 'Hammer Preacher Curl',
        note: 'الفيديو بريتشر بقبضة هامر' },
  23: { video: '/exercises/videos/dumbbell-hammer-preacher-curl.mp4', name: 'Hammer Preacher Curl',
        note: 'الفيديو على البريتشر بقبضة هامر - نفس الحركة' },
  22: { video: '/exercises/videos/incline-dumbbell-curl.mp4',     name: 'Incline Dumbbell Curl',
        note: 'الفيديو على بنش مائل - نفس الكيرل بالدمبل' },
  38: { video: '/exercises/videos/seated-leg-curl.mp4',           name: 'Seated Leg Curl',
        note: 'الفيديو جالس - نفس كيرل الهامسترينج' },
};

export function getExerciseVideo(exId) {
  return EXERCISE_VIDEOS[exId] || null;
}
