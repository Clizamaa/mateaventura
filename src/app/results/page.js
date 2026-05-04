'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, RotateCcw, Settings2, Timer, CheckCircle, XCircle, Flame, Lightbulb } from 'lucide-react'
import MascotOwl from '@/components/mascot/MascotOwl'
import StarRating from '@/components/shared/StarRating'
import ConfettiEffect from '@/components/shared/ConfettiEffect'
import useGameStore from '@/store/gameStore'

const formatTime = (secs) => {
  if (!secs) return '0s'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function ResultsPage() {
  const router = useRouter()
  const { results, hintsUsed, resetSession } = useGameStore()
  const [showConfetti, setShowConfetti] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (!results) { router.push('/dashboard'); return }

    setShowConfetti((results.estrellas ?? 0) >= 2)
    let current = 0
    const target = results.puntajeFinal ?? 0
    const step = Math.max(1, Math.floor(target / 30))
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setAnimatedScore(current)
      if (current >= target) clearInterval(timer)
    }, 50)
    return () => clearInterval(timer)
  }, [results, router])

  if (!results) return null

  const {
    puntajeFinal,
    aciertos,
    errores,
    total,
    precision,
    estrellas,
    xpGanada,
    tiempoTotal,
    mejorRacha,
  } = results

  const mascotMood = estrellas === 3 ? 'celebrating' : estrellas === 2 ? 'happy' : 'thinking'

  const messages = {
    3: ['¡Increíble! ¡Eres un genio!', '¡Perfecto! ¡Imparable!', '¡Wow! ¡Sin fallos!'],
    2: ['¡Muy bien! ¡Sigue así!', '¡Genial! Casi perfecto', '¡Buen trabajo!'],
    1: ['¡Sigue practicando!', '¡Casi! La próxima lo logras', '¡El esfuerzo cuenta!'],
  }
  const message = (messages[estrellas] ?? messages[1])[Math.floor(Math.random() * 3)]

  const stats = [
    { label: 'Correctas', value: aciertos, icon: <CheckCircle size={20} className="text-green-500" />, color: '#10B981', bg: '#F0FDF4' },
    { label: 'Incorrectas', value: errores, icon: <XCircle size={20} className="text-red-400" />, color: '#F87171', bg: '#FEF2F2' },
    { label: 'Tiempo', value: formatTime(tiempoTotal), icon: <Timer size={20} className="text-blue-500" />, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Mejor racha', value: `${mejorRacha ?? 0}🔥`, icon: <Flame size={20} className="text-orange-400" />, color: '#F97316', bg: '#FFF7ED' },
    { label: 'Precisión', value: `${precision ?? 0}%`, icon: <CheckCircle size={20} className="text-purple-500" />, color: '#8B5CF6', bg: '#F3E8FF' },
    { label: 'Pistas usadas', value: hintsUsed, icon: <Lightbulb size={20} className="text-yellow-500" />, color: '#FBBF24', bg: '#FFFBEB' },
  ]

  return (
    <div className="min-h-screen pattern-bg flex flex-col pb-8">
      <ConfettiEffect active={showConfetti} count={60} />

      {/* Header celebratorio */}
      <div className="bg-gradient-brand text-white px-4 py-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-6xl flex items-center justify-center gap-4">
          {'🎉🌟🎉🌟🎉'.split('').map((s, i) => <span key={i}>{s}</span>)}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <MascotOwl mood={mascotMood} size={150} animate />
        </motion.div>
        <motion.h1
          className="font-heading text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.h1>
        <motion.p
          className="text-blue-100 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ¡Terminaste {total} ejercicios!
        </motion.p>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 -mt-4">
        {/* Estrellas */}
        <motion.div
          className="card-soft p-6 text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StarRating stars={estrellas ?? 1} maxStars={3} size={56} animated />
          <p className="text-gray-500 text-sm mt-2 font-semibold">
            {estrellas === 3 ? '¡Rendimiento perfecto!' : estrellas === 2 ? '¡Buen rendimiento!' : '¡Sigue practicando!'}
          </p>
        </motion.div>

        {/* Puntaje principal */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            className="card-soft p-5 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            <p className="text-gray-500 text-sm font-semibold mb-1">Puntaje Total</p>
            <motion.p
              className="font-heading text-5xl font-bold text-gradient-blue"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {animatedScore}
            </motion.p>
            <p className="text-gray-400 text-sm">puntos</p>
          </motion.div>

          <motion.div
            className="card-soft p-5 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
          >
            <p className="text-gray-500 text-sm font-semibold mb-1">XP Ganada</p>
            <p className="font-heading text-5xl font-bold text-gradient-warm">+{xpGanada ?? 0}</p>
            <p className="text-gray-400 text-sm">experiencia</p>
          </motion.div>
        </div>

        {/* Estadísticas detalladas */}
        <motion.div
          className="card-soft p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-4">Estadísticas</h3>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-3 rounded-2xl"
                style={{ background: stat.bg }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.05, type: 'spring' }}
              >
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="font-heading text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Barra de accuracy */}
        <motion.div
          className="card-soft p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-700">Precisión general</span>
            <span className="font-heading text-2xl font-bold text-gradient-blue">{precision ?? 0}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: (precision ?? 0) >= 80 ? '#10B981' : (precision ?? 0) >= 60 ? '#FBBF24' : '#F87171' }}
              initial={{ width: 0 }}
              animate={{ width: `${precision ?? 0}%` }}
              transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span className={(precision ?? 0) >= 60 ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>
              {(precision ?? 0) >= 80 ? '¡Excelente!' : (precision ?? 0) >= 60 ? '¡Bien!' : '¡Sigue practicando!'}
            </span>
            <span>100%</span>
          </div>
        </motion.div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <motion.button
            onClick={() => { resetSession(); router.push('/practice') }}
            className="w-full py-4 rounded-2xl font-heading text-xl font-bold text-white bg-gradient-brand shadow-lg btn-bounce"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            ¡Jugar de nuevo! 🚀
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => { resetSession(); router.push('/practice') }}
              className="py-3.5 rounded-2xl font-heading text-lg font-bold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 transition-colors btn-bounce flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Settings2 size={18} /> Cambiar
            </motion.button>

            <motion.button
              onClick={() => { resetSession(); router.push('/dashboard') }}
              className="py-3.5 rounded-2xl font-heading text-lg font-bold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-colors btn-bounce flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <Home size={18} /> Inicio
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
