import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Gullu } from '../mascot/Gullu'
import { Button } from '../ui'

interface MentorDialogProps {
  message: string
  onNext?: () => void
  position?: 'top' | 'bottom' | 'center' | 'bottom-right'
}

/** Gullu's tip bubble (paper scope, coach-mark layer). */
export function MentorDialog({ message, onNext, position = 'bottom' }: MentorDialogProps) {
  const { t } = useTranslation()
  return (
    <motion.div
      className={`mentor paper mentor--${position}`}
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Gullu mood="think" size={48} />
      <div className="mentor__body">
        <p className="mentor__text">{message}</p>
        {onNext && <Button variant="primary" size="s" onClick={onNext}>{t('common.gotIt')}</Button>}
      </div>
    </motion.div>
  )
}
