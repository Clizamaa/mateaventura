'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#3B82F6', '#8B5CF6', '#FBBF24', '#10B981', '#F87171', '#06B6D4', '#EC4899']
const SHAPES = ['●', '★', '◆', '▲', '■']

function Particle({ x, delay, color, shape }) {

  return (
    <motion.div
      style={{ position: 'fixed', left: `${x}%`, top: '-20px', color, fontSize: Math.random() * 14 + 10, zIndex: 9999, pointerEvents: 'none' }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{ y: '110vh', rotate: Math.random() * 720 - 360, opacity: [1, 1, 0] }}
      transition={{ duration: Math.random() * 2 + 2, delay, ease: 'easeIn' }}
    >
      {shape}
    </motion.div>
  )
}

export default function ConfettiEffect({ active = false, count = 40 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (active) {
      const p = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      }))
      setParticles(p)
      const timer = setTimeout(() => setParticles([]), 4000)
      return () => clearTimeout(timer)
    }
  }, [active, count])

  return (
    <AnimatePresence>
      {particles.map(p => <Particle key={p.id} {...p} />)}
    </AnimatePresence>
  )
}
