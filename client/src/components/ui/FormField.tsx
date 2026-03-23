import React from 'react'
import './components.css'

interface FormFieldProps {
  label: string
  icon?: React.ReactNode
  error?: string
  hint?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function FormField({
  label,
  icon,
  error,
  hint,
  className = '',
  style,
  children,
}: FormFieldProps) {
  return (
    <div
      className={['ui-field', className].filter(Boolean).join(' ')}
      style={style}
    >
      <label className="ui-field-label">{label}</label>
      <div className="ui-field-wrap">
        {icon && <span className="ui-field-icon">{icon}</span>}
        {children}
      </div>
      {error && <span className="ui-field-error">{error}</span>}
      {hint && <span className="ui-field-hint">{hint}</span>}
    </div>
  )
}
