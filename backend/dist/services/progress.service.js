"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const client_1 = require("@prisma/client");
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
/**
 * Service for handling user progress operations
 */
class ProgressService {
    /**
     * Update user's progress for a module
     */
    async updateProgress(userId, moduleId, data) {
        // Check if a progress record already exists
        const existingProgress = await prisma.userProgress.findUnique({
            where: {
                userId_moduleId: {
                    userId,
                    moduleId
                }
            }
        });
        const updateData = {
            lastAccessedAt: new Date(),
            ...data
        };
        // If completion status is set to COMPLETED, set completedAt
        if (data.completionStatus === 'COMPLETED') {
            updateData.completedAt = new Date();
            // If this is the first time completing, check for achievements
            if ((existingProgress === null || existingProgress === void 0 ? void 0 : existingProgress.completionStatus) !== 'COMPLETED') {
                await this.checkModuleCompletionAchievements(userId);
            }
            // Update learning streak
            await this.updateLearningStreak(userId);
        }
        if (existingProgress) {
            // Update existing progress
            const updatedProgress = await prisma.userProgress.update({
                where: {
                    id: existingProgress.id
                },
                data: updateData
            });
            // If time spent is provided, update it separately using raw SQL
            const timeSpentValue = data.timeSpentSeconds || 0;
            if (timeSpentValue > 0) {
                await prisma.$executeRaw `
          UPDATE "UserProgress"
          SET "timeSpentSeconds" = "timeSpentSeconds" + ${timeSpentValue}
          WHERE id = ${existingProgress.id}
        `;
            }
            // Get the updated record with the latest data
            const refreshedProgress = await prisma.userProgress.findUnique({
                where: {
                    id: existingProgress.id
                }
            });
            return refreshedProgress || updatedProgress;
        }
        else {
            // Create new progress record with type assertion to bypass TypeScript checks
            const createData = {
                userId,
                moduleId,
                progressPercentage: data.progressPercentage || 0,
                completionStatus: data.completionStatus || 'NOT_STARTED',
                pointsEarned: data.pointsEarned || 0,
                lastAccessedAt: new Date(),
                completedAt: data.completionStatus === 'COMPLETED' ? new Date() : null
            };
            // Add timeSpentSeconds to the create data
            const timeSpentValue = data.timeSpentSeconds || 0;
            if (timeSpentValue > 0) {
                createData.timeSpentSeconds = timeSpentValue;
            }
            const newProgress = await prisma.userProgress.create({
                data: createData
            });
            return newProgress;
        }
    }
    /**
     * Start a module learning session
     */
    async startModule(userId, moduleId) {
        // Check if progress already exists for this user and module
        const existingProgress = await prisma.userProgress.findUnique({
            where: {
                userId_moduleId: {
                    userId,
                    moduleId
                }
            }
        });
        if (existingProgress) {
            // Update existing progress record
            const updatedProgress = await prisma.userProgress.update({
                where: {
                    id: existingProgress.id
                },
                data: {
                    lastAccessedAt: new Date(),
                    completionStatus: existingProgress.completionStatus === 'NOT_STARTED' ? 'IN_PROGRESS' : existingProgress.completionStatus
                }
            });
            // Log the activity
            await this.logActivity(existingProgress.id, client_1.ActivityType.MODULE_STARTED, "");
            // Update the learning streak for the user
            await this.updateLearningStreak(userId);
            // Check if user earned any achievements
            await this.checkAndAwardAchievements(userId);
            return updatedProgress;
        }
        else {
            // Create new progress record
            const newProgress = await prisma.userProgress.create({
                data: {
                    user: { connect: { id: userId } },
                    learningModule: { connect: { id: moduleId } },
                    completionStatus: 'IN_PROGRESS',
                    progressPercentage: 0,
                    pointsEarned: 0,
                    timeSpentSeconds: 0,
                    lastAccessedAt: new Date()
                } // Type assertion for fields not recognized by TypeScript yet
            });
            // Log the activity
            await this.logActivity(newProgress.id, client_1.ActivityType.MODULE_STARTED, "");
            // Update the learning streak for the user
            await this.updateLearningStreak(userId);
            // Check if user earned any achievements
            await this.checkAndAwardAchievements(userId);
            return newProgress;
        }
    }
    /**
     * Complete a module and log activities
     */
    async completeModule(userId, moduleId, timeSpentSeconds = 0) {
        try {
            // Check if progress already exists for this user and module
            const existingProgress = await prisma.userProgress.findUnique({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId
                    }
                }
            });
            if (existingProgress) {
                // Update existing progress record
                const updatedProgress = await prisma.userProgress.update({
                    where: {
                        id: existingProgress.id
                    },
                    data: {
                        completionStatus: 'COMPLETED',
                        progressPercentage: 100,
                        lastAccessedAt: new Date(),
                        completedAt: new Date(),
                        timeSpentSeconds: {
                            increment: timeSpentSeconds
                        }
                    }
                });
                // Log the activity
                await this.logActivity(existingProgress.id, client_1.ActivityType.MODULE_COMPLETED, "Module completed");
                // Update the learning streak
                await this.updateLearningStreak(userId);
                // Check if user earned any achievements
                await this.checkAndAwardAchievements(userId);
                return updatedProgress;
            }
            else {
                // Create new completed progress record
                const newProgress = await prisma.userProgress.create({
                    data: {
                        userId,
                        moduleId,
                        completionStatus: 'COMPLETED',
                        progressPercentage: 100,
                        pointsEarned: 0, // Will be updated based on module points
                        timeSpentSeconds: timeSpentSeconds,
                        lastAccessedAt: new Date(),
                        completedAt: new Date()
                    } // Type assertion for fields not recognized by TypeScript yet
                });
                // Log the activity
                await this.logActivity(newProgress.id, client_1.ActivityType.MODULE_COMPLETED, "Module completed");
                // Update the learning streak
                await this.updateLearningStreak(userId);
                // Check if user earned any achievements
                await this.checkAndAwardAchievements(userId);
                return newProgress;
            }
        }
        catch (error) {
            console.error('Error completing module:', error);
            throw error;
        }
    }
    /**
     * Log user activity
     */
    async logActivity(userProgressId, activityType, details) {
        try {
            await prisma.$executeRaw `
        INSERT INTO "ActivityLog" (
          "userProgressId", 
          "activityType", 
          "timestamp", 
          "metadata"
        ) VALUES (
          ${userProgressId}, 
          ${activityType}, 
          ${new Date()}, 
          ${details || ''} 
        )
      `;
        }
        catch (error) {
            console.error('Error logging activity:', error);
            // This is a non-critical operation, so we don't throw
        }
    }
    /**
     * Update the user's learning streak
     */
    async updateLearningStreak(userId) {
        try {
            // Use raw SQL since the schema hasn't been migrated yet
            const existingStreak = await prisma.$queryRaw `
        SELECT * FROM "LearningStreak" WHERE "userId" = ${userId}
      `;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (existingStreak && Array.isArray(existingStreak) && existingStreak.length > 0) {
                const streak = existingStreak[0];
                const lastActivityDate = new Date(streak.lastActivityDate);
                lastActivityDate.setHours(0, 0, 0, 0);
                const diffInDays = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffInDays === 0) {
                    // Already logged activity today, nothing to update
                    return;
                }
                else if (diffInDays === 1) {
                    // Consecutive day, increment streak
                    const newStreakCount = streak.currentStreak + 1;
                    const newLongestStreak = Math.max(streak.longestStreak, newStreakCount);
                    await prisma.$executeRaw `
            UPDATE "LearningStreak" 
            SET 
              "currentStreak" = ${newStreakCount}, 
              "longestStreak" = ${newLongestStreak}, 
              "lastActivityDate" = ${today}
            WHERE "userId" = ${userId}
          `;
                    // Check if the new streak hit milestone for achievement
                    if (newStreakCount === 7 || newStreakCount === 30 || newStreakCount === 100) {
                        await this.checkStreakAchievements(userId, newStreakCount);
                    }
                }
                else {
                    // Streak broken, reset to 1
                    await prisma.$executeRaw `
            UPDATE "LearningStreak" 
            SET 
              "currentStreak" = 1, 
              "lastActivityDate" = ${today}
            WHERE "userId" = ${userId}
          `;
                }
            }
            else {
                // First activity, create streak record
                await prisma.$executeRaw `
          INSERT INTO "LearningStreak" (
            "userId", 
            "currentStreak", 
            "longestStreak", 
            "lastActivityDate", 
            "startDate"
          ) VALUES (
            ${userId}, 
            1, 
            1, 
            ${today}, 
            ${today}
          )
        `;
            }
        }
        catch (error) {
            console.error('Error updating learning streak:', error);
            // Non-critical error, don't throw
        }
    }
    /**
     * Check streak-based achievements
     */
    async checkStreakAchievements(userId, streakCount) {
        try {
            let achievementName = '';
            if (streakCount >= 100) {
                achievementName = 'Learning Legend';
            }
            else if (streakCount >= 30) {
                achievementName = 'Monthly Master';
            }
            else if (streakCount >= 7) {
                achievementName = 'Weekly Warrior';
            }
            if (achievementName) {
                // Get the achievement using raw SQL
                const achievementResult = await prisma.$queryRaw `
          SELECT * FROM "Achievement" WHERE "name" = ${achievementName}
        `;
                if (achievementResult && Array.isArray(achievementResult) && achievementResult.length > 0) {
                    const achievement = achievementResult[0];
                    // Check if user already has this achievement
                    const existingAchievementResult = await prisma.$queryRaw `
            SELECT * FROM "UserAchievement" 
            WHERE "userId" = ${userId} AND "achievementId" = ${achievement.id}
          `;
                    if (!existingAchievementResult || existingAchievementResult.length === 0) {
                        // Award the achievement
                        await prisma.$executeRaw `
              INSERT INTO "UserAchievement" (
                "userId", 
                "achievementId", 
                "awardedAt", 
                "isNotified"
              ) VALUES (
                ${userId}, 
                ${achievement.id}, 
                ${new Date()}, 
                false
              )
            `;
                    }
                }
            }
        }
        catch (error) {
            console.error('Error checking streak achievements:', error);
            // Non-critical error, don't throw
        }
    }
    /**
     * Get user learning statistics
     */
    async getUserStats(userId) {
        try {
            // Get total completed modules for this user
            const completedModules = await prisma.userProgress.count({
                where: {
                    userId,
                    completionStatus: 'COMPLETED'
                }
            });
            // Get total modules count for completion rate calculation
            const totalModules = await prisma.learningModule.count({
                where: {
                    isPublished: true
                }
            });
            // Calculate module completion rate
            const moduleCompletionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
            // Get points earned
            const pointsResult = await prisma.userProgress.aggregate({
                where: {
                    userId
                },
                _sum: {
                    pointsEarned: true
                }
            });
            const totalPointsEarned = pointsResult._sum.pointsEarned || 0;
            // Get time spent across all modules
            const timeResult = await prisma.$queryRaw `
        SELECT SUM("timeSpentSeconds") as total 
        FROM "UserProgress" 
        WHERE "userId" = ${userId}
      `;
            const totalTimeSpentSeconds = timeResult && Array.isArray(timeResult) && timeResult[0] ?
                parseInt(timeResult[0].total.toString(), 10) : 0;
            // Calculate average completion time for completed modules
            let averageCompletionTime = 0;
            if (completedModules > 0) {
                const completedModulesData = await prisma.$queryRaw `
          SELECT "timeSpentSeconds" 
          FROM "UserProgress" 
          WHERE "userId" = ${userId} AND "completionStatus" = 'COMPLETED'
        `;
                if (Array.isArray(completedModulesData) && completedModulesData.length > 0) {
                    const totalTime = completedModulesData.reduce((sum, module) => sum + (parseInt(module.timeSpentSeconds) || 0), 0);
                    averageCompletionTime = totalTime / completedModules;
                }
            }
            // Get streak information
            const streak = await prisma.$queryRaw `
        SELECT "currentStreak", "longestStreak" 
        FROM "LearningStreak" 
        WHERE "userId" = ${userId}
      `;
            const currentStreak = streak && Array.isArray(streak) && streak.length > 0 ?
                parseInt(streak[0].currentStreak) : 0;
            const longestStreak = streak && Array.isArray(streak) && streak.length > 0 ?
                parseInt(streak[0].longestStreak) : 0;
            // Get total activities count
            const totalActivities = await prisma.$queryRaw `
        SELECT COUNT(*) as count 
        FROM "ActivityLog" al
        JOIN "UserProgress" up ON al."userProgressId" = up.id
        WHERE up."userId" = ${userId}
      `;
            const activitiesCount = totalActivities && Array.isArray(totalActivities) &&
                totalActivities.length > 0 ? parseInt(totalActivities[0].count.toString(), 10) : 0;
            return {
                totalModulesCompleted: completedModules,
                totalPointsEarned,
                averageCompletionTime,
                currentStreak,
                longestStreak,
                totalActivities: activitiesCount,
                totalTimeSpentSeconds,
                moduleCompletionRate
            };
        }
        catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
    /**
     * Get user activity history with filtering and pagination
     */
    async getUserActivityHistory(userId, page = 1, pageSize = 10, activityType) {
        try {
            const offset = (page - 1) * pageSize;
            const whereClause = activityType
                ? `WHERE up."userId" = ${userId} AND al."activityType" = '${activityType}'`
                : `WHERE up."userId" = ${userId}`;
            // Count total activities
            const countResult = await prisma.$queryRaw `
        SELECT COUNT(*) as total
        FROM "ActivityLog" al
        JOIN "UserProgress" up ON al."userProgressId" = up.id
        ${client_1.Prisma.raw(whereClause)}
      `;
            const total = parseInt(countResult[0].total, 10);
            // Get paginated activities
            const activities = await prisma.$queryRaw `
        SELECT al.id, al."activityType", al."timestamp", al.metadata, up."moduleId",
        lm.title as "moduleTitle"
        FROM "ActivityLog" al
        JOIN "UserProgress" up ON al."userProgressId" = up.id
        LEFT JOIN "LearningModule" lm ON up."moduleId" = lm.id
        ${client_1.Prisma.raw(whereClause)}
        ORDER BY al."timestamp" DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
            return {
                activities,
                total,
                page,
                pageSize
            };
        }
        catch (error) {
            console.error('Error getting user activity history:', error);
            throw error;
        }
    }
    /**
     * Get user achievements
     */
    async getUserAchievements(userId) {
        try {
            // Use raw SQL to get user achievements
            const achievements = await prisma.$queryRaw `
        SELECT 
          a.id, 
          a.name, 
          a.description, 
          a.imageUrl, 
          a.criteria, 
          a.pointsValue,
          ua."awardedAt"
        FROM "Achievement" a
        JOIN "UserAchievement" ua ON a.id = ua."achievementId"
        WHERE ua."userId" = ${userId}
        ORDER BY ua."awardedAt" DESC
      `;
            // Ensure achievements is always an array
            const achievementsArray = Array.isArray(achievements) ? achievements : [];
            // Get achievements user hasn't earned yet
            const unlockedAchievementIds = achievementsArray.map(a => a.id);
            // Build the SQL condition for excluding already earned achievements
            let lockedAchievements = [];
            if (unlockedAchievementIds.length > 0) {
                // Use a separate query for each case to avoid complex SQL in SQLite
                lockedAchievements = await prisma.$queryRaw `
          SELECT 
            id, 
            name, 
            description, 
            imageUrl, 
            criteria,
            pointsValue
          FROM "Achievement"
          WHERE id NOT IN (${client_1.Prisma.join(unlockedAchievementIds)})
          AND isActive = true
          ORDER BY pointsValue ASC
        `;
            }
            else {
                // If no achievements yet, return all available achievements as locked
                lockedAchievements = await prisma.$queryRaw `
          SELECT 
            id, 
            name, 
            description, 
            imageUrl, 
            criteria,
            pointsValue
          FROM "Achievement"
          WHERE isActive = true
          ORDER BY pointsValue ASC
        `;
            }
            // Ensure lockedAchievements is always an array and add isLocked flag
            const lockedAchievementsArray = Array.isArray(lockedAchievements) ?
                lockedAchievements.map(a => ({
                    ...a,
                    isLocked: true
                })) : [];
            return {
                achievements: achievementsArray,
                lockedAchievements: lockedAchievementsArray
            };
        }
        catch (error) {
            console.error('Error getting user achievements:', error);
            // Return empty arrays on error to maintain consistent return type
            return { achievements: [], lockedAchievements: [] };
        }
    }
    /**
     * Get learning platform analytics (admin only)
     */
    async getPlatformAnalytics() {
        try {
            // Get total users count
            const totalUsers = await prisma.user.count();
            // Get modules completion rate
            const totalCompletedModules = await prisma.userProgress.count({
                where: {
                    completionStatus: 'COMPLETED'
                }
            });
            // Get total modules count for completion rate calculation
            const totalModules = await prisma.learningModule.count({
                where: {
                    isPublished: true
                }
            });
            // Calculate average completion rate
            const totalModuleEnrollments = await prisma.userProgress.count();
            const averageCompletionRate = totalModuleEnrollments > 0
                ? ((totalCompletedModules / totalModuleEnrollments) * 100).toFixed(2)
                : 0;
            // Get most popular modules
            const popularModulesResult = await prisma.$queryRaw `
        SELECT 
          lm.id, 
          lm.title, 
          COUNT(up."userId") as "enrollmentCount"
        FROM "LearningModule" lm
        JOIN "UserProgress" up ON lm.id = up."moduleId"
        GROUP BY lm.id, lm.title
        ORDER BY "enrollmentCount" DESC
        LIMIT 5
      `;
            const popularModules = Array.isArray(popularModulesResult) ? popularModulesResult : [];
            // Get active users over time (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const activeUsersDataResult = await prisma.$queryRaw `
        SELECT 
          DATE(up."lastAccessedAt") as "date", 
          COUNT(DISTINCT up."userId") as "activeUsers"
        FROM "UserProgress" up
        WHERE up."lastAccessedAt" >= ${sevenDaysAgo}
        GROUP BY DATE(up."lastAccessedAt")
        ORDER BY "date" ASC
      `;
            // Format the active users data
            const activeUsersData = Array.isArray(activeUsersDataResult) ? activeUsersDataResult : [];
            const formattedActiveUsers = activeUsersData.map(day => ({
                date: day.date,
                activeUsers: parseInt(day.activeUsers.toString(), 10)
            }));
            return {
                userStats: {
                    totalUsers,
                    totalCompletedModules,
                    averageCompletionRate
                },
                moduleStats: {
                    popularModules: popularModules.map(module => ({
                        id: module.id,
                        title: module.title,
                        enrollmentCount: parseInt(module.enrollmentCount.toString(), 10)
                    }))
                },
                userActivity: {
                    activeUsers: formattedActiveUsers
                }
            };
        }
        catch (error) {
            console.error('Error getting platform analytics:', error);
            throw error;
        }
    }
    /**
     * Check if user has earned any achievements and award them
     */
    async checkModuleCompletionAchievements(userId) {
        try {
            // Get completed modules count
            const completedModules = await prisma.userProgress.count({
                where: {
                    userId,
                    completionStatus: 'COMPLETED'
                }
            });
            // Check module completion achievements
            const moduleAchievements = [
                { count: 1, name: 'First Steps' },
                { count: 5, name: 'Knowledge Seeker' },
                { count: 10, name: 'Cyber Scholar' },
                { count: 25, name: 'Security Expert' },
                { count: 50, name: 'Cyber Defender' }
            ];
            // Find the highest applicable achievement
            let highestApplicable = null;
            for (const achievement of moduleAchievements) {
                if (completedModules >= achievement.count) {
                    highestApplicable = achievement;
                }
                else {
                    break;
                }
            }
            if (highestApplicable) {
                // Get the achievement using raw SQL
                const achievementResult = await prisma.$queryRaw `
          SELECT * FROM "Achievement" WHERE "name" = ${highestApplicable.name}
        `;
                const achievements = Array.isArray(achievementResult) ? achievementResult : [];
                if (achievements.length > 0) {
                    const achievement = achievements[0];
                    // Check if user already has this achievement
                    const existingAchievementResult = await prisma.$queryRaw `
            SELECT * FROM "UserAchievement" 
            WHERE "userId" = ${userId} AND "achievementId" = ${achievement.id}
          `;
                    const existingAchievements = Array.isArray(existingAchievementResult) ? existingAchievementResult : [];
                    if (existingAchievements.length === 0) {
                        // Award the achievement
                        await prisma.$executeRaw `
              INSERT INTO "UserAchievement" (
                "userId", 
                "achievementId", 
                "awardedAt", 
                "isNotified"
              ) VALUES (
                ${userId}, 
                ${achievement.id}, 
                ${new Date()}, 
                false
              )
            `;
                    }
                }
            }
        }
        catch (error) {
            console.error('Error checking and awarding achievements:', error);
            // Non-critical error, don't throw
        }
    }
    /**
     * Get progress for a specific module for a user
     */
    async getModuleProgress(userId, moduleId) {
        try {
            const progress = await prisma.userProgress.findUnique({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId
                    }
                }
            });
            if (progress) {
                // Get module details separately if needed
                const module = await prisma.learningModule.findUnique({
                    where: { id: moduleId },
                    select: {
                        title: true,
                        description: true,
                        difficultyLevel: true,
                        estimatedTimeMinutes: true,
                        points: true
                    }
                });
                // Use type assertion for the entire progress object to avoid individual property errors
                // This ensures TypeScript understands all properties are available
                const typedProgress = progress;
                // Return a new object that combines progress with module details
                return {
                    id: typedProgress.id,
                    userId: typedProgress.userId,
                    moduleId: typedProgress.moduleId,
                    completionStatus: typedProgress.completionStatus,
                    progressPercentage: typedProgress.progressPercentage,
                    pointsEarned: typedProgress.pointsEarned,
                    timeSpentSeconds: typedProgress.timeSpentSeconds,
                    lastAccessedAt: typedProgress.lastAccessedAt,
                    completedAt: typedProgress.completedAt,
                    createdAt: typedProgress.createdAt,
                    updatedAt: typedProgress.updatedAt,
                    notesSaved: typedProgress.notesSaved,
                    bookmarks: typedProgress.bookmarks,
                    moduleDetails: module
                };
            }
            return progress;
        }
        catch (error) {
            console.error('Error getting module progress:', error);
            throw error;
        }
    }
    /**
     * Get all progress records for a user
     */
    async getUserProgress(userId) {
        try {
            const progressRecords = await prisma.userProgress.findMany({
                where: {
                    userId
                },
                orderBy: {
                    lastAccessedAt: 'desc'
                }
            });
            // Get module details for all modules in the progress records
            const moduleIds = progressRecords.map(record => record.moduleId);
            const modules = await prisma.learningModule.findMany({
                where: {
                    id: {
                        in: moduleIds
                    }
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    difficultyLevel: true,
                    estimatedTimeMinutes: true,
                    points: true,
                    imageUrl: true
                }
            });
            // Map modules to progress records with properly typed objects
            return progressRecords.map(progress => {
                const moduleDetails = modules.find(m => m.id === progress.moduleId);
                // Use type assertion for the entire progress object
                const typedProgress = progress;
                // Create a new object with all properties to avoid TypeScript errors
                return {
                    id: typedProgress.id,
                    userId: typedProgress.userId,
                    moduleId: typedProgress.moduleId,
                    completionStatus: typedProgress.completionStatus,
                    progressPercentage: typedProgress.progressPercentage,
                    pointsEarned: typedProgress.pointsEarned,
                    timeSpentSeconds: typedProgress.timeSpentSeconds,
                    lastAccessedAt: typedProgress.lastAccessedAt,
                    completedAt: typedProgress.completedAt,
                    createdAt: typedProgress.createdAt,
                    updatedAt: typedProgress.updatedAt,
                    notesSaved: typedProgress.notesSaved,
                    bookmarks: typedProgress.bookmarks,
                    moduleDetails
                };
            });
        }
        catch (error) {
            console.error('Error getting user progress:', error);
            throw error;
        }
    }
    /**
     * Format seconds into a human-readable time string (HH:MM:SS)
     */
    formatTimeSpent(seconds) {
        if (!seconds || isNaN(seconds)) {
            return '00:00:00';
        }
        // Calculate hours, minutes, and remaining seconds
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        // Format with leading zeros
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
    /**
     * Update section progress
     */
    async updateSectionProgress(userId, moduleId, sectionId, timeSpentSeconds) {
        try {
            const progress = await prisma.userProgress.findUnique({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId
                    }
                }
            });
            if (!progress) {
                // Create progress record if it doesn't exist
                const newProgress = await prisma.userProgress.create({
                    data: {
                        userId,
                        moduleId,
                        completionStatus: 'IN_PROGRESS',
                        progressPercentage: 20, // Default initial progress for section completion
                        pointsEarned: 5, // Default points for section
                        timeSpentSeconds: timeSpentSeconds,
                        lastAccessedAt: new Date()
                    } // Type assertion to handle fields not in the strict schema
                });
                // Log the activity
                await this.logActivity(newProgress.id, client_1.ActivityType.SECTION_COMPLETED, `Section ${sectionId} completed`);
                return newProgress;
            }
            // First, update basic fields using the standard update method
            const updatedProgress = await prisma.userProgress.update({
                where: {
                    id: progress.id
                },
                data: {
                    // If not completed yet, update progress percentage
                    ...(progress.completionStatus !== 'COMPLETED' ? {
                        progressPercentage: Math.min(progress.progressPercentage + 20, 100)
                    } : {}),
                    // Always update the last accessed time
                    lastAccessedAt: new Date()
                }
            });
            // Then, use a raw SQL query to update the timeSpentSeconds field
            // This bypasses TypeScript's type checking
            await prisma.$executeRaw `
        UPDATE "UserProgress"
        SET "timeSpentSeconds" = "timeSpentSeconds" + ${timeSpentSeconds}
        WHERE id = ${progress.id}
      `;
            // Log the activity
            await this.logActivity(progress.id, client_1.ActivityType.SECTION_COMPLETED, `Section ${sectionId} completed`);
            // Get the updated record
            const refreshedProgress = await prisma.userProgress.findUnique({
                where: {
                    id: progress.id
                }
            });
            return refreshedProgress;
        }
        catch (error) {
            console.error('Error updating section progress:', error);
            throw error;
        }
    }
    /**
     * Save notes for a specific module
     */
    async saveNotes(userId, moduleId, notes) {
        try {
            // Check if progress exists
            const existingProgress = await prisma.userProgress.findUnique({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId
                    }
                }
            });
            if (!existingProgress) {
                // Create new progress record with notes
                const newProgress = await prisma.userProgress.create({
                    data: {
                        userId,
                        moduleId,
                        completionStatus: 'IN_PROGRESS',
                        progressPercentage: 0,
                        pointsEarned: 0,
                        timeSpentSeconds: 0,
                        notesSaved: notes,
                        lastAccessedAt: new Date()
                    }
                });
                await this.logActivity(newProgress.id, client_1.ActivityType.NOTE_ADDED, "Added notes");
                return newProgress;
            }
            // Update existing progress with notes
            const updatedProgress = await prisma.userProgress.update({
                where: {
                    id: existingProgress.id
                },
                data: {
                    notesSaved: notes,
                    lastAccessedAt: new Date()
                }
            });
            await this.logActivity(existingProgress.id, client_1.ActivityType.NOTE_ADDED, "Updated notes");
            return updatedProgress;
        }
        catch (error) {
            console.error('Error saving notes:', error);
            throw error;
        }
    }
    /**
     * Save bookmarks for a specific module
     */
    async saveBookmarks(userId, moduleId, bookmarks) {
        try {
            // Check if progress exists
            const existingProgress = await prisma.userProgress.findUnique({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId
                    }
                }
            });
            if (!existingProgress) {
                // Create new progress record with bookmarks
                const newProgress = await prisma.userProgress.create({
                    data: {
                        userId,
                        moduleId,
                        completionStatus: 'IN_PROGRESS',
                        progressPercentage: 0,
                        pointsEarned: 0,
                        timeSpentSeconds: 0,
                        bookmarks,
                        lastAccessedAt: new Date()
                    }
                });
                // Using NOTE_ADDED instead of BOOKMARK_ADDED since it's not in the enum
                await this.logActivity(newProgress.id, client_1.ActivityType.NOTE_ADDED, "Added bookmarks");
                return newProgress;
            }
            // Update existing progress with bookmarks
            const updatedProgress = await prisma.userProgress.update({
                where: {
                    id: existingProgress.id
                },
                data: {
                    bookmarks,
                    lastAccessedAt: new Date()
                }
            });
            // Using NOTE_ADDED instead of BOOKMARK_ADDED since it's not in the enum
            await this.logActivity(existingProgress.id, client_1.ActivityType.NOTE_ADDED, "Updated bookmarks");
            return updatedProgress;
        }
        catch (error) {
            console.error('Error saving bookmarks:', error);
            throw error;
        }
    }
    /**
     * Check if user has earned any achievements and award them
     */
    async checkAndAwardAchievements(userId) {
        try {
            // Get user stats to determine eligibility for achievements
            const stats = await this.getUserStats(userId);
            // Check for various achievement criteria
            // 1. Module completion achievements
            if (stats.totalModulesCompleted >= 1) {
                await this.awardAchievementIfNotExists(userId, 'FIRST_MODULE_COMPLETED');
            }
            if (stats.totalModulesCompleted >= 5) {
                await this.awardAchievementIfNotExists(userId, 'FIVE_MODULES_COMPLETED');
            }
            if (stats.totalModulesCompleted >= 10) {
                await this.awardAchievementIfNotExists(userId, 'TEN_MODULES_COMPLETED');
            }
            // 2. Streak achievements
            if (stats.currentStreak >= 3) {
                await this.awardAchievementIfNotExists(userId, 'THREE_DAY_STREAK');
            }
            if (stats.currentStreak >= 7) {
                await this.awardAchievementIfNotExists(userId, 'WEEK_STREAK');
            }
            if (stats.currentStreak >= 30) {
                await this.awardAchievementIfNotExists(userId, 'MONTH_STREAK');
            }
            // 3. Points achievements
            if (stats.totalPointsEarned >= 100) {
                await this.awardAchievementIfNotExists(userId, 'POINT_COLLECTOR');
            }
            if (stats.totalPointsEarned >= 1000) {
                await this.awardAchievementIfNotExists(userId, 'POINT_MASTER');
            }
            // 4. Activity achievements
            if (stats.totalActivities >= 50) {
                await this.awardAchievementIfNotExists(userId, 'ACTIVE_LEARNER');
            }
        }
        catch (error) {
            console.error('Error checking and awarding achievements:', error);
            // Swallow errors here - achievement checks shouldn't block other operations
        }
    }
    /**
     * Award an achievement if the user doesn't already have it
     * @private
     */
    async awardAchievementIfNotExists(userId, achievementName) {
        try {
            // Find the achievement by name using raw SQL since schema might not be migrated yet
            const achievements = await prisma.$queryRaw `
        SELECT id, name 
        FROM "Achievement" 
        WHERE name = ${achievementName}
        LIMIT 1
      `;
            if (!achievements || achievements.length === 0) {
                console.warn(`Achievement ${achievementName} not found in database`);
                return;
            }
            const achievement = achievements[0];
            // Check if user already has this achievement
            const existingAchievements = await prisma.$queryRaw `
        SELECT id 
        FROM "UserAchievement"
        WHERE "userId" = ${userId} AND "achievementId" = ${achievement.id}
        LIMIT 1
      `;
            if (!existingAchievements || existingAchievements.length === 0) {
                // Award new achievement using Prisma instead of raw SQL
                await prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id,
                        awardedAt: new Date(),
                        isNotified: false
                    }
                });
                console.log(`Awarded achievement ${achievementName} to user ${userId}`);
            }
        }
        catch (error) {
            console.error(`Error awarding achievement ${achievementName}:`, error);
        }
    }
}
exports.ProgressService = ProgressService;
exports.default = new ProgressService();
