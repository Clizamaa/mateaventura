'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { ArrowLeft, Edit3, Check, LogOut, Trophy, Zap } from 'lucide-react'
import ProgressBar from '@/components/shared/ProgressBar'
import { AVATARS } from '@/store/gameStore'
import { api } from '@/lib/api'

const XP_PER_LEVEL = 200
const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
const formatTime = (secs) => {
  if (!secs) return '0s'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)

  const user = session?.user

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (!user?.id) return
    setNewName(user.name || '')
    api.get(`/api/users/${user.id}/stats`).then(setStats).catch(console.error)
    api.get('/api/sessions/history?limit=20').then(d => setHistory(d.data ?? [])).catch(console.error)
  }, [user?.id])

  if (status === 'loading' || !user) return null

  const xpInLevel = (user.xp || 0) % XP_PER_LEVEL

  const totalCorrect = history.reduce((acc, s) => acc + (s.aciertos || 0), 0)
  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((acc, s) => {
        const p = s.ejerciciosTotales > 0 ? Math.round((s.aciertos / s.ejerciciosTotales) * 100) : 0
        return acc + p
      }, 0) / history.length)
    : 0
  const bestScore = history.length > 0 ? Math.max(...history.map(s => s.puntajeFinal || 0)) : 0

  const handleSaveName = async () => {
    if (newName.trim().length < 2) return
    setSaving(true)
    try {
      await api.put(`/api/users/${user.id}`, { nombre: newName.trim() })
      await update({ name: newName.trim() })
      setEditingName(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChangeAvatar = async (avatarId, avatarEmoji) => {
    setSaving(true)
    try {
      await api.put(`/api/users/${user.id}/avatar`, { avatarId })
      await update({ ...session.user, avatarId, avatarEmoji })
      setShowAvatarPicker(false)
    } catch (err) {
      console.error('Error updating avatar:', err)
    } finally {
      setSaving(false)
    }
  }

  const statCards = [
    { label: 'Nivel', value: user.nivel || 1, icon: '⭐', color: '#FBBF24', bg: '#FFFBEB' },
    { label: 'XP Total', value: user.xp || 0, icon: '⚡', color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Racha', value: `${user.racha || 0}🔥`, icon: '🔥', color: '#F87171', bg: '#FEF2F2' },
    { label: 'Sesiones', value: stats?.totalSessions ?? '—', icon: '🎮', color: '#10B981', bg: '#F0FDF4' },
    { label: 'Precisión', value: `${avgAccuracy}%`, icon: '🎯', color: '#8B5CF6', bg: '#F3E8FF' },
    { label: 'Mejor Score', value: stats?.bestScore ?? bestScore, icon: '🏆', color: '#F97316', bg: '#FFF7ED' },
  ]

  return (
    <div className="min-h-screen pattern-bg pb-8">
      {/* Header */}
      <div className="bg-gradient-brand text-white px-4 pt-6 pb-20 relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-heading text-2xl font-bold">Mi Perfil</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30"
            aria-label="Cerrar sesión"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-14 space-y-4">
        {/* Card perfil */}
        <motion.div
          className="card-soft p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-5">
            {/* Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-20 h-20 rounded-2xl text-4xl flex items-center justify-center shadow-md bg-gradient-to-br from-blue-100 to-purple-100 hover:shadow-lg transition-all"
              >
                {user.avatarEmoji || '🦉'}
              </button>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-brand rounded-full flex items-center justify-center shadow-md">
                <Edit3 size={14} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-purple-300 focus:outline-none font-bold text-lg"
                    maxLength={20}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="p-2 rounded-xl bg-green-500 text-white disabled:opacity-70"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-2xl font-bold text-gray-800">{user.name}</h2>
                  <button onClick={() => setEditingName(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <Edit3 size={16} />
                  </button>
                </div>
              )}
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Avatar picker */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div
                className="p-3 bg-purple-50 rounded-2xl mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm font-bold text-purple-700 mb-2">Elige tu nuevo avatar:</p>
                <div className="grid grid-cols-8 gap-2">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => handleChangeAvatar(avatar.id, avatar.emoji)}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${user.avatarEmoji === avatar.emoji ? 'bg-purple-200 scale-110' : 'hover:bg-purple-100'}`}
                      title={avatar.name}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-2 text-gray-700">
              <span>Nivel {user.nivel || 1} ⭐</span>
              <span>{xpInLevel} / {XP_PER_LEVEL} XP para subir de nivel</span>
            </div>
            <ProgressBar value={xpInLevel} max={XP_PER_LEVEL} color="#8B5CF6" size="lg" />
          </div>
        </motion.div>

        {/* Stats generales */}
        <motion.div
          className="card-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-4">Mis Estadísticas</h3>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center p-3 rounded-2xl"
                style={{ background: s.bg }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05, type: 'spring' }}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="font-heading text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Historial de sesiones */}
        <motion.div
          className="card-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-4">
            Historial de Sesiones
            <span className="ml-2 text-sm font-semibold text-gray-400">({history.length})</span>
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📚</p>
              <p className="font-semibold">¡Aún no has jugado!</p>
              <p className="text-sm">Completa tu primera sesión para ver tu historial</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {history.map(s => {
                const precision = s.ejerciciosTotales > 0 ? Math.round((s.aciertos / s.ejerciciosTotales) * 100) : 0
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className="text-2xl flex-shrink-0">
                      {s.estrellas === 3 ? '🌟' : s.estrellas === 2 ? '⭐' : '🔸'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-800">{s.aciertos}/{s.ejerciciosTotales} correctas</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-semibold">{s.dificultadSeleccionada}</span>
                        {s.gameMode?.nombre && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold">{s.gameMode.nombre}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{precision}% precisión • {formatTime(s.tiempoTotal)} • {formatDate(s.iniciadaEn)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-green-600">{s.puntajeFinal} pts</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => router.push('/achievements')}
            className="py-4 rounded-2xl font-heading text-lg font-bold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 transition-colors btn-bounce flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Trophy size={20} /> Logros
          </motion.button>
          <motion.button
            onClick={() => router.push('/practice')}
            className="py-4 rounded-2xl font-heading text-lg font-bold text-white bg-gradient-brand shadow-md btn-bounce flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Zap size={20} /> Practicar
          </motion.button>
        </div>
      </div>
    </div>
  )
}
