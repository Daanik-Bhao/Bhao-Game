import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './ui.css'

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** default 16px padding; 'tile' = home tile (14px, min-height 118); 'none' = no padding */
  pad?: 'default' | 'tile' | 'none'
  sunken?: boolean
  as?: 'div' | 'section' | 'article'
}

/** Panel / card container (spec §D.4). Light: white + hairline + e-1. On the table: table surface, no shadow. */
export function Panel({ children, pad = 'default', sunken, as: Tag = 'div', className = '', ...rest }: PanelProps) {
  const cls = ['panel', pad === 'default' ? 'panel--pad' : pad === 'tile' ? 'panel--tile' : '', sunken ? 'panel--sunken' : '', className]
    .filter(Boolean).join(' ')
  return <Tag className={cls} {...rest}>{children}</Tag>
}

/** @deprecated use Panel. Kept so older screens compile while they are migrated. */
export function Card({ children, className, style, onClick }: {
  children: ReactNode; className?: string; style?: CSSProperties; onClick?: () => void
  hoverable?: boolean; glow?: 'blue' | 'gold' | 'green' | 'red'
}) {
  return <Panel className={className} style={style} onClick={onClick}>{children}</Panel>
}
