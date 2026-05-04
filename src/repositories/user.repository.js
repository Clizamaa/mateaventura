import { prisma } from '@/lib/prisma'

const USER_PUBLIC_SELECT = {
  id: true, email: true, username: true, nombre: true, apellido: true,
  role: true, xp: true, nivel: true, racha: true, activo: true,
  avatarId: true, gradoActual: true, createdAt: true,
  avatar: { select: { emoji: true, nombre: true } },
}

export const userRepository = {
  async findById(id) {
    return prisma.user.findUnique({ where: { id }, select: USER_PUBLIC_SELECT })
  },

  async findByIdWithHash(id) {
    return prisma.user.findUnique({ where: { id } })
  },

  async findByUsername(username) {
    return prisma.user.findUnique({ where: { username: username.toLowerCase() }, select: USER_PUBLIC_SELECT })
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  },

  async existsUsernameOrEmail(username, email) {
    const count = await prisma.user.count({
      where: { OR: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] },
    })
    return count > 0
  },

  async create(data) {
    return prisma.user.create({ data, select: USER_PUBLIC_SELECT })
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data, select: USER_PUBLIC_SELECT })
  },

  async updateXpAndLevel(id, xp, nivel) {
    return prisma.user.update({ where: { id }, data: { xp, nivel } })
  },

  async incrementRacha(id) {
    return prisma.user.update({ where: { id }, data: { racha: { increment: 1 } } })
  },

  async resetRacha(id) {
    return prisma.user.update({ where: { id }, data: { racha: 0 } })
  },

  async getStats(id) {
    const [totalSessions, totalScore, bestScore] = await Promise.all([
      prisma.session.count({ where: { userId: id, estado: 'COMPLETADA' } }),
      prisma.score.aggregate({ where: { userId: id }, _sum: { puntaje: true } }),
      prisma.score.findFirst({ where: { userId: id }, orderBy: { puntaje: 'desc' }, select: { puntaje: true } }),
    ])
    return {
      totalSessions,
      totalScore: totalScore._sum.puntaje ?? 0,
      bestScore: bestScore?.puntaje ?? 0,
    }
  },
}
