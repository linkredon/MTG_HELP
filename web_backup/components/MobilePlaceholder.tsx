"use client"

import { Construction, AlertCircle } from 'lucide-react'

interface MobilePlaceholderProps {
  title: string
  description?: string
  icon?: any
}

export default function MobilePlaceholder({ 
  title, 
  description = "Esta funcionalidade está em desenvolvimento e será implementada em breve.",
  icon: Icon = Construction 
}: MobilePlaceholderProps) {
  return (
    <div className="mobile-placeholder">
      <div className="mobile-placeholder-content">
        <div className="mobile-placeholder-icon">
          <Icon size={48} />
        </div>
        <h2 className="mobile-placeholder-title">{title}</h2>
        <p className="mobile-placeholder-description">{description}</p>
        <div className="mobile-placeholder-status">
          <AlertCircle size={16} />
          <span>Em desenvolvimento</span>
        </div>
      </div>
    </div>
  )
} 