import React, { useEffect, useRef } from 'react'
import './components.css'

interface StatCardProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  className?: string
  style?: React.CSSProperties
  animateOnMount?: boolean
}

export function StatCard({
  value,
  suffix = '',
  prefix = '',
  label,
  className = '',
  style,
  animateOnMount = false,
}: StatCardProps) {
  const numRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animateOnMount) return
    const el = numRef.current
    const card = cardRef.current
    if (!el || !card) return

    card.classList.add('animated')
    const duration = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      const v = eased * value
      el.textContent =
        prefix +
        (Number.isInteger(value)
          ? Math.round(v).toLocaleString()
          : v.toFixed(1)) +
        suffix
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [animateOnMount, value, prefix, suffix])

  const display =
    prefix +
    (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)) +
    suffix

  return (
    <div
      ref={cardRef}
      className={['ui-stat-card', className].filter(Boolean).join(' ')}
      style={style}
    >
      <span ref={numRef} className="ui-stat-num">
        {display}
      </span>
      <span className="ui-stat-label">{label}</span>
      <div className="ui-stat-bar">
        <div className="ui-stat-bar-fill" />
      </div>
    </div>
  )
}
