'use client'
import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, color = '#3B82F6', label, showPercent = false, size = 'md' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const heights = { sm: 'h-2', md: 'h-4', lg: 'h-6' }

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-semibold text-gray-600">{label}</span>}
          {showPercent && <span className="text-sm font-bold" style={{ color }}>{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
