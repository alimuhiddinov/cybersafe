import { PrismaClient } from '@prisma/client';
import progressService from '../services/progress.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Simplified test script for achievement tracking functionality
 */
async function testAchievementTracking() {
  try {
    console.log('===== CYBERSAFE ACHIEVEMENT TRACKING TEST =====');
    
    // Setup phase
    console.log('\n--- Setup: Creating Test User and Modules ---');
    
    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'achievementtest@cybersafe.com' },
      update: {},
      create: {
        username: 'achievementtest',
        email: 'achievementtest@cybersafe.com',
        password: 'TestPass123',
        role: 'USER',
        isVerified: true
      }
    });
    console.log(`Test user created: ${testUser.username} (ID: ${testUser.id})`);
    
    // Create just 3 test modules for our test
    const modulePromises = [];
    for (let i = 1; i <= 3; i++) {
      modulePromises.push(
        prisma.learningModule.upsert({
          where: { id: 3000 + i },
          update: {},
          create: {
            id: 3000 + i,
            title: `Achievement Test Module ${i}`,
            description: `Test module ${i} for achievement testing`,
            content: JSON.stringify({ sections: [{ title: 'Section 1', content: 'Content' }] }),
            difficultyLevel: 'BEGINNER',
            estimatedTimeMinutes: 10,
            points: 50,
            isPublished: true
          }
        })
      );
    }
    
    const testModules = await Promise.all(modulePromises);
    console.log(`Created ${testModules.length} test modules`);
    
    // Clear existing progress and achievements
    await prisma.userProgress.deleteMany({
      where: {
        userId: testUser.id,
        moduleId: { in: testModules.map(m => m.id) }
      }
    });
    
    await prisma.userAchievement.deleteMany({
      where: { userId: testUser.id }
    });
    
    console.log('Cleared existing data for clean testing');
    
    // Step 1: Check initial achievements
    console.log('\nSTEP 1: Verifying Initial State');
    const initialAchievements = await progressService.getUserAchievements(testUser.id);
    console.log(`- User has ${initialAchievements.achievements.length} achievements`);
    console.log(`- User has ${initialAchievements.lockedAchievements.length} locked achievements`);
    
    if (initialAchievements.lockedAchievements.length > 0) {
      console.log('  Sample locked achievements:');
      initialAchievements.lockedAchievements.slice(0, 3).forEach(a => {
        console.log(`  - ${a.name}: ${a.description}`);
      });
    }
    
    // Step 2: Complete a module and check for FIRST_MODULE_COMPLETED achievement
    console.log('\nSTEP 2: Completing First Module');
    await progressService.startModule(testUser.id, testModules[0].id);
    await progressService.completeModule(testUser.id, testModules[0].id, 300);
    console.log('- Module completed');
    
    // Check for achievement award
    await progressService.checkAndAwardAchievements(testUser.id);
    
    const firstModuleResult = await progressService.getUserAchievements(testUser.id);
    console.log(`- User now has ${firstModuleResult.achievements.length} achievements`);
    
    const hasFirstModuleAchievement = firstModuleResult.achievements.some(
      a => a.name === 'FIRST_MODULE_COMPLETED'
    );
    
    console.log(`- FIRST_MODULE_COMPLETED awarded: ${hasFirstModuleAchievement ? 'Yes ' : 'No '}`);
    
    if (firstModuleResult.achievements.length > 0) {
      console.log('  Earned achievements:');
      firstModuleResult.achievements.forEach(a => {
        console.log(`  - ${a.name}: ${a.description}`);
      });
    }
    
    console.log('\n===== ACHIEVEMENT TEST COMPLETED =====');
    
  } catch (error) {
    console.error('Error during achievement testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAchievementTracking()
  .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
  });
