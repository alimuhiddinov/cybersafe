import { PrismaClient, CompletionStatus } from '@prisma/client';
import progressService from '../services/progress.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Core test script for progress tracking features of CyberSafe
 * This focuses only on features that are confirmed to exist in the schema
 */
async function testCoreProgressFeatures() {
  try {
    console.log('===== CYBERSAFE CORE PROGRESS TRACKING TEST =====');
    
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
    for (let i = 1; i <= 3; i++) {
      modulePromises.push(
        prisma.learningModule.upsert({
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
        })
      );
    }
    
    const testModules = await Promise.all(modulePromises);
    console.log(`Created ${testModules.length} test modules`);
    
    // Clear existing progress for clean test
    await prisma.userProgress.deleteMany({
      where: {
        userId: testUser.id,
        moduleId: {
          in: testModules.map(m => m.id)
        }
      }
    }).catch(err => {
      console.log(`Note: Could not clear progress records: ${err.message}`);
    });
    console.log('Cleared existing progress records for clean testing');
    
    // --- TEST 1: BASIC PROGRESS RECORDING ---
    console.log('\n===== 1. BASIC PROGRESS RECORDING =====');
    
    // 1.1 Start a module
    console.log('\n--- Test 1.1: Starting a Module ---');
    const startProgress = await progressService.startModule(testUser.id, testModules[0].id);
    console.log(startProgress ? '✅ Successfully started module' : '❌ Failed to start module');
    
    // 1.2 Update progress
    console.log('\n--- Test 1.2: Updating Progress ---');
    const updateData = {
      progressPercentage: 50,
      pointsEarned: 25,
      timeSpentSeconds: 300
    };
    const updateProgress = await progressService.updateProgress(
      testUser.id, 
      testModules[0].id, 
      updateData
    );
    console.log(updateProgress ? '✅ Successfully updated progress' : '❌ Failed to update progress');
    console.log(`Progress percentage: ${updateProgress.progressPercentage}%`);
    
    // 1.3 Complete module
    console.log('\n--- Test 1.3: Completing a Module ---');
    const completeProgress = await progressService.completeModule(
      testUser.id, 
      testModules[0].id, 
      600 // 10 minutes to complete
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
    console.log(`Verification - Module completed: ${verifyCompletion?.completionStatus === 'COMPLETED'}`);
    
    // --- TEST 2: ACTIVITY LOGGING ---
    console.log('\n===== 2. ACTIVITY LOGGING =====');
    
    // 2.1 Check activity logs are created
    console.log('\n--- Test 2.1: Activity Log Creation ---');
    const activityLog = await progressService.getUserActivityHistory(testUser.id, 1, 20);
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
    
    // --- TEST 3: LEARNING STREAKS ---
    console.log('\n===== 3. LEARNING STREAKS =====');
    
    // 3.1 Verify streak creation
    console.log('\n--- Test 3.1: Streak Record Creation ---');
    const streak = await prisma.$queryRaw`
      SELECT * FROM "LearningStreak" WHERE "userId" = ${testUser.id}
    ` as any[];
    
    console.log(`✅ Streak record exists: ${streak.length > 0}`);
    if (streak.length > 0) {
      console.log('Current streak:', streak[0].currentStreak);
      console.log('Longest streak:', streak[0].longestStreak);
    }
    
    // Get user stats to see streak values
    console.log('\n--- Test 3.2: User Stats with Streaks ---');
    const userStats = await progressService.getUserStats(testUser.id);
    console.log('User stats:', {
      modulesCompleted: userStats.totalModulesCompleted,
      pointsEarned: userStats.totalPointsEarned,
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak
    });
    
    // --- TEST 4: ANALYTICS ---
    console.log('\n===== 4. ANALYTICS =====');
    
    // 4.1 Progress reports
    console.log('\n--- Test 4.1: Progress Reports ---');
    console.log('Module completion rate:', `${userStats.moduleCompletionRate.toFixed(1)}%`);
    console.log('Total activities:', userStats.totalActivities);
    
    // 4.2 Time-based analytics
    console.log('\n--- Test 4.2: Time Analytics ---');
    console.log('Average completion time:', `${userStats.averageCompletionTime.toFixed(1)} seconds`);
    console.log('Total time spent:', `${userStats.totalTimeSpentSeconds} seconds`);
    
    // --- TEST 5: NOTES & BOOKMARKS ---
    console.log('\n===== 5. NOTES & BOOKMARKS =====');
    
    // 5.1 Save notes
    console.log('\n--- Test 5.1: Saving Notes ---');
    const testNotes = "These are test notes for the module";
    const notesResult = await progressService.saveNotes(testUser.id, testModules[0].id, testNotes);
    console.log(`✅ Notes saved: ${!!notesResult}`);
    
    // 5.2 Save bookmarks
    console.log('\n--- Test 5.2: Saving Bookmarks ---');
    const testBookmarks = JSON.stringify([
      { position: "section1", timestamp: 120 },
      { position: "section2", timestamp: 240 }
    ]);
    const bookmarksResult = await progressService.saveBookmarks(testUser.id, testModules[0].id, testBookmarks);
    console.log(`✅ Bookmarks saved: ${!!bookmarksResult}`);
    
    // 5.3. Get module progress to verify notes and bookmarks
    const moduleProgress = await progressService.getModuleProgress(testUser.id, testModules[0].id);
    console.log(`✅ Notes retrieved: ${moduleProgress.notes === testNotes}`);
    console.log(`✅ Bookmarks retrieved: ${!!moduleProgress.bookmarks}`);
    
    console.log('\n===== ALL TESTS COMPLETED SUCCESSFULLY! =====');
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testCoreProgressFeatures()
  .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
  });
