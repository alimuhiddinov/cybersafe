"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionController = __importStar(require("../controllers/question.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const assessment_middleware_1 = require("../middleware/assessment.middleware");
const router = express_1.default.Router();
// Auth required for all routes
router.use(auth_middleware_1.authenticate);
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
router.get('/:id', assessment_middleware_1.checkQuestionExists, questionController.getQuestionById);
/**
 * @route   POST /api/question
 * @desc    Create a new question with answers
 * @access  Private (Admin/Instructor)
 */
router.post('/', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), questionController.createQuestion);
/**
 * @route   PUT /api/question/:id
 * @desc    Update a question
 * @access  Private (Admin/Instructor)
 */
router.put('/:id', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), assessment_middleware_1.checkQuestionExists, questionController.updateQuestion);
/**
 * @route   DELETE /api/question/:id
 * @desc    Delete a question
 * @access  Private (Admin/Instructor)
 */
router.delete('/:id', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), assessment_middleware_1.checkQuestionExists, questionController.deleteQuestion);
/**
 * @route   POST /api/question/:id/answer
 * @desc    Create a new answer for a question
 * @access  Private (Admin/Instructor)
 */
router.post('/:id/answer', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), assessment_middleware_1.checkQuestionExists, questionController.createAnswer);
/**
 * @route   GET /api/question/:id/answers
 * @desc    Get all answers for a question
 * @access  Private
 */
router.get('/:id/answers', assessment_middleware_1.checkQuestionExists, questionController.getAnswers);
/**
 * @route   PUT /api/question/answer/:id
 * @desc    Update an answer
 * @access  Private (Admin/Instructor)
 */
router.put('/answer/:id', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), assessment_middleware_1.checkAnswerExists, questionController.updateAnswer);
/**
 * @route   DELETE /api/question/answer/:id
 * @desc    Delete an answer
 * @access  Private (Admin/Instructor)
 */
router.delete('/answer/:id', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), assessment_middleware_1.checkAnswerExists, questionController.deleteAnswer);
/**
 * @route   PUT /api/question/reorder
 * @desc    Reorder questions in an assessment
 * @access  Private (Admin/Instructor)
 */
router.put('/reorder', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), questionController.reorderQuestions);
/**
 * @route   PUT /api/question/:id/reorder-answers
 * @desc    Reorder answers for a question
 * @access  Private (Admin/Instructor)
 */
router.put('/:id/reorder-answers', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), assessment_middleware_1.checkQuestionExists, questionController.reorderAnswers);
/**
 * @route   POST /api/question/bulk-import
 * @desc    Import questions in bulk for an assessment
 * @access  Private (Admin/Instructor)
 */
router.post('/bulk-import', (0, auth_middleware_2.authorize)(['ADMIN', 'INSTRUCTOR']), questionController.bulkImportQuestions);
exports.default = router;
