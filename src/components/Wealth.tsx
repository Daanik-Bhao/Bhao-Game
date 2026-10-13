import { formatMoney } from '../lib/format'
import { useLang } from '../i18n/lang'

/** A ₹ amount in the number font (spec §B.5): compact Indian format, real minus sign, never a coin image. */
export function Wealth({ amount, showPlus = false, compact = true, className = '' }: { amount: number; showPlus?: boolean; compact?: boolean; className?: string }) {
  const lang = useLang()
  return <span className={`num ${className}`.trim()}>{formatMoney(amount, { compact, signed: showPlus, lang })}</span>
}
