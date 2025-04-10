"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
class FeedbackService {
    /**
     * Submit feedback for a learning module
     * @param userId User ID
     * @param moduleId Module ID
     * @param rating Rating (1-5)
     * @param comment Optional comment
     * @returns The created or updated feedback
     */
    async submitModuleFeedback(userId, moduleId, rating, comment) {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        try {
            // Check if feedback already exists for this user-module combination
            const existingFeedback = await prisma.userFeedback.findUnique({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId
                    }
                }
            });
            if (existingFeedback) {
                // Update existing feedback
                return await prisma.userFeedback.update({
                    where: {
                        userId_moduleId: {
                            userId,
                            moduleId
                        }
                    },
                    data: {
                        rating,
                        comment: comment || existingFeedback.comment,
                        updatedAt: new Date()
                    }
                });
            }
            else {
                // Create new feedback
                return await prisma.userFeedback.create({
                    data: {
                        userId,
                        moduleId,
                        rating,
                        comment
                    }
                });
            }
        }
        catch (error) {
            console.error('Error submitting module feedback:', error);
            throw error;
        }
    }
    /**
     * Get feedback by ID
     * @param feedbackId Feedback ID
     * @returns The feedback record
     */
    async getFeedbackById(feedbackId) {
        try {
            return await prisma.userFeedback.findUnique({
                where: { id: feedbackId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    learningModule: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error getting feedback by ID:', error);
            throw error;
        }
    }
    /**
     * Get all feedback for a specific module
     * @param moduleId Module ID
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     * @returns Paginated feedback records for the module
     */
    async getModuleFeedback(moduleId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        try {
            const [feedbackItems, totalCount] = await Promise.all([
                prisma.userFeedback.findMany({
                    where: { moduleId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take
                }),
                prisma.userFeedback.count({
                    where: { moduleId }
                })
            ]);
            return {
                data: feedbackItems,
                metadata: {
                    totalCount,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize)
                }
            };
        }
        catch (error) {
            console.error('Error getting module feedback:', error);
            throw error;
        }
    }
    /**
     * Get all feedback submitted by a specific user
     * @param userId User ID
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     * @returns Paginated feedback records for the user
     */
    async getUserFeedback(userId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        try {
            const [feedbackItems, totalCount] = await Promise.all([
                prisma.userFeedback.findMany({
                    where: { userId },
                    include: {
                        learningModule: {
                            select: {
                                id: true,
                                title: true,
                                description: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take
                }),
                prisma.userFeedback.count({
                    where: { userId }
                })
            ]);
            return {
                data: feedbackItems,
                metadata: {
                    totalCount,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize)
                }
            };
        }
        catch (error) {
            console.error('Error getting user feedback:', error);
            throw error;
        }
    }
    /**
     * Delete a feedback record
     * @param feedbackId Feedback ID
     * @param requestingUserId User ID requesting deletion (for authorization check)
     * @param isAdmin Whether the requesting user is an admin
     * @returns The deleted feedback or null if not authorized
     */
    async deleteFeedback(feedbackId, requestingUserId, isAdmin) {
        try {
            // Find the feedback to check ownership
            const feedback = await prisma.userFeedback.findUnique({
                where: { id: feedbackId }
            });
            if (!feedback) {
                throw new Error('Feedback not found');
            }
            // Only allow deletion if the user owns the feedback or is an admin
            if (feedback.userId !== requestingUserId && !isAdmin) {
                return null; // Not authorized
            }
            // Delete the feedback
            return await prisma.userFeedback.delete({
                where: { id: feedbackId }
            });
        }
        catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    }
    /**
     * Get analytics for module feedback
     * @param moduleId Module ID (optional, if not provided returns analytics for all modules)
     * @returns Feedback analytics data
     */
    async getModuleFeedbackAnalytics(moduleId) {
        try {
            // Base query conditions
            const whereCondition = moduleId ? { moduleId } : {};
            // Get total ratings and average rating
            const aggregatedData = await prisma.userFeedback.aggregate({
                where: whereCondition,
                _avg: {
                    rating: true
                },
                _count: {
                    rating: true
                }
            });
            // Get rating distribution
            const ratingDistribution = await prisma.userFeedback.groupBy({
                by: ['rating'],
                where: whereCondition,
                _count: {
                    rating: true
                },
                orderBy: {
                    rating: 'asc'
                }
            });
            // Format the distribution for easier consumption
            const distribution = Array.from({ length: 5 }, (_, i) => i + 1).map(rating => {
                const found = ratingDistribution.find(item => item.rating === rating);
                return {
                    rating,
                    count: found ? found._count.rating : 0
                };
            });
            // Get comment counts
            const commentsCount = await prisma.userFeedback.count({
                where: {
                    ...whereCondition,
                    comment: {
                        not: null
                    }
                }
            });
            // Get recent trends (last 30 days vs previous 30 days)
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(now.getDate() - 60);
            const recentRatings = await prisma.userFeedback.aggregate({
                where: {
                    ...whereCondition,
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                },
                _avg: {
                    rating: true
                },
                _count: {
                    rating: true
                }
            });
            const previousRatings = await prisma.userFeedback.aggregate({
                where: {
                    ...whereCondition,
                    createdAt: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo
                    }
                },
                _avg: {
                    rating: true
                },
                _count: {
                    rating: true
                }
            });
            return {
                averageRating: aggregatedData._avg.rating || 0,
                totalRatings: aggregatedData._count.rating || 0,
                ratingDistribution: distribution,
                commentsCount,
                recentTrends: {
                    last30Days: {
                        averageRating: recentRatings._avg.rating || 0,
                        count: recentRatings._count.rating || 0
                    },
                    previous30Days: {
                        averageRating: previousRatings._avg.rating || 0,
                        count: previousRatings._count.rating || 0
                    },
                    ratingChange: calculatePercentageChange(previousRatings._avg.rating || 0, recentRatings._avg.rating || 0),
                    volumeChange: calculatePercentageChange(previousRatings._count.rating || 0, recentRatings._count.rating || 0)
                }
            };
        }
        catch (error) {
            console.error('Error getting feedback analytics:', error);
            throw error;
        }
    }
    /**
     * Get feedback analytics across all modules
     * @returns Overall feedback analytics
     */
    async getOverallFeedbackAnalytics() {
        try {
            // Get analytics for all modules
            const overallAnalytics = await this.getModuleFeedbackAnalytics();
            // Get top and bottom rated modules
            const topRatedModules = await prisma.$queryRaw `
        SELECT m.id, m.title, AVG(f.rating) as averageRating, COUNT(f.id) as ratingCount
        FROM "UserFeedback" f
        JOIN "LearningModule" m ON f."moduleId" = m.id
        GROUP BY m.id, m.title
        HAVING COUNT(f.id) >= 3
        ORDER BY averageRating DESC
        LIMIT 5
      `;
            const bottomRatedModules = await prisma.$queryRaw `
        SELECT m.id, m.title, AVG(f.rating) as averageRating, COUNT(f.id) as ratingCount
        FROM "UserFeedback" f
        JOIN "LearningModule" m ON f."moduleId" = m.id
        GROUP BY m.id, m.title
        HAVING COUNT(f.id) >= 3
        ORDER BY averageRating ASC
        LIMIT 5
      `;
            // Get modules with most feedback
            const mostFeedbackModules = await prisma.$queryRaw `
        SELECT m.id, m.title, COUNT(f.id) as feedbackCount, AVG(f.rating) as averageRating
        FROM "UserFeedback" f
        JOIN "LearningModule" m ON f."moduleId" = m.id
        GROUP BY m.id, m.title
        ORDER BY feedbackCount DESC
        LIMIT 5
      `;
            return {
                ...overallAnalytics,
                topRatedModules,
                bottomRatedModules,
                mostFeedbackModules
            };
        }
        catch (error) {
            console.error('Error getting overall feedback analytics:', error);
            throw error;
        }
    }
}
/**
 * Calculate percentage change between two values
 * @param previous Previous value
 * @param current Current value
 * @returns Percentage change or 0 if previous is 0
 */
function calculatePercentageChange(previous, current) {
    if (previous === 0)
        return 0;
    return ((current - previous) / previous) * 100;
}
// Export singleton instance
const feedbackService = new FeedbackService();
exports.default = feedbackService;
