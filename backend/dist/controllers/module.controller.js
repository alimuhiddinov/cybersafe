"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedModules = exports.deleteModule = exports.updateModule = exports.createModule = exports.getModuleContent = exports.getModuleById = exports.getAllModules = void 0;
const module_service_1 = __importDefault(require("../services/module.service"));
/**
 * Get all modules with filtering and pagination
 * @route GET /api/modules
 * @access Public (with content filtering based on user role)
 */
const getAllModules = async (req, res) => {
    var _a;
    try {
        const { search, difficulty, published, orderBy, orderDirection, page, limit } = req.query;
        // Parse query parameters
        const filters = {
            search: search,
            difficultyLevel: difficulty,
            isPublished: published === 'true' ? true : published === 'false' ? false : undefined,
            orderBy: orderBy,
            orderDirection: orderDirection || 'desc',
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        };
        // Get user role from authenticated user or default to USER
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || 'USER';
        const result = await module_service_1.default.getModules(filters, userRole);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Get all modules error:', error);
        res.status(500).json({ message: 'Server error retrieving modules' });
    }
};
exports.getAllModules = getAllModules;
/**
 * Get a single module by ID
 * @route GET /api/modules/:moduleId
 * @access Public (with content filtering based on publication status)
 */
const getModuleById = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        const module = await module_service_1.default.getModuleDetails(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        // If module is not published, only allow admin and instructor access
        if (!module.isPublished && (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR'))) {
            return res.status(403).json({
                message: 'This module is not yet published',
                isPublished: false
            });
        }
        res.status(200).json(module);
    }
    catch (error) {
        console.error('Get module by ID error:', error);
        res.status(500).json({ message: 'Server error retrieving module' });
    }
};
exports.getModuleById = getModuleById;
/**
 * Get module content
 * @route GET /api/modules/:moduleId/content
 * @access Public
 */
const getModuleContent = async (req, res) => {
    try {
        // Module middleware already checked if module exists 
        const module = req.module;
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        const content = await module_service_1.default.getModuleContent(module.id);
        if (!content) {
            return res.status(404).json({ message: 'Module content not found' });
        }
        res.status(200).json(content);
    }
    catch (error) {
        console.error('Get module content error:', error);
        res.status(500).json({ message: 'Server error retrieving module content' });
    }
};
exports.getModuleContent = getModuleContent;
/**
 * Create a new module
 * @route POST /api/modules
 * @access Private (Admin only)
 */
const createModule = async (req, res) => {
    try {
        // Check if user is authorized (admin or instructor)
        if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR')) {
            return res.status(403).json({ message: 'Not authorized to create modules' });
        }
        const { title, description, content, difficultyLevel, estimatedTimeMinutes, points, prerequisites, imageUrl, isPublished, orderIndex } = req.body;
        // Validate required fields
        if (!title || !description || !content || !difficultyLevel) {
            return res.status(400).json({
                message: 'Missing required fields',
                requiredFields: ['title', 'description', 'content', 'difficultyLevel']
            });
        }
        // Create new module
        const newModule = await module_service_1.default.createModule({
            title,
            description,
            content,
            difficultyLevel: difficultyLevel,
            estimatedTimeMinutes: parseInt(estimatedTimeMinutes) || 30,
            points: parseInt(points) || 0,
            prerequisites,
            imageUrl,
            isPublished: Boolean(isPublished),
            orderIndex: parseInt(orderIndex) || 0
        }, req.user.id);
        res.status(201).json({
            message: 'Module created successfully',
            module: newModule
        });
    }
    catch (error) {
        console.error('Create module error:', error);
        res.status(500).json({ message: 'Server error creating module' });
    }
};
exports.createModule = createModule;
/**
 * Update an existing module
 * @route PUT /api/modules/:moduleId
 * @access Private (Admin only)
 */
const updateModule = async (req, res) => {
    try {
        // Check if user is authorized (admin or instructor)
        if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR')) {
            return res.status(403).json({ message: 'Not authorized to update modules' });
        }
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        const { title, description, content, difficultyLevel, estimatedTimeMinutes, points, prerequisites, imageUrl, isPublished, orderIndex } = req.body;
        // Check if module exists
        const existingModule = await module_service_1.default.getModuleById(moduleId);
        if (!existingModule) {
            return res.status(404).json({ message: 'Module not found' });
        }
        // Update module
        const updatedModule = await module_service_1.default.updateModule(moduleId, {
            title,
            description,
            content,
            difficultyLevel: difficultyLevel,
            estimatedTimeMinutes: estimatedTimeMinutes !== undefined ? parseInt(estimatedTimeMinutes) : undefined,
            points: points !== undefined ? parseInt(points) : undefined,
            prerequisites,
            imageUrl,
            isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
            orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined
        });
        res.status(200).json({
            message: 'Module updated successfully',
            module: updatedModule
        });
    }
    catch (error) {
        console.error('Update module error:', error);
        res.status(500).json({ message: 'Server error updating module' });
    }
};
exports.updateModule = updateModule;
/**
 * Delete a module
 * @route DELETE /api/modules/:moduleId
 * @access Private (Admin only)
 */
const deleteModule = async (req, res) => {
    try {
        // Check if user is authorized (admin only)
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete modules' });
        }
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
            return res.status(400).json({ message: 'Invalid module ID' });
        }
        // Check if module exists
        const existingModule = await module_service_1.default.getModuleById(moduleId);
        if (!existingModule) {
            return res.status(404).json({ message: 'Module not found' });
        }
        // Delete module
        await module_service_1.default.deleteModule(moduleId);
        res.status(200).json({
            message: 'Module deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete module error:', error);
        res.status(500).json({ message: 'Server error deleting module' });
    }
};
exports.deleteModule = deleteModule;
/**
 * Get recommended modules for a user
 * @route GET /api/modules/recommended
 * @access Private (Requires authentication)
 */
const getRecommendedModules = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const recommendedModules = await module_service_1.default.getRecommendedModules(req.user.id);
        res.status(200).json(recommendedModules);
    }
    catch (error) {
        console.error('Get recommended modules error:', error);
        res.status(500).json({ message: 'Server error retrieving recommended modules' });
    }
};
exports.getRecommendedModules = getRecommendedModules;
