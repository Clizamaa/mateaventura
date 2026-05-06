const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const grades = await prisma.grade.findMany();
  console.log('Grades count:', grades.length);
  if (grades.length > 0) {
    console.log(grades[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
