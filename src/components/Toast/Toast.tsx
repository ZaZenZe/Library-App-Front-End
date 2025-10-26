// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Toast.scss'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

export const Toast = ({ id, message, type, duration = 4000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  return (
    <motion.div
      className={`toast toast--${type}`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      layout
    >
      <div className="toast__icon">{icons[type]}</div>
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </motion.div>
  )
}

export const ToastContainer = ({ 
  toasts, 
  onClose 
}: { 
  toasts: ToastProps[]
  onClose: (id: string) => void 
}) => {
  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}
