"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Service for handling learning module operations
 */
class ModuleService {
    /**
     * Create a new learning module
     */
    async createModule(data, createdById) {
        return prisma.learningModule.create({
            data: {
                ...data,
                createdById
            }
        });
    }
    /**
     * Update an existing learning module
     */
    async updateModule(id, data) {
        return prisma.learningModule.update({
            where: { id },
            data
        });
    }
    /**
     * Delete a learning module
     */
    async deleteModule(id) {
        return prisma.learningModule.delete({
            where: { id }
        });
    }
    /**
     * Get a single module by ID
     */
    async getModuleById(id) {
        return prisma.learningModule.findUnique({
            where: { id }
        });
    }
    /**
     * Get module details with assessments
     */
    async getModuleDetails(id, includeAssessments = true) {
        if (includeAssessments) {
            return prisma.learningModule.findUnique({
                where: { id },
                include: {
                    assessments: {
                        include: {
                            questions: true
                        }
                    }
                }
            });
        }
        else {
            return prisma.learningModule.findUnique({
                where: { id }
            });
        }
    }
    /**
     * Get all modules with filtering, pagination and sorting
     */
    async getModules(params, userRole = 'USER') {
        const { search, difficultyLevel, isPublished, orderBy = 'createdAt', orderDirection = 'desc', page = 1, limit = 10 } = params;
        // Build where clause based on filters
        const where = {};
        // Search in title or description
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }
        // Filter by difficulty level
        if (difficultyLevel) {
            where.difficultyLevel = difficultyLevel;
        }
        // Filter by published status (only show published for regular users)
        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }
        else if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
            where.isPublished = true;
        }
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Get total count for pagination
        const total = await prisma.learningModule.count({ where });
        // Execute query with filters and pagination
        const data = await prisma.learningModule.findMany({
            where,
            orderBy: {
                [orderBy]: orderDirection
            },
            skip,
            take: limit
        });
        // Calculate total pages
        const pages = Math.ceil(total / limit);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                pages
            }
        };
    }
    /**
     * Get learning module content
     */
    async getModuleContent(id) {
        const module = await prisma.learningModule.findUnique({
            where: { id },
            select: { content: true }
        });
        return module;
    }
    /**
     * Get recommended modules for a user based on their progress
     */
    async getRecommendedModules(userId) {
        // Get user's completed modules
        const completedModules = await prisma.userProgress.findMany({
            where: {
                userId,
                completionStatus: 'COMPLETED'
            },
            select: {
                moduleId: true
            }
        });
        const completedModuleIds = completedModules.map(m => m.moduleId);
        // Get modules in progress
        const inProgressModules = await prisma.userProgress.findMany({
            where: {
                userId,
                completionStatus: 'IN_PROGRESS'
            },
            select: {
                moduleId: true
            }
        });
        const inProgressModuleIds = inProgressModules.map(m => m.moduleId);
        // First priority: Return modules that are in progress
        if (inProgressModuleIds.length > 0) {
            const inProgressModulesData = await prisma.learningModule.findMany({
                where: {
                    id: { in: inProgressModuleIds },
                    isPublished: true
                },
                orderBy: {
                    orderIndex: 'asc'
                },
                take: 3
            });
            if (inProgressModulesData.length > 0) {
                return inProgressModulesData;
            }
        }
        // Second priority: Get next logical modules based on difficulty and prerequisites
        // First, find the highest difficulty level the user has completed
        const highestCompletedLevel = await prisma.learningModule.findFirst({
            where: {
                id: { in: completedModuleIds }
            },
            orderBy: {
                difficultyLevel: 'desc'
            },
            select: {
                difficultyLevel: true
            }
        });
        // Default to BEGINNER if no modules completed
        const targetDifficulty = (highestCompletedLevel === null || highestCompletedLevel === void 0 ? void 0 : highestCompletedLevel.difficultyLevel) || 'BEGINNER';
        // Get modules at the same or next difficulty level that the user hasn't started yet
        return prisma.learningModule.findMany({
            where: {
                id: { notIn: [...completedModuleIds, ...inProgressModuleIds] },
                isPublished: true,
                OR: [
                    { difficultyLevel: targetDifficulty },
                    { difficultyLevel: this.getNextDifficultyLevel(targetDifficulty) }
                ]
            },
            orderBy: [
                { difficultyLevel: 'asc' },
                { orderIndex: 'asc' }
            ],
            take: 3
        });
    }
    /**
     * Get the next difficulty level
     */
    getNextDifficultyLevel(current) {
        const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
        const currentIndex = levels.indexOf(current);
        // If already at the highest level or invalid, return current
        if (currentIndex === -1 || currentIndex === levels.length - 1) {
            return current;
        }
        return levels[currentIndex + 1];
    }
}
exports.ModuleService = ModuleService;
exports.default = new ModuleService();
