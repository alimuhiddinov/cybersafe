"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = __importDefault(require("./services/prisma.service"));
async function testDatabase() {
    var _a, _b;
    try {
        console.log('\n--- CyberSafe Database Test ---\n');
        // Test database connection
        console.log('Testing database connection...');
        const connectionTest = await prisma_service_1.default.testConnection();
        console.log('Connection test result:', connectionTest);
        console.log('---------------------------\n');
        if (!connectionTest.connected) {
            console.error('Database connection failed. Please check your database configuration.');
            return;
        }
        // Test some queries
        console.log('Retrieving users with badges...');
        const users = await prisma_service_1.default.getAllUsersWithBadges();
        console.log(`Found ${users.length} users`);
        users.forEach(user => {
            var _a;
            console.log(`- ${user.username} (${user.email}) with ${((_a = user.userBadges) === null || _a === void 0 ? void 0 : _a.length) || 0} badges`);
        });
        console.log('---------------------------\n');
        console.log('Retrieving learning modules...');
        const modules = await prisma_service_1.default.getAllLearningModules();
        console.log(`Found ${modules.length} learning modules`);
        modules.forEach(module => {
            console.log(`- ${module.title} (${module.difficultyLevel})`);
        });
        console.log('---------------------------\n');
        console.log('Retrieving leaderboard...');
        const leaderboard = await prisma_service_1.default.getLeaderboard(5);
        console.log('Top 5 users:');
        leaderboard.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.username} - ${entry.totalPoints} points`);
        });
        console.log('---------------------------\n');
        // Test a user dashboard
        console.log('Retrieving user dashboard for the first user...');
        if (users.length > 0) {
            const dashboard = await prisma_service_1.default.getUserDashboard(users[0].id);
            console.log('User dashboard summary:');
            console.log(`- Username: ${dashboard.user.username}`);
            console.log(`- Badges: ${((_a = dashboard.user.userBadges) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            console.log(`- Module stats: ${JSON.stringify(dashboard.moduleStats)}`);
            console.log(`- Recent attempts: ${((_b = dashboard.recentAttempts) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
        }
        console.log('---------------------------\n');
        console.log('Database tests completed successfully!');
    }
    catch (error) {
        console.error('Error during database test:', error);
    }
    finally {
        await prisma_service_1.default.disconnect();
    }
}
testDatabase();
