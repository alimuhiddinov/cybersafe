import { PrismaClient } from '@prisma/client';
import moduleService from './services/module.service';

const prisma = new PrismaClient();

async function testModuleService() {
  try {
    console.log('\n--- Testing Learning Module Service ---\n');
    
    // Get all modules
    console.log('Testing getModules...');
    const modules = await moduleService.getModules({
      page: 1,
      limit: 10
    }, 'ADMIN');
    
    console.log(`Found ${modules.data.length} modules`);
    console.log('Pagination:', modules.pagination);
    
    if (modules.data.length > 0) {
      const firstModuleId = modules.data[0].id;
      
      // Get module details
      console.log(`\nTesting getModuleDetails for module ID: ${firstModuleId}...`);
      const moduleDetails = await moduleService.getModuleDetails(firstModuleId);
      console.log('Module title:', moduleDetails?.title);
      console.log('Has assessments:', moduleDetails?.assessments?.length > 0 ? 'Yes' : 'No');
      
      // Get module content
      console.log(`\nTesting getModuleContent for module ID: ${firstModuleId}...`);
      const content = await moduleService.getModuleContent(firstModuleId);
      console.log('Content available:', content ? 'Yes' : 'No');
      
      // Test recommendations
      console.log('\nTesting getRecommendedModules...');
      // Assuming we have at least one user in the database with ID 1
      const recommendedModules = await moduleService.getRecommendedModules(1);
      console.log(`Found ${recommendedModules.length} recommended modules`);
    }
    
    console.log('\n--- Module Service Tests Completed ---\n');
  } catch (error) {
    console.error('Error during module service test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModuleService();
