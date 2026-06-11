import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import { query, getClient } from '../../config/database.js';
import { logAction } from '../middleware/auth.js';

// =============================================
// GET ALL PROGRAMS
// =============================================
export const getPrograms = async (req, res) => {
  try {
    const { difficulty, goal, featured } = req.query;

    let conditions = ['p.is_active = true'];
    let params = [];
    let i = 1;

    if (difficulty) { conditions.push(`p.difficulty = $${i++}`); params.push(difficulty); }
    if (goal) { conditions.push(`p.goal = $${i++}`); params.push(goal); }
    if (featured === 'true') { conditions.push(`p.is_featured = true`); }

    const result = await query(
      `SELECT
        p.*,
        u.name as created_by_name,
        COUNT(DISTINCT pd.id) as total_days
       FROM programs p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN program_days pd ON pd.program_id = p.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY p.id, u.name
       ORDER BY p.is_featured DESC, p.created_at DESC`,
      params
    );

    return res.json({ programs: result.rows });
  } catch (err) {
    console.error('Get programs error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// GET SINGLE PROGRAM WITH FULL DETAILS
// =============================================
export const getProgram = async (req, res) => {
  try {
    const programResult = await query(
      `SELECT p.*, u.name as created_by_name
       FROM programs p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1 AND p.is_active = true`,
      [req.params.id]
    );

    if (!programResult.rows.length) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const program = programResult.rows[0];

    // Get all days with exercises
    const daysResult = await query(
      `SELECT
        pd.id, pd.day_number, pd.name, pd.name_ar, pd.focus,
        json_agg(
          json_build_object(
            'id', pe.id,
            'order_index', pe.order_index,
            'sets', pe.sets,
            'reps', pe.reps,
            'rest_seconds', pe.rest_seconds,
            'notes', pe.notes,
            'notes_ar', pe.notes_ar,
            'exercise', json_build_object(
              'id', e.id,
              'name', e.name,
              'name_ar', e.name_ar,
              'image_url', e.image_url,
              'difficulty', e.difficulty,
              'muscle_group', mg.name,
              'muscle_group_ar', mg.name_ar
            )
          ) ORDER BY pe.order_index
        ) as exercises
       FROM program_days pd
       LEFT JOIN program_exercises pe ON pe.program_day_id = pd.id
       LEFT JOIN exercises e ON pe.exercise_id = e.id
       LEFT JOIN muscle_groups mg ON e.muscle_group_id = mg.id
       WHERE pd.program_id = $1
       GROUP BY pd.id
       ORDER BY pd.day_number`,
      [req.params.id]
    );

    return res.json({ program: { ...program, days: daysResult.rows } });
  } catch (err) {
    console.error('Get program error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// CREATE PROGRAM (Admin) - with transaction
// =============================================
export const createProgram = async (req, res) => {
  const client = await getClient();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await client.query('BEGIN');

    const {
      title, title_ar, description, description_ar,
      duration_weeks, days_per_week, difficulty, goal,
      is_featured, days
    } = req.body;

    let cover_image_url = null;
    let cover_image_public_id = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'gymx/programs',
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
      });
      cover_image_url = uploadResult.secure_url;
      cover_image_public_id = uploadResult.public_id;
    }

    const programResult = await client.query(
      `INSERT INTO programs
        (title, title_ar, description, description_ar, duration_weeks, days_per_week,
         difficulty, goal, cover_image_url, cover_image_public_id, is_featured, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [title, title_ar, description, description_ar, duration_weeks, days_per_week,
       difficulty, goal, cover_image_url, cover_image_public_id, is_featured || false, req.user.id]
    );

    const program = programResult.rows[0];

    // Insert days and exercises if provided
    if (days && Array.isArray(days)) {
      for (const day of days) {
        const dayResult = await client.query(
          `INSERT INTO program_days (program_id, day_number, name, name_ar, focus)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [program.id, day.day_number, day.name, day.name_ar, day.focus]
        );

        if (day.exercises && Array.isArray(day.exercises)) {
          for (const [i, ex] of day.exercises.entries()) {
            await client.query(
              `INSERT INTO program_exercises
                (program_day_id, exercise_id, order_index, sets, reps, rest_seconds, notes, notes_ar)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
              [dayResult.rows[0].id, ex.exercise_id, i, ex.sets, ex.reps, ex.rest_seconds, ex.notes, ex.notes_ar]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    await logAction(req.user.id, 'PROGRAM_CREATE', 'programs', program.id, null, program, req);

    return res.status(201).json({ program, message: 'Program created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create program error:', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// =============================================
// DELETE PROGRAM (Admin - soft delete)
// =============================================
export const deleteProgram = async (req, res) => {
  try {
    const result = await query(
      'UPDATE programs SET is_active = false WHERE id = $1 RETURNING id, title',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Program not found' });
    }

    await logAction(req.user.id, 'PROGRAM_DELETE', 'programs', req.params.id, null, null, req);

    return res.json({ message: 'Program deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
