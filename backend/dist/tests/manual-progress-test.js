"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const progress_service_1 = __importDefault(require("../services/progress.service"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
/**
 * Comprehensive test script for the progress tracking functionality
 */
async function testProgressTracking() {
    var _a;
    try {
        console.log('===== CYBERSAFE PROGRESS TRACKING TEST SUITE =====');
        // Create test user if not exists
        const testUser = await prisma.user.upsert({
            where: { email: 'testuser@cybersafe.com' },
            update: {},
            create: {
                username: 'testuser',
                email: 'testuser@cybersafe.com',
                password: 'SecurePass123', // Use password instead of passwordHash
                role: 'USER',
                isVerified: true
            }
        });
        console.log(`Test user created/found: ${testUser.username} (ID: ${testUser.id})`);
        // Create test module if not exists
        const testModule = await prisma.learningModule.upsert({
            where: { id: 999 },
            update: {},
            create: {
                id: 999,
                title: 'Test Module',
                description: 'A test module for progress tracking',
                content: JSON.stringify({
                    sections: [
                        {
                            title: 'Test Section 1',
                            content: 'Test content for section 1'
                        },
                        {
                            title: 'Test Section 2',
                            content: 'Test content for section 2'
                        }
                    ]
                }),
                difficultyLevel: 'BEGINNER',
                estimatedTimeMinutes: 30,
                points: 100,
                isPublished: true
            }
        });
        console.log(`Test module created/found: ${testModule.title} (ID: ${testModule.id})`);
        console.log('\n===== 1. BASIC PROGRESS RECORDING =====');
        // Test 1.1: Start module - Creating a new progress record
        console.log('\n--- Test 1.1: Start Module ---');
        const startProgress = await progress_service_1.default.startModule(testUser.id, testModule.id);
        console.log('✅ Start module result:', JSON.stringify(startProgress, null, 2));
        // Test 1.2: Update progress - Update as user moves through module
        console.log('\n--- Test 1.2: Update Progress ---');
        const updateData = {
            progressPercentage: 50,
            pointsEarned: 25,
            timeSpentSeconds: 300
        };
        const updateProgress = await progress_service_1.default.updateProgress(testUser.id, testModule.id, updateData);
        console.log('✅ Update progress result:', JSON.stringify(updateProgress, null, 2));
        // Test 1.3: Complete module - Mark a module as complete
        console.log('\n--- Test 1.3: Complete Module ---');
        const completeProgress = await progress_service_1.default.completeModule(testUser.id, testModule.id, 600);
        console.log('✅ Complete module result:', JSON.stringify(completeProgress, null, 2));
        console.log('\n===== 2. ACTIVITY LOGGING =====');
        // Test 2.1: Verify activity logging
        console.log('\n--- Test 2.1: Verify User Activities ---');
        const activityLog = await progress_service_1.default.getUserActivityHistory(testUser.id, 1, 10);
        console.log('✅ Activity log contains entries:', activityLog.activities.length > 0);
        // Only show a summary to avoid overwhelming console
        if (activityLog.activities.length > 0) {
            console.log('Activity count:', activityLog.activities.length);
            console.log('First activity sample:', {
                id: activityLog.activities[0].id,
                type: activityLog.activities[0].activityType,
                timestamp: activityLog.activities[0].timestamp,
                // Make sure we use metadata field, not details
                metadata: activityLog.activities[0].metadata || JSON.stringify({}),
                moduleId: activityLog.activities[0].moduleId,
            });
        }
        else {
            console.log('No activities found');
        }
        // Test 2.2: Check timestamps
        console.log('\n--- Test 2.2: Verify Timestamps ---');
        // Check if activities are properly timestamped
        const timestampsValid = activityLog.activities.every(activity => {
            const timestamp = new Date(activity.timestamp);
            return timestamp instanceof Date && !isNaN(timestamp.getTime());
        });
        console.log(`✅ All activity timestamps are valid: ${timestampsValid}`);
        console.log('\n===== 3. ACHIEVEMENT TRACKING =====');
        // Test 3.1: Award achievement
        console.log('\n--- Test 3.1: Award Achievement ---');
        await progress_service_1.default.checkAndAwardAchievements(testUser.id);
        const achievementsResult = await progress_service_1.default.getUserAchievements(testUser.id);
        console.log('✅ User achievements:', ((_a = achievementsResult === null || achievementsResult === void 0 ? void 0 : achievementsResult.achievements) === null || _a === void 0 ? void 0 : _a.length) || 0);
        console.log('Achievement details:', JSON.stringify((achievementsResult === null || achievementsResult === void 0 ? void 0 : achievementsResult.achievements) || [], null, 2));
        console.log('\n--- Test 3.2: Achievement Association ---');
        console.log(`✅ Achievements associated with user ${testUser.id}: ${((achievementsResult === null || achievementsResult === void 0 ? void 0 : achievementsResult.achievements) || []).every(a => a.awardedAt)}`);
        console.log('\n===== 4. LEARNING STREAKS =====');
        // Test 4.1: Streak creation
        console.log('\n--- Test 4.1: Streak Creation ---');
        // The streak should have been created/updated during previous operations
        const streak = await prisma.$queryRaw `
      SELECT * FROM "LearningStreak"
      WHERE "userId" = ${testUser.id}
    `;
        console.log(`✅ Streak record exists: ${streak && streak.length > 0}`);
        if (streak && streak.length > 0) {
            console.log('Streak details:', JSON.stringify(streak[0], null, 2));
        }
        console.log('\n--- Test 4.2: Streak Calculation ---');
        // Get user stats to check streak values
        const userStats = await progress_service_1.default.getUserStats(testUser.id);
        console.log(`✅ Current streak value: ${userStats.currentStreak}`);
        console.log(`✅ Longest streak value: ${userStats.longestStreak}`);
        console.log('\n===== 5. ANALYTICS =====');
        // Test 5.1: Progress reports
        console.log('\n--- Test 5.1: Progress Reports ---');
        console.log('User stats (aggregation):', JSON.stringify(userStats, null, 2));
        console.log(`✅ Total modules completed: ${userStats.totalModulesCompleted}`);
        console.log(`✅ Total points earned: ${userStats.totalPointsEarned}`);
        console.log(`✅ Module completion rate: ${userStats.moduleCompletionRate}%`);
        // Test 5.2: Time-based analytics
        console.log('\n--- Test 5.2: Time-based Analytics ---');
        console.log(`✅ Average completion time: ${userStats.averageCompletionTime} seconds`);
        console.log(`✅ Total time spent: ${userStats.totalTimeSpentSeconds} seconds`);
        // Save notes to test that feature
        console.log('\n===== BONUS: NOTES & BOOKMARKS =====');
        console.log('\n--- Bonus Test: Save Notes ---');
        const testNotes = "These are my test notes for this module";
        const savedNotes = await progress_service_1.default.saveNotes(testUser.id, testModule.id, testNotes);
        console.log(`✅ Notes saved:`, JSON.stringify(savedNotes, null, 2));
        // Save bookmarks to test that feature
        console.log('\n--- Bonus Test: Save Bookmarks ---');
        const testBookmarks = [
            { position: "section1", timestamp: 120 },
            { position: "section2", timestamp: 240 }
        ];
        const savedBookmarks = await progress_service_1.default.saveBookmarks(testUser.id, testModule.id, JSON.stringify(testBookmarks));
        console.log(`✅ Bookmarks saved:`, JSON.stringify(savedBookmarks, null, 2));
        console.log('\n===== ALL TESTS COMPLETED SUCCESSFULLY! =====');
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the tests
testProgressTracking()
    .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
});
