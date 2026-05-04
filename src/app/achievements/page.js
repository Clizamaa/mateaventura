'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Lock, Star } from 'lucide-react'
import { api } from '@/lib/api'

const RANK_STYLES = [
  { bg: 'from-yellow-400 to-amber-500', medal: '🥇' },
  { bg: 'from-gray-300 to-gray-400', medal: '🥈' },
  { bg: 'from-orange-400 to-orange-500', medal: '🥉' },
]

export default function AchievementsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('achievements')
  const [allAchievements, setAllAchievements] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [ranking, setRanking] = useState([])
  const [loadingAch, setLoadingAch] = useState(true)
  const [loadingRanking, setLoadingRanking] = useState(true)

  const user = session?.user

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    api.get('/api/achievements').then(setAllAchievements).catch(console.error).finally(() => setLoadingAch(false))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    api.get(`/api/achievements/user/${user.id}`).then(setUserAchievements).catch(console.error)
  }, [user?.id])

  useEffect(() => {
    if (activeTab !== 'ranking') return
    api.get('/api/rankings').then(setRanking).catch(console.error).finally(() => setLoadingRanking(false))
  }, [activeTab])

  if (status === 'loading' || !user) return null

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, ease: 'easeOut' } }),
  }

  return (
    <div className="min-h-screen pattern-bg pb-8">
      {/* Header */}
      <div className="bg-gradient-brand text-white px-4 pt-6 pb-16 relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Logros & Ranking</h1>
            <p className="text-blue-100 text-sm">{unlockedIds.size}/{allAchievements.length} medallas desbloqueadas</p>
          </div>
          <div className="ml-auto text-4xl">🏆</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10">
        {/* Tabs */}
        <div className="card-soft p-1 flex mb-6">
          {[
            { id: 'achievements', label: '🏅 Logros' },
            { id: 'ranking', label: '📊 Ranking' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-xl font-heading text-lg font-bold transition-all ${
                activeTab === tab.id ? 'bg-gradient-brand text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Logros */}
        {activeTab === 'achievements' && (
          <div className="space-y-3">
            {loadingAch ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🏅</p>
                <p className="font-semibold">Cargando logros...</p>
              </div>
            ) : allAchievements.map((ach, i) => {
              const unlocked = unlockedIds.has(ach.id)
              return (
                <motion.div
                  key={ach.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className={`card-soft p-4 flex items-center gap-4 transition-all ${unlocked ? '' : 'opacity-60'}`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl relative flex-shrink-0 ${unlocked ? 'shadow-md' : 'grayscale'}`}
                    style={{ background: unlocked ? '#EFF6FF' : '#F3F4F6' }}
                  >
                    {ach.icono ?? '🏅'}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                        <Lock size={18} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-lg font-bold text-gray-800">{ach.titulo}</p>
                    <p className="text-sm text-gray-500">{ach.descripcion}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {unlocked ? (
                      <div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 mx-auto bg-blue-500">
                          <Star size={16} className="text-white" fill="white" />
                        </div>
                        <p className="text-xs font-bold text-green-600">+{ach.xpRecompensa} XP</p>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-gray-400">{ach.xpRecompensa} XP</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Ranking */}
        {activeTab === 'ranking' && (
          <div className="space-y-3">
            {loadingRanking ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p className="font-semibold">Cargando ranking...</p>
              </div>
            ) : ranking.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🏆</p>
                <p className="font-semibold">¡Sé el primero en aparecer aquí!</p>
                <p className="text-sm">Completa sesiones para ganar puntos</p>
              </div>
            ) : (
              <>
                {/* Top 3 */}
                {ranking.length >= 3 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[ranking[1], ranking[0], ranking[2]].filter(Boolean).map((entry, i) => {
                      const realIndex = i === 0 ? 1 : i === 1 ? 0 : 2
                      const style = RANK_STYLES[realIndex]
                      const isMe = entry.usuario?.id === user.id
                      return (
                        <motion.div
                          key={entry.usuario?.id ?? i}
                          className={`text-center p-3 rounded-2xl bg-gradient-to-b ${style.bg} text-white relative ${i === 1 ? '-mt-3 pt-6' : ''} ${isMe ? 'ring-4 ring-blue-400' : ''}`}
                          initial={{ opacity: 0, y: i === 1 ? -20 : 20 }}
                          animate={{ opacity: 1, y: i === 1 ? -12 : 0 }}
                          transition={{ delay: realIndex * 0.1, type: 'spring' }}
                        >
                          <div className="text-3xl mb-1">{style.medal}</div>
                          <div className="text-2xl">{entry.usuario?.avatar?.emoji ?? '🦉'}</div>
                          <p className="font-heading text-sm font-bold truncate">{entry.usuario?.nombre}</p>
                          <p className="text-xs opacity-80">{entry.puntajeTotal} pts</p>
                          {isMe && <div className="text-xs mt-1 bg-white/30 rounded-full px-2 py-0.5">¡Tú!</div>}
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* Lista completa */}
                {ranking.map((entry, i) => {
                  const isMe = entry.usuario?.id === user.id
                  return (
                    <motion.div
                      key={entry.usuario?.id ?? i}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        isMe ? 'border-blue-400 bg-blue-50 shadow-md' : 'card-soft'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 ${
                        i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="text-2xl">{entry.usuario?.avatar?.emoji ?? '🦉'}</div>
                      <div className="flex-1">
                        <p className={`font-bold ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                          {entry.usuario?.nombre} {isMe && <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full">¡Tú!</span>}
                        </p>
                        <p className="text-xs text-gray-500">Nivel {entry.usuario?.nivel ?? 1} • {entry.usuario?.racha ?? 0}🔥 racha</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-lg font-bold text-gray-800">{entry.puntajeTotal}</p>
                        <p className="text-xs text-gray-400">pts</p>
                      </div>
                    </motion.div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
