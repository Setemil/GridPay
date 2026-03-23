import React from 'react'
import './components.css'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'
type HeadingVariant = 'primary' | 'secondary'

interface HeadingProps {
  as?: HeadingLevel
  variant?: HeadingVariant
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function Heading({
  as: Tag = 'h2',
  variant = 'primary',
  className = '',
  style,
  children,
}: HeadingProps) {
  return (
    <Tag
      className={['ui-heading', `ui-${Tag}`, `ui-heading-${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </Tag>
  )
}
