import React from 'react'
import './components.css'

type BadgeVariant = 'solar' | 'wind' | 'verified' | 'red'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Badge({
  variant = 'solar',
  children,
  className = '',
  style,
}: BadgeProps) {
  return (
    <span
      className={['ui-badge', `ui-badge-${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </span>
  )
}
