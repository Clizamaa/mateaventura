'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Check, ChevronRight, Timer, Heart, Zap, Dumbbell } from 'lucide-react'
import MascotOwl from '@/components/mascot/MascotOwl'
import useGameStore from '@/store/gameStore'
import { api } from '@/lib/api'

const DIFFICULTIES = [
  { id: 'FACIL', label: 'Fácil', sublabel: 'Brote', emoji: '🌱', color: '#10B981', bg: '#F0FDF4', border: '#86EFAC', desc: 'Perfecta para empezar' },
  { id: 'MEDIO', label: 'Medio', sublabel: 'Árbol', emoji: '🌳', color: '#FBBF24', bg: '#FFFBEB', border: '#FDE68A', desc: 'Un reto interesante' },
  { id: 'DIFICIL', label: 'Difícil', sublabel: 'Fuego', emoji: '🔥', color: '#F87171', bg: '#FEF2F2', border: '#FECACA', desc: '¡Para valientes!' },
]

const MODES = [
  { id: 'LIBRE', label: 'Práctica Libre', emoji: '📚', icon: <Zap size={24} />, desc: 'Sin tiempo, a tu ritmo', color: '#3B82F6', bg: 'from-blue-500 to-blue-600' },
  { id: 'CONTRARRELOJ', label: 'Contrarreloj', emoji: '⏱️', icon: <Timer size={24} />, desc: '60 segundos por pregunta', color: '#8B5CF6', bg: 'from-purple-500 to-purple-600' },
  { id: 'SUPERVIVENCIA', label: 'Supervivencia', emoji: '❤️', icon: <Heart size={24} />, desc: '3 vidas. ¡No las pierdas!', color: '#F87171', bg: 'from-red-400 to-red-500' },
  { id: 'MARATON', label: 'Maratón', emoji: '🏃', icon: <Dumbbell size={24} />, desc: '20 ejercicios seguidos', color: '#10B981', bg: 'from-emerald-500 to-emerald-600' },
]

const UNIT_EMOJIS = {
  'Sumas y Restas': '➕',
  'Multiplicación': '✖️',
  'División': '➗',
  'Fracciones': '🍕',
  'Geometría': '📐',
}

export default function PracticePage() {
  const router = useRouter()
  const { status } = useSession()
  const startSession = useGameStore(s => s.startSession)

  const [step, setStep] = useState(1)
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedUnits, setSelectedUnits] = useState([])
  const [difficulty, setDifficulty] = useState('MEDIO')
  const [mode, setMode] = useState('LIBRE')

  const [books, setBooks] = useState([])
  const [units, setUnits] = useState([])
  const [gameModes, setGameModes] = useState([])
  const [loading, setLoading] = useState(false)
  const [startError, setStartError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  // Fetch books and game modes on mount
  useEffect(() => {
    api.get('/api/books').then(d => setBooks(d.data ?? [])).catch(console.error)
    api.get('/api/game-modes').then(setGameModes).catch(console.error)
  }, [])

  // Fetch units when book is selected
  useEffect(() => {
    if (!selectedBook) { setUnits([]); return }
    api.get(`/api/units?bookId=${selectedBook}`).then(setUnits).catch(console.error)
  }, [selectedBook])

  const currentBook = books.find(b => b.id === selectedBook)

  const toggleUnit = (unitId) => {
    setSelectedUnits(prev =>
      prev.includes(unitId) ? prev.filter(u => u !== unitId) : [...prev, unitId]
    )
  }

  const handleStart = async () => {
    setStartError('')
    setLoading(true)
    try {
      const gameMode = gameModes.find(m => m.nombre === mode)
      if (!gameMode) throw new Error('Modo de juego no encontrado')

      const result = await api.post('/api/sessions/start', {
        bookId: selectedBook,
        unitIds: selectedUnits,
        dificultad: difficulty,
        gameModeId: gameMode.id,
      })

      startSession({
        sessionId: result.sessionId,
        exercises: result.exercises,
        gameModeConfig: result.gameModeConfig,
        mode,
      })

      router.push('/exercise')
    } catch (err) {
      setStartError(err.message)
      setLoading(false)
    }
  }

  const canProceed = { 1: !!selectedBook, 2: true, 3: true, 4: true }
  const steps = ['Libro', 'Unidades', 'Dificultad', 'Modo']

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 } }),
  }

  return (
    <div className="min-h-screen pattern-bg pb-8">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/dashboard')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-xl font-bold text-gray-800">Configurar Práctica</h1>
            <div className="flex gap-1 mt-1">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${i + 1 <= step ? 'bg-gradient-brand' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
          <div className="text-sm font-bold text-purple-600">{step}/{steps.length}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Paso 1: Selección de libro */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-3 mb-6">
                <MascotOwl mood="thinking" size={70} animate />
                <div>
                  <h2 className="font-heading text-2xl font-bold text-gray-800">¿Qué quieres practicar?</h2>
                  <p className="text-gray-500">Elige tu libro de matemáticas</p>
                </div>
              </div>

              {books.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-4xl mb-2">📚</p>
                  <p className="font-semibold">Cargando libros...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {books.map((book, i) => {
                    const color = book.subject?.color ?? '#3B82F6'
                    const emoji = book.subject?.icono ?? '📘'
                    return (
                      <motion.button
                        key={book.id}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => { setSelectedBook(book.id); setSelectedUnits([]) }}
                        className={`relative text-left p-5 rounded-3xl border-2 transition-all ${
                          selectedBook === book.id
                            ? 'border-purple-400 shadow-lg scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-purple-200'
                        }`}
                        style={selectedBook === book.id ? { background: `${color}10`, borderColor: color } : { background: 'white' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-md" style={{ background: `${color}20` }}>
                            {emoji}
                          </div>
                          <div>
                            <h3 className="font-heading text-xl font-bold text-gray-800">{book.titulo}</h3>
                            <p className="text-gray-500">{book.grade?.nombre} • {book._count?.units ?? 0} unidades</p>
                          </div>
                        </div>
                        {selectedBook === book.id && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: color }}>
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Paso 2: Unidades */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-heading text-2xl font-bold text-gray-800 mb-1">¿Qué unidades?</h2>
              <p className="text-gray-500 mb-6">Puedes elegir varias. Si no eliges ninguna, ¡practicamos todo!</p>

              <div className="grid grid-cols-1 gap-3">
                {units.map((unit, i) => {
                  const isSelected = selectedUnits.includes(unit.id)
                  const emoji = UNIT_EMOJIS[unit.titulo] ?? '📚'
                  return (
                    <motion.button
                      key={unit.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => toggleUnit(unit.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                      }`}>
                        {isSelected ? <Check size={18} className="text-white" /> : <span className="text-xl">{emoji}</span>}
                      </div>
                      <span className="font-semibold text-gray-800 text-lg">{unit.titulo}</span>
                    </motion.button>
                  )
                })}
              </div>

              {selectedUnits.length > 0 && (
                <motion.div
                  className="mt-4 p-3 bg-blue-50 rounded-2xl text-blue-700 text-sm font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✅ Seleccionaste {selectedUnits.length} unidad(es)
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Paso 3: Dificultad */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-heading text-2xl font-bold text-gray-800 mb-1">¿Qué tan difícil?</h2>
              <p className="text-gray-500 mb-6">Elige el nivel que más te guste</p>

              <div className="flex flex-col gap-4">
                {DIFFICULTIES.map((d, i) => (
                  <motion.button
                    key={d.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setDifficulty(d.id)}
                    className={`p-5 rounded-3xl border-2 text-left transition-all ${
                      difficulty === d.id ? 'shadow-lg scale-[1.02]' : 'bg-white'
                    }`}
                    style={{
                      borderColor: difficulty === d.id ? d.color : '#E5E7EB',
                      background: difficulty === d.id ? d.bg : 'white',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{d.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-2xl font-bold" style={{ color: d.color }}>{d.label}</h3>
                          <span className="text-sm font-semibold text-gray-500">"{d.sublabel}"</span>
                        </div>
                        <p className="text-gray-600">{d.desc}</p>
                      </div>
                      {difficulty === d.id && (
                        <div className="ml-auto w-8 h-8 rounded-full flex items-center justify-center" style={{ background: d.color }}>
                          <Check size={18} className="text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Paso 4: Modo de juego */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-heading text-2xl font-bold text-gray-800 mb-1">¿Cómo quieres jugar?</h2>
              <p className="text-gray-500 mb-6">Elige tu modo de desafío</p>

              <div className="grid grid-cols-2 gap-3">
                {MODES.map((m, i) => (
                  <motion.button
                    key={m.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setMode(m.id)}
                    className={`p-4 rounded-3xl text-left transition-all relative overflow-hidden ${
                      mode === m.id ? 'ring-4 ring-white shadow-xl scale-[1.03]' : 'opacity-80 hover:opacity-100'
                    } bg-gradient-to-br ${m.bg} text-white`}
                  >
                    <span className="text-3xl block mb-2">{m.emoji}</span>
                    <p className="font-heading text-lg font-bold">{m.label}</p>
                    <p className="text-white/80 text-xs mt-1">{m.desc}</p>
                    {mode === m.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Check size={14} style={{ color: m.color }} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Resumen */}
              <motion.div
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-purple-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">Resumen de tu sesión</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Libro:</span> <strong>{currentBook?.titulo}</strong></div>
                  <div><span className="text-gray-500">Unidades:</span> <strong>{selectedUnits.length || 'Todas'}</strong></div>
                  <div><span className="text-gray-500">Dificultad:</span> <strong>{DIFFICULTIES.find(d => d.id === difficulty)?.label}</strong></div>
                  <div><span className="text-gray-500">Modo:</span> <strong>{MODES.find(m => m.id === mode)?.label}</strong></div>
                </div>
              </motion.div>

              {startError && (
                <motion.div
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {startError}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de navegación */}
        <div className="mt-6">
          {step < 4 ? (
            <motion.button
              onClick={() => canProceed[step] && setStep(s => s + 1)}
              disabled={!canProceed[step]}
              className="w-full py-4 rounded-2xl font-heading text-xl font-bold text-white bg-gradient-brand shadow-lg btn-bounce disabled:opacity-40"
              whileTap={{ scale: 0.97 }}
            >
              <span className="flex items-center justify-center gap-2">
                Siguiente <ChevronRight size={22} />
              </span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-5 rounded-3xl font-heading text-2xl font-bold text-white bg-gradient-brand shadow-xl btn-bounce card-glow-blue disabled:opacity-70"
              whileTap={{ scale: 0.97 }}
              animate={loading ? {} : { scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⭐</motion.span>
                  Preparando...
                </span>
              ) : '¡Empezar Aventura! 🚀'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
