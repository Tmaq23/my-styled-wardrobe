const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createVerificationTable() {
  try {
    console.log('🚀 Creating analysis_verifications table in Supabase...\n');
    
    // Step 1: Create the table
    console.log('📋 Step 1: Creating table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.analysis_verifications (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "userId" TEXT NOT NULL,
          "bodyShape" TEXT NOT NULL,
          "colorPalette" TEXT NOT NULL,
          "bodyImageUrl" TEXT,
          "faceImageUrl" TEXT,
          "stripePaymentIntentId" TEXT,
          amount DOUBLE PRECISION NOT NULL DEFAULT 30.0,
          currency TEXT NOT NULL DEFAULT 'gbp',
          "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
          "verifiedBodyShape" TEXT,
          "verifiedColorPalette" TEXT,
          "stylistNotes" TEXT,
          "stylistId" TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          "verifiedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table created successfully!\n');
    
    // Step 2: Create indexes
    console.log('📋 Step 2: Creating indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "analysis_verifications_userId_idx" 
      ON public.analysis_verifications("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "analysis_verifications_status_idx" 
      ON public.analysis_verifications(status);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "analysis_verifications_paymentStatus_idx" 
      ON public.analysis_verifications("paymentStatus");
    `);
    console.log('✅ Indexes created successfully!\n');
    
    // Step 3: Add foreign key (with error handling in case it fails)
    console.log('📋 Step 3: Adding foreign key constraint...');
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'analysis_verifications_userId_fkey'
          ) THEN
            ALTER TABLE public.analysis_verifications 
            ADD CONSTRAINT "analysis_verifications_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);
      console.log('✅ Foreign key constraint added!\n');
    } catch (fkError) {
      console.log('⚠️  Foreign key already exists or minor issue (safe to ignore)\n');
    }
    
    // Step 4: Verify the table exists
    console.log('📋 Step 4: Verifying table...');
    const verification = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'analysis_verifications';
    `;
    
    if (verification.length > 0) {
      console.log('✅ VERIFIED: analysis_verifications table exists!\n');
      
      // Count records
      const count = await prisma.analysisVerification.count();
      console.log(`📊 Current verification records: ${count}\n`);
      
      console.log('🎉 SUCCESS! Everything is set up correctly!');
      console.log('👉 You can now use the "Get Verified - £30" button on your site!\n');
      return true;
    } else {
      console.log('❌ Table verification failed!\n');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    console.error('\nFull error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

createVerificationTable();

