import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const CONFIRM_WORD = 'DELETE'

/** "Delete my account" link + confirmation dialog. Calls the `delete_own_account` RPC. */
export function DeleteAccountButton() {
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const close = () => {
    if (busy) return
    setOpen(false)
    setTyped('')
    setError('')
  }

  const confirm = async () => {
    setBusy(true)
    setError('')
    try {
      await deleteAccount()
      setOpen(false)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete your account. Please try again or email support@daanik.com.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', color: '#B91C1C', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 8 }}
      >
        Delete my account
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#111827' }}>
            <h2 id="delete-account-title" style={{ margin: '0 0 8px', fontSize: 20 }}>Delete your account?</h2>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4B5563', lineHeight: 1.5 }}>
              This permanently deletes your BHAO account, profile, coins, stats, leaderboard entry and contract progress.
              This cannot be undone.
            </p>
            <label htmlFor="delete-confirm" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Type <strong>{CONFIRM_WORD}</strong> to confirm
            </label>
            <input
              id="delete-confirm"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              autoComplete="off"
              style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {error && <p role="alert" style={{ color: '#B91C1C', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
              <button onClick={close} disabled={busy} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={busy || typed.trim().toUpperCase() !== CONFIRM_WORD}
                style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontWeight: 700, fontFamily: 'inherit', cursor: busy ? 'wait' : 'pointer', opacity: busy || typed.trim().toUpperCase() !== CONFIRM_WORD ? 0.5 : 1 }}
              >
                {busy ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
