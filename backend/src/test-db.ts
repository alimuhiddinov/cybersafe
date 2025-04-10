import prismaService from './services/prisma.service';

async function testDatabase() {
  try {
    console.log('\n--- CyberSafe Database Test ---\n');
    
    // Test database connection
    console.log('Testing database connection...');
    const connectionTest = await prismaService.testConnection();
    console.log('Connection test result:', connectionTest);
    console.log('---------------------------\n');
    
    if (!connectionTest.connected) {
      console.error('Database connection failed. Please check your database configuration.');
      return;
    }
    
    // Test some queries
    console.log('Retrieving users with badges...');
    const users = await prismaService.getAllUsersWithBadges();
    console.log(`Found ${users.length} users`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) with ${user.userBadges?.length || 0} badges`);
    });
    console.log('---------------------------\n');
    
    console.log('Retrieving learning modules...');
    const modules = await prismaService.getAllLearningModules();
    console.log(`Found ${modules.length} learning modules`);
    modules.forEach(module => {
      console.log(`- ${module.title} (${module.difficultyLevel})`);
    });
    console.log('---------------------------\n');
    
    console.log('Retrieving leaderboard...');
    const leaderboard = await prismaService.getLeaderboard(5);
    console.log('Top 5 users:');
    leaderboard.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.username} - ${entry.totalPoints} points`);
    });
    console.log('---------------------------\n');
    
    // Test a user dashboard
    console.log('Retrieving user dashboard for the first user...');
    if (users.length > 0) {
      const dashboard = await prismaService.getUserDashboard(users[0].id);
      console.log('User dashboard summary:');
      console.log(`- Username: ${dashboard.user.username}`);
      console.log(`- Badges: ${dashboard.user.userBadges?.length || 0}`);
      console.log(`- Module stats: ${JSON.stringify(dashboard.moduleStats)}`);
      console.log(`- Recent attempts: ${dashboard.recentAttempts?.length || 0}`);
    }
    console.log('---------------------------\n');
    
    console.log('Database tests completed successfully!');
  } catch (error) {
    console.error('Error during database test:', error);
  } finally {
    await prismaService.disconnect();
  }
}

testDatabase();
