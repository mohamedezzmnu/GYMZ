// بيانات مكتبة الفيديو — namnq/workout-free-videos (CC0 1.0, public domain)
// المصدر: https://github.com/namnq/workout-free-videos — فيديوهات حقيقية 720p
// الفيديوهات نفسها متخزنة جوه المشروع في /public/exercises/videos/ (self-hosted)
// خطوات الأداء (stepsAr) مترجمة بالعامية المصرية يدويًا من الـcues الأصلية.
const VIDEO_EXERCISES = [
  {
    "id": "dumbbell-bench-press",
    "name": "Dumbbell Bench Press",
    "bodyPart": "chest",
    "target": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "dumbbell",
    "difficulty": "beginner",
    "video": "/exercises/videos/dumbbell-bench-press.mp4",
    "stepsAr": [
      "دوس من نص صدرك وخلّي معصمك فوق كوعك على طول.",
      "ثبّت لوحي كتفك لازقين في البنش طول التمرين.",
      "انزل ببطء (عدّ لثنين) واطلع بقوة من غير خبط."
    ]
  },
  {
    "id": "incline-bench-press",
    "name": "Incline Bench Press",
    "bodyPart": "chest",
    "target": "chest",
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/incline-bench-press.mp4",
    "stepsAr": [
      "ظبط البنش على زاوية 30 لـ45 درجة.",
      "نزّل البار لحد ما يلمس أعلى صدرك.",
      "ادفع البار لفوق ولورا شوية ناحية وشك."
    ]
  },
  {
    "id": "exercise-ball-dumbbell-bench-press",
    "name": "Stability Ball Dumbbell Press",
    "bodyPart": "chest",
    "target": "chest",
    "secondaryMuscles": [
      "abs",
      "triceps"
    ],
    "equipment": "dumbbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/exercise-ball-dumbbell-bench-press.mp4",
    "stepsAr": [
      "نام براسك وأعلى ضهرك على الكورة وخلّي وركيك مرفوعين مستويين.",
      "شدّ أردافك عشان جسمك يفضل مستقيم زي الكوبري.",
      "ادفع الدمبلز لفوق فوق صدرك."
    ]
  },
  {
    "id": "chest-dip",
    "name": "Chest Dip",
    "bodyPart": "chest",
    "target": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": "body weight",
    "difficulty": "intermediate",
    "video": "/exercises/videos/chest-dip.mp4",
    "stepsAr": [
      "مِل بجسمك لقدام شوية.",
      "انزل لحد ما كتفك ينزل تحت كوعك بشوية.",
      "اطلع من غير ما تفرد كوعك بعنف في الآخر."
    ]
  },
  {
    "id": "military-press",
    "name": "Overhead Press",
    "bodyPart": "shoulders",
    "target": "shoulders",
    "secondaryMuscles": [
      "triceps",
      "traps"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/military-press.mp4",
    "stepsAr": [
      "شدّ بطنك وأردافك كويس قبل كل تكرار.",
      "ادفع البار في خط مستقيم من قدام وشك.",
      "في الآخر خلّي دراعك جنب ودنك."
    ]
  },
  {
    "id": "dumbbell-lateral-raise",
    "name": "Dumbbell Lateral Raise",
    "bodyPart": "shoulders",
    "target": "shoulders",
    "secondaryMuscles": [
      "traps"
    ],
    "equipment": "dumbbell",
    "difficulty": "beginner",
    "video": "/exercises/videos/dumbbell-lateral-raise.mp4",
    "stepsAr": [
      "خلّي في كوعك ثنية خفيفة.",
      "ارفع لمستوى كتفك وقود الحركة بكوعك مش بإيدك.",
      "انزل ببطء ومن غير تأرجح."
    ]
  },
  {
    "id": "bent-over-low-pulley-rear-delt-fly",
    "name": "Cable Rear Delt Fly",
    "bodyPart": "shoulders",
    "target": "shoulders",
    "secondaryMuscles": [
      "upperBack"
    ],
    "equipment": "cable",
    "difficulty": "intermediate",
    "video": "/exercises/videos/bent-over-low-pulley-rear-delt-fly.mp4",
    "stepsAr": [
      "مِل لقدام وضهرك مستقيم.",
      "افتح إيديك على جنب في قوس واسع.",
      "وقّف لحظة لما إيدك توصل لمستوى كتفك."
    ]
  },
  {
    "id": "close-grip-bench-press",
    "name": "Close-Grip Bench Press",
    "bodyPart": "upper arms",
    "target": "triceps",
    "secondaryMuscles": [
      "chest"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/close-grip-bench-press.mp4",
    "stepsAr": [
      "خلّي إيديك بعرض كتفك.",
      "كوعك يفضل لازق في جسمك.",
      "نزّل لأسفل صدرك واطلع لفرد كامل."
    ]
  },
  {
    "id": "ez-bar-skullcrusher",
    "name": "EZ Bar Skullcrusher",
    "bodyPart": "upper arms",
    "target": "triceps",
    "secondaryMuscles": [],
    "equipment": "ez barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/ez-bar-skullcrusher.mp4",
    "stepsAr": [
      "أعلى دراعك يفضل عمودي ميتحركش.",
      "نزّل البار ناحية جبهتك.",
      "اطلع بفرد الكوع بس."
    ]
  },
  {
    "id": "weighted-tricep-dips",
    "name": "Weighted Tricep Dip",
    "bodyPart": "upper arms",
    "target": "triceps",
    "secondaryMuscles": [
      "chest"
    ],
    "equipment": "body weight",
    "difficulty": "advanced",
    "video": "/exercises/videos/weighted-tricep-dips.mp4",
    "stepsAr": [
      "خلّي جسمك واقف مستقيم.",
      "انزل لحد ما كوعك يبقى زاوية 90 درجة.",
      "ادفع لفوق وافرد التراي كامل."
    ]
  },
  {
    "id": "standing-barbell-curl",
    "name": "Standing Barbell Curl",
    "bodyPart": "upper arms",
    "target": "biceps",
    "secondaryMuscles": [
      "forearm"
    ],
    "equipment": "barbell",
    "difficulty": "beginner",
    "video": "/exercises/videos/standing-barbell-curl.mp4",
    "stepsAr": [
      "كوعك يفضل مثبت جنب جسمك.",
      "العب من غير ما تميل بجسمك لورا.",
      "انزل لآخر فرد كامل."
    ]
  },
  {
    "id": "incline-dumbbell-curl",
    "name": "Incline Dumbbell Curl",
    "bodyPart": "upper arms",
    "target": "biceps",
    "secondaryMuscles": [],
    "equipment": "dumbbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/incline-dumbbell-curl.mp4",
    "stepsAr": [
      "سيب دراعك يتدلى مستقيم ورا جسمك.",
      "العب وكوعك ثابت مكانه.",
      "اعصر العضلة فوق وانزل ببطء."
    ]
  },
  {
    "id": "dumbbell-hammer-preacher-curl",
    "name": "Hammer Preacher Curl",
    "bodyPart": "upper arms",
    "target": "biceps",
    "secondaryMuscles": [
      "forearm"
    ],
    "equipment": "dumbbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/dumbbell-hammer-preacher-curl.mp4",
    "stepsAr": [
      "امسك قبضة هامر (إبهامك لفوق).",
      "خلّي إبطك لازق في المسند.",
      "وقّف قبل ما الدمبل يبقى عمودي بشوية."
    ]
  },
  {
    "id": "seated-barbell-wrist-curl",
    "name": "Seated Wrist Curl",
    "bodyPart": "upper arms",
    "target": "forearm",
    "secondaryMuscles": [],
    "equipment": "barbell",
    "difficulty": "beginner",
    "video": "/exercises/videos/seated-barbell-wrist-curl.mp4",
    "stepsAr": [
      "ساعدك على فخدك وكفك لفوق.",
      "سيب البار ينزل لحد أطراف صوابعك.",
      "لف معصمك لفوق واعصر."
    ]
  },
  {
    "id": "reverse-grip-barbell-curl",
    "name": "Reverse-Grip EZ Curl",
    "bodyPart": "upper arms",
    "target": "forearm",
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": "ez barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/reverse-grip-barbell-curl.mp4",
    "stepsAr": [
      "امسك قبضة عكسية على الجزء المائل من البار.",
      "خلّي معصمك مستقيم وانت بتلف.",
      "انزل بتحكم."
    ]
  },
  {
    "id": "plate-pinch-carry",
    "name": "Plate Pinch Carry",
    "bodyPart": "upper arms",
    "target": "forearm",
    "secondaryMuscles": [
      "traps"
    ],
    "equipment": "weighted",
    "difficulty": "beginner",
    "video": "/exercises/videos/plate-pinch-carry.mp4",
    "stepsAr": [
      "اعصر بلاطتين والوجه الناعم لبره.",
      "امشي منتصب بخطوات قصيرة.",
      "حطهم قبل ما قبضتك تفلت."
    ]
  },
  {
    "id": "barbell-shrug",
    "name": "Barbell Shrug",
    "bodyPart": "back",
    "target": "traps",
    "secondaryMuscles": [],
    "equipment": "barbell",
    "difficulty": "beginner",
    "video": "/exercises/videos/barbell-shrug.mp4",
    "stepsAr": [
      "قف مستقيم ودراعك مفرود.",
      "ارفع كتفك ناحية ودنك.",
      "اثبت ثانية، ومتدوّرش كتفك."
    ]
  },
  {
    "id": "dumbbell-shrug",
    "name": "Dumbbell Shrug",
    "bodyPart": "back",
    "target": "traps",
    "secondaryMuscles": [],
    "equipment": "dumbbell",
    "difficulty": "beginner",
    "video": "/exercises/videos/dumbbell-shrug.mp4",
    "stepsAr": [
      "الدمبلز على جنبك بقبضة عادية.",
      "ارفع كتفك مستقيم لفوق.",
      "انزل لأقصى مَد."
    ]
  },
  {
    "id": "barbell-upright-row",
    "name": "Barbell Upright Row",
    "bodyPart": "back",
    "target": "traps",
    "secondaryMuscles": [
      "shoulders"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/barbell-upright-row.mp4",
    "stepsAr": [
      "امسك أوسع من كتفك بشوية.",
      "اسحب البار لفوق وقود بكوعك.",
      "وقّف عند مستوى أسفل صدرك."
    ]
  },
  {
    "id": "seated-cable-row",
    "name": "Seated Cable Row",
    "bodyPart": "back",
    "target": "upperBack",
    "secondaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": "cable",
    "difficulty": "beginner",
    "video": "/exercises/videos/seated-cable-row.mp4",
    "stepsAr": [
      "اقعد منتصب وركبتك متنية شوية.",
      "اسحب المقبض لحد ضلوعك التحتانية.",
      "في الرجوع سيب لوحي كتفك يمشوا لقدام."
    ]
  },
  {
    "id": "machine-t-bar-row",
    "name": "Chest-Supported T-Bar Row",
    "bodyPart": "back",
    "target": "upperBack",
    "secondaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/machine-t-bar-row.mp4",
    "stepsAr": [
      "صدرك يفضل ملزوق في المسند.",
      "شدّ كوعك لورا ورا جسمك.",
      "وقّف واعصر لوحي كتفك في بعض."
    ]
  },
  {
    "id": "bent-over-row",
    "name": "Barbell Bent-Over Row",
    "bodyPart": "back",
    "target": "upperBack",
    "secondaryMuscles": [
      "lats",
      "lowerBack"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/bent-over-row.mp4",
    "stepsAr": [
      "مِل لحد حوالي 45 درجة وضهرك مستقيم.",
      "اسحب البار لحد سرتك.",
      "انزل من غير ما تفقد وضعك."
    ]
  },
  {
    "id": "lat-pull-down",
    "name": "Lat Pulldown",
    "bodyPart": "back",
    "target": "lats",
    "secondaryMuscles": [
      "biceps",
      "upperBack"
    ],
    "equipment": "cable",
    "difficulty": "beginner",
    "video": "/exercises/videos/lat-pull-down.mp4",
    "stepsAr": [
      "امسك أوسع من كتفك بشوية.",
      "اسحب البار لأعلى صدرك.",
      "اتحكم في البار وهو طالع لفوق."
    ]
  },
  {
    "id": "wide-grip-pull-up",
    "name": "Wide-Grip Pull-Up",
    "bodyPart": "back",
    "target": "lats",
    "secondaryMuscles": [
      "biceps",
      "upperBack"
    ],
    "equipment": "body weight",
    "difficulty": "intermediate",
    "video": "/exercises/videos/wide-grip-pull-up.mp4",
    "stepsAr": [
      "ابدأ من تعلّق كامل ودراعك مفرود.",
      "اسحب صدرك ناحية البار.",
      "انزل لآخر فرد في كل تكرار."
    ]
  },
  {
    "id": "straight-arm-lat-pull-down",
    "name": "Straight-Arm Pulldown",
    "bodyPart": "back",
    "target": "lats",
    "secondaryMuscles": [],
    "equipment": "cable",
    "difficulty": "intermediate",
    "video": "/exercises/videos/straight-arm-lat-pull-down.mp4",
    "stepsAr": [
      "دراعك شبه مفرود ومالك شوية لقدام.",
      "نزّل البار في قوس لحد فخدك.",
      "حسّ باللاتس مش بالتراي."
    ]
  },
  {
    "id": "superman",
    "name": "Superman",
    "bodyPart": "back",
    "target": "lowerBack",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/superman.mp4",
    "stepsAr": [
      "نام على بطنك ومد إيديك قدامك.",
      "ارفع إيديك ورجليك مع بعض.",
      "اثبت ثانيتين فوق."
    ]
  },
  {
    "id": "sit-up",
    "name": "Sit-Up",
    "bodyPart": "waist",
    "target": "abs",
    "secondaryMuscles": [],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/sit-up.mp4",
    "stepsAr": [
      "ثبّت رجليك وركبتك متنية.",
      "اطلع فقرة فقرة.",
      "انزل ببطء لحد الأرض."
    ]
  },
  {
    "id": "lying-floor-leg-raise",
    "name": "Lying Leg Raise",
    "bodyPart": "waist",
    "target": "abs",
    "secondaryMuscles": [
      "hipFlexors"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/lying-floor-leg-raise.mp4",
    "stepsAr": [
      "اضغط أسفل ضهرك في الأرض.",
      "ارفع رجليك مفرودة لحد العمودي.",
      "انزل لحد فوق الأرض بشوية من غير ما تلمسها."
    ]
  },
  {
    "id": "weighted-crunch",
    "name": "Weighted Plate Crunch",
    "bodyPart": "waist",
    "target": "abs",
    "secondaryMuscles": [],
    "equipment": "weighted",
    "difficulty": "intermediate",
    "video": "/exercises/videos/weighted-crunch.mp4",
    "stepsAr": [
      "امسك البلاطة فوق صدرك.",
      "قريّب ضلوعك من حوضك.",
      "ازفر بقوة وانت فوق."
    ]
  },
  {
    "id": "tall-kneeling-cable-lift",
    "name": "Kneeling Cable Lift",
    "bodyPart": "waist",
    "target": "obliques",
    "secondaryMuscles": [
      "abs"
    ],
    "equipment": "cable",
    "difficulty": "beginner",
    "video": "/exercises/videos/tall-kneeling-cable-lift.mp4",
    "stepsAr": [
      "اركع منتصب وحوضك متربع.",
      "ارفع الحبل قطري جنب جسمك.",
      "قاوم اللفة وانت راجع."
    ]
  },
  {
    "id": "tall-kneeling-cable-chop",
    "name": "Kneeling Cable Chop",
    "bodyPart": "waist",
    "target": "obliques",
    "secondaryMuscles": [
      "abs"
    ],
    "equipment": "cable",
    "difficulty": "intermediate",
    "video": "/exercises/videos/tall-kneeling-cable-chop.mp4",
    "stepsAr": [
      "ابدأ من فوق على جنب واحد.",
      "انزل قاطع جسمك للجنب التاني.",
      "خلّي حوضك باصص لقدام."
    ]
  },
  {
    "id": "split-stance-cable-lift",
    "name": "Split-Stance Cable Lift",
    "bodyPart": "waist",
    "target": "obliques",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "cable",
    "difficulty": "intermediate",
    "video": "/exercises/videos/split-stance-cable-lift.mp4",
    "stepsAr": [
      "قفة مفتوحة ضيقة.",
      "ارفع من تحت لفوق قطري جنب جسمك.",
      "ثبّت وزنك على رجلك الأمامية."
    ]
  },
  {
    "id": "barbell-hip-thrust",
    "name": "Barbell Hip Thrust",
    "bodyPart": "hips",
    "target": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/barbell-hip-thrust.mp4",
    "stepsAr": [
      "أعلى ضهرك على حرف البنش والبار فوق حوضك.",
      "ادفع من كعبك لفرد ورك كامل.",
      "دقنك في صدرك وضلوعك لتحت وانت فوق."
    ]
  },
  {
    "id": "hyperextension",
    "name": "Back Extension",
    "bodyPart": "hips",
    "target": "glutes",
    "secondaryMuscles": [
      "hamstrings",
      "lowerBack"
    ],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/hyperextension.mp4",
    "stepsAr": [
      "المسند تحت خط الحوض بشوية.",
      "انزل بميلان وضهرك مستقيم.",
      "اطلع لحد ما جسمك يبقى خط واحد مستقيم."
    ]
  },
  {
    "id": "good-mornings",
    "name": "Good Morning",
    "bodyPart": "hips",
    "target": "glutes",
    "secondaryMuscles": [
      "hamstrings",
      "lowerBack"
    ],
    "equipment": "barbell",
    "difficulty": "advanced",
    "video": "/exercises/videos/good-mornings.mp4",
    "stepsAr": [
      "البار على أعلى ضهرك وركبتك مرنة.",
      "ادفع وركيك لورا لحد ما جسمك يقرب يوازي الأرض.",
      "قوم بعصر الأرداف."
    ]
  },
  {
    "id": "barbell-back-squat",
    "name": "Barbell Back Squat",
    "bodyPart": "upper legs",
    "target": "quads",
    "secondaryMuscles": [
      "glutes",
      "adductors"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/barbell-back-squat.mp4",
    "stepsAr": [
      "خد نفسك وشدّ جسمك قبل ما تنزل.",
      "ركبتك تتبع اتجاه صوابع رجلك.",
      "ادفع لفوق من رجلك كلها."
    ]
  },
  {
    "id": "leg-press",
    "name": "Leg Press",
    "bodyPart": "upper legs",
    "target": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/leg-press.mp4",
    "stepsAr": [
      "رجلك بعرض كتفك في نص المنصة.",
      "انزل لحد ما ركبتك توصل 90 درجة.",
      "متفردش ركبتك بالكامل فوق."
    ]
  },
  {
    "id": "machine-hack-squat",
    "name": "Hack Squat",
    "bodyPart": "upper legs",
    "target": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "machine",
    "difficulty": "intermediate",
    "video": "/exercises/videos/machine-hack-squat.mp4",
    "stepsAr": [
      "ضهرك ملزوق في المسند.",
      "انزل عميق بتحكم.",
      "ادفع من نص رجلك."
    ]
  },
  {
    "id": "exercise-ball-wall-squat",
    "name": "Stability Ball Wall Squat",
    "bodyPart": "upper legs",
    "target": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "stability ball",
    "difficulty": "beginner",
    "video": "/exercises/videos/exercise-ball-wall-squat.mp4",
    "stepsAr": [
      "الكورة بين أسفل ضهرك والحيطة.",
      "انزل والكورة بتلف معاك.",
      "قف منتصب واعصر أردافك."
    ]
  },
  {
    "id": "stiff-leg-deadlift",
    "name": "Stiff-Leg Deadlift",
    "bodyPart": "upper legs",
    "target": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "lowerBack"
    ],
    "equipment": "barbell",
    "difficulty": "intermediate",
    "video": "/exercises/videos/stiff-leg-deadlift.mp4",
    "stepsAr": [
      "ركبتك مرنة والبار قريب من رجلك.",
      "انزل بميلان لحد ما تحس بمط قوي في الهامسترينج.",
      "ارجع بدفع وركيك لقدام."
    ]
  },
  {
    "id": "seated-leg-curl",
    "name": "Seated Leg Curl",
    "bodyPart": "upper legs",
    "target": "hamstrings",
    "secondaryMuscles": [],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/seated-leg-curl.mp4",
    "stepsAr": [
      "خلّي ركبتك على محور الماشين بالظبط.",
      "اسحب المسند تحت المقعد.",
      "ارجع ببطء وخلّي الشد شغال."
    ]
  },
  {
    "id": "exercise-ball-leg-curl",
    "name": "Stability Ball Leg Curl",
    "bodyPart": "upper legs",
    "target": "hamstrings",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "stability ball",
    "difficulty": "beginner",
    "video": "/exercises/videos/exercise-ball-leg-curl.mp4",
    "stepsAr": [
      "كعبك على الكورة ووركيك مرفوعين.",
      "لف الكورة ناحية أردافك.",
      "خلّي وركيك مرفوعين طول الوقت."
    ]
  },
  {
    "id": "nordic-hamstring-curl",
    "name": "Nordic Hamstring Curl",
    "bodyPart": "upper legs",
    "target": "hamstrings",
    "secondaryMuscles": [],
    "equipment": "body weight",
    "difficulty": "advanced",
    "video": "/exercises/videos/nordic-hamstring-curl.mp4",
    "stepsAr": [
      "اركع وكاحلك مثبت.",
      "انزل بجسمك لقدام بأبطأ ما تقدر.",
      "استقبل بإيدك وادفع بيهم ترجع."
    ]
  },
  {
    "id": "standing-machine-calf-raise",
    "name": "Standing Calf Raise",
    "bodyPart": "upper legs",
    "target": "calves",
    "secondaryMuscles": [],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/standing-machine-calf-raise.mp4",
    "stepsAr": [
      "مشط رجلك على الحرف.",
      "ارفع كعبك لأعلى ما تقدر.",
      "انزل لمط كامل."
    ]
  },
  {
    "id": "seated-calf-raise",
    "name": "Seated Calf Raise",
    "bodyPart": "upper legs",
    "target": "calves",
    "secondaryMuscles": [],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/seated-calf-raise.mp4",
    "stepsAr": [
      "المسند مظبوط فوق ركبتك.",
      "ادفع لفوق من إبهام رجلك.",
      "اثبت لحظة في المط تحت."
    ]
  },
  {
    "id": "45-degree-leg-press-calf-raise",
    "name": "Leg Press Calf Raise",
    "bodyPart": "upper legs",
    "target": "calves",
    "secondaryMuscles": [],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/45-degree-leg-press-calf-raise.mp4",
    "stepsAr": [
      "مشط رجلك بس على المنصة.",
      "ركبتك مستقيمة بس مش مقفولة.",
      "مدى كامل وإيقاع بطيء."
    ]
  },
  {
    "id": "hip-adduction-machine",
    "name": "Hip Adduction Machine",
    "bodyPart": "hips",
    "target": "adductors",
    "secondaryMuscles": [],
    "equipment": "machine",
    "difficulty": "beginner",
    "video": "/exercises/videos/hip-adduction-machine.mp4",
    "stepsAr": [
      "اقعد منتصب ملزوق في المسند.",
      "اضم رجليك على بعض بقوة.",
      "افتح ببطء لمط مريح."
    ]
  },
  {
    "id": "alternating-lateral-lunge-with-overhead-reach",
    "name": "Lateral Lunge with Reach",
    "bodyPart": "recovery",
    "target": "adductors",
    "secondaryMuscles": [
      "glutes",
      "quads"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/alternating-lateral-lunge-with-overhead-reach.mp4",
    "stepsAr": [
      "اخط خطوة واسعة وانزل على ورك واحد.",
      "مد إيديك الاتنين فوق راسك.",
      "بدّل بين الجنبين بتحكم."
    ]
  },
  {
    "id": "deep-squat-prying",
    "name": "Deep Squat Pry",
    "bodyPart": "recovery",
    "target": "adductors",
    "secondaryMuscles": [
      "hipFlexors"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/deep-squat-prying.mp4",
    "stepsAr": [
      "انزل في سكوات عميق وكعبك في الأرض.",
      "استخدم كوعك تدوس ركبتك لبره.",
      "اتحرك يمين وشمال ببطء."
    ]
  },
  {
    "id": "cable-hip-abduction",
    "name": "Cable Hip Abduction",
    "bodyPart": "hips",
    "target": "abductors",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "cable",
    "difficulty": "beginner",
    "video": "/exercises/videos/cable-hip-abduction.mp4",
    "stepsAr": [
      "الكف على الكاحل الخارجي.",
      "افتح رجلك لبره من غير ما تميل بجسمك.",
      "ارجع في ثانيتين."
    ]
  },
  {
    "id": "cradle-walk",
    "name": "Cradle Walk",
    "bodyPart": "recovery",
    "target": "hipFlexors",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/cradle-walk.mp4",
    "stepsAr": [
      "ارفع ساقك وحضنها ناحية صدرك.",
      "ارتفع على مشط رجلك التانية.",
      "اخط لقدام وبدّل."
    ]
  },
  {
    "id": "fire-hydrant-circles",
    "name": "Fire Hydrant Circles",
    "bodyPart": "recovery",
    "target": "hipFlexors",
    "secondaryMuscles": [
      "abductors"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/fire-hydrant-circles.mp4",
    "stepsAr": [
      "إيدك تحت كتفك وركبتك تحت حوضك.",
      "ارسم دواير كبيرة بركبتك.",
      "خلّي جسمك ثابت ميتحركش."
    ]
  },
  {
    "id": "kneeling-posterior-hip-capsule-mobilization",
    "name": "Kneeling Hip Capsule Mobilization",
    "bodyPart": "recovery",
    "target": "hipFlexors",
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": "body weight",
    "difficulty": "beginner",
    "video": "/exercises/videos/kneeling-posterior-hip-capsule-mobilization.mp4",
    "stepsAr": [
      "اركع ورجل متعكشة وراك.",
      "حرك وركيك لورا وللجنب.",
      "اتنفس جوا المط."
    ]
  },
  {
    "id": "it-band-foam-rolling",
    "name": "IT Band Foam Rolling",
    "bodyPart": "recovery",
    "target": "itBand",
    "secondaryMuscles": [
      "quads"
    ],
    "equipment": "foam roll",
    "difficulty": "beginner",
    "video": "/exercises/videos/it-band-foam-rolling.mp4",
    "stepsAr": [
      "نام على جنبك فوق الرولر.",
      "لِف من الحوض لحد فوق الركبة بشوية.",
      "وقّف على النقط المشدودة وخد نفس."
    ]
  },
  {
    "id": "plantar-fascia-lacrosse-ball",
    "name": "Plantar Fascia Release",
    "bodyPart": "recovery",
    "target": "plantar",
    "secondaryMuscles": [],
    "equipment": "other",
    "difficulty": "beginner",
    "video": "/exercises/videos/plantar-fascia-lacrosse-ball.mp4",
    "stepsAr": [
      "قف وحط الكورة تحت قوس قدمك.",
      "لِف من الكعب للصوابع بضغط خفيف.",
      "اقعد وقت زيادة على النقط الموجعة."
    ]
  },
  {
    "id": "palmar-fascia-lacrosse-ball",
    "name": "Palm Release",
    "bodyPart": "recovery",
    "target": "palmar",
    "secondaryMuscles": [
      "forearm"
    ],
    "equipment": "other",
    "difficulty": "beginner",
    "video": "/exercises/videos/palmar-fascia-lacrosse-ball.mp4",
    "stepsAr": [
      "ثبّت الكورة تحت كفك على ترابيزة.",
      "لِف دواير صغيرة.",
      "افتح واقفل صوابعك وانت بتلف."
    ]
  },
  {
    "id": "neck-tiger-tail",
    "name": "Neck Release",
    "bodyPart": "recovery",
    "target": "neck",
    "secondaryMuscles": [
      "traps"
    ],
    "equipment": "foam roll",
    "difficulty": "beginner",
    "video": "/exercises/videos/neck-tiger-tail.mp4",
    "stepsAr": [
      "مرر العصاية على جنب رقبتك.",
      "ضغط خفيف بس.",
      "لف راسك ببطء وانت بتمرر."
    ]
  }
];

export default VIDEO_EXERCISES;
