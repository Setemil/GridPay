import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { animate } from 'animejs'
import './components.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  style?: React.CSSProperties
  overlayStyle?: React.CSSProperties
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  style,
  overlayStyle,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && panelRef.current) {
      animate(panelRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 300,
        ease: 'easeOutExpo',
      })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="ui-modal-overlay"
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ui-modal" ref={panelRef} style={style}>
        <div className="ui-modal-header">
          {title && <h3 className="ui-modal-title">{title}</h3>}
          <button
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
