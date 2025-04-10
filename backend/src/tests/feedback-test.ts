import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import feedbackService from '../services/feedback.service';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Comprehensive test script for feedback system
 */
async function testFeedbackSystem() {
  try {
    console.log('===== CYBERSAFE FEEDBACK SYSTEM TEST =====\n');
    
    // Test data
    console.log('--- Setting up test data ---');
    
    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'feedback-test@cybersafe.com' },
      update: {},
      create: {
        username: 'feedback-test',
        email: 'feedback-test@cybersafe.com',
        password: 'TestPass123',
        role: 'USER',
        isVerified: true
      }
    });
    console.log(`Test user created: ${testUser.username} (ID: ${testUser.id})`);
    
    // Create another test user for multiple feedback records
    const testUser2 = await prisma.user.upsert({
      where: { email: 'feedback-test2@cybersafe.com' },
      update: {},
      create: {
        username: 'feedback-test2',
        email: 'feedback-test2@cybersafe.com',
        password: 'TestPass123',
        role: 'USER',
        isVerified: true
      }
    });
    console.log(`Second test user created: ${testUser2.username} (ID: ${testUser2.id})`);
    
    // Create admin user for testing analytics access
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin-test@cybersafe.com' },
      update: {
        role: 'ADMIN'
      },
      create: {
        username: 'admin-test',
        email: 'admin-test@cybersafe.com',
        password: 'AdminPass123',
        role: 'ADMIN',
        isVerified: true
      }
    });
    console.log(`Admin user created: ${adminUser.username} (ID: ${adminUser.id})`);
    
    // Create test modules
    const testModule1 = await prisma.learningModule.upsert({
      where: { id: 9001 },
      update: {},
      create: {
        id: 9001,
        title: 'Feedback Test Module 1',
        description: 'A test module for feedback testing',
        content: JSON.stringify({ sections: [{ title: 'Section 1', content: 'Test content' }] }),
        difficultyLevel: 'BEGINNER',
        estimatedTimeMinutes: 15,
        points: 20,
        isPublished: true
      }
    });
    
    const testModule2 = await prisma.learningModule.upsert({
      where: { id: 9002 },
      update: {},
      create: {
        id: 9002,
        title: 'Feedback Test Module 2',
        description: 'Another test module for feedback testing',
        content: JSON.stringify({ sections: [{ title: 'Section 1', content: 'More test content' }] }),
        difficultyLevel: 'INTERMEDIATE',
        estimatedTimeMinutes: 25,
        points: 30,
        isPublished: true
      }
    });
    
    console.log(`Created test modules: ${testModule1.title}, ${testModule2.title}`);
    
    // Clear any existing feedback for clean testing
    await prisma.userFeedback.deleteMany({
      where: {
        userId: {
          in: [testUser.id, testUser2.id]
        },
        moduleId: {
          in: [testModule1.id, testModule2.id]
        }
      }
    });
    console.log('Cleared existing feedback for clean testing');
    
    console.log('\n--- TEST 1: Submit Module Feedback ---');
    
    // Submit feedback for module 1
    const feedback1 = await feedbackService.submitModuleFeedback(
      testUser.id,
      testModule1.id,
      5, // 5-star rating
      'This module was excellent! I learned a lot about cybersecurity basics.'
    );
    
    console.log('Feedback submitted successfully:');
    console.log(`- Rating: ${feedback1.rating}/5`);
    console.log(`- Comment: ${feedback1.comment}`);
    
    // Submit feedback for module 2
    const feedback2 = await feedbackService.submitModuleFeedback(
      testUser.id,
      testModule2.id,
      3, // 3-star rating
      'The module was okay but could use more visual examples.'
    );
    
    console.log('\nFeedback submitted for second module:');
    console.log(`- Rating: ${feedback2.rating}/5`);
    console.log(`- Comment: ${feedback2.comment}`);
    
    // Submit feedback from second user
    const feedback3 = await feedbackService.submitModuleFeedback(
      testUser2.id,
      testModule1.id,
      4, // 4-star rating
      'Good content, but could be more interactive.'
    );
    
    console.log('\nFeedback submitted from second user:');
    console.log(`- Rating: ${feedback3.rating}/5`);
    console.log(`- Comment: ${feedback3.comment}`);
    
    const feedback4 = await feedbackService.submitModuleFeedback(
      testUser2.id,
      testModule2.id,
      2, // 2-star rating
      'Too advanced for beginners, needs more explanations.'
    );
    
    console.log('\nFeedback submitted from second user for second module:');
    console.log(`- Rating: ${feedback4.rating}/5`);
    console.log(`- Comment: ${feedback4.comment}`);
    
    // TEST 2: Retrieve feedback for a module
    console.log('\n--- TEST 2: Retrieve Module Feedback ---');
    
    const moduleFeedback = await feedbackService.getModuleFeedback(testModule1.id);
    
    console.log(`Retrieved ${moduleFeedback.data.length} feedback items for module "${testModule1.title}"`);
    moduleFeedback.data.forEach((item, index) => {
      console.log(`\nFeedback #${index + 1}:`);
      console.log(`- User: ${item.user.username}`);
      console.log(`- Rating: ${item.rating}/5`);
      console.log(`- Comment: ${item.comment}`);
      console.log(`- Date: ${new Date(item.createdAt).toLocaleString()}`);
    });
    
    // TEST 3: Retrieve feedback for a user
    console.log('\n--- TEST 3: Retrieve User Feedback ---');
    
    const userFeedback = await feedbackService.getUserFeedback(testUser.id);
    
    console.log(`Retrieved ${userFeedback.data.length} feedback items from user "${testUser.username}"`);
    userFeedback.data.forEach((item, index) => {
      console.log(`\nFeedback #${index + 1}:`);
      console.log(`- Module: ${item.learningModule.title}`);
      console.log(`- Rating: ${item.rating}/5`);
      console.log(`- Comment: ${item.comment}`);
      console.log(`- Date: ${new Date(item.createdAt).toLocaleString()}`);
    });
    
    // TEST 4: Update existing feedback
    console.log('\n--- TEST 4: Update Existing Feedback ---');
    
    const updatedFeedback = await feedbackService.submitModuleFeedback(
      testUser.id,
      testModule1.id,
      4, // Change from 5 to 4 stars
      'Updated comment: Still very good, but could use more practical examples.'
    );
    
    console.log('Feedback updated successfully:');
    console.log(`- Previous Rating: 5/5, New Rating: ${updatedFeedback.rating}/5`);
    console.log(`- Updated Comment: ${updatedFeedback.comment}`);
    
    // TEST 5: Feedback analytics for a module
    console.log('\n--- TEST 5: Module Feedback Analytics ---');
    
    const moduleAnalytics = await feedbackService.getModuleFeedbackAnalytics(testModule1.id);
    
    console.log(`Analytics for module "${testModule1.title}":`);
    console.log(`- Average Rating: ${moduleAnalytics.averageRating.toFixed(2)}/5`);
    console.log(`- Total Ratings: ${moduleAnalytics.totalRatings}`);
    console.log('- Rating Distribution:');
    moduleAnalytics.ratingDistribution.forEach(item => {
      console.log(`  - ${item.rating} stars: ${item.count} ratings`);
    });
    
    // TEST 6: Overall feedback analytics
    console.log('\n--- TEST 6: Overall Feedback Analytics ---');
    
    const overallAnalytics = await feedbackService.getOverallFeedbackAnalytics();
    
    console.log('Overall Platform Feedback Analytics:');
    console.log(`- Average Rating Across All Modules: ${overallAnalytics.averageRating.toFixed(2)}/5`);
    console.log(`- Total Feedback Submissions: ${overallAnalytics.totalRatings}`);
    console.log(`- Total Comments: ${overallAnalytics.commentsCount}`);
    
    if (overallAnalytics.topRatedModules && overallAnalytics.topRatedModules.length > 0) {
      console.log('\nTop Rated Modules:');
      overallAnalytics.topRatedModules.forEach((module, index) => {
        console.log(`  ${index + 1}. ${module.title} - ${parseFloat(module.averageRating).toFixed(2)}/5 (${module.ratingCount} ratings)`);
      });
    }
    
    // TEST 7: Get specific feedback by ID
    console.log('\n--- TEST 7: Get Feedback by ID ---');
    
    const specificFeedback = await feedbackService.getFeedbackById(feedback1.id);
    
    console.log(`Retrieved feedback with ID ${feedback1.id}:`);
    if (specificFeedback) {
      console.log(`- User: ${specificFeedback.user.username}`);
      console.log(`- Module: ${specificFeedback.learningModule.title}`);
      console.log(`- Rating: ${specificFeedback.rating}/5`);
      console.log(`- Comment: ${specificFeedback.comment}`);
    } else {
      console.log('Feedback not found');
    }
    
    // TEST 8: Delete a feedback
    console.log('\n--- TEST 8: Delete Feedback ---');
    
    const deletedFeedback = await feedbackService.deleteFeedback(feedback4.id, testUser2.id, false);
    
    if (deletedFeedback) {
      console.log(`Successfully deleted feedback for module "${testModule2.title}" from user "${testUser2.username}"`);
    } else {
      console.log('Failed to delete feedback');
    }
    
    // Verify deletion
    const remainingCount = await prisma.userFeedback.count({
      where: {
        userId: testUser2.id,
        moduleId: testModule2.id
      }
    });
    
    console.log(`Remaining feedback items for this user-module combination: ${remainingCount}`);
    
    console.log('\n===== FEEDBACK SYSTEM TEST COMPLETED SUCCESSFULLY =====');
    
  } catch (error) {
    console.error('Error during feedback system testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testFeedbackSystem()
  .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
  });
