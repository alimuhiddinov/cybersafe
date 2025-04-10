"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const module_routes_1 = __importDefault(require("./module.routes"));
const progress_routes_1 = __importDefault(require("./progress.routes"));
const assessment_routes_1 = __importDefault(require("./assessment.routes"));
const question_routes_1 = __importDefault(require("./question.routes"));
const test_routes_1 = __importDefault(require("./test.routes"));
const feedback_routes_1 = __importDefault(require("./feedback.routes"));
const router = (0, express_1.Router)();
// Health check for API routes
router.get('/', (_, res) => {
    res.json({
        message: 'CyberSafe API',
        version: '1.0.0',
        status: 'online'
    });
});
// Mount route groups
router.use('/auth', auth_routes_1.default);
router.use('/modules', module_routes_1.default);
router.use('/progress', progress_routes_1.default);
router.use('/assessments', assessment_routes_1.default);
router.use('/questions', question_routes_1.default);
router.use('/test', test_routes_1.default);
router.use('/feedback', feedback_routes_1.default);
// Add more route groups as needed:
// router.use('/courses', courseRoutes);
// router.use('/users', userRoutes);
// router.use('/lessons', lessonRoutes);
exports.default = router;
