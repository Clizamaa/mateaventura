'use client'
import { motion } from 'framer-motion'

export default function StarRating({ stars = 0, maxStars = 3, size = 48, animated = true }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: maxStars }, (_, i) => (
        <motion.div
          key={i}
          initial={animated ? { scale: 0, rotate: -180 } : { scale: 1 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.2, type: 'spring', stiffness: 300, damping: 15 }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            {i < stars ? (
              <>
                <polygon
                  points="24,4 29,18 44,18 32,27 37,42 24,33 11,42 16,27 4,18 19,18"
                  fill="#FBBF24"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                <polygon
                  points="24,8 28,19 38,19 30,25 33,36 24,30 15,36 18,25 10,19 20,19"
                  fill="#FDE68A"
                  opacity="0.6"
                />
              </>
            ) : (
              <polygon
                points="24,4 29,18 44,18 32,27 37,42 24,33 11,42 16,27 4,18 19,18"
                fill="#E5E7EB"
                stroke="#D1D5DB"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
