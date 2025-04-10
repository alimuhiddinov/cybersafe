import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// User general progress and stats routes - Private (requires authentication)
router.get('/progress', authenticate, progressController.getUserProgress);
router.get('/stats', authenticate, progressController.getUserStats);
router.get('/activity', authenticate, progressController.getUserActivity);
router.get('/achievements', authenticate, progressController.getUserAchievements);

// Module specific progress operations
router.post('/module/:moduleId/start', authenticate, progressController.startModule);
router.post('/module/:moduleId/complete', authenticate, progressController.completeModule);
router.post('/module/:moduleId/notes', authenticate, progressController.saveNotes);
router.post('/module/:moduleId/bookmarks', authenticate, progressController.saveBookmarks);

// Admin analytics routes
router.get('/analytics', authenticate, progressController.getPlatformAnalytics);

export default router;
