import bcrypt from 'bcryptjs'
import { userRepository } from '@/repositories/user.repository'
import { createError } from '@/lib/api-handler'
import { XP_POR_NIVEL } from '@/constants'
import { prisma } from '@/lib/prisma'

export const authService = {
  /**
   * Registra un nuevo alumno.
   * @param {import('@/schemas/auth.schema').registerSchema._type} data
   */
  async register(data) {
    const exists = await userRepository.existsUsernameOrEmail(data.username, data.email)
    if (exists) throw createError('El nombre de usuario o email ya está en uso', 409, 'CONFLICT')

    const passwordHash = await bcrypt.hash(data.password, 12)

    let avatarId
    if (data.avatarEmoji) {
      const avatar = await prisma.avatar.findFirst({ where: { emoji: data.avatarEmoji } })
      if (avatar) avatarId = avatar.id
    }

    const user = await userRepository.create({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash,
      nombre: data.nombre,
      apellido: data.apellido,
      gradoActual: data.gradoActual,
      ...(avatarId && { avatarId }),
    })

    return user
  },

  /**
   * Calcula el nivel a partir de XP.
   * @param {number} xp
   */
  calcLevel(xp) {
    return Math.floor(xp / XP_POR_NIVEL) + 1
  },

  /**
   * Verifica las credenciales de un usuario (usado internamente por NextAuth).
   */
  async verify(username, password) {
    const user = await userRepository.findByIdWithHash(username)
    if (!user || !user.activo) return null
    const valid = await bcrypt.compare(password, user.passwordHash)
    return valid ? user : null
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithHash(userId)
    if (!user) throw createError('Usuario no encontrado', 404, 'NOT_FOUND')
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw createError('Contraseña actual incorrecta', 400, 'INVALID_PASSWORD')
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await userRepository.update(userId, { passwordHash })
  },
}
