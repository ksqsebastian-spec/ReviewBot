'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';

/*
  CopyButton Component

  A button that copies text to clipboard and shows feedback.

  WHY A DEDICATED COPY BUTTON?
  Copying to clipboard is a common action that needs:
  1. Visual feedback (user needs to know it worked)
  2. Temporary state change (shows "Copied!" then reverts)
  3. Error handling (clipboard API can fail)

  USAGE:
  <CopyButton text="Text to copy" />
  <CopyButton text={reviewText} onCopy={() => trackCopyEvent()} />
*/

/**
 * @param {Object} props
 * @param {string} props.text - Text to copy to clipboard
 * @param {Function} props.onCopy - Callback after successful copy
 * @param {string} props.className - Additional CSS classes
 */
export default function CopyButton({ text, onCopy, className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      onCopy?.(); // Call callback if provided

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-all duration-200
        ${copied
          ? 'bg-green-100 text-green-700'
          : 'bg-primary-600 text-white hover:bg-primary-700'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
    >
      {copied ? (
        <>
          {/* Checkmark icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          {/* Copy icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Copy Review
        </>
      )}
    </button>
  );
}
