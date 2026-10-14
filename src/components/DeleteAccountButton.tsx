import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Modal } from './ui'
import { DELETE_CONFIRM_WORD as CONFIRM_WORD } from './deleteAccount'
import '../pages/menus.css'

interface DeleteAccountButtonProps {
  /** Dev gallery: start with the dialog open */
  initialOpen?: boolean
  /** Dev gallery: replace the real `delete_own_account` call */
  onDelete?: () => Promise<void>
}

/**
 * "Delete account" (spec §E.22): outline button with danger text in Profile → Danger zone,
 * opening a confirm dialog (type DELETE). Calls the `delete_own_account` RPC via useAuth().
 */
export function DeleteAccountButton({ initialOpen = false, onDelete }: DeleteAccountButtonProps = {}) {
  const { t } = useTranslation()
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(initialOpen)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const matched = typed.trim().toUpperCase() === CONFIRM_WORD

  const close = () => {
    if (busy) return
    setOpen(false)
    setTyped('')
    setError('')
  }

  const confirm = async () => {
    if (!matched) return
    setBusy(true)
    setError('')
    try {
      await (onDelete ?? deleteAccount)()
      setOpen(false)
      navigate('/', { replace: true })
    } catch {
      setError(t('profile.delete.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="outline" className="btn--danger-text" icon={<Trash2 size={20} aria-hidden="true" />} onClick={() => setOpen(true)}>
        {t('profile.delete.button')}
      </Button>

      <Modal
        open={open}
        onClose={close}
        title={t('profile.delete.title')}
        className="delete-modal"
        actions={<>
          <Button variant="danger" loading={busy} disabled={!matched} onClick={confirm}>
            {busy ? t('profile.delete.deleting') : t('profile.delete.confirm')}
          </Button>
          <Button variant="outline" onClick={close} disabled={busy}>{t('common.cancel')}</Button>
        </>}
      >
        <div className="delete-modal__body">
          <p>{t('profile.delete.intro')}</p>
          <ul>
            <li>{t('profile.delete.item1')}</li>
            <li>{t('profile.delete.item2')}</li>
            <li>{t('profile.delete.item3')}</li>
          </ul>
          <p className="delete-modal__warn">{t('profile.delete.permanent')}</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); void confirm() }}>
          <Input
            label={t('profile.delete.typeLabel', { word: CONFIRM_WORD })}
            value={typed}
            onChange={e => setTyped(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            error={error || undefined}
          />
        </form>
      </Modal>
    </>
  )
}
