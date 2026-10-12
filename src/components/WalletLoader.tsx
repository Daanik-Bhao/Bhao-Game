import './WalletLoader.css'

export function WalletLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="wallet-loader">
        <div className="wallet-back"></div>
        <div className="bill bill-1"></div>
        <div className="bill bill-2"></div>
        <div className="bill bill-3"></div>
        <div className="wallet-front">
          <div className="text">
            Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
