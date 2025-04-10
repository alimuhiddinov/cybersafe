"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformAnalytics = exports.getUserAchievements = exports.getUserActivity = exports.getUserStats = exports.getModuleProgress = exports.getUserProgress = exports.saveBookmarks = exports.saveNotes = exports.completeModule = exports.startModule = exports.updateProgress = void 0;
const progress_service_1 = __importDefault(require("../services/progress.service"));
/**
 * Update user's progress for a module
 * @route POST /api/modules/:moduleId/progress
 * @access Private (Requires authentication)
 */
const updateProgress = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        const { completionStatus, progressPercentage, pointsEarned, timeSpentSeconds } = req.body;
        // Validate completion status if provided
        if (completionStatus && !['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(completionStatus)) {
            return res.status(400).json({
                message: 'Invalid completion status',
                validValues: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']
            });
        }
        // Validate progress percentage if provided
        if (progressPercentage !== undefined) {
            const progress = parseFloat(progressPercentage);
            if (isNaN(progress) || progress < 0 || progress > 100) {
                return res.status(400).json({
                    message: 'Progress percentage must be between 0 and 100'
                });
            }
        }
        // Validate points earned if provided
        if (pointsEarned !== undefined) {
            const points = parseInt(pointsEarned);
            if (isNaN(points) || points < 0) {
                return res.status(400).json({
                    message: 'Points earned must be a positive number'
                });
            }
        }
        // Validate time spent if provided
        if (timeSpentSeconds !== undefined) {
            const time = parseInt(timeSpentSeconds);
            if (isNaN(time) || time < 0) {
                return res.status(400).json({
                    message: 'Time spent must be a positive number of seconds'
                });
            }
        }
        // Update progress
        const progress = await progress_service_1.default.updateProgress(req.user.id, moduleId, {
            completionStatus: completionStatus,
            progressPercentage: progressPercentage !== undefined ? parseFloat(progressPercentage) : undefined,
            pointsEarned: pointsEarned !== undefined ? parseInt(pointsEarned) : undefined,
            timeSpentSeconds: timeSpentSeconds !== undefined ? parseInt(timeSpentSeconds) : undefined
        });
        res.status(200).json({
            message: 'Progress updated successfully',
            progress
        });
    }
    catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Server error updating progress' });
    }
};
exports.updateProgress = updateProgress;
/**
 * Start a module
 * @route POST /api/progress/module/:moduleId/start
 * @access Private (Requires authentication)
 */
const startModule = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        const progress = await progress_service_1.default.startModule(req.user.id, moduleId);
        res.status(200).json({
            message: 'Module started successfully',
            progress
        });
    }
    catch (error) {
        console.error('Start module error:', error);
        res.status(500).json({ message: 'Server error starting module' });
    }
};
exports.startModule = startModule;
/**
 * Complete a module
 * @route POST /api/progress/module/:moduleId/complete
 * @access Private (Requires authentication)
 */
const completeModule = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        const { timeSpentSeconds } = req.body;
        // Validate time spent
        let timeSpent = 0;
        if (timeSpentSeconds !== undefined) {
            timeSpent = parseInt(timeSpentSeconds);
            if (isNaN(timeSpent) || timeSpent < 0) {
                return res.status(400).json({
                    message: 'Time spent must be a positive number of seconds'
                });
            }
        }
        const progress = await progress_service_1.default.completeModule(req.user.id, moduleId, timeSpent);
        res.status(200).json({
            message: 'Module completed successfully',
            progress
        });
    }
    catch (error) {
        console.error('Complete module error:', error);
        res.status(500).json({ message: 'Server error completing module' });
    }
};
exports.completeModule = completeModule;
/**
 * Save user notes for a module
 * @route POST /api/progress/module/:moduleId/notes
 * @access Private (Requires authentication)
 */
const saveNotes = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const userId = req.user.id;
        const moduleId = parseInt(req.params.moduleId);
        const { notes } = req.body;
        if (!moduleId || !notes) {
            res.status(400).json({ error: 'Module ID and notes are required' });
            return;
        }
        const result = await progress_service_1.default.saveNotes(userId, moduleId, notes);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ error: 'Failed to save notes' });
    }
};
exports.saveNotes = saveNotes;
/**
 * Save bookmarks for a module
 * @route POST /api/progress/module/:moduleId/bookmarks
 * @access Private (Requires authentication)
 */
const saveBookmarks = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        const { bookmarks } = req.body;
        if (!bookmarks || !Array.isArray(bookmarks)) {
            return res.status(400).json({ message: 'Bookmarks must be provided as an array' });
        }
        // Convert bookmarks array to JSON string
        const bookmarksString = JSON.stringify(bookmarks);
        const progress = await progress_service_1.default.saveBookmarks(req.user.id, moduleId, bookmarksString);
        res.status(200).json({
            message: 'Bookmarks saved successfully',
            progress
        });
    }
    catch (error) {
        console.error('Save bookmarks error:', error);
        res.status(500).json({ message: 'Server error saving bookmarks' });
    }
};
exports.saveBookmarks = saveBookmarks;
/**
 * Get user's progress for all modules
 * @route GET /api/user/progress
 * @access Private (Requires authentication)
 */
const getUserProgress = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const userId = req.user.id;
        const progress = await progress_service_1.default.getUserProgress(userId);
        // Return with consistent field naming for frontend
        const result = progress.map(item => ({
            ...item,
            notes: item.notesSaved, // Add notes alias for backward compatibility
        }));
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error retrieving user progress:', error);
        res.status(500).json({ error: 'Failed to retrieve user progress' });
    }
};
exports.getUserProgress = getUserProgress;
/**
 * Get user's progress for a specific module
 * @route GET /api/modules/:moduleId/progress
 * @access Private (Requires authentication)
 */
const getModuleProgress = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const userId = req.user.id;
        const moduleId = parseInt(req.params.moduleId);
        if (!moduleId) {
            res.status(400).json({ error: 'Module ID is required' });
            return;
        }
        const progress = await progress_service_1.default.getModuleProgress(userId, moduleId);
        if (!progress) {
            res.status(404).json({ error: 'Progress not found' });
            return;
        }
        // Return with consistent field naming for frontend
        const result = {
            ...progress,
            notes: progress.notesSaved, // Add notes alias for backward compatibility
        };
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error retrieving module progress:', error);
        res.status(500).json({ error: 'Failed to retrieve module progress' });
    }
};
exports.getModuleProgress = getModuleProgress;
/**
 * Get user's learning statistics
 * @route GET /api/user/stats
 * @access Private (Requires authentication)
 */
const getUserStats = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const stats = await progress_service_1.default.getUserStats(req.user.id);
        res.status(200).json(stats);
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Server error retrieving user statistics' });
    }
};
exports.getUserStats = getUserStats;
/**
 * Get user's activity history with filtering and pagination
 * @route GET /api/user/activity
 * @access Private (Requires authentication)
 */
const getUserActivity = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const activityType = req.query.type;
        // Validate pagination parameters
        if (isNaN(page) || page < 1) {
            return res.status(400).json({ message: 'Page must be a positive number' });
        }
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ message: 'Limit must be between 1 and 100' });
        }
        const activities = await progress_service_1.default.getUserActivityHistory(req.user.id, page, limit, activityType);
        res.status(200).json(activities);
    }
    catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ message: 'Server error retrieving user activity' });
    }
};
exports.getUserActivity = getUserActivity;
/**
 * Get user's achievements
 * @route GET /api/user/achievements
 * @access Private (Requires authentication)
 */
const getUserAchievements = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const achievements = await progress_service_1.default.getUserAchievements(req.user.id);
        res.status(200).json(achievements);
    }
    catch (error) {
        console.error('Get user achievements error:', error);
        res.status(500).json({ message: 'Server error retrieving user achievements' });
    }
};
exports.getUserAchievements = getUserAchievements;
/**
 * Get platform analytics (admin only)
 * @route GET /api/progress/analytics
 * @access Private (Admin only)
 */
const getPlatformAnalytics = async (req, res) => {
    try {
        // Check if user is authenticated and is admin
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const analytics = await progress_service_1.default.getPlatformAnalytics();
        res.status(200).json(analytics);
    }
    catch (error) {
        console.error('Get platform analytics error:', error);
        res.status(500).json({ message: 'Server error retrieving platform analytics' });
    }
};
exports.getPlatformAnalytics = getPlatformAnalytics;
