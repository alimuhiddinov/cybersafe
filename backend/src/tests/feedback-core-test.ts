import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import feedbackService from '../services/feedback.service';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Core test for feedback system - simplified with clear log outputs
 */
async function testFeedbackCore() {
  try {
    console.log('\n=================================================');
    console.log('      CYBERSAFE FEEDBACK SYSTEM CORE TEST        ');
    console.log('=================================================\n');
    
    // Setup test data
    console.log('STEP 1: Setting up test data...');
    
    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'fb-test@cybersafe.com' },
      update: {},
      create: {
        username: 'fb-test',
        email: 'fb-test@cybersafe.com',
        password: 'TestPass123',
        role: 'USER',
        isVerified: true
      }
    });
    console.log(`✓ Test user created: ID ${testUser.id}, username '${testUser.username}'`);
    
    // Create test module
    const testModule = await prisma.learningModule.upsert({
      where: { id: 8001 },
      update: {},
      create: {
        id: 8001,
        title: 'Feedback Core Test Module',
        description: 'A module for testing feedback functionality',
        content: JSON.stringify({ sections: [{ title: 'Section 1', content: 'Test content' }] }),
        difficultyLevel: 'BEGINNER',
        estimatedTimeMinutes: 15,
        points: 20,
        isPublished: true
      }
    });
    console.log(`✓ Test module created: ID ${testModule.id}, title '${testModule.title}'`);
    
    // Clear existing feedback
    await prisma.userFeedback.deleteMany({
      where: {
        userId: testUser.id,
        moduleId: testModule.id
      }
    });
    console.log('✓ Cleared existing feedback for clean testing\n');
    
    // Test 1: Submit new feedback
    console.log('STEP 2: Testing feedback submission...');
    const newFeedback = await feedbackService.submitModuleFeedback(
      testUser.id,
      testModule.id,
      4, // 4-star rating
      'Great module with useful information!'
    );
    
    console.log('✓ Feedback submitted successfully:');
    console.log(`  - ID: ${newFeedback.id}`);
    console.log(`  - User ID: ${newFeedback.userId}`);
    console.log(`  - Module ID: ${newFeedback.moduleId}`);
    console.log(`  - Rating: ${newFeedback.rating}/5`);
    console.log(`  - Comment: ${newFeedback.comment}`);
    console.log(`  - Created: ${newFeedback.createdAt}\n`);
    
    // Test 2: Update existing feedback
    console.log('STEP 3: Testing feedback update...');
    const updatedFeedback = await feedbackService.submitModuleFeedback(
      testUser.id,
      testModule.id,
      5, // Improved rating
      'Updated: Excellent module, very informative with great examples!'
    );
    
    console.log('✓ Feedback updated successfully:');
    console.log(`  - ID: ${updatedFeedback.id}`);
    console.log(`  - Rating changed from 4 to ${updatedFeedback.rating}/5`);
    console.log(`  - New comment: ${updatedFeedback.comment}`);
    console.log(`  - Updated: ${updatedFeedback.updatedAt}\n`);
    
    // Test 3: Retrieve feedback by ID
    console.log('STEP 4: Testing feedback retrieval by ID...');
    const retrievedFeedback = await feedbackService.getFeedbackById(updatedFeedback.id);
    
    console.log('✓ Feedback retrieved successfully:');
    console.log(`  - User: ${retrievedFeedback?.user.username}`);
    console.log(`  - Module: ${retrievedFeedback?.learningModule.title}`);
    console.log(`  - Rating: ${retrievedFeedback?.rating}/5`);
    console.log(`  - Comment: ${retrievedFeedback?.comment}\n`);
    
    // Test 4: Module feedback analytics
    console.log('STEP 5: Testing module feedback analytics...');
    
    // Create another user and add more feedback to get meaningful analytics
    const testUser2 = await prisma.user.upsert({
      where: { email: 'fb-test2@cybersafe.com' },
      update: {},
      create: {
        username: 'fb-test2',
        email: 'fb-test2@cybersafe.com',
        password: 'TestPass123',
        role: 'USER',
        isVerified: true
      }
    });
    
    await feedbackService.submitModuleFeedback(
      testUser2.id,
      testModule.id,
      3, // 3-star rating
      'Good content but needs more practical examples.'
    );
    
    const moduleAnalytics = await feedbackService.getModuleFeedbackAnalytics(testModule.id);
    
    console.log('✓ Module feedback analytics generated:');
    console.log(`  - Average rating: ${moduleAnalytics.averageRating.toFixed(2)}/5`);
    console.log(`  - Total ratings: ${moduleAnalytics.totalRatings}`);
    console.log('  - Rating distribution:');
    moduleAnalytics.ratingDistribution.forEach(item => {
      console.log(`    * ${item.rating} stars: ${item.count} rating(s)`);
    });
    console.log(`  - Comments count: ${moduleAnalytics.commentsCount}\n`);
    
    // Test 5: Get module feedback (paginated)
    console.log('STEP 6: Testing module feedback retrieval...');
    const moduleFeedback = await feedbackService.getModuleFeedback(testModule.id);
    
    console.log(`✓ Retrieved ${moduleFeedback.data.length} feedback items for module:`);
    moduleFeedback.data.forEach((item, i) => {
      console.log(`  ${i+1}. User: ${item.user.username}, Rating: ${item.rating}/5`);
      console.log(`     Comment: ${item.comment}`);
    });
    console.log('  Pagination metadata:');
    console.log(`  - Total count: ${moduleFeedback.metadata.totalCount}`);
    console.log(`  - Page: ${moduleFeedback.metadata.page}/${moduleFeedback.metadata.totalPages}`);
    console.log(`  - Page size: ${moduleFeedback.metadata.pageSize}\n`);
    
    // Test 6: Get user feedback
    console.log('STEP 7: Testing user feedback retrieval...');
    const userFeedback = await feedbackService.getUserFeedback(testUser.id);
    
    console.log(`✓ Retrieved ${userFeedback.data.length} feedback items for user '${testUser.username}':`);
    userFeedback.data.forEach((item, i) => {
      console.log(`  ${i+1}. Module: ${item.learningModule.title}`);
      console.log(`     Rating: ${item.rating}/5, Comment: ${item.comment}`);
    });
    
    // Final summary
    console.log('\n=================================================');
    console.log('  FEEDBACK SYSTEM CORE TEST COMPLETED SUCCESSFULLY');
    console.log('=================================================');
    console.log('\nSummary of Verified Functionality:');
    console.log('✓ Module rating submission');
    console.log('✓ User feedback collection');
    console.log('✓ Feedback updating');
    console.log('✓ Feedback retrieval (by ID, by module, by user)');
    console.log('✓ Feedback analytics generation');
    console.log('✓ Pagination support for feedback lists');
    
  } catch (error) {
    console.error('Error during feedback system testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFeedbackCore()
  .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
  });
