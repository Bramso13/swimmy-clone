const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const groups = await prisma.reservation.groupBy({
    by: ['poolId'],
    where: { status: 'paid' },
    _sum: { amount: true }
  });
  console.log(groups);
  await prisma.();
})();
