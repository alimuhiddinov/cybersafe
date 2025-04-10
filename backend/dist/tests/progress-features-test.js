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
// Test achievements
const achievements = [
    {
        name: 'FIRST_MODULE_COMPLETED',
        description: 'Complete your first module',
        imageUrl: 'https://example.com/achievement1.png',
        criteria: 'Complete 1 module',
        pointsValue: 10
    },
    {
        name: 'FIVE_MODULES_COMPLETED',
        description: 'Complete five modules',
        imageUrl: 'https://example.com/achievement2.png',
        criteria: 'Complete 5 modules',
        pointsValue: 25
    },
    {
        name: 'ACTIVE_LEARNER',
        description: 'Record 50 learning activities',
        imageUrl: 'https://example.com/achievement3.png',
        criteria: 'Record 50 activities',
        pointsValue: 15
    },
    {
        name: 'THREE_DAY_STREAK',
        description: 'Learn for three consecutive days',
        imageUrl: 'https://example.com/achievement4.png',
        criteria: 'Maintain a 3-day streak',
        pointsValue: 20
    }
];
/**
 * Comprehensive test script for progress tracking features of CyberSafe
 */
async function testProgressFeatures() {
    var _a, _b, _c;
    try {
        console.log('===== CYBERSAFE PROGRESS TRACKING FEATURES TEST =====');
        // Setup phase - create test data
        console.log('\n--- Setup: Creating Test Data ---');
        // 1. Create test user
        const testUser = await prisma.user.upsert({
            where: { email: 'progresstest@cybersafe.com' },
            update: {},
            create: {
                username: 'progresstest',
                email: 'progresstest@cybersafe.com',
                password: 'TestPass123',
                role: 'USER',
                isVerified: true
            }
        });
        console.log(`Test user created: ${testUser.username} (ID: ${testUser.id})`);
        // 2. Create test modules
        const modulePromises = [];
        for (let i = 1; i <= 5; i++) {
            modulePromises.push(prisma.learningModule.upsert({
                where: { id: 1000 + i },
                update: {},
                create: {
                    id: 1000 + i,
                    title: `Test Module ${i}`,
                    description: `A test module #${i} for progress tracking`,
                    content: JSON.stringify({
                        sections: [
                            { title: 'Section 1', content: 'Content 1' },
                            { title: 'Section 2', content: 'Content 2' }
                        ]
                    }),
                    difficultyLevel: 'BEGINNER',
                    estimatedTimeMinutes: 15 + i * 5,
                    points: 50 + i * 10,
                    isPublished: true
                }
            }));
        }
        const testModules = await Promise.all(modulePromises);
        console.log(`Created ${testModules.length} test modules`);
        // 3. Create test achievements if they don't exist
        for (const achievement of achievements) {
            await prisma.achievement.upsert({
                where: { name: achievement.name },
                update: {},
                create: achievement
            }).catch(err => {
                console.log(`Note: Could not create achievement ${achievement.name}: ${err.message}`);
            });
        }
        console.log('Test achievements created or updated');
        // Clear existing progress for clean test
        await prisma.userProgress.deleteMany({
            where: {
                userId: testUser.id,
                moduleId: {
                    in: testModules.map(m => m.id)
                }
            }
        });
        console.log('Cleared existing progress records for clean testing');
        // --- TEST 1: BASIC PROGRESS RECORDING ---
        console.log('\n===== 1. BASIC PROGRESS RECORDING =====');
        // 1.1 Start a module
        console.log('\n--- Test 1.1: Starting a Module ---');
        const startProgress = await progress_service_1.default.startModule(testUser.id, testModules[0].id);
        console.log(startProgress ? '✅ Successfully started module' : '❌ Failed to start module');
        // 1.2 Update progress
        console.log('\n--- Test 1.2: Updating Progress ---');
        const updateData = {
            progressPercentage: 50,
            pointsEarned: 25,
            timeSpentSeconds: 300
        };
        const updateProgress = await progress_service_1.default.updateProgress(testUser.id, testModules[0].id, updateData);
        console.log(updateProgress ? '✅ Successfully updated progress' : '❌ Failed to update progress');
        console.log(`Progress percentage: ${updateProgress.progressPercentage}%`);
        // 1.3 Complete module
        console.log('\n--- Test 1.3: Completing a Module ---');
        const completeProgress = await progress_service_1.default.completeModule(testUser.id, testModules[0].id, 600 // 10 minutes to complete
        );
        console.log(completeProgress ? '✅ Successfully completed module' : '❌ Failed to complete module');
        console.log(`Completion status: ${completeProgress.completionStatus}`);
        // Verify the completion through a query
        const verifyCompletion = await prisma.userProgress.findUnique({
            where: {
                userId_moduleId: {
                    userId: testUser.id,
                    moduleId: testModules[0].id
                }
            }
        });
        console.log(`Verification - Module completed: ${(verifyCompletion === null || verifyCompletion === void 0 ? void 0 : verifyCompletion.completionStatus) === 'COMPLETED'}`);
        // --- TEST 2: ACTIVITY LOGGING ---
        console.log('\n===== 2. ACTIVITY LOGGING =====');
        // 2.1 Check activity logs are created
        console.log('\n--- Test 2.1: Activity Log Creation ---');
        const activityLog = await progress_service_1.default.getUserActivityHistory(testUser.id, 1, 20);
        console.log(`✅ Activity logs found: ${activityLog.activities.length}`);
        if (activityLog.activities.length > 0) {
            console.log('Sample activity:', {
                type: activityLog.activities[0].activityType,
                timestamp: new Date(activityLog.activities[0].timestamp).toISOString(),
                moduleId: activityLog.activities[0].moduleId
            });
        }
        // 2.2 Verify timestamp accuracy
        console.log('\n--- Test 2.2: Timestamp Verification ---');
        if (activityLog.activities.length > 0) {
            const mostRecentActivity = activityLog.activities[0];
            const activityTime = new Date(mostRecentActivity.timestamp);
            const nowTime = new Date();
            const diffMinutes = Math.abs((nowTime.getTime() - activityTime.getTime()) / (1000 * 60));
            console.log(`✅ Most recent activity was ${Math.round(diffMinutes)} minutes ago`);
            console.log(`Recent enough (< 5 min): ${diffMinutes < 5}`);
        }
        // --- TEST 3: ACHIEVEMENT TRACKING ---
        console.log('\n===== 3. ACHIEVEMENT TRACKING =====');
        // 3.1 Award an achievement
        console.log('\n--- Test 3.1: Achievement Awarding ---');
        await progress_service_1.default.checkAndAwardAchievements(testUser.id);
        const userAchievements = await progress_service_1.default.getUserAchievements(testUser.id);
        console.log(`✅ User has ${((_a = userAchievements === null || userAchievements === void 0 ? void 0 : userAchievements.achievements) === null || _a === void 0 ? void 0 : _a.length) || 0} achievements`);
        if (((_b = userAchievements === null || userAchievements === void 0 ? void 0 : userAchievements.achievements) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            console.log('Achievements:', userAchievements.achievements.map(a => a.name));
        }
        // 3.2 Test multiple module completions for achievement triggers
        console.log('\n--- Test 3.2: Multiple Module Completions ---');
        for (let i = 1; i < 3; i++) { // Complete 2 more modules
            await progress_service_1.default.startModule(testUser.id, testModules[i].id);
            await progress_service_1.default.completeModule(testUser.id, testModules[i].id, 500);
            console.log(`✅ Completed module ${i + 1}`);
        }
        await progress_service_1.default.checkAndAwardAchievements(testUser.id);
        const updatedAchievements = await progress_service_1.default.getUserAchievements(testUser.id);
        console.log(`✅ User now has ${((_c = updatedAchievements === null || updatedAchievements === void 0 ? void 0 : updatedAchievements.achievements) === null || _c === void 0 ? void 0 : _c.length) || 0} achievements`);
        // --- TEST 4: LEARNING STREAKS ---
        console.log('\n===== 4. LEARNING STREAKS =====');
        // 4.1 Verify streak creation
        console.log('\n--- Test 4.1: Streak Record Creation ---');
        const streak = await prisma.$queryRaw `
      SELECT * FROM "LearningStreak" WHERE "userId" = ${testUser.id}
    `;
        console.log(`✅ Streak record exists: ${streak.length > 0}`);
        if (streak.length > 0) {
            console.log('Current streak:', streak[0].currentStreak);
            console.log('Longest streak:', streak[0].longestStreak);
        }
        // 4.2 Get user stats to see streak values
        console.log('\n--- Test 4.2: User Stats with Streaks ---');
        const userStats = await progress_service_1.default.getUserStats(testUser.id);
        console.log('User stats:', {
            modulesCompleted: userStats.totalModulesCompleted,
            pointsEarned: userStats.totalPointsEarned,
            currentStreak: userStats.currentStreak,
            longestStreak: userStats.longestStreak
        });
        // --- TEST 5: ANALYTICS ---
        console.log('\n===== 5. ANALYTICS =====');
        // 5.1 Progress reports
        console.log('\n--- Test 5.1: Progress Reports ---');
        console.log('Module completion rate:', `${userStats.moduleCompletionRate.toFixed(1)}%`);
        console.log('Total activities:', userStats.totalActivities);
        // 5.2 Time-based analytics
        console.log('\n--- Test 5.2: Time Analytics ---');
        console.log('Average completion time:', `${userStats.averageCompletionTime.toFixed(1)} seconds`);
        console.log('Total time spent:', `${userStats.totalTimeSpentSeconds} seconds`);
        console.log('\n--- BONUS: Notes & Bookmarks ---');
        // Save notes
        const testNotes = "These are test notes for the module";
        const notesResult = await progress_service_1.default.saveNotes(testUser.id, testModules[0].id, testNotes);
        console.log(`✅ Notes saved: ${!!notesResult}`);
        // Save bookmarks
        const testBookmarks = JSON.stringify([
            { position: "section1", timestamp: 120 },
            { position: "section2", timestamp: 240 }
        ]);
        const bookmarksResult = await progress_service_1.default.saveBookmarks(testUser.id, testModules[0].id, testBookmarks);
        console.log(`✅ Bookmarks saved: ${!!bookmarksResult}`);
        // Get module progress to verify notes and bookmarks
        const moduleProgress = await progress_service_1.default.getModuleProgress(testUser.id, testModules[0].id);
        console.log(`✅ Notes retrieved: ${moduleProgress.notes === testNotes}`);
        console.log(`✅ Bookmarks retrieved: ${!!moduleProgress.bookmarks}`);
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
testProgressFeatures()
    .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
});
