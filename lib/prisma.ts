import { PrismaClient } from '@prisma/client';

import { ensureRowLevelSecurity } from '@/lib/ensureRls';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  rlsEnsured?: boolean;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;

  prisma.$connect()
    .then(async () => {
      if (globalForPrisma.rlsEnsured) return;
      await ensureRowLevelSecurity(prisma);
      globalForPrisma.rlsEnsured = true;
    })
    .catch((err) => {
      console.error('Failed to connect to database or enable RLS:', err);
    });
}

export default prisma;
