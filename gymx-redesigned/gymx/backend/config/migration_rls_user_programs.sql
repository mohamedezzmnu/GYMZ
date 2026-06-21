-- =============================================
-- Migration: السماح للمستخدم بتحديث نسبة تقدمه في برامجه
-- محتاج تشغّل ده عشان فيتشر "progress البرنامج" يشتغل، لأن
-- الكود بقى بيعمل UPDATE على جدول user_programs من الـ frontend
-- (قبل كده كان بس INSERT/UPSERT/SELECT).
--
-- لو RLS مفعّل على جدول user_programs عندك، شغّل ده.
-- لو RLS مش مفعّل (يعني الجدول شغال عادي من غير قيود)، تجاهل الملف ده.
-- =============================================

-- 1. فعّل RLS على الجدول لو لسه مش مفعّل
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;

-- 2. policy تسمح للمستخدم يشوف برامجه هو بس
DROP POLICY IF EXISTS "Users can view own programs" ON user_programs;
CREATE POLICY "Users can view own programs"
  ON user_programs FOR SELECT
  USING (auth.uid() = user_id);

-- 3. policy تسمح للمستخدم يضيف برنامج لنفسه
DROP POLICY IF EXISTS "Users can insert own programs" ON user_programs;
CREATE POLICY "Users can insert own programs"
  ON user_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. policy تسمح للمستخدم يحدّث (progress / completed_at) لبرامجه هو بس
DROP POLICY IF EXISTS "Users can update own programs" ON user_programs;
CREATE POLICY "Users can update own programs"
  ON user_programs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- نفس الفكرة لجدول workout_sessions (لو RLS مفعّل عليه)
-- =============================================
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
CREATE POLICY "Users can view own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON workout_sessions;
CREATE POLICY "Users can insert own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
