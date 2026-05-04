import { prisma } from '@/lib/prisma'

export const achievementRepository = {
  async findAll() {
    return prisma.achievement.findMany({ where: { activo: true }, orderBy: { raridad: 'asc' } })
  },

  async findUserAchievements(userId) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { obtenidoEn: 'desc' },
    })
  },

  async hasAchievement(userId, codigo) {
    const ach = await prisma.achievement.findUnique({ where: { codigo } })
    if (!ach) return false
    const ua = await prisma.userAchievement.findUnique({ where: { userId_achievementId: { userId, achievementId: ach.id } } })
    return !!ua
  },

  async grantAchievement(userId, achievementId) {
    return prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      create: { userId, achievementId },
      update: {},
    })
  },

  async findByCodigo(codigo) {
    return prisma.achievement.findUnique({ where: { codigo } })
  },
}
