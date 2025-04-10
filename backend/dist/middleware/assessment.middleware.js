"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAssessmentAttemptAccess = exports.checkAnswerExists = exports.checkQuestionExists = exports.checkAssessmentExists = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Middleware to check if an assessment exists
 */
const checkAssessmentExists = async (req, res, next) => {
    try {
        const assessmentId = parseInt(req.params.id);
        if (isNaN(assessmentId)) {
            return res.status(400).json({ message: 'Invalid assessment ID' });
        }
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }
        // Attach assessment to request for use in subsequent middleware or routes
        req.assessment = assessment;
        next();
    }
    catch (error) {
        console.error('Assessment exists check error:', error);
        return res.status(500).json({ message: 'Server error checking assessment' });
    }
};
exports.checkAssessmentExists = checkAssessmentExists;
/**
 * Middleware to check if a question exists
 */
const checkQuestionExists = async (req, res, next) => {
    try {
        const questionId = parseInt(req.params.id);
        if (isNaN(questionId)) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Attach question to request for use in subsequent middleware or routes
        req.question = question;
        next();
    }
    catch (error) {
        console.error('Question exists check error:', error);
        return res.status(500).json({ message: 'Server error checking question' });
    }
};
exports.checkQuestionExists = checkQuestionExists;
/**
 * Middleware to check if an answer exists
 */
const checkAnswerExists = async (req, res, next) => {
    try {
        const answerId = parseInt(req.params.id);
        if (isNaN(answerId)) {
            return res.status(400).json({ message: 'Invalid answer ID' });
        }
        const answer = await prisma.answer.findUnique({
            where: { id: answerId }
        });
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }
        // Attach answer to request for use in subsequent middleware or routes
        req.answer = answer;
        next();
    }
    catch (error) {
        console.error('Answer exists check error:', error);
        return res.status(500).json({ message: 'Server error checking answer' });
    }
};
exports.checkAnswerExists = checkAnswerExists;
/**
 * Middleware to check if an assessment attempt exists and belongs to the user
 */
const checkAssessmentAttemptAccess = async (req, res, next) => {
    var _a, _b;
    try {
        const attemptId = parseInt(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (isNaN(attemptId)) {
            return res.status(400).json({ message: 'Invalid attempt ID' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const attempt = await prisma.userAssessmentAttempt.findUnique({
            where: { id: attemptId }
        });
        if (!attempt) {
            return res.status(404).json({ message: 'Assessment attempt not found' });
        }
        // Check if the attempt belongs to the user or if user is admin
        if (attempt.userId !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'ADMIN') {
            return res.status(403).json({ message: 'You do not have permission to access this attempt' });
        }
        // Attach attempt to request for use in subsequent middleware or routes
        req.attempt = attempt;
        next();
    }
    catch (error) {
        console.error('Assessment attempt access check error:', error);
        return res.status(500).json({ message: 'Server error checking assessment attempt' });
    }
};
exports.checkAssessmentAttemptAccess = checkAssessmentAttemptAccess;
