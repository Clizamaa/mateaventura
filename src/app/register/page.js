'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Check } from 'lucide-react'
import { signIn } from 'next-auth/react'
import MascotOwl from '@/components/mascot/MascotOwl'
import { AVATARS } from '@/store/gameStore'
import { api } from '@/lib/api'

const schema = z.object({
  name: z.string().min(2, '¡Tu nombre debe tener al menos 2 letras!').max(20, '¡Nombre muy largo!'),
  username: z.string().min(3, '¡Mínimo 3 letras!').max(15, '¡Máximo 15 letras!').regex(/^[a-zA-Z0-9_]+$/, '¡Solo letras, números y _!'),
  password: z.string().min(4, '¡Mínimo 4 caracteres!'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: '¡Las contraseñas no coinciden!',
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState('owl')
  const [step, setStep] = useState(1)
  const [registerError, setRegisterError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm({
    resolver: zodResolver(schema),
  })

  const handleNextStep = async () => {
    const valid = await trigger(['name', 'username', 'password', 'confirmPassword'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data) => {
    if (step === 1) { handleNextStep(); return }

    setRegisterError('')
    try {
      const avatar = AVATARS.find(a => a.id === selectedAvatar)
      await api.post('/api/auth/register', {
        nombre: data.name,
        username: data.username.toLowerCase(),
        email: `${data.username.toLowerCase()}@mateaventura.cl`,
        password: data.password,
        avatarEmoji: avatar?.emoji ?? '🦉',
      })

      await signIn('credentials', {
        username: data.username.toLowerCase(),
        password: data.password,
        redirect: false,
      })

      setStep(3)
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err) {
      setRegisterError(err.message)
    }
  }

  const selectedAvatarData = AVATARS.find(a => a.id === selectedAvatar)

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg">
        <motion.div
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <MascotOwl mood="celebrating" size={200} animate />
          <h1 className="font-heading text-4xl font-bold text-gradient-blue mt-4">¡Bienvenido a la aventura!</h1>
          <p className="text-gray-500 text-lg mt-2">Preparando tu mundo matemático... 🚀</p>
          <motion.div className="mt-6 flex justify-center gap-2" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            {[0,1,2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-gradient-brand" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pattern-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="w-full max-w-lg mb-4 flex items-center gap-3">
          <motion.button
            onClick={() => step === 2 ? setStep(1) : router.push('/')}
            className="p-2 rounded-xl hover:bg-white/80 text-gray-600 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="flex-1">
            <div className="flex gap-2">
              {[1, 2].map(s => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-colors duration-300 ${s <= step ? 'bg-gradient-brand' : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Paso {step} de 2</p>
          </div>
        </div>

        <div className="card-soft p-8 w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-4 mb-6">
                  <MascotOwl mood="happy" size={80} animate />
                  <div>
                    <h1 className="font-heading text-3xl font-bold text-gray-800">¡Únete a la aventura!</h1>
                    <p className="text-gray-500">Crea tu cuenta de explorador matemático</p>
                  </div>
                </div>

                <form className="flex flex-col gap-4">
                  {[
                    { name: 'name', label: 'Tu nombre real', placeholder: 'Ej: Sofía, Mateo...', type: 'text' },
                    { name: 'username', label: 'Nombre de aventurero (para entrar)', placeholder: 'Ej: sofia123', type: 'text' },
                    { name: 'password', label: 'Contraseña secreta', placeholder: 'Mínimo 4 caracteres', type: 'password' },
                    { name: 'confirmPassword', label: 'Repite tu contraseña', placeholder: 'Misma contraseña', type: 'password' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{field.label}</label>
                      <input
                        {...register(field.name)}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none text-lg font-semibold bg-white transition-colors"
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-sm mt-1 font-semibold">🦉 {errors[field.name].message}</p>
                      )}
                    </div>
                  ))}

                  <motion.button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-4 rounded-2xl font-heading text-xl font-bold text-white bg-gradient-brand shadow-lg btn-bounce mt-2"
                    whileTap={{ scale: 0.97 }}
                  >
                    Siguiente: ¡Elegir avatar! 🦉
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-heading text-3xl font-bold text-gray-800 mb-2">¡Elige tu avatar!</h2>
                <p className="text-gray-500 mb-6">¿Quién serás en tu aventura matemática?</p>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {AVATARS.map(avatar => (
                    <motion.button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                        selectedAvatar === avatar.id
                          ? 'border-purple-400 bg-purple-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-purple-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-3xl">{avatar.emoji}</span>
                      <span className="text-xs font-bold text-gray-600">{avatar.name}</span>
                      {selectedAvatar === avatar.id && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: avatar.color }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Preview */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-md" style={{ background: `${selectedAvatarData?.color}20`, border: `2px solid ${selectedAvatarData?.color}40` }}>
                    {selectedAvatarData?.emoji}
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-gray-800">¡Perfecto!</p>
                    <p className="text-gray-600">Serás <strong>{selectedAvatarData?.name}</strong> en tu aventura</p>
                  </div>
                </div>

                <AnimatePresence>
                  {registerError && (
                    <motion.div
                      className="mb-4 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-semibold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {registerError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl font-heading text-xl font-bold text-white bg-gradient-brand shadow-lg btn-bounce disabled:opacity-70"
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? '¡Creando tu aventura... ⭐' : '¡Empezar Aventura! 🚀'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
