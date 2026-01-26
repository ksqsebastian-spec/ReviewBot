'use client';

import { useEffect } from 'react';

/*
  Modal Component

  An accessible modal/dialog overlay.

  ACCESSIBILITY FEATURES:
  1. Closes on Escape key press
  2. Closes when clicking backdrop (optional)
  3. Prevents body scroll when open
  4. Focus trap would be added for full accessibility

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
  // Handle Escape key to close modal
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function runs when modal closes or component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    // Backdrop - covers entire screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose} // Close when clicking backdrop
    >
      {/* Modal content - stop propagation so clicking inside doesn't close */}
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
