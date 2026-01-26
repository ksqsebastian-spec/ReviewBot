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

  USAGE:
  <QRCode url="https://yoursite.com/signup/company-slug" />
  <QRCode url={signupUrl} size={200} />
*/

/**
 * @param {Object} props
 * @param {string} props.url - URL to encode in QR code
 * @param {number} props.size - Size in pixels (default 128)
 * @param {string} props.className - Additional CSS classes
 */
export default function QRCode({ url, size = 128, className = '' }) {
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-sm">No URL</span>
      </div>
    );
  }

  return (
    <div className={`inline-block p-4 bg-white rounded-lg shadow-sm ${className}`}>
      <QRCodeSVG
        value={url}
        size={size}
        level="M" // Error correction level (L, M, Q, H)
        includeMargin={false}
      />
    </div>
  );
}
