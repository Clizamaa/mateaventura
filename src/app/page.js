'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Star, Zap, Trophy } from 'lucide-react'
import { signIn } from 'next-auth/react'
import MascotOwl from '@/components/mascot/MascotOwl'

const loginSchema = z.object({
  username: z.string().min(3, '¡Tu nombre debe tener al menos 3 letras!'),
  password: z.string().min(4, '¡Tu contraseña debe tener al menos 4 caracteres!'),
})

export default function LandingPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [mascotMood, setMascotMood] = useState('happy')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setError('')
    const result = await signIn('credentials', {
      username: data.username.toLowerCase(),
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError('¡Ups! Usuario o contraseña incorrectos. Intenta con "demo" y "1234"')
      setMascotMood('sad')
      setTimeout(() => setMascotMood('thinking'), 2000)
    } else {
      setMascotMood('celebrating')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 800)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pattern-bg">
      {/* Decoraciones de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {['⭐', '✨', '🌟', '💫', '⭐', '✨'].map((star, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            style={{ left: `${10 + i * 16}%`, top: `${5 + (i % 3) * 25}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 360], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            {star}
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 px-4 py-8 max-w-6xl mx-auto w-full">

        {/* Hero izquierdo */}
        <motion.div
          className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧮</span>
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-gradient-blue leading-none">MateAventura</h1>
              <p className="text-sm text-gray-500 font-semibold">¡Aprende Matemáticas con Magia!</p>
            </div>
          </div>

          {/* Mascota */}
          <div className="relative">
            <MascotOwl mood={mascotMood} size={200} animate />
            <motion.div
              className="absolute -top-4 -right-4 bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-lg border-2 border-purple-100 max-w-48"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <p className="text-sm font-bold text-purple-700">
                {mascotMood === 'sad'
                  ? '¡Casi! Inténtalo de nuevo 🤗'
                  : mascotMood === 'celebrating'
                  ? '¡Bienvenido de vuelta! 🎉'
                  : '¡Hola! Soy Luma, tu guía en la aventura matemática 🦉'}
              </p>
            </motion.div>
          </div>

          {/* Stats rápidos */}
          <div className="flex gap-4 mt-6">
            {[
              { icon: <Star size={20} className="text-yellow-500" />, text: '+500 ejercicios', bg: '#FEF3C7' },
              { icon: <Trophy size={20} className="text-purple-500" />, text: 'Logros & Ranking', bg: '#F3E8FF' },
              { icon: <Zap size={20} className="text-blue-500" />, text: '4 modos de juego', bg: '#EFF6FF' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700"
                style={{ background: item.bg }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {item.icon}
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Formulario de login */}
        <motion.div
          className="card-soft p-8 w-full max-w-md"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-heading text-3xl font-bold text-gray-800 mb-2">¡Bienvenido!</h2>
          <p className="text-gray-500 mb-6">Ingresa para continuar tu aventura</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tu nombre de aventurero</label>
              <input
                {...register('username')}
                type="text"
                placeholder="Ej: sofia, mateo, demo"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none text-lg font-semibold bg-white transition-colors"
                onFocus={() => setMascotMood('thinking')}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1 font-semibold">🦉 {errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña secreta</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none text-lg font-semibold bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 font-semibold">🦉 {errors.password.message}</p>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-heading text-xl font-bold text-white bg-gradient-brand shadow-lg btn-bounce disabled:opacity-70 mt-2"
              whileTap={{ scale: 0.97 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⭐</motion.span>
                  Entrando...
                </span>
              ) : '¡Comenzar Aventura! 🚀'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm font-semibold">¿Eres nuevo?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <motion.button
              onClick={() => router.push('/register')}
              className="w-full py-3.5 rounded-2xl font-heading text-lg font-bold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 transition-colors btn-bounce"
              whileTap={{ scale: 0.97 }}
            >
              ¡Soy Nuevo! ✨
            </motion.button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Prueba con usuario <strong>demo</strong> y contraseña <strong>1234</strong>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
