"use client"

import { Settings, User, Bell, Shield, Palette, Globe, HelpCircle, Info } from 'lucide-react'

export default function MobileConfigPlaceholder() {
  const configSections = [
    {
      title: 'Perfil',
      icon: User,
      items: [
        { label: 'Editar Perfil', description: 'Alterar informações pessoais' },
        { label: 'Avatar', description: 'Mudar foto de perfil' },
        { label: 'Privacidade', description: 'Configurar visibilidade' }
      ]
    },
    {
      title: 'Notificações',
      icon: Bell,
      items: [
        { label: 'Push Notifications', description: 'Alertas em tempo real' },
        { label: 'Email', description: 'Notificações por email' },
        { label: 'Conquistas', description: 'Alertas de conquistas' }
      ]
    },
    {
      title: 'Segurança',
      icon: Shield,
      items: [
        { label: 'Senha', description: 'Alterar senha' },
        { label: 'Autenticação 2FA', description: 'Segurança adicional' },
        { label: 'Sessões', description: 'Gerenciar logins' }
      ]
    },
    {
      title: 'Aparência',
      icon: Palette,
      items: [
        { label: 'Tema', description: 'Claro ou escuro' },
        { label: 'Cores', description: 'Personalizar cores' },
        { label: 'Layout', description: 'Ajustar interface' }
      ]
    },
    {
      title: 'Geral',
      icon: Settings,
      items: [
        { label: 'Idioma', description: 'Português' },
        { label: 'Região', description: 'Brasil' },
        { label: 'Sincronização', description: 'Configurar backup' }
      ]
    }
  ]

  return (
    <div className="mobile-config">
      <div className="mobile-config-header">
        <h1 className="mobile-config-title">Configurações</h1>
        <p className="mobile-config-subtitle">Personalize sua experiência</p>
      </div>

      <div className="mobile-config-sections">
        {configSections.map((section, sectionIndex) => {
          const Icon = section.icon
          return (
            <div key={sectionIndex} className="mobile-config-section">
              <div className="mobile-config-section-header">
                <div className="mobile-config-section-icon">
                  <Icon size={18} />
                </div>
                <h2 className="mobile-config-section-title">{section.title}</h2>
              </div>
              
              <div className="mobile-config-items">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="mobile-config-item">
                    <div className="mobile-config-item-content">
                      <div className="mobile-config-item-main">
                        <span className="mobile-config-item-label">{item.label}</span>
                        <span className="mobile-config-item-description">{item.description}</span>
                      </div>
                      <div className="mobile-config-item-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mobile-config-footer">
        <div className="mobile-config-version">
          <Info size={14} />
          <span>Versão 1.2.0</span>
        </div>
        <div className="mobile-config-help">
          <HelpCircle size={14} />
          <span>Ajuda e Suporte</span>
        </div>
      </div>
    </div>
  )
} 