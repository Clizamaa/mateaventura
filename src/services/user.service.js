import { userRepository } from '@/repositories/user.repository'
import { createError } from '@/lib/api-handler'

export const userService = {
  async findById(id) {
    const user = await userRepository.findById(id)
    if (!user) throw createError('Usuario no encontrado', 404, 'NOT_FOUND')
    return user
  },

  async update(id, data) {
    await this.findById(id)
    return userRepository.update(id, data)
  },

  async updateAvatar(id, avatarId) {
    await this.findById(id)
    return userRepository.update(id, { avatarId })
  },

  async getStats(id) {
    await this.findById(id)
    return userRepository.getStats(id)
  },
}
