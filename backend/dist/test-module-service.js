"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const module_service_1 = __importDefault(require("./services/module.service"));
const prisma = new client_1.PrismaClient();
async function testModuleService() {
    var _a;
    try {
        console.log('\n--- Testing Learning Module Service ---\n');
        // Get all modules
        console.log('Testing getModules...');
        const modules = await module_service_1.default.getModules({
            page: 1,
            limit: 10
        }, 'ADMIN');
        console.log(`Found ${modules.data.length} modules`);
        console.log('Pagination:', modules.pagination);
        if (modules.data.length > 0) {
            const firstModuleId = modules.data[0].id;
            // Get module details
            console.log(`\nTesting getModuleDetails for module ID: ${firstModuleId}...`);
            const moduleDetails = await module_service_1.default.getModuleDetails(firstModuleId);
            console.log('Module title:', moduleDetails === null || moduleDetails === void 0 ? void 0 : moduleDetails.title);
            console.log('Has assessments:', ((_a = moduleDetails === null || moduleDetails === void 0 ? void 0 : moduleDetails.assessments) === null || _a === void 0 ? void 0 : _a.length) > 0 ? 'Yes' : 'No');
            // Get module content
            console.log(`\nTesting getModuleContent for module ID: ${firstModuleId}...`);
            const content = await module_service_1.default.getModuleContent(firstModuleId);
            console.log('Content available:', content ? 'Yes' : 'No');
            // Test recommendations
            console.log('\nTesting getRecommendedModules...');
            // Assuming we have at least one user in the database with ID 1
            const recommendedModules = await module_service_1.default.getRecommendedModules(1);
            console.log(`Found ${recommendedModules.length} recommended modules`);
        }
        console.log('\n--- Module Service Tests Completed ---\n');
    }
    catch (error) {
        console.error('Error during module service test:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testModuleService();
