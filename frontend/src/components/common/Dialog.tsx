import React from 'react';
import { createPortal } from 'react-dom';

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
  closeOnEscape = true
}) => {
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
    if (closeOnBackdrop && e.target === e.currentTarget && window.innerWidth >= 768) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center md:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop - only visible on desktop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm hidden md:block"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Dialog Content */}
      <div 
        className={`
          relative bg-white dark:bg-gray-800 shadow-2xl 
          /* Mobile: Full screen */
          h-full w-full md:rounded-lg
          /* Desktop: Modal with constraints */
          md:max-h-[90vh] md:max-w-[95vw] md:w-full overflow-y-auto
          md:sm:max-w-2xl md:md:max-w-3xl md:lg:max-w-4xl
          ${className}
        `}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
