-- =============================================
-- GYMX Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast email lookup
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- REFRESH TOKENS TABLE (Secure Auth)
-- =============================================
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- =============================================
-- MUSCLE GROUPS TABLE
-- =============================================
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_ar VARCHAR(100),
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- EXERCISES TABLE
-- =============================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200),
  description TEXT,
  description_ar TEXT,
  muscle_group_id UUID REFERENCES muscle_groups(id),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment VARCHAR(100),
  image_url TEXT,
  image_public_id VARCHAR(255),
  video_url TEXT,
  tips TEXT,
  tips_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);

-- =============================================
-- PROGRAMS TABLE
-- =============================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  title_ar VARCHAR(200),
  description TEXT,
  description_ar TEXT,
  duration_weeks INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  goal VARCHAR(50) CHECK (goal IN ('strength', 'hypertrophy', 'fat_loss', 'endurance', 'general')),
  cover_image_url TEXT,
  cover_image_public_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PROGRAM DAYS TABLE
-- =============================================
CREATE TABLE program_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  name VARCHAR(100),
  name_ar VARCHAR(100),
  focus VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_program_days_program ON program_days(program_id);

-- =============================================
-- PROGRAM EXERCISES (Many-to-Many)
-- =============================================
CREATE TABLE program_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_day_id UUID NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  sets INTEGER,
  reps VARCHAR(50),
  rest_seconds INTEGER,
  notes TEXT,
  notes_ar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_program_exercises_day ON program_exercises(program_day_id);

-- =============================================
-- USER PROGRAMS (Enrollments)
-- =============================================
CREATE TABLE user_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, program_id)
);

-- =============================================
-- AUDIT LOG (Security)
-- =============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================
-- SEED: Muscle Groups
-- =============================================
INSERT INTO muscle_groups (name, name_ar, icon) VALUES
  ('Chest', 'الصدر', 'chest'),
  ('Back', 'الظهر', 'back'),
  ('Shoulders', 'الأكتاف', 'shoulders'),
  ('Arms', 'الأذرع', 'arms'),
  ('Legs', 'الأرجل', 'legs'),
  ('Core', 'البطن', 'core'),
  ('Glutes', 'المؤخرة', 'glutes'),
  ('Full Body', 'الجسم كله', 'fullbody');

-- =============================================
-- UPDATED AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
