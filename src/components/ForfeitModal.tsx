interface ForfeitModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export function ForfeitModal({ onCancel, onConfirm }: ForfeitModalProps) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24, animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'linear-gradient(0.83deg, #2D9842 -131.45%, #62B271 -73.88%, #FFFFFF 99.29%)',
        width: '100%', 
        maxWidth: 695,
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        borderRadius: 12,
        padding: '60px 40px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
      }}>
        
        <h1 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700, // Bold and large as requested
          fontSize: 42, 
          lineHeight: 1.2,
          color: '#000000',
          margin: '0 0 24px 0'
        }}>
          Forfeit Match
        </h1>

        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 20, 
          color: '#575D66', 
          lineHeight: 1.6, 
          fontWeight: 400, 
          margin: '0 0 50px 0',
          maxWidth: '80%'
        }}>
          Are you sure you want to leave? If you leave now, you will automatically <strong style={{ color: '#d92c2c' }}>lose this match</strong> and incur any rank point deductions.
          <br /><br />
          <strong style={{ color: '#d92c2c' }}>Leaving the match may result in a deduction of 25 DC Coins.</strong>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          justifyContent: 'center',
          width: '100%'
        }}>
          <button 
            onClick={onCancel} 
            style={{ 
              width: 258, 
              height: 59, 
              background: 'linear-gradient(180deg, #66D575 0%, #09BC83 100%)', 
              borderRadius: 8,
              border: 'none', 
              cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 600,
              fontSize: 24,
              color: '#111827',
              transition: 'opacity 0.2s'
            }} 
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Cancel
          </button>

          <button 
            onClick={onConfirm} 
            style={{ 
              width: 322, 
              height: 59, 
              background: '#0B2545', 
              borderRadius: 8,
              border: 'none', 
              cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 600,
              fontSize: 24,
              color: '#66D575',
              transition: 'opacity 0.2s',
              textTransform: 'uppercase' // User wanted it capitalized/uppercase instead of lowercase
            }} 
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Forfeit
          </button>
        </div>
      </div>
    </div>
  )
}
