import { MULTIPLICADOR_DIFICULTAD, PENALIZACION_PISTA } from '@/constants'

export const scoreService = {
  /**
   * Calcula el puntaje de un ejercicio respondido.
   * @param {{ puntajeBase: number, dificultad: string, tiempoRespuestaSegundos: number, tiempoEstimadoSegundos: number, usoPista: boolean, correcta: boolean, racha: number }} params
   */
  calcExerciseScore({ puntajeBase, dificultad, tiempoRespuestaSegundos, tiempoEstimadoSegundos, usoPista, correcta, racha }) {
    if (!correcta) return 0

    const multDificultad = MULTIPLICADOR_DIFICULTAD[dificultad] ?? 1.0
    const multPista = usoPista ? PENALIZACION_PISTA : 1.0

    // Bonus por velocidad: máx 1.5x si responde en < 30% del tiempo estimado
    let multTiempo = 1.0
    if (tiempoEstimadoSegundos > 0 && tiempoRespuestaSegundos > 0) {
      const ratio = tiempoRespuestaSegundos / tiempoEstimadoSegundos
      multTiempo = ratio <= 0.3 ? 1.5 : ratio <= 0.6 ? 1.2 : 1.0
    }

    // Bonus de racha: +2pts por cada respuesta consecutiva (máx +10)
    const bonusRacha = Math.min(racha * 2, 10)

    const base = Math.round(puntajeBase * multDificultad * multPista * multTiempo)
    return base + bonusRacha
  },

  /**
   * Calcula las estrellas obtenidas según el porcentaje de aciertos.
   * @param {number} aciertos
   * @param {number} total
   * @param {number} pistasUsadas
   */
  calcStars(aciertos, total, pistasUsadas) {
    if (total === 0) return 0
    const pct = (aciertos / total) * 100
    if (pct >= 90 && pistasUsadas === 0) return 3
    if (pct >= 60) return 2
    return 1
  },

  /**
   * Calcula XP otorgada al finalizar la sesión.
   * @param {{ puntajeFinal: number, estrellas: number, dificultad: string }} params
   */
  calcXP({ puntajeFinal, estrellas, dificultad }) {
    const base = Math.round(puntajeFinal * 0.1)
    const bonusEstrellas = estrellas * 20
    const bonusDificultad = dificultad === 'DIFICIL' ? 30 : dificultad === 'MEDIO' ? 15 : 0
    return base + bonusEstrellas + bonusDificultad
  },
}
