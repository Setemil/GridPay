import React from 'react'
import './components.css'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  arrow?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  arrow,
  children,
  className = '',
  style,
  ...rest
}: ButtonProps) {
  const cls = [
    'ui-btn',
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    full ? 'ui-btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={cls} style={style} {...rest}>
      {children}
      {arrow && <span className="ui-btn-arrow">→</span>}
    </button>
  )
}
