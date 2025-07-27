import React from 'react';
import { createPortal } from 'react-dom';
import { useMobile } from '@/contexts/MobileContext';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const { isMobile } = useMobile();
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Add escape listener
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close on backdrop click for desktop (md and above)
    if (
      closeOnBackdrop &&
      e.target === e.currentTarget &&
      !isMobile
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9998] ${
        isMobile 
          ? 'flex' 
          : 'flex items-center justify-center p-4'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop - only visible on desktop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          isMobile ? 'hidden' : 'block'
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog Content */}
      <div
        className={`
          relative bg-white shadow-2xl dark:bg-gray-800 overflow-y-auto
          ${isMobile 
            ? 'h-full w-full' 
            : 'max-h-[95vh] w-full max-w-[95vw] rounded-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl'
          }
          ${className}
        `}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
