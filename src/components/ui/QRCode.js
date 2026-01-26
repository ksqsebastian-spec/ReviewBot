'use client';

import { QRCodeSVG } from 'qrcode.react';

/*
  QRCode Component

  Generates a QR code for any URL - used for email signup pages.

  WHY QR CODES?
  For physical locations (offices, stores), QR codes let customers:
  1. Quickly access the review page on their phone
  2. Sign up for email notifications
  3. No need to type URLs manually

  ACCESSIBILITY:
  - aria-label describes the QR code purpose
  - SVG marked as decorative since the label provides context

  USAGE:
  <QRCode url="https://yoursite.com/signup/company-slug" />
  <QRCode url={signupUrl} size={200} />
*/

/**
 * @param {Object} props
 * @param {string} props.url - URL to encode in QR code
 * @param {number} props.size - Size in pixels (default 128)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessible label for the QR code
 */
export default function QRCode({ url, size = 128, className = '', label }) {
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm">Keine URL</span>
      </div>
    );
  }

  // Generate accessible label if not provided
  const accessibleLabel = label || `QR-Code für ${url}`;

  return (
    <div
      className={`inline-block p-4 bg-white rounded-lg shadow-sm ${className}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
        // QR codes need high contrast - always use black on white
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  );
}
