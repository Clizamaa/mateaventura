import { prisma } from '@/lib/prisma'

export const sessionRepository = {
  async findById(id) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        gameMode: true,
        sessionExercises: {
          orderBy: { orden: 'asc' },
          include: { exercise: { select: { id: true, enunciado: true, tipo: true, opciones: true, pista: true, puntajeBase: true, dificultad: true, unit: { select: { titulo: true } } } } },
        },
      },
    })
  },

  async findByIdWithExerciseAnswers(id) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        sessionExercises: {
          include: { exercise: true },
          orderBy: { orden: 'asc' },
        },
      },
    })
  },

  async create({ userId, gameModeId, unitsSeleccionadas, dificultadSeleccionada }) {
    return prisma.session.create({
      data: { userId, gameModeId, unitsSeleccionadas, dificultadSeleccionada },
    })
  },

  async createSessionExercises(sessionId, exercises) {
    const data = exercises.map((ex, i) => ({
      sessionId,
      exerciseId: ex.id,
      orden: i + 1,
    }))
    return prisma.sessionExercise.createMany({ data })
  },

  async findSessionExercise(sessionId, sessionExerciseId) {
    return prisma.sessionExercise.findFirst({
      where: { id: sessionExerciseId, sessionId },
      include: { exercise: true },
    })
  },

  async answerSessionExercise(id, { respuestaUsuario, correcta, tiempoRespuestaSegundos, usoPista, puntajeObtenido }) {
    return prisma.sessionExercise.update({
      where: { id },
      data: { respuestaUsuario, correcta, tiempoRespuestaSegundos, usoPista, puntajeObtenido, respondidoEn: new Date() },
    })
  },

  async updateStats(id, data) {
    return prisma.session.update({ where: { id }, data })
  },

  async finish(id, { puntajeFinal, aciertos, errores, tiempoTotal, mejorRacha, pistasUsadas, estrellas, ejerciciosTotales }) {
    return prisma.session.update({
      where: { id },
      data: { puntajeFinal, aciertos, errores, tiempoTotal, mejorRacha, pistasUsadas, estrellas, ejerciciosTotales, estado: 'COMPLETADA', finalizadaEn: new Date() },
    })
  },

  async abandon(id) {
    return prisma.session.update({ where: { id }, data: { estado: 'ABANDONADA', finalizadaEn: new Date() } })
  },

  async getUserHistory(userId, { page = 1, limit = 20 } = {}) {
    const [data, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId, estado: 'COMPLETADA' },
        orderBy: { iniciadaEn: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { gameMode: { select: { nombre: true } }, score: { select: { puntaje: true } } },
      }),
      prisma.session.count({ where: { userId, estado: 'COMPLETADA' } }),
    ])
    return { data, total }
  },
}
