'use client';

import { useEffect, useRef, useId } from 'react';

/*
  Modal Component

  An accessible modal/dialog overlay.

  ACCESSIBILITY FEATURES:
  1. Closes on Escape key press
  2. Closes when clicking backdrop
  3. Prevents body scroll when open
  4. Focus trap - keeps focus within modal
  5. role="dialog" and aria-modal="true"
  6. aria-labelledby links to title
  7. Close button has aria-label
  8. Returns focus to trigger element on close

  USAGE:
  <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
    <p>Are you sure?</p>
  </Modal>
*/

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {string} props.title - Modal header title
 * @param {React.ReactNode} props.children - Modal content
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  // Handle Escape key and focus trap
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    function handleFocusTrap(event) {
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    if (isOpen) {
      // Save current focus to restore later
      previousFocusRef.current = document.activeElement;

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'hidden';

      // Focus the modal container or first focusable element
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'unset';

      // Restore focus to previous element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop - covers entire screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Modal content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id={titleId}
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Dialog schließen"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
