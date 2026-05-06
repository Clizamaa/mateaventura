'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowLeft, RefreshCcw, CheckCircle, XCircle } from 'lucide-react'
import MascotOwl from '@/components/mascot/MascotOwl'
import { api } from '@/lib/api'

const DIFFICULTIES = [
  { id: 'FACIL', label: 'Fácil', emoji: '🌱', color: '#10B981', bg: '#F0FDF4' },
  { id: 'MEDIO', label: 'Medio', emoji: '🌳', color: '#FBBF24', bg: '#FFFBEB' },
  { id: 'DIFICIL', label: 'Difícil', emoji: '🔥', color: '#F87171', bg: '#FEF2F2' },
]

const MODES = [
  { id: 'LIBRE', label: 'Libre', emoji: '📚' },
  { id: 'CONTRARRELOJ', label: 'Contrarreloj', emoji: '⏱️' },
  { id: 'SUPERVIVENCIA', label: 'Supervivencia', emoji: '❤️' },
]

export default function GeneratorPage() {
  const router = useRouter()
  const [books, setBooks] = useState([])
  const [units, setUnits] = useState([])
  const [selectedBook, setSelectedBook] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIO')
  const [mode, setMode] = useState('LIBRE')
  
  const [loading, setLoading] = useState(false)
  const [exercise, setExercise] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/books').then(d => setBooks(d.data ?? [])).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedBook) { setUnits([]); return }
    api.get(`/api/units?bookId=${selectedBook}`).then(setUnits).catch(console.error)
  }, [selectedBook])

  const handleGenerate = async () => {
    if (!selectedUnit) {
      setError('Por favor selecciona una unidad primero')
      return
    }
    
    setError('')
    setLoading(true)
    setExercise(null)
    setSelectedOption(null)
    setIsCorrect(null)

    try {
      const unitData = units.find(u => u.id === selectedUnit)
      const payload = {
        unit: {
          nombre: unitData.titulo,
          keywords: unitData.descripcion || unitData.titulo
        },
        dificultad: difficulty.toLowerCase(),
        modo: mode.toLowerCase()
      }

      const response = await fetch('/api/ejercicios/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al generar')
      
      setExercise(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (opcion) => {
    if (selectedOption !== null) return // Ya respondió
    setSelectedOption(opcion)
    setIsCorrect(opcion === exercise.correcta)
  }

  return (
    <div className="min-h-screen pattern-bg pb-8">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 flex items-center gap-2">
              <Sparkles size={24} className="text-pink-500" />
              Generador Mágico con IA
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {/* Panel de Configuración */}
        <div className="space-y-6">
          <div className="card-soft p-5">
            <h2 className="font-heading text-lg font-bold text-gray-800 mb-4">1. Elige el tema</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Libro</label>
                <select 
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-0 transition-colors"
                  value={selectedBook}
                  onChange={(e) => { setSelectedBook(e.target.value); setSelectedUnit('') }}
                >
                  <option value="">Selecciona un libro...</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.titulo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Unidad</label>
                <select 
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-0 transition-colors"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  disabled={!selectedBook}
                >
                  <option value="">Selecciona una unidad...</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.titulo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card-soft p-5">
            <h2 className="font-heading text-lg font-bold text-gray-800 mb-4">2. Configura el desafío</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Dificultad</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`p-2 rounded-xl border-2 text-sm font-bold transition-all ${difficulty === d.id ? 'shadow-md scale-105' : 'bg-white opacity-70'}`}
                      style={{ borderColor: difficulty === d.id ? d.color : '#E5E7EB', background: difficulty === d.id ? d.bg : 'white', color: d.color }}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Modo</label>
                <div className="grid grid-cols-3 gap-2">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`p-2 rounded-xl border-2 text-sm font-bold transition-all ${mode === m.id ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md scale-105' : 'border-gray-200 bg-white text-gray-500 opacity-70'}`}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200">{error}</div>}

          <motion.button
            onClick={handleGenerate}
            disabled={loading || !selectedUnit}
            className="w-full py-4 rounded-2xl font-heading text-xl font-bold text-white bg-gradient-brand shadow-lg btn-bounce flex items-center justify-center gap-2 disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
            animate={loading ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {loading ? (
              <><RefreshCcw className="animate-spin" /> Pensando...</>
            ) : (
              <><Sparkles /> ¡Crear Ejercicio Mágico!</>
            )}
          </motion.button>
        </div>

        {/* Panel de Ejercicio */}
        <div className="flex flex-col h-full">
          <AnimatePresence mode="wait">
            {!exercise && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400"
              >
                <MascotOwl mood="happy" size={120} animate />
                <h3 className="font-heading text-xl font-bold text-gray-600 mt-4">¡Luma está lista!</h3>
                <p className="mt-2">Configura las opciones y presiona crear para que Luma invente un ejercicio nuevo solo para ti con el poder de Claude.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-2 bg-gradient-brand rounded-full flex items-center justify-center text-4xl shadow-xl animate-pulse">✨</div>
                </div>
                <h3 className="font-heading text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Claude está pensando...</h3>
                <p className="text-gray-500 mt-2 font-semibold">Generando matemáticas divertidas</p>
              </motion.div>
            )}

            {exercise && !loading && (
              <motion.div 
                key="exercise"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="card-soft p-6 flex-1 flex flex-col border-4 border-purple-100"
              >
                <div className="mb-6 flex gap-4">
                  <MascotOwl mood={isCorrect === null ? 'thinking' : isCorrect ? 'happy' : 'sad'} size={60} />
                  <div className="bg-purple-50 p-4 rounded-2xl rounded-tl-none border border-purple-100 flex-1 relative">
                    <p className="font-semibold text-gray-800 text-lg leading-relaxed">{exercise.enunciado}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 flex-1">
                  {exercise.opciones.map((opcion, i) => {
                    const isSelected = selectedOption === opcion
                    const isTheCorrectOne = opcion === exercise.correcta
                    const showSuccess = selectedOption !== null && isTheCorrectOne
                    const showError = isSelected && !isTheCorrectOne

                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleAnswer(opcion)}
                        disabled={selectedOption !== null}
                        whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                        whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                        className={`p-4 rounded-2xl border-2 text-left font-bold text-lg transition-all flex items-center justify-between ${
                          selectedOption === null ? 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700' :
                          showSuccess ? 'bg-green-100 border-green-500 text-green-800 shadow-md' :
                          showError ? 'bg-red-100 border-red-500 text-red-800' :
                          'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        {opcion}
                        {showSuccess && <CheckCircle className="text-green-600" />}
                        {showError && <XCircle className="text-red-600" />}
                      </motion.button>
                    )
                  })}
                </div>

                <AnimatePresence>
                  {selectedOption !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      className={`p-4 rounded-2xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <h4 className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? '¡Excelente!' : '¡Ups! Casi...'}
                      </h4>
                      <p className="text-gray-700 font-medium text-sm leading-relaxed">{exercise.explicacion}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
