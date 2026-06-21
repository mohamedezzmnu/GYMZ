-- =============================================
-- Migration: add goal_weight to user_onboarding
-- Run this once on your existing Supabase database.
-- Safe to run even if the table/column already exists.
-- =============================================

-- لو جدول user_onboarding مش موجود أصلاً، يتعمل بالشكل ده:
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal VARCHAR(50),
  level VARCHAR(20),
  days_per_week INTEGER,
  recommended_program VARCHAR(200),
  goal_weight NUMERIC(5,2),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- لو الجدول موجود بالفعل وعايز تضيف العمود بس:
ALTER TABLE user_onboarding
  ADD COLUMN IF NOT EXISTS goal_weight NUMERIC(5,2);
