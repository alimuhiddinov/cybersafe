import express from 'express';
import * as questionController from '../controllers/question.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import { checkQuestionExists, checkAnswerExists } from '../middleware/assessment.middleware';

const router = express.Router();

// Auth required for all routes
router.use(authenticate);

/**
 * @route   GET /api/question
 * @desc    Get questions with filtering
 * @access  Private
 */
router.get('/', questionController.getQuestions);

/**
 * @route   GET /api/question/:id
 * @desc    Get a question by ID
 * @access  Private
 */
router.get('/:id', checkQuestionExists, questionController.getQuestionById);

/**
 * @route   POST /api/question
 * @desc    Create a new question with answers
 * @access  Private (Admin/Instructor)
 */
router.post('/', authorize(['ADMIN', 'INSTRUCTOR']), questionController.createQuestion);

/**
 * @route   PUT /api/question/:id
 * @desc    Update a question
 * @access  Private (Admin/Instructor)
 */
router.put('/:id', authorize(['ADMIN', 'INSTRUCTOR']), checkQuestionExists, questionController.updateQuestion);

/**
 * @route   DELETE /api/question/:id
 * @desc    Delete a question
 * @access  Private (Admin/Instructor)
 */
router.delete('/:id', authorize(['ADMIN', 'INSTRUCTOR']), checkQuestionExists, questionController.deleteQuestion);

/**
 * @route   POST /api/question/:id/answer
 * @desc    Create a new answer for a question
 * @access  Private (Admin/Instructor)
 */
router.post('/:id/answer', authorize(['ADMIN', 'INSTRUCTOR']), checkQuestionExists, questionController.createAnswer);

/**
 * @route   GET /api/question/:id/answers
 * @desc    Get all answers for a question
 * @access  Private
 */
router.get('/:id/answers', checkQuestionExists, questionController.getAnswers);

/**
 * @route   PUT /api/question/answer/:id
 * @desc    Update an answer
 * @access  Private (Admin/Instructor)
 */
router.put('/answer/:id', authorize(['ADMIN', 'INSTRUCTOR']), checkAnswerExists, questionController.updateAnswer);

/**
 * @route   DELETE /api/question/answer/:id
 * @desc    Delete an answer
 * @access  Private (Admin/Instructor)
 */
router.delete('/answer/:id', authorize(['ADMIN', 'INSTRUCTOR']), checkAnswerExists, questionController.deleteAnswer);

/**
 * @route   PUT /api/question/reorder
 * @desc    Reorder questions in an assessment
 * @access  Private (Admin/Instructor)
 */
router.put('/reorder', authorize(['ADMIN', 'INSTRUCTOR']), questionController.reorderQuestions);

/**
 * @route   PUT /api/question/:id/reorder-answers
 * @desc    Reorder answers for a question
 * @access  Private (Admin/Instructor)
 */
router.put('/:id/reorder-answers', authorize(['ADMIN', 'INSTRUCTOR']), checkQuestionExists, questionController.reorderAnswers);

/**
 * @route   POST /api/question/bulk-import
 * @desc    Import questions in bulk for an assessment
 * @access  Private (Admin/Instructor)
 */
router.post('/bulk-import', authorize(['ADMIN', 'INSTRUCTOR']), questionController.bulkImportQuestions);

export default router;
