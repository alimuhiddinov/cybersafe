import express from 'express';
import * as assessmentController from '../controllers/assessment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import { checkAssessmentExists } from '../middleware/assessment.middleware';
import { checkAssessmentAttemptAccess } from '../middleware/assessment.middleware';

const router = express.Router();

// Auth required for all routes
router.use(authenticate);

/**
 * @route   GET /api/assessment
 * @desc    Get all assessments with filtering
 * @access  Private (Admin/Instructor)
 */
router.get('/', authorize(['ADMIN', 'INSTRUCTOR']), assessmentController.getAllAssessments);

/**
 * @route   POST /api/assessment
 * @desc    Create a new assessment
 * @access  Private (Admin/Instructor)
 */
router.post('/', authorize(['ADMIN', 'INSTRUCTOR']), assessmentController.createAssessment);

/**
 * @route   POST /api/assessment/generate
 * @desc    Generate a new quiz for the user
 * @access  Private
 */
router.post('/generate', assessmentController.generateQuiz);

/**
 * @route   GET /api/assessment/history
 * @desc    Get user's assessment history
 * @access  Private
 */
router.get('/user/history', assessmentController.getAssessmentHistory);

/**
 * @route   GET /api/assessment/progress
 * @desc    Get user's assessment progress metrics
 * @access  Private
 */
router.get('/user/progress', assessmentController.getAssessmentProgress);

/**
 * @route   GET /api/assessment/attempt/:id
 * @desc    Get detailed results for a specific assessment attempt
 * @access  Private
 */
router.get('/attempt/:id', checkAssessmentAttemptAccess, assessmentController.getAttemptDetails);

/**
 * @route   GET /api/assessment/:id
 * @desc    Get an assessment by ID
 * @access  Private
 */
router.get('/:id', checkAssessmentExists, assessmentController.getAssessmentById);

/**
 * @route   PUT /api/assessment/:id
 * @desc    Update an assessment
 * @access  Private (Admin/Instructor)
 */
router.put('/:id', authorize(['ADMIN', 'INSTRUCTOR']), checkAssessmentExists, assessmentController.updateAssessment);

/**
 * @route   DELETE /api/assessment/:id
 * @desc    Delete an assessment
 * @access  Private (Admin/Instructor)
 */
router.delete('/:id', authorize(['ADMIN', 'INSTRUCTOR']), checkAssessmentExists, assessmentController.deleteAssessment);

/**
 * @route   POST /api/assessment/:id/submit
 * @desc    Submit an assessment attempt
 * @access  Private
 */
router.post('/:id/submit', checkAssessmentExists, assessmentController.submitAssessment);

export default router;
