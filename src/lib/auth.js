import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { z } from 'zod'
import { authConfig } from './auth.config'

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { username, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { username: username.toLowerCase() },
          select: {
            id: true,
            email: true,
            username: true,
            nombre: true,
            apellido: true,
            role: true,
            passwordHash: true,
            avatarId: true,
            xp: true,
            nivel: true,
            racha: true,
            activo: true,
            avatar: { select: { emoji: true } },
          },
        })

        if (!user || !user.activo) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.nombre,
          apellido: user.apellido,
          role: user.role,
          avatarId: user.avatarId,
          avatarEmoji: user.avatar?.emoji ?? '🦉',
          xp: user.xp,
          nivel: user.nivel,
          racha: user.racha,
        }
      },
    }),
  ],
})
