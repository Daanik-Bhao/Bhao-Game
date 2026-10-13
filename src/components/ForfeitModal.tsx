import { useTranslation } from 'react-i18next'
import { Button, Modal } from './ui'

interface ForfeitModalProps {
  onCancel: () => void
  onConfirm: () => void
  /** Ranked / multiplayer: the quit counts as a loss */
  ranked?: boolean
  /** Defaults to true (callers usually mount it conditionally) */
  open?: boolean
}

/** Quit confirmation (spec §E.19): Gullu worried, Keep playing (primary) / Quit game (danger). */
export function ForfeitModal({ onCancel, onConfirm, ranked = false, open = true }: ForfeitModalProps) {
  const { t } = useTranslation()
  return (
    <Modal
      open={open}
      onClose={onCancel}
      gullu="worried"
      gulluSize={80}
      title={t('board.quit.title')}
      body={ranked ? t('board.quit.bodyRanked') : t('board.quit.body')}
      actions={(
        <>
          <Button variant="primary" size="l" block onClick={onCancel} data-autofocus>{t('board.quit.keep')}</Button>
          <Button variant="danger" size="l" block onClick={onConfirm}>{t('board.quit.confirm')}</Button>
        </>
      )}
    />
  )
}
