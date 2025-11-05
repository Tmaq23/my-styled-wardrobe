const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.pmdlnlrlrqfwhawwcaxl:F6BfH!q5AFcDRdc@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'
    }
  }
});

async function main() {
  const requests = await prisma.customShopRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log('Total custom shop requests:', requests.length);
  console.log(JSON.stringify(requests, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
