'use client';

import CopyButton from '@/components/ui/CopyButton';

/*
  ReviewActions Component

  Action buttons for copying the review and opening Google Reviews.
  These are the final step in the review generation flow.

  USER FLOW:
  1. User copies the review text
  2. User clicks the Google link
  3. Google Reviews opens → user pastes the review

  WHY TWO SEPARATE ACTIONS?
  We can't auto-paste into Google (security restriction).
  The two-step process is clear and expected by users.
*/

/**
 * @param {Object} props
 * @param {string} props.reviewText - Text to copy
 * @param {string} props.googleReviewUrl - URL to Google Reviews page
 * @param {boolean} props.disabled - Whether actions are disabled
 * @param {Function} props.onCopy - Callback when review is copied
 * @param {Function} props.onLinkClick - Callback when Google link is clicked
 */
export default function ReviewActions({
  reviewText,
  googleReviewUrl,
  disabled = false,
  onCopy,
  onLinkClick,
}) {
  const handleGoogleClick = () => {
    onLinkClick?.();
    // Open in new tab
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <p className="text-sm text-gray-600">
        Copy your review, then click the button below to open Google Reviews and paste it.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Copy button */}
        <CopyButton
          text={reviewText}
          onCopy={onCopy}
          className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
        />

        {/* Google Reviews button */}
        <button
          onClick={handleGoogleClick}
          disabled={disabled || !googleReviewUrl}
          className={`
            inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            font-medium transition-colors duration-200
            bg-white text-gray-700 border border-gray-300
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {/* Google icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Open Google Reviews
        </button>
      </div>

      {/* Helpful tip */}
      <p className="text-xs text-gray-500">
        Tip: The review has been copied to your clipboard. Just paste it on the Google page!
      </p>
    </div>
  );
}
