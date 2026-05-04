'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Lightbulb } from 'lucide-react'
import MascotOwl from '@/components/mascot/MascotOwl'
import ConfettiEffect from '@/components/shared/ConfettiEffect'
import useGameStore from '@/store/gameStore'
import { api } from '@/lib/api'

const MODE_LABELS = {
  LIBRE: 'Práctica Libre',
  CONTRARRELOJ: 'Contrarreloj',
  SUPERVIVENCIA: 'Supervivencia',
  MARATON: 'Maratón',
}

export default function ExercisePage() {
  const router = useRouter()
  const {
    sessionId,
    exercises,
    currentIndex,
    score,
    lives,
    streak,
    mode,
    gameModeConfig,
    isFinished,
    startTime,
    recordAnswer,
    advanceExercise,
    setResults,
    resetSession,
  } = useGameStore()

  const [selected, setSelected] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [serverCorrectAnswer, setServerCorrectAnswer] = useState(null)
  const [serverExplanation, setServerExplanation] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mascotMood, setMascotMood] = useState('happy')
  const [timerActive, setTimerActive] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const exerciseStartTime = useRef(null)
  const currentExercise = exercises[currentIndex]
  const total = exercises.length
  const maxLives = gameModeConfig?.vidas ?? 3

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) router.push('/practice')
  }, [sessionId, router])

  // Track exercise start time
  useEffect(() => {
    if (currentExercise && !showFeedback) {
      exerciseStartTime.current = Date.now()
    }
  }, [currentIndex, currentExercise, showFeedback])

  // Timer para modo contrarreloj
  useEffect(() => {
    if (mode !== 'CONTRARRELOJ' || !currentExercise || showFeedback) return
    setTimeLeft(60)
    setTimerActive(true)
  }, [currentIndex, mode, currentExercise, showFeedback])

  useEffect(() => {
    if (!timerActive || mode !== 'CONTRARRELOJ') return
    if (timeLeft <= 0) {
      handleAnswer(null)
      return
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerActive, mode])

  const handleAnswer = useCallback(async (answer) => {
    if (showFeedback || !currentExercise || isAnswering) return
    setTimerActive(false)
    setSelected(answer)
    setIsAnswering(true)

    const tiempoRespuesta = exerciseStartTime.current
      ? Math.round((Date.now() - exerciseStartTime.current) / 1000)
      : 0

    try {
      const result = await api.post(`/api/sessions/${sessionId}/answer`, {
        sessionExerciseId: currentExercise.sessionExerciseId,
        respuesta: answer ?? '',
        tiempoRespuestaSegundos: tiempoRespuesta,
        usoPista: showHint,
      })

      recordAnswer({
        puntajeObtenido: result.puntajeObtenido,
        correcta: result.correcta,
        usoPista: showHint,
      })

      setIsCorrect(result.correcta)
      setServerCorrectAnswer(result.respuestaCorrecta)
      setServerExplanation(result.explicacion)
      setShowFeedback(true)

      if (result.correcta) {
        setMascotMood('celebrating')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        setMascotMood('sad')
      }
      setTimeout(() => setShowExplanation(true), 500)
    } catch {
      // If API fails, still allow user to continue
      setShowFeedback(true)
      setIsCorrect(false)
      setMascotMood('sad')
      setTimeout(() => setShowExplanation(true), 500)
    } finally {
      setIsAnswering(false)
    }
  }, [showFeedback, currentExercise, isAnswering, sessionId, showHint, recordAnswer])

  const handleNext = async () => {
    const isLast = currentIndex + 1 >= total
    const isDone = isLast || isFinished

    if (isDone) {
      setIsFinishing(true)
      try {
        const tiempoTotal = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
        const data = await api.post(`/api/sessions/${sessionId}/finish`, { tiempoTotal })
        setResults(data)
        router.push('/results')
      } catch {
        router.push('/dashboard')
      }
      return
    }

    advanceExercise()
    setSelected(null)
    setIsCorrect(null)
    setServerCorrectAnswer(null)
    setServerExplanation(null)
    setShowFeedback(false)
    setShowHint(false)
    setShowExplanation(false)
    setMascotMood('happy')
    setTimerActive(false)
  }

  const handleHint = () => {
    if (showHint) return
    setShowHint(true)
  }

  if (!sessionId || !currentExercise) {
    if (isFinishing) return null
    return null
  }

  const progressPct = (currentIndex / total) * 100
  const timerPct = (timeLeft / 60) * 100
  const timerColor = timeLeft > 20 ? '#10B981' : timeLeft > 10 ? '#FBBF24' : '#F87171'
  const isLastExercise = currentIndex + 1 >= total

  return (
    <div className="min-h-screen pattern-bg flex flex-col">
      <ConfettiEffect active={showConfetti} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {/* Progreso */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">
                {currentIndex + 1} / {total}
              </span>
              <span className="text-xs text-gray-400">{MODE_LABELS[mode]}</span>
            </div>

            {/* Vidas (supervivencia) */}
            {mode === 'SUPERVIVENCIA' && (
              <div className="flex gap-1">
                {Array.from({ length: maxLives }, (_, i) => (
                  <Heart
                    key={i}
                    size={22}
                    fill={i < lives ? '#F87171' : 'none'}
                    className={i < lives ? 'text-red-400' : 'text-gray-200'}
                  />
                ))}
              </div>
            )}

            {/* Timer */}
            {mode === 'CONTRARRELOJ' && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-colors"
                    style={{ width: `${timerPct}%`, background: timerColor }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
              </div>
            )}

            {/* Puntaje */}
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-xl">
              <span className="text-yellow-500 text-sm">⭐</span>
              <span className="font-bold text-yellow-700 text-sm">{score}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Racha */}
        {streak >= 3 && !showFeedback && (
          <motion.div
            className="text-center mb-3 text-orange-500 font-bold text-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🔥 ¡Racha de {streak}! ¡Imparable!
          </motion.div>
        )}

        {/* Ejercicio */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="card-soft p-6 mb-4"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-100 text-purple-600">
                {currentExercise.unit?.titulo ?? currentExercise.unit}
              </span>
              {!showFeedback && (
                <button
                  onClick={handleHint}
                  disabled={showHint}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-colors ml-auto ${
                    showHint ? 'bg-gray-100 text-gray-400' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                  }`}
                >
                  <Lightbulb size={14} />
                  {showHint ? 'Pista usada' : 'Pista'}
                </button>
              )}
            </div>

            <h2 className="font-heading text-2xl font-bold text-gray-800 leading-snug mb-2">
              {currentExercise.enunciado}
            </h2>

            <AnimatePresence>
              {showHint && currentExercise.pista && (
                <motion.div
                  className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm text-yellow-800 font-semibold"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  💡 {currentExercise.pista}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Opciones */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(currentExercise.opciones ?? []).map((option, i) => {
            let buttonStyle = 'bg-white border-2 border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50'
            if (showFeedback) {
              const correctAns = serverCorrectAnswer
              if (isCorrect && option === selected) buttonStyle = 'bg-green-500 border-green-500 text-white shadow-lg'
              else if (!isCorrect && correctAns && option === correctAns) buttonStyle = 'bg-green-500 border-green-500 text-white shadow-lg'
              else if (option === selected && !isCorrect) buttonStyle = 'bg-red-400 border-red-400 text-white'
              else buttonStyle = 'bg-gray-100 border-gray-200 text-gray-400'
            } else if (selected === option) {
              buttonStyle = 'bg-blue-500 border-blue-500 text-white'
            }

            return (
              <motion.button
                key={option}
                onClick={() => !showFeedback && !isAnswering && handleAnswer(option)}
                disabled={showFeedback || isAnswering}
                className={`p-4 rounded-2xl font-heading text-xl font-bold transition-all min-h-[64px] ${buttonStyle}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, type: 'spring' }}
                whileHover={!showFeedback && !isAnswering ? { scale: 1.03 } : {}}
                whileTap={!showFeedback && !isAnswering ? { scale: 0.97 } : {}}
              >
                {option}
              </motion.button>
            )
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className={`p-5 rounded-3xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-start gap-4">
                <MascotOwl mood={isCorrect ? 'celebrating' : 'sad'} size={80} animate />
                <div className="flex-1">
                  <p className={`font-heading text-xl font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                    {isCorrect
                      ? ['¡Correcto! 🎉', '¡Genial! ⭐', '¡Súper! 🚀', '¡Excelente! 🏆'][Math.floor(Math.random() * 4)]
                      : ['Casi... 🤔', '¡Inténtalo!', '¡No te rindas! 💪', 'Sigue aprendiendo'][Math.floor(Math.random() * 4)]}
                  </p>
                  {showExplanation && serverExplanation && (
                    <motion.p
                      className={`text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {serverExplanation}
                    </motion.p>
                  )}
                  {isCorrect && (
                    <p className="text-green-600 text-sm mt-1 font-bold">
                      +pts {streak >= 2 && `🔥 ×${Math.min(streak, 3)}`}
                    </p>
                  )}
                  {!isCorrect && serverCorrectAnswer && showExplanation && (
                    <p className="text-sm font-bold text-gray-600 mt-1">
                      Respuesta correcta: <span className="text-green-600">{serverCorrectAnswer}</span>
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                onClick={handleNext}
                disabled={isFinishing}
                className={`w-full mt-4 py-3.5 rounded-2xl font-heading text-lg font-bold text-white btn-bounce disabled:opacity-70 ${isCorrect ? 'bg-gradient-green' : 'bg-gradient-brand'}`}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {isFinishing ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⭐</motion.span>
                    Calculando resultados...
                  </span>
                ) : (isLastExercise || isFinished) ? '¡Ver Resultados! 🏆' : 'Siguiente →'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
