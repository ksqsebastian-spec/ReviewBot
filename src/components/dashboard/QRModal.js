'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import QRCode from '@/components/ui/QRCode';
import { copyToClipboard } from '@/lib/utils';

/*
  QRModal Component

  A modal that displays an enlarged QR code for a company.
  Includes print and copy link functionality.

  WHY A SEPARATE MODAL?
  The CompanyCard shows a small QR code for space efficiency.
  Users need a larger QR for:
  - Scanning on phones (better camera focus)
  - Printing for display in physical locations
  - Screenshots for sharing

  PRINT FUNCTIONALITY:
  Opens a new window with a print-optimized layout showing
  only the QR code and company name, ready for printing.
*/

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Object} props.company - Company object (name, slug)
 */
export default function QRModal({ isOpen, onClose, company }) {
  const [copied, setCopied] = useState(false);

  if (!company) return null;

  // Build the review wizard URL
  const getReviewUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${company.slug}`;
  };

  // Handle copy with visual feedback
  const handleCopy = async () => {
    const success = await copyToClipboard(getReviewUrl());
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle print - opens print-friendly window
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blockiert. Bitte erlauben Sie Popups für diese Seite.');
      return;
    }

    const reviewUrl = getReviewUrl();

    // Create print-friendly HTML with embedded QR code
    // Using data URL for QR code to ensure it prints correctly
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR-Code - ${company.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
            text-align: center;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #1f2937;
          }
          .qr-container {
            padding: 1.5rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 1rem;
          }
          .url {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
            font-family: monospace;
            word-break: break-all;
          }
          .instructions {
            margin-top: 1.5rem;
            font-size: 1.125rem;
            color: #374151;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${company.name}</h1>
        <div class="qr-container" id="qr"></div>
        <p class="url">${reviewUrl}</p>
        <p class="instructions">Scannen Sie den QR-Code, um eine Bewertung abzugeben</p>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\/script>
        <script>
          QRCode.toCanvas(document.createElement('canvas'), '${reviewUrl}', { width: 256, margin: 0 }, function(err, canvas) {
            if (!err) document.getElementById('qr').appendChild(canvas);
            setTimeout(function() { window.print(); }, 500);
          });
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company.name}>
      <div className="flex flex-col items-center">
        {/* Large QR Code */}
        <div className="mb-4">
          <QRCode url={getReviewUrl()} size={220} />
        </div>

        {/* URL display */}
        <p className="text-sm text-gray-500 dark:text-dark-400 font-mono mb-6 text-center break-all">
          {getReviewUrl()}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          {/* Copy Link Button */}
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                        text-sm font-medium transition-all
                        ${copied
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-200 dark:hover:bg-dark-600'
                        }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kopiert!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Link kopieren
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                       text-sm font-medium transition-colors
                       bg-primary-600 text-white hover:bg-primary-700
                       dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-dark-950"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Drucken
          </button>
        </div>
      </div>
    </Modal>
  );
}
