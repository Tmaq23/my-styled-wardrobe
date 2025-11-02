// Script to update existing UserLimit records with new fields
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserLimits() {
  try {
    console.log('🔄 Updating existing UserLimit records...');
    
    // Get all UserLimit records
    const limits = await prisma.userLimit.findMany();
    
    console.log(`Found ${limits.length} UserLimit records`);
    
    // Update each record to ensure it has the new fields with default values
    for (const limit of limits) {
      // Check if the record is missing the new fields (they would be undefined in old records)
      await prisma.userLimit.update({
        where: { userId: limit.userId },
        data: {
          aiAnalysesUsed: limit.aiAnalysesUsed ?? 0,
          tierLimitAnalyses: limit.tierLimitAnalyses ?? 1,
        },
      });
      console.log(`✅ Updated limits for user: ${limit.userId}`);
    }
    
    console.log('✅ All UserLimit records updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating user limits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserLimits();




