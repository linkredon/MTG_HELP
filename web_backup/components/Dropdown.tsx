"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export default function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    
    const updatePosition = () => {
      if (!triggerRef.current) return;
      
      const rect = triggerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Em dispositivos móveis, posicionar na parte inferior da tela
        setPosition({
          top: rect.bottom + window.scrollY,
          left: 16,
          right: 16
        });
      } else {
        // Em desktop, posicionar relativo ao trigger
        if (align === 'right') {
          setPosition({
            top: rect.bottom + window.scrollY,
            left: 0,
            right: window.innerWidth - rect.right
          });
        } else {
          setPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left,
            right: 0
          });
        }
        
        // Verificar se o dropdown vai sair da tela e ajustar se necessário
        if (dropdownRef.current) {
          const dropdownRect = dropdownRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          // Ajustar verticalmente se necessário
          if (rect.bottom + dropdownRect.height > viewportHeight) {
            setPosition(prev => ({
              ...prev,
              top: rect.top + window.scrollY - dropdownRect.height
            }));
          }
          
          // Ajustar horizontalmente se necessário
          if (align === 'left' && rect.left + dropdownRect.width > viewportWidth) {
            setPosition(prev => ({
              ...prev,
              left: viewportWidth - dropdownRect.width - 16,
              right: 0
            }));
          }
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, align]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {mounted && isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
            style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}
          />
          <div 
            ref={dropdownRef}
            className="dropdown-menu"
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              ...(align === 'right' ? { right: `${position.right}px` } : { left: `${position.left}px` }),
              zIndex: 9999,
              minWidth: '240px',
              maxWidth: window.innerWidth < 768 ? 'calc(100vw - 32px)' : '320px',
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              padding: '12px'
            }}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  );
}