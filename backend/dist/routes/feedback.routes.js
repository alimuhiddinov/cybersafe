"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feedback_service_1 = __importDefault(require("../services/feedback.service"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @route POST /api/feedback
 * @description Submit feedback for a learning module
 * @access Private
 */
router.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { moduleId, rating, comment } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userId = req.user.id;
        if (!moduleId || !rating) {
            return res.status(400).json({ message: 'Module ID and rating are required' });
        }
        const feedback = await feedback_service_1.default.submitModuleFeedback(userId, parseInt(moduleId), parseInt(rating), comment);
        res.status(201).json({
            success: true,
            data: feedback
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to submit feedback'
        });
    }
});
/**
 * @route GET /api/feedback/module/:moduleId
 * @description Get all feedback for a specific module
 * @access Public
 */
router.get('/module/:moduleId', async (req, res) => {
    try {
        const moduleId = parseInt(req.params.moduleId);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const feedback = await feedback_service_1.default.getModuleFeedback(moduleId, page, pageSize);
        res.status(200).json({
            success: true,
            ...feedback
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve module feedback'
        });
    }
});
/**
 * @route GET /api/feedback/user
 * @description Get all feedback submitted by the current user
 * @access Private
 */
router.get('/user', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const feedback = await feedback_service_1.default.getUserFeedback(userId, page, pageSize);
        res.status(200).json({
            success: true,
            ...feedback
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve user feedback'
        });
    }
});
/**
 * @route GET /api/feedback/:id
 * @description Get feedback by ID
 * @access Private
 */
router.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const feedbackId = parseInt(req.params.id);
        const feedback = await feedback_service_1.default.getFeedbackById(feedbackId);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        // Only allow access if user owns the feedback or is an admin
        if (feedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to feedback'
            });
        }
        res.status(200).json({
            success: true,
            data: feedback
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve feedback'
        });
    }
});
/**
 * @route DELETE /api/feedback/:id
 * @description Delete feedback by ID
 * @access Private
 */
router.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const feedbackId = parseInt(req.params.id);
        const isAdmin = req.user.role === 'ADMIN';
        const result = await feedback_service_1.default.deleteFeedback(feedbackId, req.user.id, isAdmin);
        if (!result) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this feedback'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete feedback'
        });
    }
});
/**
 * @route GET /api/feedback/analytics/module/:moduleId
 * @description Get analytics for a specific module's feedback
 * @access Private (Instructors and Admins)
 */
router.get('/analytics/module/:moduleId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Only allow instructors and admins to access analytics
        if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to analytics'
            });
        }
        const moduleId = parseInt(req.params.moduleId);
        const analytics = await feedback_service_1.default.getModuleFeedbackAnalytics(moduleId);
        res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve feedback analytics'
        });
    }
});
/**
 * @route GET /api/feedback/analytics/overall
 * @description Get overall feedback analytics for all modules
 * @access Private (Admins only)
 */
router.get('/analytics/overall', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), async (_req, res) => {
    try {
        const analytics = await feedback_service_1.default.getOverallFeedbackAnalytics();
        res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve overall feedback analytics'
        });
    }
});
exports.default = router;
