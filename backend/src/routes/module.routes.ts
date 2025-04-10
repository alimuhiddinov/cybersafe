import { Router } from 'express';
import * as moduleController from '../controllers/module.controller';
import * as progressController from '../controllers/progress.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { moduleExists, checkPremiumAccess, checkModulePublished } from '../middleware/module.middleware';

const router = Router();

// Module listing and filtering routes - Public
router.get('/', moduleController.getAllModules);
router.get('/recommended', authenticate, moduleController.getRecommendedModules);

// Module detail routes - Public with possible restrictions
router.get('/:moduleId', moduleExists, checkModulePublished, moduleController.getModuleById);
router.get('/:moduleId/content', moduleExists, checkModulePublished, checkPremiumAccess, moduleController.getModuleContent);

// Module progress routes - Private (requires authentication)
router.get('/:moduleId/progress', authenticate, progressController.getModuleProgress);
router.post('/:moduleId/progress', authenticate, moduleExists, progressController.updateProgress);

// Admin module management routes - Private (requires admin or instructor role)
router.post('/', authenticate, authorize(['ADMIN', 'INSTRUCTOR']), moduleController.createModule);
router.put('/:moduleId', authenticate, authorize(['ADMIN', 'INSTRUCTOR']), moduleExists, moduleController.updateModule);
router.delete('/:moduleId', authenticate, authorize(['ADMIN']), moduleExists, moduleController.deleteModule);

export default router;
