import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Users, Target, Zap, CheckCircle2 } from 'lucide-react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

// ══════════════════════════════════════════
// بيانات البرامج
// ══════════════════════════════════════════
const PROGRAMS = [
  {
    id: 1,
    tag: 'FULL BODY',
    title: 'الجسم الكامل',
    subtitle: 'Full Body',
    days: '3 أيام أسبوعياً',
    level: 'مبتدئ',
    levelColor: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', text: '#4ade80' },
    accentColor: '#4ade80',
    icon: '💪',
    suitable: 'للمبتدئين أو اللي عندهم وقت محدود',
    schedule: 'السبت، الإثنين، الأربعاء',
    description: 'لو لسه بادئ، البرنامج ده هيبني جسمك كله ويعلمك الأساسيات.',
    days_detail: [
      {
        day: 'اليوم الأول',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Squat', detail: '3 سيتات × 8 رباعات', exId: 35 },
          { name: 'Bench Press', detail: '3 سيتات × 8 رباعات', exId: 1 },
          { name: 'Lat Pulldown', detail: '3 سيتات × 10 رباعات', exId: 10 },
          { name: 'Shoulder Press', detail: '3 سيتات × 10 رباعات', exId: 15 },
          { name: 'Cable Curl', detail: '3 سيتات × 12 رباعة', exId: 26 },
          { name: 'Triceps Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'اليوم الثاني',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Romanian Deadlift', detail: '3 سيتات × 8 رباعات', exId: 37 },
          { name: 'Incline DB Press', detail: '3 سيتات × 10 رباعات', exId: 2 },
          { name: 'Seated Row', detail: '3 سيتات × 10 رباعات', exId: 11 },
          { name: 'Leg Press', detail: '3 سيتات × 12 رباعة', exId: 36 },
          { name: 'Lateral Raise', detail: '3 سيتات × 15 رباعة', exId: 16 },
          { name: 'Hammer Curl', detail: '3 سيتات × 12 رباعة', exId: 23 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'اليوم الثالث',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Deadlift', detail: '3 سيتات × 5 رباعات', exId: 7 },
          { name: 'Chest Press Machine', detail: '3 سيتات × 10 رباعات', exId: null },
          { name: 'Pull Ups', detail: '3 سيتات × بقصاك', exId: 8 },
          { name: 'Bulgarian Split Squat', detail: '3 سيتات × 10 رباعات', exId: 41 },
          { name: 'Face Pull', detail: '3 سيتات × 15 رباعة', exId: 13 },
          { name: 'Rope Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
    ],
  },
  {
    id: 2,
    tag: 'UPPER / LOWER',
    title: 'علوي / سفلي',
    subtitle: 'Upper / Lower',
    days: '4 أيام أسبوعياً',
    level: 'جميع المستويات',
    levelColor: { bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.3)', text: '#FFFFFF' },
    accentColor: '#FFFFFF',
    icon: '⚖️',
    suitable: 'ممتاز لكل المستويات وللموازنة بين البناء والراحة',
    schedule: 'الإثنين، الثلاثاء، الخميس، الجمعة',
    description: 'برنامج ممتاز لو عاوز تضخيم مع استشفاء كويس.',
    days_detail: [
      {
        day: 'Upper 1',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Bench Press', detail: '4 سيتات × 8 رباعات', exId: 1 },
          { name: 'Barbell Row', detail: '4 سيتات × 8 رباعات', exId: 9 },
          { name: 'Incline DB Press', detail: '3 سيتات × 10 رباعات', exId: 2 },
          { name: 'Lat Pulldown', detail: '3 سيتات × 10 رباعات', exId: 10 },
          { name: 'Lateral Raise', detail: '3 سيتات × 15 رباعة', exId: 16 },
          { name: 'Triceps Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Cable Curl', detail: '3 سيتات × 12 رباعة', exId: 26 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Lower 1',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Squat', detail: '4 سيتات × 8 رباعات', exId: 35 },
          { name: 'Romanian Deadlift', detail: '3 سيتات × 10 رباعات', exId: 37 },
          { name: 'Leg Press', detail: '3 سيتات × 12 رباعة', exId: 36 },
          { name: 'Leg Curl', detail: '3 سيتات × 12 رباعة', exId: 38 },
          { name: 'Standing Calf Raise', detail: '4 سيتات × 20 رباعة', exId: 56 },
          { name: 'Hanging Leg Raise', detail: '3 سيتات × 15 رباعة', exId: 50 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Upper 2',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Incline Bench Press', detail: '4 سيتات × 8 رباعات', exId: 2 },
          { name: 'Seated Cable Row', detail: '3 سيتات × 10 رباعات', exId: 11 },
          { name: 'Shoulder Press', detail: '3 سيتات × 10 رباعات', exId: 15 },
          { name: 'Pull Ups', detail: '3 سيتات × بقصاك', exId: 8 },
          { name: 'Face Pull', detail: '3 سيتات × 15 رباعة', exId: 13 },
          { name: 'Hammer Curl', detail: '3 سيتات × 12 رباعة', exId: 23 },
          { name: 'Skull Crushers', detail: '3 سيتات × 12 رباعة', exId: 30 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Lower 2',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو خفيف + تمدد مفاصل', exId: null },
          { name: 'Deadlift', detail: '4 سيتات × 5 رباعات', exId: 7 },
          { name: 'Bulgarian Split Squat', detail: '3 سيتات × 10 رباعات', exId: 41 },
          { name: 'Leg Extension', detail: '3 سيتات × 15 رباعة', exId: 39 },
          { name: 'Leg Curl', detail: '3 سيتات × 12 رباعة', exId: 38 },
          { name: 'Seated Calf Raise', detail: '4 سيتات × 20 رباعة', exId: 57 },
          { name: 'Cable Crunch', detail: '3 سيتات × 15 رباعة', exId: 51 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
    ],
  },
  {
    id: 3,
    tag: 'PPL',
    title: 'دفع / سحب / أرجل',
    subtitle: 'Push / Pull / Legs',
    days: '6 أيام أسبوعياً',
    level: 'متوسط — متقدم',
    levelColor: { bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', text: '#facc15' },
    accentColor: '#facc15',
    icon: '🔥',
    suitable: 'للمستويات المتوسطة والمتقدمة',
    schedule: '6 أيام في الأسبوع',
    description: 'من أقوى برامج التضخيم، كل عضلة بتتمرن مرتين في الأسبوع.',
    days_detail: [
      {
        day: 'Push A (صدر - كتف - تراي)',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + إطالة للكتف والصدر', exId: null },
          { name: 'Bench Press', detail: '4 سيتات × 6-8 رباعات', exId: 1 },
          { name: 'Incline Dumbbell Press', detail: '3 سيتات × 10 رباعات', exId: 2 },
          { name: 'Chest Press Machine', detail: '3 سيتات × 12 رباعة', exId: null },
          { name: 'Shoulder Press', detail: '3 سيتات × 10 رباعات', exId: 15 },
          { name: 'Lateral Raise', detail: '3 سيتات × 15 رباعة', exId: 16 },
          { name: 'Triceps Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Overhead Extension', detail: '3 سيتات × 12 رباعة', exId: 32 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Pull A (ظهر - باي)',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + إطالة للظهر والكتف', exId: null },
          { name: 'Deadlift', detail: '4 سيتات × 5 رباعات', exId: 7 },
          { name: 'Pull Ups', detail: '4 سيتات × بقصاك', exId: 8 },
          { name: 'Barbell Row', detail: '3 سيتات × 8 رباعات', exId: 9 },
          { name: 'Lat Pulldown', detail: '3 سيتات × 12 رباعة', exId: 10 },
          { name: 'Face Pull', detail: '3 سيتات × 15 رباعة', exId: 13 },
          { name: 'Barbell Curl', detail: '3 سيتات × 10 رباعات', exId: 21 },
          { name: 'Hammer Curl', detail: '3 سيتات × 12 رباعة', exId: 23 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Legs A',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + فرد الركبة والورك', exId: null },
          { name: 'Squat', detail: '4 سيتات × 6-8 رباعات', exId: 35 },
          { name: 'Leg Press', detail: '3 سيتات × 12 رباعة', exId: 36 },
          { name: 'Romanian Deadlift', detail: '3 سيتات × 10 رباعات', exId: 37 },
          { name: 'Leg Extension', detail: '3 سيتات × 15 رباعة', exId: 39 },
          { name: 'Leg Curl', detail: '3 سيتات × 12 رباعة', exId: 38 },
          { name: 'Standing Calf Raise', detail: '4 سيتات × 20 رباعة', exId: 56 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للأرجل', exId: null },
        ],
      },
      {
        day: 'Push B',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + إطالة للكتف والصدر', exId: null },
          { name: 'Incline Bench Press', detail: '4 سيتات × 8 رباعات', exId: 2 },
          { name: 'Chest Dips', detail: '3 سيتات × 10 رباعات', exId: 6 },
          { name: 'Pec Deck Fly', detail: '3 سيتات × 15 رباعة', exId: null },
          { name: 'Arnold Press', detail: '3 سيتات × 10 رباعات', exId: 19 },
          { name: 'Cable Lateral Raise', detail: '3 سيتات × 15 رباعة', exId: 16 },
          { name: 'Skull Crushers', detail: '3 سيتات × 10 رباعات', exId: 30 },
          { name: 'Rope Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Pull B',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + إطالة للظهر والكتف', exId: null },
          { name: 'Chest Supported Row', detail: '3 سيتات × 10 رباعات', exId: null },
          { name: 'Close Grip Pulldown', detail: '3 سيتات × 12 رباعة', exId: 10 },
          { name: 'Seated Cable Row', detail: '3 سيتات × 12 رباعة', exId: 11 },
          { name: 'Rear Delt Fly', detail: '3 سيتات × 15 رباعة', exId: 18 },
          { name: 'EZ Bar Curl', detail: '3 سيتات × 10 رباعات', exId: 21 },
          { name: 'Preacher Curl', detail: '3 سيتات × 12 رباعة', exId: 24 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Legs B',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + فرد الركبة والورك', exId: null },
          { name: 'Front Squat', detail: '3 سيتات × 8 رباعات', exId: 43 },
          { name: 'Hack Squat', detail: '3 سيتات × 10 رباعات', exId: 42 },
          { name: 'Bulgarian Split Squat', detail: '3 سيتات × 10 رباعات', exId: 41 },
          { name: 'Seated Leg Curl', detail: '3 سيتات × 12 رباعة', exId: 38 },
          { name: 'Calf Raise', detail: '4 سيتات × 20 رباعة', exId: 56 },
          { name: 'Abs Circuit', detail: '3 سيتات', exId: null },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للأرجل', exId: null },
        ],
      },
    ],
  },
  {
    id: 4,
    tag: 'ARNOLD SPLIT',
    title: 'نظام أرنولد',
    subtitle: 'Arnold Split',
    days: '6 أيام أسبوعياً',
    level: 'متوسط — متقدم',
    levelColor: { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
    accentColor: '#a78bfa',
    icon: '👑',
    suitable: 'لمحبي التقسيم الكلاسيكي وزيادة الحجم العضلي',
    schedule: 'الإثنين والخميس صدر وظهر — الثلاثاء والجمعة أكتاف وذراعين — الأربعاء والسبت أرجل',
    description: 'نظام أرنولد الكلاسيكي لزيادة الحجم العضلي.',
    days_detail: [
      {
        day: 'Chest + Back',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + تمدد للصدر والظهر', exId: null },
          { name: 'Bench Press', detail: '4 سيتات × 8 رباعات', exId: 1 },
          { name: 'Incline DB Press', detail: '3 سيتات × 10 رباعات', exId: 2 },
          { name: 'Pull Ups', detail: '4 سيتات × بقصاك', exId: 8 },
          { name: 'Barbell Row', detail: '3 سيتات × 8 رباعات', exId: 9 },
          { name: 'Lat Pulldown', detail: '3 سيتات × 12 رباعة', exId: 10 },
          { name: 'Seated Row', detail: '3 سيتات × 12 رباعة', exId: 11 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Shoulders + Arms',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + تمدد للكتف والذراعين', exId: null },
          { name: 'Shoulder Press', detail: '4 سيتات × 8 رباعات', exId: 15 },
          { name: 'Lateral Raise', detail: '3 سيتات × 15 رباعة', exId: 16 },
          { name: 'Rear Delt Fly', detail: '3 سيتات × 15 رباعة', exId: 18 },
          { name: 'Barbell Curl', detail: '3 سيتات × 10 رباعات', exId: 21 },
          { name: 'Hammer Curl', detail: '3 سيتات × 12 رباعة', exId: 23 },
          { name: 'Skull Crushers', detail: '3 سيتات × 10 رباعات', exId: 30 },
          { name: 'Rope Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد وإطالات', exId: null },
        ],
      },
      {
        day: 'Legs',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + فرد الركبة والورك', exId: null },
          { name: 'Squat', detail: '4 سيتات × 8 رباعات', exId: 35 },
          { name: 'Leg Press', detail: '3 سيتات × 12 رباعة', exId: 36 },
          { name: 'Romanian Deadlift', detail: '3 سيتات × 10 رباعات', exId: 37 },
          { name: 'Leg Extension', detail: '3 سيتات × 15 رباعة', exId: 39 },
          { name: 'Leg Curl', detail: '3 سيتات × 12 رباعة', exId: 38 },
          { name: 'Calf Raise', detail: '4 سيتات × 20 رباعة', exId: 56 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للأرجل', exId: null },
        ],
      },
    ],
  },
  {
    id: 5,
    tag: 'BRO SPLIT',
    title: 'عضلة في اليوم',
    subtitle: 'Bro Split',
    days: '5 أيام أسبوعياً',
    level: 'متقدم',
    levelColor: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
    accentColor: '#f87171',
    icon: '🏆',
    suitable: 'لو بتحب تركز جامد على عضلة واحدة في اليوم',
    schedule: 'الإثنين للجمعة — يوم كامل لكل عضلة',
    description: 'لو بتحب تركز جامد على عضلة واحدة في اليوم.',
    days_detail: [
      {
        day: 'Day 1 - Chest',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + تمدد الصدر والكتف', exId: null },
          { name: 'Bench Press', detail: '4 سيتات × 8 رباعات', exId: 1 },
          { name: 'Incline DB Press', detail: '3 سيتات × 10 رباعات', exId: 2 },
          { name: 'Chest Fly', detail: '3 سيتات × 15 رباعة', exId: 5 },
          { name: 'Dips', detail: '3 سيتات × 12 رباعة', exId: 6 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للصدر', exId: null },
        ],
      },
      {
        day: 'Day 2 - Back',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + تمدد الظهر والكتف', exId: null },
          { name: 'Deadlift', detail: '4 سيتات × 5 رباعات', exId: 7 },
          { name: 'Pull Ups', detail: '4 سيتات × بقصاك', exId: 8 },
          { name: 'Barbell Row', detail: '3 سيتات × 8 رباعات', exId: 9 },
          { name: 'Lat Pulldown', detail: '3 سيتات × 12 رباعة', exId: 10 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للظهر', exId: null },
        ],
      },
      {
        day: 'Day 3 - Shoulders',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + تمدد الكتف والعنق', exId: null },
          { name: 'Shoulder Press', detail: '4 سيتات × 8 رباعات', exId: 15 },
          { name: 'Lateral Raise', detail: '3 سيتات × 15 رباعة', exId: 16 },
          { name: 'Rear Delt Fly', detail: '3 سيتات × 15 رباعة', exId: 18 },
          { name: 'Upright Row', detail: '3 سيتات × 12 رباعة', exId: 20 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للكتف', exId: null },
        ],
      },
      {
        day: 'Day 4 - Arms',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + تمدد الكوع والمعصم', exId: null },
          { name: 'Barbell Curl', detail: '3 سيتات × 10 رباعات', exId: 21 },
          { name: 'Hammer Curl', detail: '3 سيتات × 12 رباعة', exId: 23 },
          { name: 'Preacher Curl', detail: '3 سيتات × 12 رباعة', exId: 24 },
          { name: 'Skull Crushers', detail: '3 سيتات × 10 رباعات', exId: 30 },
          { name: 'Rope Pushdown', detail: '3 سيتات × 12 رباعة', exId: 31 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للذراعين', exId: null },
        ],
      },
      {
        day: 'Day 5 - Legs',
        exercises: [
          { name: 'Warm-up', detail: '10 دقايق كارديو + فرد الركبة والورك', exId: null },
          { name: 'Squat', detail: '4 سيتات × 8 رباعات', exId: 35 },
          { name: 'Leg Press', detail: '3 سيتات × 12 رباعة', exId: 36 },
          { name: 'Romanian Deadlift', detail: '3 سيتات × 10 رباعات', exId: 37 },
          { name: 'Leg Extension', detail: '3 سيتات × 15 رباعة', exId: 39 },
          { name: 'Leg Curl', detail: '3 سيتات × 12 رباعة', exId: 38 },
          { name: 'Calf Raise', detail: '4 سيتات × 20 رباعة', exId: 56 },
          { name: 'Cool-down & Stretching', detail: '5 دقايق تمدد للأرجل', exId: null },
        ],
      },
    ],
  },
];

// ══════════════════════════════════════════
// الهيكل الأساسي لأي يوم تمرين
// ══════════════════════════════════════════
const DAY_STRUCTURE = [
  { step: '01', title: 'الإحماء', subtitle: 'Warm-up', desc: '10 دقايق كارديو خفيف + تمدد للمفاصل عشان جسمك يكون جاهز وتتجنب الإصابات.', color: '#4ade80', icon: '🔥' },
  { step: '02', title: 'التمارين الأساسية', subtitle: 'Compound Exercises', desc: 'رفع الأثقال في التمارين الكبيرة زي السكوات والبنش برس والديدليفت — دي أهم جزء في التمرين.', color: '#FFFFFF', icon: '🏋️' },
  { step: '03', title: 'التمارين المساعدة', subtitle: 'Isolation Exercises', desc: 'تمارين بتستهدف العضلة بشكل مباشر زي تجميع الدمبل أو جهاز السحب — لإكمال الشغل.', color: '#facc15', icon: '🎯' },
  { step: '04', title: 'التبريد والإطالات', subtitle: 'Cool-down', desc: 'في الآخر مش اختياري — بيقلل وجع العضلات وبيساعد على الاسترداد للتمرين الجاي.', color: '#f87171', icon: '❄️' },
];

// ══════════════════════════════════════════
// Components
// ══════════════════════════════════════════
function ProgramCard({ program, index, highlighted = false, enrolledTitle, setEnrolledTitle }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [open, setOpen] = useState(highlighted);
  const [activeDay, setActiveDay] = useState(0);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const { user } = useAuth();

  // هل البرنامج ده هو المسجل فيه؟
  const isMyProgram = enrolledTitle === (program.subtitle || program.title);
  // هل مسجل في برنامج تاني؟
  const hasOtherProgram = enrolledTitle && !isMyProgram;

  // تحقق لو منضم قبل كده
  useEffect(() => {
    if (!user) return;
    supabase.from('user_programs')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_title', program.subtitle || program.title)
      .single()
      .then(({ data }) => { if (data) setJoined(true); });
  }, [user]);

  // تحقق لو سجّل جلسة النهارده قبل كده
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    supabase.from('workout_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_title', program.subtitle || program.title)
      .eq('session_day', today)
      .single()
      .then(({ data }) => { if (data) setSessionDone(true); });
  }, [user]);

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error('سجّل دخول الأول'); return; }
    setJoining(true);
    // استخرج الرقم من days (مثلاً "3 أيام أسبوعياً" → 3)
    const daysNum = parseInt(program.days) || 3;
    // حوّل الـ level للإنجليزي
    const levelMap = { 'مبتدئ': 'beginner', 'متوسط': 'intermediate', 'متقدم': 'advanced' };
    const levelEn = levelMap[program.level] || program.level;
    const { error } = await supabase.from('user_programs').upsert({
      user_id: user.id,
      program_title: program.subtitle || program.title,
      program_title_ar: program.title,
      days_per_week: daysNum,
      level: levelEn,
      progress: 0,
      is_active: true,
    }, { onConflict: 'user_id,program_title' });
    setJoining(false);
    if (error) { toast.error('حصل خطأ: ' + error.message); return; }
    setJoined(true);
    setEnrolledTitle(program.subtitle || program.title);
    toast.success(`انضممت لبرنامج ${program.title} ✅`);
  };

  const handleLogSession = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error('سجّل دخول الأول'); return; }
    setSavingSession(true);
    const today = new Date().toISOString().split('T')[0];
    const dayLabel = program.days_detail?.[activeDay]?.day || `يوم ${activeDay + 1}`;
    const { error } = await supabase.from('workout_sessions').insert({
      user_id: user.id,
      program_title: program.subtitle || program.title,
      day_label: dayLabel,
      session_day: today,
      done: true,
    });
    setSavingSession(false);
    if (error) { toast.error('حصل خطأ'); return; }
    setSessionDone(true);
    toast.success('تم تسجيل جلسة النهارده 💪');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      id={'program-' + program.subtitle} style={{ marginBottom: 16 }}
    >
      {/* Card Header */}
      <motion.div
        whileHover={{ borderColor: 'var(--glass-border-hover)' }}
        transition={{ duration: 0.12 }}
        style={{ position: 'relative', overflow: 'hidden', background: 'var(--carbon)', border: highlighted ? '1px solid rgba(255,77,46,0.4)' : '1px solid var(--glass-border)', borderRadius: open ? '14px 14px 0 0' : 14, transition: 'border-color 150ms ease, background 150ms ease', cursor: 'pointer', padding: '24px 28px' }}
        onClick={() => setOpen(!open)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem' }}>{program.icon}</span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 6, background: 'var(--accent-dim)', border: '1px solid rgba(255,77,46,0.2)', color: 'var(--accent-bright)' }}>
                {program.tag}
              </span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 6, background: program.levelColor.bg, border: '1px solid ' + program.levelColor.border, color: program.levelColor.text }}>
                {program.level}
              </span>
              {isMyProgram && (
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 6, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✅ برنامجك الحالي
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--chalk)', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {program.title}
            </h2>
            <div style={{ fontSize: '0.8rem', color: program.accentColor, fontFamily: 'var(--font-mono)', marginBottom: 12, opacity: 0.85 }}>
              {program.subtitle}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--ash-light)', lineHeight: 1.7, margin: '0 0 14px 0', direction: 'rtl', fontFamily: 'var(--font-body)', maxWidth: 600 }}>
              {program.description}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} color='var(--ash)' />
                <span style={{ fontSize: '0.75rem', color: 'var(--ash-light)', fontFamily: 'var(--font-mono)' }}>{program.days}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={13} color='var(--ash)' />
                <span style={{ fontSize: '0.75rem', color: 'var(--ash-light)', fontFamily: 'var(--font-body)', direction: 'rtl' }}>{program.suitable}</span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ color: program.accentColor, flexShrink: 0, marginTop: 4 }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '24px 28px' }}>
              {/* Day tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {program.days_detail.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid', transition: 'all 200ms ease', background: activeDay === i ? program.accentColor + '22' : 'transparent', borderColor: activeDay === i ? program.accentColor + '88' : 'rgba(255,255,255,0.1)', color: activeDay === i ? program.accentColor : 'rgba(255,255,255,0.4)' }}
                  >
                    يوم {i + 1}
                  </button>
                ))}
              </div>

              {/* Active day */}
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: program.accentColor, marginBottom: 16, direction: 'rtl', fontWeight: 'bold' }}>
                  {program.days_detail[activeDay].day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {program.days_detail[activeDay].exercises.map((ex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', direction: 'rtl' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: program.accentColor, opacity: 0.7, minWidth: 22, paddingTop: 2 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', color: 'var(--chalk)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
                          {ex.exId ? (
                            <Link
                              href={`/exercises?ex=${ex.exId}`}
                              style={{ color: 'var(--chalk)', textDecoration: 'underline', textDecorationColor: program.accentColor, textDecorationThickness: 1, textUnderlineOffset: 3 }}
                            >
                              {ex.name}
                            </Link>
                          ) : ex.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>{ex.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* banner لو مسجل في برنامج تاني */}
              {hasOtherProgram && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: 16, padding: '10px 14px',
                    background: 'rgba(250,204,21,0.07)',
                    border: '1px solid rgba(250,204,21,0.25)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 10,
                    direction: 'rtl',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>⚠️</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#facc15', margin: 0 }}>
                      إنت مسجل حالياً في برنامج <strong>{enrolledTitle}</strong>
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ash)', margin: '3px 0 0' }}>
                      لو انضممت لده هيتغير برنامجك الأساسي
                    </p>
                  </div>
                </motion.div>
              )}

              {/* زرار الانضمام */}
              <motion.button
                onClick={handleJoin}
                disabled={joining || joined}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: 20, width: '100%', padding: '13px',
                  background: joined ? 'rgba(74,222,128,0.1)' : 'var(--accent)',
                  border: joined ? '1px solid rgba(74,222,128,0.3)' : 'none',
                  borderRadius: 12, cursor: joined ? 'default' : 'pointer',
                  color: joined ? '#4ade80' : '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {joined ? <><CheckCircle2 size={16} /> منضم للبرنامج</> : joining ? 'جاري الانضمام...' : <><Zap size={15} /> ابدأ البرنامج</>}
              </motion.button>

              {/* زرار تسجيل الجلسة */}
              <motion.button
                onClick={handleLogSession}
                disabled={savingSession || sessionDone}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: 10, width: '100%', padding: '12px',
                  background: sessionDone ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${sessionDone ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, cursor: sessionDone ? 'default' : 'pointer',
                  color: sessionDone ? '#4ade80' : 'var(--ash-light)',
                  fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.06em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {sessionDone
                  ? <><CheckCircle2 size={15} /> تمت جلسة النهارده 💪</>
                  : savingSession ? 'جاري الحفظ...'
                  : <>✅ سجّل جلسة النهارده</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StructureStep({ step, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: step.color + '18', border: '1px solid ' + step.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
        {step.icon}
      </div>
      <div style={{ flex: 1, direction: 'rtl' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: step.color, opacity: 0.8 }}>{step.step}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--chalk)', fontWeight: 'bold' }}>{step.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>— {step.subtitle}</span>
        </div>
        <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0, fontFamily: 'var(--font-body)' }}>{step.desc}</p>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════
// Main Page
export default function ProgramsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const filterProgram = router.query.program || null;
  const [enrolledTitle, setEnrolledTitle] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('user_programs')
      .select('program_title')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setEnrolledTitle(data.program_title); });
  }, [user]);

  return (
    <>
      <Head><title>Programs - GYMZ</title></Head>

      {/* Hero */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mono" style={{ color: 'var(--ash)', marginBottom: 12 }}>Training programs</div>
            <h1 className="display-lg" style={{ marginBottom: 16 }}>اختار <span style={{ color: 'var(--accent)' }}>برنامجك</span></h1>
            <p style={{ fontSize: '1rem', color: 'var(--ash-light)', maxWidth: 560, lineHeight: 1.8, direction: 'rtl', fontFamily: 'var(--font-body)' }}>
              5 برامج تمرين جاهزة — كل واحد ليه أسلوبه وناسه. اختار اللي يناسب مستواك ووقتك وابدأ.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          {(filterProgram ? PROGRAMS.filter(p => p.title === filterProgram || p.subtitle === filterProgram) : PROGRAMS).map((p, i) => (
            <ProgramCard key={p.id} program={p} index={i} enrolledTitle={enrolledTitle} setEnrolledTitle={setEnrolledTitle} />
          ))}
        </div>
      </section>

      {/* Day Structure */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} style={{ marginBottom: 32 }}>
            <div className="mono" style={{ color: 'var(--ash)', marginBottom: 8 }}>هيكل أي يوم تمرين</div>
            <h2 className="display-sm" style={{ margin: 0 }}>الترتيب <span style={{ color: 'var(--accent)' }}>الصح</span></h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DAY_STRUCTURE.map((s, i) => <StructureStep key={i} step={s} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
