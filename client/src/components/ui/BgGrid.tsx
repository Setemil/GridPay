import React from 'react'
import './components.css'

interface BgGridProps {
  fixed?: boolean
  style?: React.CSSProperties
  className?: string
}

export function BgGrid({ fixed = false, style, className = '' }: BgGridProps) {
  const cls = [
    fixed ? 'ui-bg-grid ui-bg-grid-fixed' : 'ui-bg-grid',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={cls} style={style} />
}
