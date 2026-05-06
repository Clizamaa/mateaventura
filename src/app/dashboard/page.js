'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { Zap, Trophy, Star, BarChart3, LogOut, Flame } from 'lucide-react'
import MascotOwl from '@/components/mascot/MascotOwl'
import ProgressBar from '@/components/shared/ProgressBar'
import { MOTIVATIONAL_TIPS } from '@/store/gameStore'
import { api } from '@/lib/api'

const XP_PER_LEVEL = 200

const UNIT_EMOJIS = {
  'Sumas y Restas': '➕',
  'Multiplicación': '✖️',
  'División': '➗',
  'Fracciones': '🍕',
  'Geometría': '📐',
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tip, setTip] = useState(MOTIVATIONAL_TIPS[0])
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [progress, setProgress] = useState([])

  const user = session?.user

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (!user?.id) return
    api.get(`/api/users/${user.id}/stats`).then(setStats).catch(console.error)
    api.get('/api/sessions/history?limit=3').then(d => setHistory(d.data ?? [])).catch(console.error)
    api.get(`/api/progress/user/${user.id}`).then(setProgress).catch(console.error)
  }, [user?.id])

  if (status === 'loading' || !user) return null

  const xpInLevel = (user.xp || 0) % XP_PER_LEVEL
  const avatarEmoji = user.avatarEmoji || '🦉'

  const quickActions = [
    { label: 'Practicar', emoji: '📚', desc: 'Ejercicios a tu ritmo', gradient: 'bg-gradient-brand', href: '/practice' },
    { label: 'Generador IA', emoji: '✨', desc: 'Crea con Claude', gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600', href: '/generator' },
    { label: 'Mis Logros', emoji: '🏆', desc: 'Medallas ganadas', gradient: 'bg-gradient-green', href: '/achievements' },
    { label: 'Ranking', emoji: '📊', desc: 'Top aventureros', gradient: 'bg-gradient-warm', href: '/achievements' },
  ]

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
  }

  return (
    <div className="min-h-screen pattern-bg pb-8">
      {/* Header */}
      <div className="bg-gradient-brand text-white px-4 pt-safe pb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['⭐', '✨', '🌟'].map((s, i) => (
            <span key={i} className="absolute text-4xl" style={{ left: `${20 + i * 30}%`, top: `${10 + i * 15}%` }}>{s}</span>
          ))}
        </div>
        <div className="max-w-4xl mx-auto relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                {avatarEmoji}
              </div>
              <div>
                <p className="text-blue-100 text-sm font-semibold">¡Hola de nuevo!</p>
                <h1 className="font-heading text-3xl font-bold">{user.name} 👋</h1>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* XP Bar */}
          <div className="mt-4 bg-white/20 rounded-2xl p-3">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span>Nivel {user.nivel || 1} ⭐</span>
              <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Racha', value: user.racha || 0, unit: 'días', icon: <Flame size={20} />, color: '#F87171', bg: '#FEF2F2' },
            { label: 'XP Total', value: user.xp || 0, unit: 'pts', icon: <Zap size={20} />, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Sesiones', value: stats?.totalSessions ?? '—', unit: 'jugadas', icon: <Trophy size={20} />, color: '#10B981', bg: '#F0FDF4' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-soft p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-xl" style={{ background: stat.bg, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <p className="font-heading text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500">{stat.unit}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mascota con tip */}
        <motion.div
          className="card-soft p-4 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MascotOwl mood="happy" size={80} animate />
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-1">Luma dice...</p>
            <p className="font-semibold text-gray-700 text-base">{tip}</p>
          </div>
          <button
            onClick={() => setTip(MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)])}
            className="p-2 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 transition-colors"
            aria-label="Otro consejo"
          >
            <Star size={18} />
          </button>
        </motion.div>

        {/* Acciones rápidas */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-3">¿Qué hacemos hoy?</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                custom={i + 3}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => router.push(action.href)}
                className={`${action.gradient} text-white p-5 rounded-3xl text-left shadow-lg btn-bounce`}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-3xl block mb-2">{action.emoji}</span>
                <p className="font-heading text-xl font-bold">{action.label}</p>
                <p className="text-white/80 text-sm">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Progreso por unidad */}
        <motion.div
          className="card-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-heading text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-500" />
            Tu progreso
          </h2>
          <div className="space-y-3">
            {progress.length > 0 ? progress.slice(0, 5).map(p => (
              <ProgressBar
                key={p.id}
                label={`${UNIT_EMOJIS[p.unit?.titulo] ?? '📚'} ${p.unit?.titulo ?? 'Unidad'}`}
                value={p.dominio}
                max={100}
                color="#3B82F6"
                showPercent
                size="md"
              />
            )) : (
              <p className="text-gray-400 text-sm font-semibold text-center py-4">
                ¡Completa ejercicios para ver tu progreso aquí!
              </p>
            )}
          </div>
        </motion.div>

        {/* Sesiones recientes */}
        {history.length > 0 && (
          <motion.div
            className="card-soft p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-4">Sesiones recientes</h2>
            <div className="space-y-3">
              {history.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="text-2xl">
                    {s.estrellas === 3 ? '🌟' : s.estrellas === 2 ? '⭐' : '🔸'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-800">{s.aciertos}/{s.ejerciciosTotales} correctas</p>
                    <p className="text-xs text-gray-500">
                      {s.ejerciciosTotales > 0 ? Math.round((s.aciertos / s.ejerciciosTotales) * 100) : 0}% precisión
                      {s.gameMode?.nombre ? ` • ${s.gameMode.nombre}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{s.puntajeFinal} pts</p>
                    <p className="text-xs text-gray-400">{new Date(s.iniciadaEn).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA principal */}
        <motion.button
          onClick={() => router.push('/practice')}
          className="w-full py-5 rounded-3xl font-heading text-2xl font-bold text-white bg-gradient-brand shadow-xl btn-bounce card-glow-blue"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          ¡A Practicar! 🚀
        </motion.button>
      </div>
    </div>
  )
}
