
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  disableCloseOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  disableCloseOnOverlayClick = false,
}) => {
  const modalRoot = document.getElementById('modal-root') || (() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'modal-root');
    document.body.appendChild(el);
    return el;
  })();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Optional: Focus the modal for accessibility
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !disableCloseOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`glass-card relative w-full max-w-lg p-6 flex flex-col items-center justify-center text-center transform scale-95 opacity-0 animate-scale-in-fade-in ${className}`}
        style={{ animationFillMode: 'forwards', animationDelay: '100ms' }} // Ensures it stays visible after animation
      >
        {title && (
          <h2 id="modal-title" className="text-3xl font-bold mb-4 text-gray-800">
            {title}
          </h2>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
