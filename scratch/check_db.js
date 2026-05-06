import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const usersCount = await prisma.user.count()
    console.log('Connection successful!')
    console.log(`Users count: ${usersCount}`)
    
    // Check tables
    const tables = await prisma.$queryRaw`SHOW TABLES`
    console.log('Tables in database:', tables)
  } catch (error) {
    console.error('Error connecting to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
