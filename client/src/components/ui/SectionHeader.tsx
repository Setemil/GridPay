import React from 'react'
import './components.css'

interface SectionHeaderProps {
  label?: string
  title: React.ReactNode
  sub?: string
  className?: string
  style?: React.CSSProperties
}

export function SectionHeader({
  label,
  title,
  sub,
  className = '',
  style,
}: SectionHeaderProps) {
  return (
    <div
      className={['ui-section-header', className].filter(Boolean).join(' ')}
      style={style}
    >
      {label && <div className="ui-section-label">◆ {label}</div>}
      <h2 className="ui-section-title">{title}</h2>
      {sub && <p className="ui-section-sub">{sub}</p>}
    </div>
  )
}
