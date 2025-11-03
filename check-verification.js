const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVerification() {
  try {
    const verifications = await prisma.analysisVerification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (verifications.length > 0) {
      const v = verifications[0];
      console.log('\n📋 Latest Verification:');
      console.log('   ID:', v.id);
      console.log('   User:', v.user.email);
      console.log('   Body Shape:', v.bodyShape);
      console.log('   Color Palette:', v.colorPalette);
      console.log('   Image URLs:', v.imageUrls);
      console.log('   Image Count:', v.imageUrls.length);
      console.log('   Payment Status:', v.paymentStatus);
      console.log('   Status:', v.status);
      console.log('   Created:', v.createdAt);
    } else {
      console.log('❌ No verifications found');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkVerification();
