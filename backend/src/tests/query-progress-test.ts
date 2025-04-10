import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * A read-only test that queries existing progress data
 */
async function queryProgressData() {
  try {
    console.log('Starting query test for progress tracking...');
    
    // 1. Get all users
    console.log('\n--- Get Users ---');
    const users = await prisma.user.findMany({
      take: 3
    });
    
    if (users.length === 0) {
      console.log('No users found in the database');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    console.log('User IDs:', users.map(u => u.id));
    
    const testUserId = users[0].id;
    
    // 2. Get all modules
    console.log('\n--- Get Modules ---');
    const modules = await prisma.learningModule.findMany({
      take: 3
    });
    
    if (modules.length === 0) {
      console.log('No modules found in the database');
      return;
    }
    
    console.log(`Found ${modules.length} modules`);
    console.log('Module IDs:', modules.map(m => m.id));
    
    // 3. Get user progress records
    console.log('\n--- Get User Progress ---');
    const progressRecords = await prisma.userProgress.findMany({
      where: {
        userId: testUserId
      },
      take: 5
    });
    
    console.log(`Found ${progressRecords.length} progress records for user ${testUserId}`);
    
    if (progressRecords.length > 0) {
      console.log('Progress records:', progressRecords.map(p => ({
        id: p.id,
        moduleId: p.moduleId,
        status: p.completionStatus,
        progress: p.progressPercentage
      })));
      
      // 4. Get activity logs for a progress record
      if (progressRecords.length > 0) {
        const progressId = progressRecords[0].id;
        console.log(`\n--- Get Activity Logs for Progress ID ${progressId} ---`);
        
        const activityLogs = await prisma.activityLog.findMany({
          where: {
            userProgressId: progressId
          }
        });
        
        console.log(`Found ${activityLogs.length} activity logs`);
        if (activityLogs.length > 0) {
          console.log('Activity logs:', activityLogs.map(a => ({
            id: a.id,
            type: a.activityType,
            timestamp: a.timestamp,
            metadata: a.metadata
          })));
        }
      }
      
      // 5. Get user achievements
      console.log('\n--- Get User Achievements ---');
      const achievements = await prisma.userAchievement.findMany({
        where: {
          userId: testUserId
        },
        include: {
          achievement: true
        }
      });
      
      console.log(`Found ${achievements.length} achievements for user ${testUserId}`);
      if (achievements.length > 0) {
        console.log('Achievements:', achievements.map(a => ({
          id: a.id,
          achievementId: a.achievementId,
          name: a.achievement.name,
          description: a.achievement.description,
          awardedAt: a.awardedAt
        })));
      }
      
      // 6. Get learning streak
      console.log('\n--- Get Learning Streak ---');
      const streak = await prisma.learningStreak.findUnique({
        where: {
          userId: testUserId
        }
      });
      
      if (streak) {
        console.log('Learning streak:', {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastActivityDate: streak.lastActivityDate
        });
      } else {
        console.log('No learning streak found for this user');
      }
    }
    
    console.log('\nQuery test completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryProgressData()
  .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
  });
