'use client'
import { motion } from 'framer-motion'

const expressions = {
  happy: { eyeY: 0, mouthPath: 'M 50 55 Q 55 60 60 55', browAngle: 0, eyeScale: 1 },
  thinking: { eyeY: -1, mouthPath: 'M 50 56 Q 55 56 60 56', browAngle: 5, eyeScale: 0.9 },
  celebrating: { eyeY: -2, mouthPath: 'M 48 54 Q 55 62 62 54', browAngle: -5, eyeScale: 1.1 },
  sad: { eyeY: 1, mouthPath: 'M 50 58 Q 55 53 60 58', browAngle: -8, eyeScale: 0.85 },
  excited: { eyeY: -2, mouthPath: 'M 47 53 Q 55 63 63 53', browAngle: -8, eyeScale: 1.2 },
}

export default function MascotOwl({ mood = 'happy', size = 140, animate = true }) {
  const expr = expressions[mood] || expressions.happy

  const floatAnimation = animate
    ? { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
    : {}

  const wingsAnimation = animate
    ? { rotate: mood === 'celebrating' ? [-5, 5, -5] : [0, 0, 0], transition: { duration: 0.5, repeat: mood === 'celebrating' ? Infinity : 0 } }
    : {}

  return (
    <motion.div animate={floatAnimation} style={{ display: 'inline-block' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Mascota Lechuza MateAventura"
      >
        {/* Sombra */}
        <ellipse cx="60" cy="126" rx="30" ry="6" fill="rgba(0,0,0,0.08)" />

        {/* Cuerpo */}
        <ellipse cx="60" cy="90" rx="32" ry="36" fill="#7C3AED" />
        <ellipse cx="60" cy="90" rx="20" ry="28" fill="#A78BFA" opacity="0.5" />

        {/* Panza */}
        <ellipse cx="60" cy="95" rx="15" ry="18" fill="#EDE9FE" />

        {/* Alas */}
        <motion.g animate={wingsAnimation}>
          <ellipse cx="28" cy="88" rx="13" ry="22" fill="#6D28D9" transform="rotate(-15 28 88)" />
          <ellipse cx="92" cy="88" rx="13" ry="22" fill="#6D28D9" transform="rotate(15 92 88)" />
        </motion.g>

        {/* Patas */}
        <rect x="46" y="120" width="8" height="8" rx="2" fill="#FBBF24" />
        <rect x="66" y="120" width="8" height="8" rx="2" fill="#FBBF24" />
        {/* Dedos */}
        <rect x="43" y="126" width="4" height="3" rx="1.5" fill="#F59E0B" />
        <rect x="48" y="127" width="4" height="3" rx="1.5" fill="#F59E0B" />
        <rect x="53" y="126" width="4" height="3" rx="1.5" fill="#F59E0B" />
        <rect x="63" y="126" width="4" height="3" rx="1.5" fill="#F59E0B" />
        <rect x="68" y="127" width="4" height="3" rx="1.5" fill="#F59E0B" />
        <rect x="73" y="126" width="4" height="3" rx="1.5" fill="#F59E0B" />

        {/* Cabeza */}
        <circle cx="60" cy="45" r="32" fill="#8B5CF6" />

        {/* Orejitas/Cuernos */}
        <polygon points="43,18 37,5 50,16" fill="#6D28D9" />
        <polygon points="77,18 83,5 70,16" fill="#6D28D9" />
        <polygon points="43,18 40,10 48,16" fill="#A78BFA" opacity="0.6" />
        <polygon points="77,18 80,10 72,16" fill="#A78BFA" opacity="0.6" />

        {/* Círculos de ojos (blancos grandes) */}
        <motion.g animate={animate ? { scaleY: [1, expr.eyeScale, 1], y: [0, expr.eyeY, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } } : {}}>
          <circle cx="47" cy="44" r="13" fill="white" />
          <circle cx="73" cy="44" r="13" fill="white" />

          {/* Iris */}
          <circle cx="47" cy="44" r="8" fill="#1e1b4b" />
          <circle cx="73" cy="44" r="8" fill="#1e1b4b" />

          {/* Pupila brillante */}
          <circle cx="50" cy="41" r="4" fill="#3B82F6" />
          <circle cx="76" cy="41" r="4" fill="#3B82F6" />

          {/* Brillo */}
          <circle cx="52" cy="39" r="2.5" fill="white" />
          <circle cx="78" cy="39" r="2.5" fill="white" />
          <circle cx="50" cy="44" r="1" fill="white" opacity="0.6" />
          <circle cx="76" cy="44" r="1" fill="white" opacity="0.6" />
        </motion.g>

        {/* Cejas */}
        <motion.g animate={animate ? { rotate: [0, expr.browAngle, 0], transition: { duration: 2, repeat: Infinity } } : {}}>
          <rect x="38" y="30" width="18" height="3" rx="1.5" fill="#5B21B6" transform={`rotate(${-expr.browAngle} 47 31.5)`} />
          <rect x="64" y="30" width="18" height="3" rx="1.5" fill="#5B21B6" transform={`rotate(${expr.browAngle} 73 31.5)`} />
        </motion.g>

        {/* Pico */}
        <polygon points="60,53 53,62 67,62" fill="#FBBF24" />
        <polygon points="60,54 54,61 66,61" fill="#F59E0B" opacity="0.5" />

        {/* Boca / expresión */}
        <motion.path
          d={expr.mouthPath}
          stroke="#5B21B6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={animate ? { d: [expr.mouthPath, expr.mouthPath] } : {}}
        />

        {/* Detalles decorativos - estrellitas en el cuerpo */}
        <circle cx="50" cy="85" r="2" fill="white" opacity="0.3" />
        <circle cx="70" cy="90" r="1.5" fill="white" opacity="0.3" />
        <circle cx="55" cy="100" r="1" fill="white" opacity="0.3" />

        {/* Gorrito de estudiante (si está celebrando) */}
        {mood === 'celebrating' && (
          <g>
            <rect x="35" y="15" width="50" height="6" rx="2" fill="#1e1b4b" />
            <rect x="53" y="8" width="14" height="8" rx="1" fill="#1e1b4b" />
            <line x1="80" y1="15" x2="85" y2="25" stroke="#FBBF24" strokeWidth="2" />
            <circle cx="85" cy="26" r="3" fill="#FBBF24" />
          </g>
        )}

        {/* Estrellas flotando si está celebrando */}
        {mood === 'celebrating' && (
          <>
            <motion.text x="95" y="30" fontSize="12" animate={{ y: [0, -10, 0], opacity: [1, 0.5, 1], transition: { duration: 1.5, repeat: Infinity } }}>⭐</motion.text>
            <motion.text x="10" y="35" fontSize="10" animate={{ y: [0, -8, 0], opacity: [1, 0.5, 1], transition: { duration: 1.2, repeat: Infinity, delay: 0.3 } }}>✨</motion.text>
          </>
        )}
      </svg>
    </motion.div>
  )
}
