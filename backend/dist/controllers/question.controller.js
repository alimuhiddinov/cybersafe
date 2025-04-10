"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportQuestions = exports.reorderAnswers = exports.reorderQuestions = exports.getAnswers = exports.deleteAnswer = exports.updateAnswer = exports.createAnswer = exports.getQuestions = exports.getQuestionById = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = void 0;
const question_service_1 = __importDefault(require("../services/question.service"));
const client_1 = require("@prisma/client");
/**
 * Create a new question with answers
 * @route POST /api/question
 * @access Private (Admin/Instructor)
 */
const createQuestion = async (req, res) => {
    try {
        const { questionText, questionType, explanation, points, difficultyLevel, assessmentId, answers } = req.body;
        // Validate required fields
        if (!questionText || !assessmentId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                message: 'Please provide questionText, assessmentId, and an array of answers'
            });
        }
        // For TRUE_FALSE questions, ensure exactly 2 answers
        if (questionType === client_1.QuestionType.TRUE_FALSE && answers.length !== 2) {
            return res.status(400).json({
                message: 'TRUE_FALSE questions must have exactly 2 answers (True and False)'
            });
        }
        // For multiple choice, ensure at least 2 answers and one is correct
        if ((questionType === client_1.QuestionType.MULTIPLE_CHOICE || questionType === client_1.QuestionType.SINGLE_CHOICE) &&
            (answers.length < 2 || !answers.some((a) => a.isCorrect))) {
            return res.status(400).json({
                message: 'Choice questions must have at least 2 answers and one must be correct'
            });
        }
        const questionData = {
            questionText,
            questionType: questionType || client_1.QuestionType.MULTIPLE_CHOICE,
            explanation,
            points: points || 1,
            difficultyLevel: difficultyLevel || client_1.DifficultyLevel.BEGINNER
        };
        // Transform answers to match the expected structure with answerText field
        const formattedAnswers = answers.map(answer => ({
            answerText: answer.text || answer.answerText,
            isCorrect: answer.isCorrect,
            explanation: answer.explanation,
            orderIndex: answer.orderIndex
        }));
        const question = await question_service_1.default.createQuestion(questionData, parseInt(assessmentId), formattedAnswers);
        res.status(201).json(question);
    }
    catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ message: 'Server error creating question' });
    }
};
exports.createQuestion = createQuestion;
/**
 * Update an existing question
 * @route PUT /api/question/:id
 * @access Private (Admin/Instructor)
 */
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText, questionType, explanation, points, difficultyLevel } = req.body;
        const updateData = {};
        if (questionText !== undefined)
            updateData.questionText = questionText;
        if (questionType !== undefined)
            updateData.questionType = questionType;
        if (explanation !== undefined)
            updateData.explanation = explanation;
        if (points !== undefined)
            updateData.points = points;
        if (difficultyLevel !== undefined)
            updateData.difficultyLevel = difficultyLevel;
        const question = await question_service_1.default.updateQuestion(parseInt(id), updateData);
        res.status(200).json(question);
    }
    catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: 'Server error updating question' });
    }
};
exports.updateQuestion = updateQuestion;
/**
 * Delete a question
 * @route DELETE /api/question/:id
 * @access Private (Admin/Instructor)
 */
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await question_service_1.default.deleteQuestion(parseInt(id));
        res.status(200).json({ message: 'Question deleted successfully', question });
    }
    catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: 'Server error deleting question' });
    }
};
exports.deleteQuestion = deleteQuestion;
/**
 * Get a question by ID
 * @route GET /api/question/:id
 * @access Private
 */
const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await question_service_1.default.getQuestionById(parseInt(id));
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    }
    catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ message: 'Server error retrieving question' });
    }
};
exports.getQuestionById = getQuestionById;
/**
 * Get questions with filtering
 * @route GET /api/question
 * @access Private
 */
const getQuestions = async (req, res) => {
    try {
        const { assessmentId, questionType, difficultyLevel, search, page, limit } = req.query;
        const filters = {
            assessmentId: assessmentId ? parseInt(assessmentId) : undefined,
            questionType: questionType,
            difficultyLevel: difficultyLevel,
            search: search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        };
        const questions = await question_service_1.default.getQuestions(filters);
        res.status(200).json(questions);
    }
    catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error retrieving questions' });
    }
};
exports.getQuestions = getQuestions;
/**
 * Create a new answer for a question
 * @route POST /api/question/:id/answer
 * @access Private (Admin/Instructor)
 */
const createAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerText, isCorrect, explanation } = req.body;
        // Validate required fields
        if (!answerText) {
            return res.status(400).json({ message: 'Please provide answerText' });
        }
        const answer = await question_service_1.default.createAnswer(parseInt(id), {
            answerText,
            isCorrect: isCorrect !== undefined ? isCorrect : false,
            explanation
        });
        res.status(201).json(answer);
    }
    catch (error) {
        console.error('Create answer error:', error);
        res.status(500).json({ message: 'Server error creating answer' });
    }
};
exports.createAnswer = createAnswer;
/**
 * Update an answer
 * @route PUT /api/question/answer/:id
 * @access Private (Admin/Instructor)
 */
const updateAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerText, isCorrect, explanation } = req.body;
        const updateData = {};
        if (answerText !== undefined)
            updateData.answerText = answerText;
        if (isCorrect !== undefined)
            updateData.isCorrect = isCorrect;
        if (explanation !== undefined)
            updateData.explanation = explanation;
        const answer = await question_service_1.default.updateAnswer(parseInt(id), updateData);
        res.status(200).json(answer);
    }
    catch (error) {
        console.error('Update answer error:', error);
        res.status(500).json({ message: 'Server error updating answer' });
    }
};
exports.updateAnswer = updateAnswer;
/**
 * Delete an answer
 * @route DELETE /api/question/answer/:id
 * @access Private (Admin/Instructor)
 */
const deleteAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const answer = await question_service_1.default.deleteAnswer(parseInt(id));
        res.status(200).json({ message: 'Answer deleted successfully', answer });
    }
    catch (error) {
        console.error('Delete answer error:', error);
        res.status(500).json({ message: 'Server error deleting answer' });
    }
};
exports.deleteAnswer = deleteAnswer;
/**
 * Get all answers for a question
 * @route GET /api/question/:id/answers
 * @access Private
 */
const getAnswers = async (req, res) => {
    try {
        const { id } = req.params;
        const answers = await question_service_1.default.getAnswersByQuestionId(parseInt(id));
        res.status(200).json(answers);
    }
    catch (error) {
        console.error('Get answers error:', error);
        res.status(500).json({ message: 'Server error retrieving answers' });
    }
};
exports.getAnswers = getAnswers;
/**
 * Reorder questions in an assessment
 * @route PUT /api/question/reorder
 * @access Private (Admin/Instructor)
 */
const reorderQuestions = async (req, res) => {
    try {
        const { assessmentId, questionOrder } = req.body;
        // Validate required fields
        if (!assessmentId || !questionOrder || !Array.isArray(questionOrder)) {
            return res.status(400).json({
                message: 'Please provide assessmentId and an array of questionOrder'
            });
        }
        const result = await question_service_1.default.reorderQuestions(assessmentId, questionOrder);
        res.status(200).json({ success: result });
    }
    catch (error) {
        console.error('Reorder questions error:', error);
        res.status(500).json({ message: 'Server error reordering questions' });
    }
};
exports.reorderQuestions = reorderQuestions;
/**
 * Reorder answers for a question
 * @route PUT /api/question/:id/reorder-answers
 * @access Private (Admin/Instructor)
 */
const reorderAnswers = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerOrder } = req.body;
        // Validate required fields
        if (!answerOrder || !Array.isArray(answerOrder)) {
            return res.status(400).json({
                message: 'Please provide an array of answerOrder'
            });
        }
        const result = await question_service_1.default.reorderAnswers(parseInt(id), answerOrder);
        res.status(200).json({ success: result });
    }
    catch (error) {
        console.error('Reorder answers error:', error);
        res.status(500).json({ message: 'Server error reordering answers' });
    }
};
exports.reorderAnswers = reorderAnswers;
/**
 * Import questions in bulk for an assessment
 * @route POST /api/question/bulk-import
 * @access Private (Admin/Instructor)
 */
const bulkImportQuestions = async (req, res) => {
    try {
        const { assessmentId, questions } = req.body;
        // Validate required fields
        if (!assessmentId || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                message: 'Please provide assessmentId and a non-empty array of questions'
            });
        }
        // Validate each question
        for (const question of questions) {
            if (!question.questionText || !question.answers || !Array.isArray(question.answers)) {
                return res.status(400).json({
                    message: 'Each question must have questionText and an array of answers'
                });
            }
            if ((question.questionType === client_1.QuestionType.MULTIPLE_CHOICE || question.questionType === client_1.QuestionType.SINGLE_CHOICE) &&
                !question.answers.some((a) => a.isCorrect)) {
                return res.status(400).json({
                    message: 'Each choice question must have at least one correct answer'
                });
            }
        }
        const createdQuestions = await question_service_1.default.bulkImportQuestions(assessmentId, questions);
        res.status(201).json({
            message: `Successfully imported ${createdQuestions.length} questions`,
            questions: createdQuestions
        });
    }
    catch (error) {
        console.error('Bulk import questions error:', error);
        res.status(500).json({ message: 'Server error importing questions' });
    }
};
exports.bulkImportQuestions = bulkImportQuestions;
