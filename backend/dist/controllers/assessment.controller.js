"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssessmentProgress = exports.getAttemptDetails = exports.getAssessmentHistory = exports.submitAssessment = exports.generateQuiz = exports.getAllAssessments = exports.getAssessmentById = exports.deleteAssessment = exports.updateAssessment = exports.createAssessment = void 0;
const assessment_service_1 = __importDefault(require("../services/assessment.service"));
/**
 * Create a new assessment
 * @route POST /api/assessment
 * @access Private (Admin/Instructor)
 */
const createAssessment = async (req, res) => {
    try {
        const { title, description, moduleId, difficultyLevel, timeLimit, passThreshold, isActive } = req.body;
        // Validate required fields
        if (!title || !description || !moduleId) {
            return res.status(400).json({ message: 'Please provide title, description, and moduleId' });
        }
        const assessment = await assessment_service_1.default.createAssessment({
            title,
            description,
            timeLimit: timeLimit || 15,
            passThreshold: passThreshold || 70,
            isActive: isActive !== undefined ? isActive : true,
            learningModule: {
                connect: { id: parseInt(moduleId) }
            },
            ...(difficultyLevel ? { difficultyLevel: difficultyLevel } : {})
        });
        res.status(201).json(assessment);
    }
    catch (error) {
        console.error('Create assessment error:', error);
        res.status(500).json({ message: 'Server error creating assessment' });
    }
};
exports.createAssessment = createAssessment;
/**
 * Update an assessment
 * @route PUT /api/assessment/:id
 * @access Private (Admin/Instructor)
 */
const updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, moduleId, difficultyLevel, timeLimit, passThreshold, isActive } = req.body;
        // Create update data
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (timeLimit !== undefined)
            updateData.timeLimit = timeLimit;
        if (passThreshold !== undefined)
            updateData.passThreshold = passThreshold;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (difficultyLevel !== undefined) {
            updateData.difficultyLevel = difficultyLevel;
        }
        if (moduleId !== undefined) {
            updateData.learningModule = {
                connect: { id: parseInt(moduleId) }
            };
        }
        const assessment = await assessment_service_1.default.updateAssessment(parseInt(id), updateData);
        res.status(200).json(assessment);
    }
    catch (error) {
        console.error('Update assessment error:', error);
        res.status(500).json({ message: 'Server error updating assessment' });
    }
};
exports.updateAssessment = updateAssessment;
/**
 * Delete an assessment
 * @route DELETE /api/assessment/:id
 * @access Private (Admin/Instructor)
 */
const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const assessment = await assessment_service_1.default.deleteAssessment(parseInt(id));
        res.status(200).json({ message: 'Assessment deleted successfully', assessment });
    }
    catch (error) {
        console.error('Delete assessment error:', error);
        res.status(500).json({ message: 'Server error deleting assessment' });
    }
};
exports.deleteAssessment = deleteAssessment;
/**
 * Get an assessment by ID
 * @route GET /api/assessment/:id
 * @access Private
 */
const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const includeQuestions = req.query.includeQuestions !== 'false';
        const assessment = await assessment_service_1.default.getAssessmentById(parseInt(id), includeQuestions);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }
        res.status(200).json(assessment);
    }
    catch (error) {
        console.error('Get assessment error:', error);
        res.status(500).json({ message: 'Server error retrieving assessment' });
    }
};
exports.getAssessmentById = getAssessmentById;
/**
 * Get all assessments with filtering
 * @route GET /api/assessment
 * @access Private (Admin/Instructor)
 */
const getAllAssessments = async (req, res) => {
    try {
        const { moduleId, title, isActive, difficultyLevel, page, limit } = req.query;
        const filters = {
            moduleId: moduleId ? parseInt(moduleId) : undefined,
            title: title,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            difficultyLevel: difficultyLevel,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        };
        const assessments = await assessment_service_1.default.getAssessments(filters);
        res.status(200).json(assessments);
    }
    catch (error) {
        console.error('Get assessments error:', error);
        res.status(500).json({ message: 'Server error retrieving assessments' });
    }
};
exports.getAllAssessments = getAllAssessments;
/**
 * Generate a new quiz for the user
 * @route POST /api/assessment/generate
 * @access Private
 */
const generateQuiz = async (req, res) => {
    try {
        const { moduleId, difficultyLevel, questionCount } = req.body;
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const userId = req.user.id;
        // Generate quiz
        const quiz = await assessment_service_1.default.generateQuiz(userId, moduleId, difficultyLevel, questionCount || 10);
        res.status(200).json(quiz);
    }
    catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({ message: 'Server error generating quiz' });
    }
};
exports.generateQuiz = generateQuiz;
/**
 * Submit an assessment attempt
 * @route POST /api/assessment/:id/submit
 * @access Private
 */
const submitAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, timeSpentSeconds } = req.body;
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const userId = req.user.id;
        // Validate required fields
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Please provide an array of answers' });
        }
        // Submit the assessment
        const result = await assessment_service_1.default.submitAssessment(userId, parseInt(id), answers, timeSpentSeconds || 0);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Submit assessment error:', error);
        res.status(500).json({ message: 'Server error submitting assessment' });
    }
};
exports.submitAssessment = submitAssessment;
/**
 * Get user's assessment history
 * @route GET /api/assessment/history
 * @access Private
 */
const getAssessmentHistory = async (req, res) => {
    try {
        const { page, limit } = req.query;
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const userId = req.user.id;
        const history = await assessment_service_1.default.getUserAssessmentHistory(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
        res.status(200).json(history);
    }
    catch (error) {
        console.error('Get assessment history error:', error);
        res.status(500).json({ message: 'Server error retrieving assessment history' });
    }
};
exports.getAssessmentHistory = getAssessmentHistory;
/**
 * Get detailed results for a specific assessment attempt
 * @route GET /api/assessment/attempt/:id
 * @access Private
 */
const getAttemptDetails = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const userId = req.user.id;
        const details = await assessment_service_1.default.getAttemptDetails(parseInt(id), userId);
        res.status(200).json(details);
    }
    catch (error) {
        console.error('Get attempt details error:', error);
        res.status(500).json({ message: 'Server error retrieving attempt details' });
    }
};
exports.getAttemptDetails = getAttemptDetails;
/**
 * Get user's assessment progress metrics
 * @route GET /api/assessment/progress
 * @access Private
 */
const getAssessmentProgress = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const userId = req.user.id;
        const progress = await assessment_service_1.default.getUserAssessmentProgress(userId);
        res.status(200).json(progress);
    }
    catch (error) {
        console.error('Get assessment progress error:', error);
        res.status(500).json({ message: 'Server error retrieving assessment progress' });
    }
};
exports.getAssessmentProgress = getAssessmentProgress;
