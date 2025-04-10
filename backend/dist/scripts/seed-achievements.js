"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const achievements = [
    {
        name: 'FIRST_MODULE_COMPLETED',
        description: 'Completed your first learning module',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/first-module.png',
        criteria: 'Complete 1 learning module',
        pointsValue: 10,
        isActive: true
    },
    {
        name: 'FIVE_MODULES_COMPLETED',
        description: 'Completed five learning modules',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/five-modules.png',
        criteria: 'Complete 5 learning modules',
        pointsValue: 25,
        isActive: true
    },
    {
        name: 'TEN_MODULES_COMPLETED',
        description: 'Completed ten learning modules',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/ten-modules.png',
        criteria: 'Complete 10 learning modules',
        pointsValue: 50,
        isActive: true
    },
    {
        name: 'POINT_COLLECTOR',
        description: 'Earned 100 points',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/point-collector.png',
        criteria: 'Earn 100 points across all modules',
        pointsValue: 20,
        isActive: true
    },
    {
        name: 'POINT_MASTER',
        description: 'Earned 1000 points',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/point-master.png',
        criteria: 'Earn 1000 points across all modules',
        pointsValue: 100,
        isActive: true
    },
    {
        name: 'THREE_DAY_STREAK',
        description: 'Learned for three consecutive days',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/three-day-streak.png',
        criteria: 'Learn on the platform for 3 consecutive days',
        pointsValue: 15,
        isActive: true
    },
    {
        name: 'WEEK_STREAK',
        description: 'Learned for seven consecutive days',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/week-streak.png',
        criteria: 'Learn on the platform for 7 consecutive days',
        pointsValue: 35,
        isActive: true
    },
    {
        name: 'MONTH_STREAK',
        description: 'Learned for thirty consecutive days',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/month-streak.png',
        criteria: 'Learn on the platform for 30 consecutive days',
        pointsValue: 100,
        isActive: true
    },
    {
        name: 'ACTIVE_LEARNER',
        description: 'Completed 50 learning activities',
        imageUrl: 'https://cybersafe-platform.com/assets/badges/active-learner.png',
        criteria: 'Complete 50 learning activities',
        pointsValue: 30,
        isActive: true
    }
];
async function seedAchievements() {
    console.log('Starting achievement seeding...');
    try {
        for (const achievement of achievements) {
            const result = await prisma.achievement.upsert({
                where: { name: achievement.name },
                update: achievement,
                create: achievement
            });
            console.log(`Created/updated achievement: ${result.name}`);
        }
        console.log('\nAchievement seeding completed successfully!');
        console.log(`Total achievements in database: ${achievements.length}`);
    }
    catch (error) {
        console.error('Error during achievement seeding:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedAchievements()
    .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
});
