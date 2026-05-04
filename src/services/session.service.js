import { sessionRepository } from '@/repositories/session.repository'
import { exerciseService } from './exercise.service'
import { scoreService } from './score.service'
import { progressRepository } from '@/repositories/progress.repository'
import { userRepository } from '@/repositories/user.repository'
import { achievementService } from './achievement.service'
import { createError } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'
import { XP_POR_NIVEL, DEFAULT_CANTIDAD_EJERCICIOS } from '@/constants'

export const sessionService = {
  /**
   * Inicia una sesión de práctica: genera ejercicios y crea la sesión en BD.
   * @param {{ userId: string, gameModeId: string, unitIds: string[], bookId?: string, dificultad: string, cantidad?: number }} params
   */
  async start({ userId, gameModeId, unitIds, bookId, dificultad, cantidad }) {
    // Validar que el modo de juego exista
    const gameMode = await prisma.gameMode.findUnique({ where: { id: gameModeId } })
    if (!gameMode || !gameMode.activo) throw createError('Modo de juego no válido', 400)

    const cantidadFinal = cantidad ?? gameMode.configuracion?.cantidad ?? DEFAULT_CANTIDAD_EJERCICIOS

    // Generar ejercicios (sin respuesta correcta)
    const exercises = await exerciseService.generate({
      unitIds,
      bookId,
      dificultad,
      cantidad: cantidadFinal,
      userId,
    })

    // Crear sesión
    const session = await sessionRepository.create({
      userId,
      gameModeId,
      unitsSeleccionadas: unitIds,
      dificultadSeleccionada: dificultad,
    })

    // Guardar ejercicios de la sesión
    await sessionRepository.createSessionExercises(session.id, exercises)

    // Obtener IDs de SessionExercise creados para incluirlos en la respuesta
    const sessionExercises = await prisma.sessionExercise.findMany({
      where: { sessionId: session.id },
      orderBy: { orden: 'asc' },
      select: { id: true, exerciseId: true },
    })

    const exercisesWithSeId = exercises.map((ex, i) => ({
      ...ex,
      sessionExerciseId: sessionExercises[i]?.id,
    }))

    return {
      sessionId: session.id,
      gameModeConfig: gameMode.configuracion,
      exercises: exercisesWithSeId,
    }
  },

  async getState(sessionId, userId) {
    const session = await sessionRepository.findById(sessionId)
    if (!session) throw createError('Sesión no encontrada', 404, 'NOT_FOUND')
    if (session.userId !== userId) throw createError('Acceso denegado', 403, 'FORBIDDEN')

    // Ocultar respuestas correctas
    const exercises = session.sessionExercises.map(({ exercise, ...se }) => ({
      ...se,
      exercise: (({ respuestaCorrecta, ...rest }) => rest)(exercise),
    }))

    return { ...session, sessionExercises: exercises }
  },

  /**
   * Procesa la respuesta de un ejercicio dentro de la sesión.
   * @param {{ sessionId: string, userId: string, sessionExerciseId: string, respuesta: any, tiempoRespuestaSegundos: number, usoPista: boolean }} params
   */
  async answer({ sessionId, userId, sessionExerciseId, respuesta, tiempoRespuestaSegundos, usoPista }) {
    const session = await sessionRepository.findByIdWithExerciseAnswers(sessionId)
    if (!session) throw createError('Sesión no encontrada', 404, 'NOT_FOUND')
    if (session.userId !== userId) throw createError('Acceso denegado', 403, 'FORBIDDEN')
    if (session.estado !== 'EN_CURSO') throw createError('La sesión ya fue finalizada', 400)

    const se = session.sessionExercises.find((e) => e.id === sessionExerciseId)
    if (!se) throw createError('Ejercicio no pertenece a esta sesión', 400)
    if (se.correcta !== null) throw createError('Este ejercicio ya fue respondido', 400)

    const { exercise } = se
    const correcta = this._validateAnswer(exercise, respuesta)

    // Calcular racha actual
    const answered = session.sessionExercises.filter((e) => e.correcta !== null)
    const racha = answered.length > 0 && answered[answered.length - 1].correcta
      ? (answered.filter((e, i, arr) => { for (let j = arr.length - 1; j >= i; j--) { if (!arr[j].correcta) return i > j } return true }).length)
      : 0

    const puntajeObtenido = scoreService.calcExerciseScore({
      puntajeBase: exercise.puntajeBase,
      dificultad: exercise.dificultad,
      tiempoRespuestaSegundos,
      tiempoEstimadoSegundos: exercise.tiempoEstimadoSegundos,
      usoPista,
      correcta,
      racha,
    })

    await sessionRepository.answerSessionExercise(sessionExerciseId, {
      respuestaUsuario: respuesta,
      correcta,
      tiempoRespuestaSegundos,
      usoPista,
      puntajeObtenido,
    })

    // Actualizar stats acumuladas de la sesión
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        aciertos: { increment: correcta ? 1 : 0 },
        errores: { increment: correcta ? 0 : 1 },
        puntajeFinal: { increment: puntajeObtenido },
        pistasUsadas: { increment: usoPista ? 1 : 0 },
      },
    })

    return {
      correcta,
      respuestaCorrecta: correcta ? null : exercise.respuestaCorrecta,
      explicacion: correcta ? null : exercise.explicacion,
      puntajeObtenido,
    }
  },

  /**
   * Finaliza la sesión, calcula score total, XP y logros.
   * @param {{ sessionId: string, userId: string, tiempoTotal: number }} params
   */
  async finish({ sessionId, userId, tiempoTotal }) {
    const session = await sessionRepository.findByIdWithExerciseAnswers(sessionId)
    if (!session) throw createError('Sesión no encontrada', 404, 'NOT_FOUND')
    if (session.userId !== userId) throw createError('Acceso denegado', 403, 'FORBIDDEN')
    if (session.estado !== 'EN_CURSO') throw createError('La sesión ya fue finalizada', 400)

    const answered = session.sessionExercises.filter((e) => e.correcta !== null)
    const aciertos = answered.filter((e) => e.correcta).length
    const total = session.sessionExercises.length
    const puntajeFinal = answered.reduce((acc, e) => acc + e.puntajeObtenido, 0)
    const estrellas = scoreService.calcStars(aciertos, total, session.pistasUsadas)

    // Calcular mejor racha
    let racha = 0, mejorRacha = 0
    for (const e of session.sessionExercises) {
      if (e.correcta) { racha++; mejorRacha = Math.max(mejorRacha, racha) } else racha = 0

    }

    await sessionRepository.finish(sessionId, {
      puntajeFinal,
      aciertos,
      errores: total - aciertos,
      tiempoTotal,
      mejorRacha,
      pistasUsadas: session.pistasUsadas,
      estrellas,
      ejerciciosTotales: total,
    })

    // Crear Score para el ranking
    const units = Array.isArray(session.unitsSeleccionadas) ? session.unitsSeleccionadas : []
    await prisma.score.create({
      data: { userId, sessionId, puntaje: puntajeFinal, unitIds: units },
    })

    // Actualizar progreso por unidad
    const unitGroups = {}
    for (const se of answered) {
      const unitId = se.exercise.unitId
      if (!unitGroups[unitId]) unitGroups[unitId] = { aciertos: 0, total: 0 }
      unitGroups[unitId].total++
      if (se.correcta) unitGroups[unitId].aciertos++
    }
    await Promise.all(Object.entries(unitGroups).map(([unitId, stats]) =>
      progressRepository.upsertProgress(userId, unitId, stats)
    ))

    // Otorgar XP al usuario
    const xpGanada = scoreService.calcXP({ puntajeFinal, estrellas, dificultad: session.dificultadSeleccionada })
    const user = await userRepository.findById(userId)
    const newXp = (user?.xp ?? 0) + xpGanada
    const newNivel = Math.floor(newXp / XP_POR_NIVEL) + 1
    await userRepository.update(userId, { xp: newXp, nivel: newNivel, racha: (user?.racha ?? 0) + 1 })

    // Verificar logros
    const logrosObtenidos = await achievementService.checkAndGrant(userId, {
      aciertos, total, estrellas, mejorRacha, xpTotal: newXp,
      totalSessions: await prisma.session.count({ where: { userId, estado: 'COMPLETADA' } }),
      dificultad: session.dificultadSeleccionada,
    })

    return {
      sessionId,
      puntajeFinal,
      aciertos,
      errores: total - aciertos,
      total,
      precision: total > 0 ? Math.round((aciertos / total) * 100) : 0,
      tiempoTotal,
      mejorRacha,
      estrellas,
      xpGanada,
      logrosObtenidos,
    }
  },

  async abandon(sessionId, userId) {
    const session = await sessionRepository.findById(sessionId)
    if (!session) throw createError('Sesión no encontrada', 404, 'NOT_FOUND')
    if (session.userId !== userId) throw createError('Acceso denegado', 403, 'FORBIDDEN')
    if (session.estado !== 'EN_CURSO') throw createError('La sesión ya fue finalizada', 400)
    return sessionRepository.abandon(sessionId)
  },

  /** Valida la respuesta del usuario contra la respuesta correcta de la BD. */
  _validateAnswer(exercise, respuesta) {
    const correct = exercise.respuestaCorrecta
    if (exercise.tipo === 'OPCION_MULTIPLE' || exercise.tipo === 'VERDADERO_FALSO') {
      return String(respuesta).trim().toLowerCase() === String(correct).trim().toLowerCase()
    }
    if (exercise.tipo === 'RESPUESTA_NUMERICA') {
      return parseFloat(respuesta) === parseFloat(correct)
    }
    return String(respuesta).trim().toLowerCase() === String(correct).trim().toLowerCase()
  },
}
