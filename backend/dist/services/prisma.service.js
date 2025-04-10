"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class PrismaService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Test database connectivity and return version information
     */
    async testConnection() {
        try {
            // Execute a simple query to verify database connection
            const result = await this.prisma.$queryRaw `SELECT sqlite_version() as version`;
            return { connected: true, info: result };
        }
        catch (error) {
            console.error('Database connection error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            return { connected: false, error: errorMessage };
        }
    }
    /**
     * Get all users with their badges
     */
    async getAllUsersWithBadges() {
        try {
            return await this.prisma.user.findMany({
                include: {
                    userBadges: {
                        include: {
                            badge: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            console.error('Error fetching users with badges:', error);
            throw error;
        }
    }
    /**
     * Get all learning modules with their creator
     */
    async getAllLearningModules() {
        try {
            return await this.prisma.learningModule.findMany({
                include: {
                    assessments: true,
                },
                orderBy: {
                    orderIndex: 'asc',
                },
            });
        }
        catch (error) {
            console.error('Error fetching learning modules:', error);
            throw error;
        }
    }
    /**
     * Get user progress for a specific user
     */
    async getUserProgress(userId) {
        try {
            return await this.prisma.userProgress.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    learningModule: true,
                },
                orderBy: {
                    lastAccessedAt: 'desc',
                },
            });
        }
        catch (error) {
            console.error(`Error fetching progress for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Get an assessment with all its questions and answers
     */
    async getAssessmentWithQuestions(assessmentId) {
        try {
            return await this.prisma.assessment.findUnique({
                where: {
                    id: assessmentId,
                },
                include: {
                    learningModule: true,
                    questions: {
                        include: {
                            answers: true,
                        },
                        orderBy: {
                            orderIndex: 'asc',
                        },
                    },
                },
            });
        }
        catch (error) {
            console.error(`Error fetching assessment ${assessmentId}:`, error);
            throw error;
        }
    }
    /**
     * Get user assessment attempts for a specific user
     */
    async getUserAssessmentAttempts(userId) {
        try {
            return await this.prisma.userAssessmentAttempt.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    assessment: true,
                    userAnswers: {
                        include: {
                            question: true,
                            answer: true,
                        },
                    },
                },
                orderBy: {
                    startedAt: 'desc',
                },
            });
        }
        catch (error) {
            console.error(`Error fetching assessment attempts for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Create a new user with premium status
     */
    async createPremiumUser(userData) {
        try {
            return await this.prisma.user.create({
                data: userData,
            });
        }
        catch (error) {
            console.error('Error creating premium user:', error);
            throw error;
        }
    }
    /**
     * Award a badge to a user
     */
    async awardBadgeToUser(userId, badgeId) {
        try {
            // Check if user already has the badge
            const existingBadge = await this.prisma.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId: userId,
                        badgeId: badgeId,
                    },
                },
            });
            if (existingBadge) {
                return { success: false, message: 'User already has this badge' };
            }
            // Award the badge
            const userBadge = await this.prisma.userBadge.create({
                data: {
                    userId: userId,
                    badgeId: badgeId,
                    awardedAt: new Date(),
                },
                include: {
                    badge: true,
                },
            });
            return {
                success: true,
                message: 'Badge awarded successfully',
                data: userBadge,
            };
        }
        catch (error) {
            console.error(`Error awarding badge ${badgeId} to user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Update user progress for a module
     */
    async updateUserProgress(userId, moduleId, progressData) {
        try {
            return await this.prisma.userProgress.upsert({
                where: {
                    userId_moduleId: {
                        userId: userId,
                        moduleId: moduleId,
                    },
                },
                update: {
                    ...progressData,
                    lastAccessedAt: new Date(),
                },
                create: {
                    userId: userId,
                    moduleId: moduleId,
                    lastAccessedAt: new Date(),
                    ...progressData,
                    pointsEarned: progressData.pointsEarned || 0,
                },
            });
        }
        catch (error) {
            console.error(`Error updating progress for user ${userId} on module ${moduleId}:`, error);
            throw error;
        }
    }
    /**
     * Get leaderboard (top users by points earned)
     */
    async getLeaderboard(limit = 10) {
        try {
            // Get all user progress records grouped by user
            const userProgressSums = await this.prisma.userProgress.groupBy({
                by: ['userId'],
                _sum: {
                    pointsEarned: true,
                },
                orderBy: {
                    _sum: {
                        pointsEarned: 'desc',
                    },
                },
                take: limit,
            });
            // Get the user details for each user in the leaderboard
            const leaderboard = await Promise.all(userProgressSums.map(async (progress) => {
                const user = await this.prisma.user.findUnique({
                    where: { id: progress.userId },
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        userBadges: {
                            include: {
                                badge: true,
                            },
                        },
                    },
                });
                return {
                    ...user,
                    totalPoints: progress._sum.pointsEarned || 0,
                };
            }));
            return leaderboard;
        }
        catch (error) {
            console.error('Error generating leaderboard:', error);
            throw error;
        }
    }
    /**
     * Get a user's dashboard data (progress, badges, recent activities)
     */
    async getUserDashboard(userId) {
        try {
            // Get the user with their badges
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userBadges: {
                        include: {
                            badge: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            // Get the user's progress on all modules
            const progress = await this.prisma.userProgress.findMany({
                where: { userId: userId },
                include: {
                    learningModule: true,
                },
            });
            // Calculate completion statistics
            const moduleStats = {
                completed: progress.filter((p) => p.completionStatus === client_1.CompletionStatus.COMPLETED).length,
                inProgress: progress.filter((p) => p.completionStatus === client_1.CompletionStatus.IN_PROGRESS).length,
                notStarted: progress.filter((p) => p.completionStatus === client_1.CompletionStatus.NOT_STARTED).length,
                totalPoints: progress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0),
            };
            // Get recent assessment attempts
            const recentAttempts = await this.prisma.userAssessmentAttempt.findMany({
                where: { userId: userId },
                include: {
                    assessment: true,
                },
                orderBy: { startedAt: 'desc' },
                take: 5,
            });
            return {
                user,
                moduleStats,
                progress,
                recentAttempts,
            };
        }
        catch (error) {
            console.error(`Error fetching dashboard for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Close the Prisma client connection
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.default = new PrismaService();
