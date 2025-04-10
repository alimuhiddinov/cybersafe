import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('\n--- CyberSafe Database Test ---\n');
    
    // Test database connection
    console.log('Testing database connection...');
    try {
      const result = await prisma.$queryRaw`SELECT sqlite_version() as version`;
      console.log('Connection successful:', result);
    } catch (error) {
      console.error('Connection error:', error);
    }
    console.log('---------------------------\n');
    
    // Count records in key tables
    console.log('Counting records in database tables:');
    
    const userCount = await prisma.user.count();
    console.log(`- Users: ${userCount}`);
    
    const badgeCount = await prisma.badge.count();
    console.log(`- Badges: ${badgeCount}`);
    
    const moduleCount = await prisma.learningModule.count();
    console.log(`- Learning Modules: ${moduleCount}`);
    
    const progressCount = await prisma.userProgress.count();
    console.log(`- User Progress Records: ${progressCount}`);
    
    const assessmentCount = await prisma.assessment.count();
    console.log(`- Assessments: ${assessmentCount}`);
    
    const questionCount = await prisma.question.count();
    console.log(`- Questions: ${questionCount}`);
    
    const answerCount = await prisma.answer.count();
    console.log(`- Answers: ${answerCount}`);
    
    console.log('---------------------------\n');
    
    // Get basic user data
    console.log('User information:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });
    
    users.forEach(user => {
      console.log(`- [${user.id}] ${user.username} (${user.email}) - Role: ${user.role}`);
    });
    console.log('---------------------------\n');
    
    // Get learning modules
    console.log('Learning modules:');
    const modules = await prisma.learningModule.findMany({
      select: {
        id: true,
        title: true,
        difficultyLevel: true,
        isPublished: true,
      }
    });
    
    modules.forEach(module => {
      console.log(`- [${module.id}] ${module.title} (${module.difficultyLevel}) - Published: ${module.isPublished}`);
    });
    console.log('---------------------------\n');
    
    // Get user progress
    console.log('User progress records:');
    const progress = await prisma.userProgress.findMany({
      select: {
        userId: true,
        moduleId: true,
        completionStatus: true,
        progressPercentage: true,
        pointsEarned: true,
      }
    });
    
    progress.forEach(p => {
      console.log(`- User ${p.userId} on module ${p.moduleId}: ${p.completionStatus} (${p.progressPercentage}%) - Points: ${p.pointsEarned}`);
    });
    console.log('---------------------------\n');
    
    console.log('Database tests completed successfully!');
  } catch (error) {
    console.error('Error during database test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabase();
