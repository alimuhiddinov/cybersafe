"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const assessment_service_1 = __importDefault(require("../services/assessment.service"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
/**
 * Test API endpoint that verifies the assessment engine
 * This is only for development and testing purposes
 */
router.get('/assessment-engine', async (req, res) => {
    try {
        const results = {
            status: 'success',
            steps: [],
        };
        // Step 1: Get a test user
        const user = await prisma.user.findFirst({
            where: { role: 'USER' }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No test user found. Please ensure the database is seeded with at least one regular user.'
            });
        }
        results.steps.push({
            step: 'Find test user',
            success: true,
            data: {
                userId: user.id,
                username: user.username
            }
        });
        // Step 2: Get a test module
        const module = await prisma.learningModule.findFirst();
        if (!module) {
            return res.status(404).json({
                status: 'error',
                message: 'No learning modules found. Please ensure the database is seeded.',
                steps: results.steps
            });
        }
        results.steps.push({
            step: 'Find test module',
            success: true,
            data: {
                moduleId: module.id,
                title: module.title
            }
        });
        // Step 3: Create a test assessment if none exists
        let assessment = await prisma.assessment.findFirst({
            where: {
                moduleId: module.id,
                isActive: true
            }
        });
        if (!assessment) {
            assessment = await prisma.assessment.create({
                data: {
                    title: 'Test Assessment',
                    description: 'This is a test assessment',
                    passThreshold: 70,
                    timeLimit: 15,
                    moduleId: module.id,
                    isActive: true,
                    randomizeQuestions: false
                }
            });
            // Create some sample questions
            const questions = [];
            for (let i = 0; i < 3; i++) {
                const question = await prisma.question.create({
                    data: {
                        questionText: `Test question ${i + 1}`,
                        questionType: client_1.QuestionType.MULTIPLE_CHOICE,
                        difficultyLevel: client_1.DifficultyLevel.BEGINNER,
                        orderIndex: i,
                        points: 5,
                        assessmentId: assessment.id,
                        answers: {
                            create: [
                                {
                                    answerText: 'Correct answer',
                                    isCorrect: true,
                                    explanation: 'This is the correct answer'
                                },
                                {
                                    answerText: 'Wrong answer',
                                    isCorrect: false,
                                    explanation: 'This is an incorrect answer'
                                }
                            ]
                        }
                    },
                    include: {
                        answers: true
                    }
                });
                questions.push(question);
            }
        }
        results.steps.push({
            step: 'Prepare test assessment',
            success: true,
            data: {
                assessmentId: assessment.id,
                title: assessment.title
            }
        });
        // Step 4: Generate a quiz
        const generatedQuiz = await assessment_service_1.default.generateQuiz(user.id, module.id, client_1.DifficultyLevel.BEGINNER, 3 // 3 questions
        );
        results.steps.push({
            step: 'Generate quiz',
            success: true,
            data: {
                quizId: generatedQuiz.id,
                title: generatedQuiz.title,
                questionCount: generatedQuiz.questions.length
            }
        });
        // Step 5: Get the questions with answers
        const questionsWithAnswers = await prisma.question.findMany({
            where: {
                assessmentId: generatedQuiz.id
            },
            include: {
                answers: true
            }
        });
        // Step 6: Submit assessment (use the correct answers for testing)
        const answers = questionsWithAnswers.map(question => {
            const correctAnswer = question.answers.find(a => a.isCorrect);
            return {
                questionId: question.id,
                answerId: (correctAnswer === null || correctAnswer === void 0 ? void 0 : correctAnswer.id) || null,
            };
        });
        const result = await assessment_service_1.default.submitAssessment(user.id, generatedQuiz.id, answers, 60 // 1 minute
        );
        results.steps.push({
            step: 'Submit assessment',
            success: true,
            data: {
                score: result.attempt.score,
                isPassed: result.attempt.isPassed,
                pointsEarned: result.attempt.pointsEarned,
                correctAnswers: result.feedback.correctAnswers,
                totalQuestions: result.feedback.totalQuestions
            }
        });
        // Step 7: Get user assessment history
        const history = await assessment_service_1.default.getUserAssessmentHistory(user.id);
        results.steps.push({
            step: 'Get assessment history',
            success: true,
            data: {
                attemptCount: history.data.length,
                recentAttempt: history.data.length > 0 ? {
                    id: history.data[0].id,
                    title: history.data[0].title,
                    score: history.data[0].score
                } : null
            }
        });
        // Step 8: Get user assessment progress
        const progress = await assessment_service_1.default.getUserAssessmentProgress(user.id);
        results.steps.push({
            step: 'Get assessment progress',
            success: true,
            data: {
                passRate: progress.summary.passRate,
                averageScore: progress.summary.averageScore,
                accuracy: progress.summary.accuracy
            }
        });
        // Return all test results
        return res.json(results);
    }
    catch (error) {
        console.error('Error during assessment engine test:', error);
        return res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred during assessment engine test',
            error: error
        });
    }
});
exports.default = router;
