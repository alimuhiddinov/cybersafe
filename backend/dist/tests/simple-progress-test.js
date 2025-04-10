"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
/**
 * A simple test for progress tracking with raw SQL queries
 */
async function testSimpleProgress() {
    try {
        console.log('Starting simple progress test...');
        // Create test user if not exists
        const testUser = await prisma.user.upsert({
            where: { email: 'simpletest@cybersafe.com' },
            update: {},
            create: {
                username: 'simpletest',
                email: 'simpletest@cybersafe.com',
                passwordHash: '$2a$10$LrYA/mTRmDfZh3LKalWPiOys4JrFhxGjnKgZ3O321S5JYUhL6j3fK', // Hash of 'SecurePass123'
                role: 'USER',
                isVerified: true
            }
        });
        console.log(`Test user created/found: ${testUser.username} (ID: ${testUser.id})`);
        // Create test module if not exists
        const testModule = await prisma.learningModule.upsert({
            where: { id: 888 },
            update: {},
            create: {
                id: 888,
                title: 'Simple Test Module',
                description: 'A simple test module for progress tracking',
                content: '{"sections":[{"title":"Test Section","content":"Test content"}]}',
                difficultyLevel: 'BEGINNER',
                estimatedTimeMinutes: 30,
                points: 100,
                isPublished: true
            }
        });
        console.log(`Test module created/found: ${testModule.title} (ID: ${testModule.id})`);
        // Create progress record
        console.log('Creating user progress record...');
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_moduleId: {
                    userId: testUser.id,
                    moduleId: testModule.id
                }
            },
            update: {
                completionStatus: 'IN_PROGRESS',
                progressPercentage: 50,
                pointsEarned: 25,
                lastAccessedAt: new Date()
            },
            create: {
                userId: testUser.id,
                moduleId: testModule.id,
                completionStatus: 'IN_PROGRESS',
                progressPercentage: 50,
                pointsEarned: 25,
                timeSpentSeconds: 300,
                lastAccessedAt: new Date()
            }
        });
        console.log('Progress record created:', progress);
        // Create activity log using raw SQL
        console.log('Creating activity log...');
        await prisma.$executeRaw `
      INSERT INTO "ActivityLog" ("userProgressId", "activityType", "timestamp", "details")
      VALUES (${progress.id}, 'MODULE_STARTED', ${new Date()}, 'Started module for testing')
    `;
        console.log('Activity log created');
        // Retrieve progress record
        console.log('Retrieving progress record...');
        const progressRecord = await prisma.userProgress.findUnique({
            where: {
                userId_moduleId: {
                    userId: testUser.id,
                    moduleId: testModule.id
                }
            }
        });
        console.log('Progress record:', progressRecord);
        // Retrieve activities
        console.log('Retrieving activities...');
        const activities = await prisma.$queryRaw `
      SELECT al.id, al."activityType", al."timestamp", al.details, up."moduleId"
      FROM "ActivityLog" al
      JOIN "UserProgress" up ON al."userProgressId" = up.id
      WHERE up."userId" = ${testUser.id}
      ORDER BY al."timestamp" DESC
    `;
        console.log('Activities:', activities);
        console.log('Simple test completed successfully!');
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testSimpleProgress()
    .catch(e => {
    console.error('Test script error:', e);
    process.exit(1);
});
