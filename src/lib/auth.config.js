/**
 * Configuración de NextAuth sin dependencias de Node.js (compatible con Edge Runtime).
 * Usada en middleware.js para validar sesiones sin acceder a la BD.
 */
export const authConfig = {
  providers: [],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.avatarId = user.avatarId
        token.avatarEmoji = user.avatarEmoji
        token.xp = user.xp
        token.nivel = user.nivel
        token.racha = user.racha
      }
      return token
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
        session.user.avatarId = token.avatarId
        session.user.avatarEmoji = token.avatarEmoji
        session.user.xp = token.xp
        session.user.nivel = token.nivel
        session.user.racha = token.racha
      }
      return session
    },
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  pages: { signIn: '/', error: '/' },
}
