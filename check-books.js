const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({ include: { grade: true } });
  console.log('Books count:', books.length);
  if (books.length > 0) {
    console.log(books[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
