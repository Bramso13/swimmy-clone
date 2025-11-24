const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const ownerId = 'xqbe7tUs82qsrJLrTnwcndfgoBfQhill';
  const pools = await prisma.pool.findMany({
    where: { ownerId: ownerId },
    select: {
      id: true,
      title: true,
      reservations: {
        select: { amount: true, status: true }
      }
    }
  });
  const formatted = pools.map(p => ({
    id: p.id,
    title: p.title,
    revenue: p.reservations.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount || 0), 0)
  }));
  console.log(formatted);
  await prisma.();
})();
