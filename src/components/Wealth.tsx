import React from 'react';
import { formatWealth } from '../types/game';

export function Wealth({ amount, style, showPlus = false }: { amount: number, style?: React.CSSProperties, showPlus?: boolean }) {
  const formatted = formatWealth(Math.abs(amount));
  const sign = amount >= 0 && showPlus ? '+' : amount < 0 ? '-' : '';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1em', ...style }}>
      {sign}
      <img src="/avatars/coins.png" alt="coin" style={{ width: '1.2em', height: '1.2em', objectFit: 'contain' }} />
      {formatted}
    </span>
  );
}
