import { achievementRepository } from '@/repositories/achievement.repository'
import { userRepository } from '@/repositories/user.repository'

const ACHIEVEMENT_CHECKS = [
  {
    codigo: 'primera_sesion',
    check: ({ totalSessions }) => totalSessions >= 1,
  },
  {
    codigo: 'perfecto',
    check: ({ aciertos, total }) => total > 0 && aciertos === total,
  },
  {
    codigo: 'racha_5',
    check: ({ mejorRacha }) => mejorRacha >= 5,
  },
  {
    codigo: 'racha_10',
    check: ({ mejorRacha }) => mejorRacha >= 10,
  },
  {
    codigo: 'sesiones_10',
    check: ({ totalSessions }) => totalSessions >= 10,
  },
  {
    codigo: 'sesiones_50',
    check: ({ totalSessions }) => totalSessions >= 50,
  },
  {
    codigo: 'nivel_5',
    check: ({ xpTotal }) => Math.floor(xpTotal / 200) + 1 >= 5,
  },
  {
    codigo: 'nivel_10',
    check: ({ xpTotal }) => Math.floor(xpTotal / 200) + 1 >= 10,
  },
  {
    codigo: 'maestro_dificil',
    check: ({ dificultad, aciertos, total }) => dificultad === 'DIFICIL' && total > 0 && aciertos / total >= 0.8,
  },
  {
    codigo: 'tres_estrellas',
    check: ({ estrellas }) => estrellas === 3,
  },
]

export const achievementService = {
  /**
   * Verifica y otorga logros según el resultado de la sesión.
   * @param {string} userId
   * @param {{ aciertos: number, total: number, estrellas: number, mejorRacha: number, xpTotal: number, totalSessions: number, dificultad: string }} stats
   * @returns {Promise<Array>} Logros obtenidos en esta sesión
   */
  async checkAndGrant(userId, stats) {
    const allAchievements = await achievementRepository.findAll()
    const userAchievements = await achievementRepository.findUserAchievements(userId)
    const obtainedCodigos = new Set(userAchievements.map((ua) => ua.achievement.codigo))

    const newlyGranted = []

    for (const check of ACHIEVEMENT_CHECKS) {
      if (obtainedCodigos.has(check.codigo)) continue

      const achievement = allAchievements.find((a) => a.codigo === check.codigo)
      if (!achievement) continue

      if (check.check(stats)) {
        await achievementRepository.grantAchievement(userId, achievement.id)
        // Otorgar XP del logro
        await userRepository.update(userId, { xp: { increment: achievement.xpRecompensa } })
        newlyGranted.push({ codigo: check.codigo, nombre: achievement.nombre, xpRecompensa: achievement.xpRecompensa })
      }
    }

    return newlyGranted
  },
}
