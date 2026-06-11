import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  getExercises, getExercise, createExercise,
  updateExercise, deleteExercise, getMuscleGroups
} from '../controllers/exerciseController.js';
import {
  getPrograms, getProgram, createProgram, deleteProgram
} from '../controllers/programController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/security.js';

const upload = multer({ dest: '/tmp/gymx-uploads/' });

// =============================================
// EXERCISE ROUTES
// =============================================
const exerciseRouter = Router();

exerciseRouter.get('/', getExercises);
exerciseRouter.get('/muscle-groups', getMuscleGroups);
exerciseRouter.get('/:id', getExercise);

exerciseRouter.post('/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  ],
  createExercise
);

exerciseRouter.put('/:id',
  authenticate,
  requireAdmin,
  uploadLimiter,
  upload.single('image'),
  updateExercise
);

exerciseRouter.delete('/:id', authenticate, requireAdmin, deleteExercise);

// =============================================
// PROGRAM ROUTES
// =============================================
const programRouter = Router();

programRouter.get('/', getPrograms);
programRouter.get('/:id', getProgram);

programRouter.post('/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  upload.single('cover'),
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('duration_weeks').isInt({ min: 1 }).withMessage('Duration required'),
    body('days_per_week').isInt({ min: 1, max: 7 }).withMessage('Days per week 1-7'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  ],
  createProgram
);

programRouter.delete('/:id', authenticate, requireAdmin, deleteProgram);

export { exerciseRouter, programRouter };
