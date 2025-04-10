import { Router } from 'express';
import authRoutes from './auth.routes';
import moduleRoutes from './module.routes';
import progressRoutes from './progress.routes';
import assessmentRoutes from './assessment.routes';
import questionRoutes from './question.routes';
import testRoutes from './test.routes';
import feedbackRoutes from './feedback.routes';

const router = Router();

// Health check for API routes
router.get('/', (_, res) => {
  res.json({
    message: 'CyberSafe API',
    version: '1.0.0',
    status: 'online'
  });
});

// Mount route groups
router.use('/auth', authRoutes);
router.use('/modules', moduleRoutes);
router.use('/progress', progressRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/questions', questionRoutes);
router.use('/test', testRoutes);
router.use('/feedback', feedbackRoutes);
// Add more route groups as needed:
// router.use('/courses', courseRoutes);
// router.use('/users', userRoutes);
// router.use('/lessons', lessonRoutes);

export default router;
