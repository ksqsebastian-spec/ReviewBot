'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCode from '@/components/ui/QRCode';
import { copyToClipboard } from '@/lib/utils';

/*
  CompanyCard Component

  Displays a company with quick-access actions for the dashboard.
  Each card shows:
  - Company name with edit link
  - Small QR code (clickable to enlarge)
  - Action buttons: Copy review link, Copy Google link, Open Google

  WHY THIS DESIGN?
  Users need quick access to common tasks without navigating away.
  The card provides all essential actions in one glance, reducing clicks.

  MOBILE-FIRST:
  - Single column on mobile, adapts to grid on larger screens
  - Touch-friendly button sizes (min 44px)
  - Actions stack vertically on smaller cards
*/

/**
 * @param {Object} props
 * @param {Object} props.company - Company object with id, name, slug, google_review_link
 * @param {Function} props.onQRClick - Called when QR code is clicked (opens modal)
 * @param {Function} props.onEdit - Called when edit button is clicked
 * @param {Function} props.onDelete - Called when delete button is clicked
 */
export default function CompanyCard({ company, onQRClick, onEdit, onDelete }) {
  const [copyState, setCopyState] = useState({ link: false, google: false });

  // Build the review wizard URL
  const getReviewUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${company.slug}`;
  };

  // Handle copy with visual feedback
  const handleCopy = async (type) => {
    const textToCopy = type === 'link' ? getReviewUrl() : company.google_review_link;
    const success = await copyToClipboard(textToCopy);

    if (success) {
      setCopyState((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopyState((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    }
  };

  // Open Google Reviews in new tab
  const handleOpenGoogle = () => {
    if (company.google_review_link) {
      window.open(company.google_review_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-5 flex flex-col h-full">
      {/* Header: Company name + Edit buttons */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {company.name}
          </h3>
          <p className="text-xs text-gray-400 dark:text-dark-500 font-mono truncate">
            /review/{company.slug}
          </p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Edit descriptors link */}
          <Link
            href={`/dashboard/companies/${company.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200
                       hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            title="Beschreibungen bearbeiten"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </Link>
          {/* Edit company button */}
          <button
            onClick={() => onEdit?.(company)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200
                       hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            title="Unternehmen bearbeiten"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {/* Delete company button */}
          <button
            onClick={() => onDelete?.(company)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Unternehmen löschen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* QR Code - clickable to enlarge */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => onQRClick?.(company)}
          className="group relative cursor-pointer rounded-lg overflow-hidden
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     dark:focus:ring-offset-dark-900 transition-transform hover:scale-105"
          title="Klicken zum Vergrößern"
          aria-label={`QR-Code für ${company.name} vergrößern`}
        >
          <QRCode url={getReviewUrl()} size={100} />
          {/* Hover overlay with zoom icon */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20
                          flex items-center justify-center transition-all">
            <svg
              className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Copy Review Wizard Link */}
        <button
          onClick={() => handleCopy('link')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all w-full
                      ${copyState.link
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                      }`}
        >
          {copyState.link ? (
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
              Review-Link kopieren
            </>
          )}
        </button>

        {/* Google Actions Row */}
        <div className="flex gap-2">
          {/* Copy Google Link */}
          <button
            onClick={() => handleCopy('google')}
            disabled={!company.google_review_link}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-all min-w-0
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${copyState.google
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                        }`}
            title="Google-Link kopieren"
          >
            {copyState.google ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            <span className="truncate">Google</span>
          </button>

          {/* Open Google Reviews */}
          <button
            onClick={handleOpenGoogle}
            disabled={!company.google_review_link}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                       text-sm font-medium transition-colors min-w-0
                       bg-primary-600 text-white hover:bg-primary-700
                       dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-dark-950
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Google Reviews öffnen"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate">Öffnen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
