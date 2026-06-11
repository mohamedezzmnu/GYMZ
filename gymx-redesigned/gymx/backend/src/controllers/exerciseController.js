import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import { query } from '../../config/database.js';
import { logAction } from '../middleware/auth.js';

// =============================================
// GET ALL EXERCISES
// =============================================
export const getExercises = async (req, res) => {
  try {
    const { muscle_group, difficulty, search, page = 1, limit = 12 } = req.query;

    let whereConditions = ['e.is_active = true'];
    let params = [];
    let paramIndex = 1;

    if (muscle_group) {
      whereConditions.push(`mg.name ILIKE $${paramIndex}`);
      params.push(`%${muscle_group}%`);
      paramIndex++;
    }

    if (difficulty) {
      whereConditions.push(`e.difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(e.name ILIKE $${paramIndex} OR e.name_ar ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const offset = (page - 1) * limit;
    params.push(parseInt(limit));
    params.push(offset);

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
        e.id, e.name, e.name_ar, e.description, e.description_ar,
        e.difficulty, e.equipment, e.image_url, e.tips, e.tips_ar,
        mg.name as muscle_group, mg.name_ar as muscle_group_ar, mg.id as muscle_group_id
       FROM exercises e
       LEFT JOIN muscle_groups mg ON e.muscle_group_id = mg.id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM exercises e
       LEFT JOIN muscle_groups mg ON e.muscle_group_id = mg.id
       ${whereClause}`,
      params.slice(0, -2)
    );

    const total = parseInt(countResult.rows[0].count);

    return res.json({
      exercises: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get exercises error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// GET SINGLE EXERCISE
// =============================================
export const getExercise = async (req, res) => {
  try {
    const result = await query(
      `SELECT
        e.*, mg.name as muscle_group, mg.name_ar as muscle_group_ar
       FROM exercises e
       LEFT JOIN muscle_groups mg ON e.muscle_group_id = mg.id
       WHERE e.id = $1 AND e.is_active = true`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    return res.json({ exercise: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// CREATE EXERCISE (Admin only)
// =============================================
export const createExercise = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, name_ar, description, description_ar,
      muscle_group_id, difficulty, equipment, tips, tips_ar
    } = req.body;

    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'gymx/exercises',
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
      });
      image_url = uploadResult.secure_url;
      image_public_id = uploadResult.public_id;
    }

    const result = await query(
      `INSERT INTO exercises
        (name, name_ar, description, description_ar, muscle_group_id,
         difficulty, equipment, image_url, image_public_id, tips, tips_ar, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [name, name_ar, description, description_ar, muscle_group_id,
       difficulty, equipment, image_url, image_public_id, tips, tips_ar, req.user.id]
    );

    await logAction(req.user.id, 'EXERCISE_CREATE', 'exercises', result.rows[0].id, null, result.rows[0], req);

    return res.status(201).json({ exercise: result.rows[0], message: 'Exercise created' });
  } catch (err) {
    console.error('Create exercise error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// UPDATE EXERCISE (Admin only)
// =============================================
export const updateExercise = async (req, res) => {
  try {
    const existing = await query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const old = existing.rows[0];
    const updates = { ...req.body };

    if (req.file) {
      // Delete old image from Cloudinary
      if (old.image_public_id) {
        await cloudinary.uploader.destroy(old.image_public_id);
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'gymx/exercises',
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
      });
      updates.image_url = uploadResult.secure_url;
      updates.image_public_id = uploadResult.public_id;
    }

    const result = await query(
      `UPDATE exercises SET
        name = COALESCE($1, name),
        name_ar = COALESCE($2, name_ar),
        description = COALESCE($3, description),
        description_ar = COALESCE($4, description_ar),
        muscle_group_id = COALESCE($5, muscle_group_id),
        difficulty = COALESCE($6, difficulty),
        equipment = COALESCE($7, equipment),
        tips = COALESCE($8, tips),
        tips_ar = COALESCE($9, tips_ar),
        image_url = COALESCE($10, image_url),
        image_public_id = COALESCE($11, image_public_id)
       WHERE id = $12
       RETURNING *`,
      [updates.name, updates.name_ar, updates.description, updates.description_ar,
       updates.muscle_group_id, updates.difficulty, updates.equipment,
       updates.tips, updates.tips_ar, updates.image_url, updates.image_public_id,
       req.params.id]
    );

    await logAction(req.user.id, 'EXERCISE_UPDATE', 'exercises', req.params.id, old, result.rows[0], req);

    return res.json({ exercise: result.rows[0], message: 'Exercise updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// DELETE EXERCISE (Admin only - soft delete)
// =============================================
export const deleteExercise = async (req, res) => {
  try {
    const result = await query(
      'UPDATE exercises SET is_active = false WHERE id = $1 RETURNING id, name',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    await logAction(req.user.id, 'EXERCISE_DELETE', 'exercises', req.params.id, null, null, req);

    return res.json({ message: 'Exercise deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// GET MUSCLE GROUPS
// =============================================
export const getMuscleGroups = async (req, res) => {
  try {
    const result = await query('SELECT * FROM muscle_groups ORDER BY name');
    return res.json({ muscleGroups: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
