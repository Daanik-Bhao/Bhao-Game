import { motion, AnimatePresence } from 'framer-motion'

interface MentorDialogProps {
  message: string
  onNext?: () => void
  position?: 'top' | 'bottom' | 'center' | 'bottom-right'
}

export function MentorDialog({ message, onNext, position = 'bottom' }: MentorDialogProps) {
  const alignStyle = 
    position === 'top' ? { top: 80, left: '50%', transform: 'translateX(-50%)' } :
    position === 'bottom-right' ? { bottom: 40, right: 40, transform: 'none' } :
    position === 'bottom' ? { bottom: 120, left: '50%', transform: 'translateX(-50%)' } :
    { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
          position: 'fixed',
          zIndex: 1000,
          ...alignStyle,
          width: '90%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '2px solid var(--gold)',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 4px rgba(255, 208, 80, 0.1)',
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start'
        }}>
          {/* Mentor Avatar */}
          <div style={{
            fontSize: 48,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: '50%',
            padding: 8,
            border: '2px solid #334155',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}>
            👨‍💼
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 14, color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The Mentor
            </h3>
            <p style={{ margin: 0, fontSize: 16, color: '#f8fafc', lineHeight: 1.5 }}>
              {message}
            </p>
            {onNext && (
              <button
                onClick={onNext}
                style={{
                  marginTop: 16,
                  background: 'var(--gold)',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
