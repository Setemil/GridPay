import React from 'react'
import { Link } from 'react-router-dom'
import './components.css'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  to?: string
  className?: string
  style?: React.CSSProperties
}

export function Logo({ size = 'md', to = '/', className = '', style }: LogoProps) {
  return (
    <Link
      to={to}
      className={['ui-logo', className].filter(Boolean).join(' ')}
      style={style}
    >
      <div
        className={[
          'ui-logo-bolt',
          size !== 'md' ? `ui-logo-bolt-${size}` : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <span
        className={[
          'ui-logo-text',
          size !== 'md' ? `ui-logo-text-${size}` : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        EnergyShare
      </span>
    </Link>
  )
}
