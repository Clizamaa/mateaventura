'use client'
import { create } from 'zustand'

const AVATARS = [
  { id: 'owl', emoji: '🦉', name: 'Búho', color: '#8B5CF6' },
  { id: 'fox', emoji: '🦊', name: 'Zorro', color: '#F97316' },
  { id: 'panda', emoji: '🐼', name: 'Panda', color: '#64748b' },
  { id: 'lion', emoji: '🦁', name: 'León', color: '#FBBF24' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicornio', color: '#EC4899' },
  { id: 'dragon', emoji: '🐲', name: 'Dragón', color: '#10B981' },
  { id: 'rocket', emoji: '🚀', name: 'Cohete', color: '#3B82F6' },
  { id: 'star', emoji: '⭐', name: 'Estrella', color: '#FBBF24' },
]

const MOTIVATIONAL_TIPS = [
  '¡Cada ejercicio que haces te hace más inteligente!',
  '¡Los errores son parte de aprender, no te rindas!',
  '¡Eres un campeón de las matemáticas!',
  '¡Sigue así, vas muy bien!',
  '¡La práctica hace al maestro!',
  '¡Tú puedes, ánimo!',
  '¡Las matemáticas son como superpoderes!',
  '¡Cada punto cuenta en tu aventura!',
]

const initialState = {
  sessionId: null,
  exercises: [],
  currentIndex: 0,
  score: 0,
  lives: 3,
  streak: 0,
  maxStreak: 0,
  hintsUsed: 0,
  mode: 'LIBRE',
  gameModeConfig: null,
  startTime: null,
  isFinished: false,
  results: null,
}

const useGameStore = create((set) => ({
  ...initialState,

  startSession: ({ sessionId, exercises, gameModeConfig, mode }) => set({
    sessionId,
    exercises,
    currentIndex: 0,
    score: 0,
    lives: gameModeConfig?.vidas ?? 3,
    streak: 0,
    maxStreak: 0,
    hintsUsed: 0,
    mode,
    gameModeConfig,
    startTime: Date.now(),
    isFinished: false,
    results: null,
  }),

  recordAnswer: ({ puntajeObtenido, correcta, usoPista }) => set((state) => {
    const newStreak = correcta ? state.streak + 1 : 0
    const newLives = correcta ? state.lives : state.lives - 1
    const isOutOfLives = state.gameModeConfig?.vidas != null && newLives <= 0
    return {
      score: state.score + puntajeObtenido,
      lives: newLives,
      streak: newStreak,
      maxStreak: Math.max(state.maxStreak, newStreak),
      hintsUsed: usoPista ? state.hintsUsed + 1 : state.hintsUsed,
      isFinished: isOutOfLives,
    }
  }),

  advanceExercise: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),

  setResults: (results) => set({ results }),

  resetSession: () => set(initialState),

  getRandomTip: () => MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)],
}))

export { AVATARS, MOTIVATIONAL_TIPS }
export default useGameStore
