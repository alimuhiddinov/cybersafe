import { Request, Response } from 'express';
import moduleService from '../services/module.service';
import { DifficultyLevel, UserRole } from '@prisma/client';

/**
 * Get all modules with filtering and pagination
 * @route GET /api/modules
 * @access Public (with content filtering based on user role)
 */
export const getAllModules = async (req: Request, res: Response) => {
  try {
    const {
      search,
      difficulty,
      published,
      orderBy,
      orderDirection,
      page,
      limit
    } = req.query;

    // Parse query parameters
    const filters = {
      search: search as string,
      difficultyLevel: difficulty as DifficultyLevel,
      isPublished: published === 'true' ? true : published === 'false' ? false : undefined,
      orderBy: orderBy as string,
      orderDirection: (orderDirection as 'asc' | 'desc') || 'desc',
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };

    // Get user role from authenticated user or default to USER
    const userRole: UserRole = (req.user?.role as UserRole) || 'USER';

    const result = await moduleService.getModules(filters, userRole);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Get all modules error:', error);
    res.status(500).json({ message: 'Server error retrieving modules' });
  }
};

/**
 * Get a single module by ID
 * @route GET /api/modules/:moduleId
 * @access Public (with content filtering based on publication status)
 */
export const getModuleById = async (req: Request, res: Response) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({ message: 'Invalid module ID' });
    }

    const module = await moduleService.getModuleDetails(moduleId);
    
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
  } catch (error) {
    console.error('Get module by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving module' });
  }
};

/**
 * Get module content 
 * @route GET /api/modules/:moduleId/content
 * @access Public 
 */
export const getModuleContent = async (req: Request, res: Response) => {
  try {
    // Module middleware already checked if module exists 
    const module = (req as any).module;
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const content = await moduleService.getModuleContent(module.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Module content not found' });
    }
    
    res.status(200).json(content);
  } catch (error) {
    console.error('Get module content error:', error);
    res.status(500).json({ message: 'Server error retrieving module content' });
  }
};

/**
 * Create a new module
 * @route POST /api/modules
 * @access Private (Admin only)
 */
export const createModule = async (req: Request, res: Response) => {
  try {
    // Check if user is authorized (admin or instructor)
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR')) {
      return res.status(403).json({ message: 'Not authorized to create modules' });
    }

    const {
      title,
      description,
      content,
      difficultyLevel,
      estimatedTimeMinutes,
      points,
      prerequisites,
      imageUrl,
      isPublished,
      orderIndex
    } = req.body;

    // Validate required fields
    if (!title || !description || !content || !difficultyLevel) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        requiredFields: ['title', 'description', 'content', 'difficultyLevel']
      });
    }

    // Create new module
    const newModule = await moduleService.createModule(
      {
        title,
        description,
        content,
        difficultyLevel: difficultyLevel as DifficultyLevel,
        estimatedTimeMinutes: parseInt(estimatedTimeMinutes) || 30,
        points: parseInt(points) || 0,
        prerequisites,
        imageUrl,
        isPublished: Boolean(isPublished),
        orderIndex: parseInt(orderIndex) || 0
      },
      req.user.id
    );
    
    res.status(201).json({
      message: 'Module created successfully',
      module: newModule
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ message: 'Server error creating module' });
  }
};

/**
 * Update an existing module
 * @route PUT /api/modules/:moduleId
 * @access Private (Admin only)
 */
export const updateModule = async (req: Request, res: Response) => {
  try {
    // Check if user is authorized (admin or instructor)
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR')) {
      return res.status(403).json({ message: 'Not authorized to update modules' });
    }

    const moduleId = parseInt(req.params.moduleId);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({ message: 'Invalid module ID' });
    }

    const {
      title,
      description,
      content,
      difficultyLevel,
      estimatedTimeMinutes,
      points,
      prerequisites,
      imageUrl,
      isPublished,
      orderIndex
    } = req.body;

    // Check if module exists
    const existingModule = await moduleService.getModuleById(moduleId);
    
    if (!existingModule) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Update module
    const updatedModule = await moduleService.updateModule(moduleId, {
      title,
      description,
      content,
      difficultyLevel: difficultyLevel as DifficultyLevel,
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
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error updating module' });
  }
};

/**
 * Delete a module
 * @route DELETE /api/modules/:moduleId
 * @access Private (Admin only)
 */
export const deleteModule = async (req: Request, res: Response) => {
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
    const existingModule = await moduleService.getModuleById(moduleId);
    
    if (!existingModule) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Delete module
    await moduleService.deleteModule(moduleId);
    
    res.status(200).json({
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error deleting module' });
  }
};

/**
 * Get recommended modules for a user
 * @route GET /api/modules/recommended
 * @access Private (Requires authentication)
 */
export const getRecommendedModules = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const recommendedModules = await moduleService.getRecommendedModules(req.user.id);
    
    res.status(200).json(recommendedModules);
  } catch (error) {
    console.error('Get recommended modules error:', error);
    res.status(500).json({ message: 'Server error retrieving recommended modules' });
  }
};
