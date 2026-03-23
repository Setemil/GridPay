import React from 'react'
import './components.css'

interface DividerProps {
  label?: string
  className?: string
  style?: React.CSSProperties
}

export function Divider({ label, className = '', style }: DividerProps) {
  return (
    <div
      className={['ui-divider', className].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="ui-divider-line" />
      {label && <span className="ui-divider-text">{label}</span>}
      <div className="ui-divider-line" />
    </div>
  )
}
