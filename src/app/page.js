'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCompanies } from '@/lib/companyData';
import QRCode from '@/components/ui/QRCode';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { copyToClipboard } from '@/lib/utils';

/*
  Home Page — Kiosk-Ready Landing

  Minimal page designed for display at business locations (tablet, screen).
  Optimized for ease of use with prominent call-to-action.

  LAYOUT:
  1. Company selector (dropdown)
  2. Big CTA button to start review
  3. Smaller QR code (for scanning)
  4. Quick action buttons (copy link, open Google)

  DESIGN PHILOSOPHY:
  - Large, touch-friendly buttons
  - Clear visual hierarchy
  - Minimal distractions
  - Easy for customers to understand instantly
*/

export default function HomePage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyState, setCopyState] = useState({ link: false, google: false });

  // Load companies from hardcoded data
  useEffect(() => {
    const companiesData = getAllCompanies();
    setCompanies(companiesData);
    if (companiesData.length > 0) {
      setSelectedCompany(companiesData[0]);
    }
    setLoading(false);
  }, []);

  // Build review URL for the selected company
  const getReviewUrl = () => {
    if (!selectedCompany) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${selectedCompany.slug}`;
  };

  // Handle copy with visual feedback
  const handleCopy = async (type) => {
    const textToCopy = type === 'link' ? getReviewUrl() : selectedCompany?.google_review_link;
    if (!textToCopy) return;

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopyState((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopyState((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    }
  };

  // Open Google Reviews
  const handleOpenGoogle = () => {
    if (selectedCompany?.google_review_link) {
      window.open(selectedCompany.google_review_link, '_blank', 'noopener,noreferrer');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600"
          role="status"
          aria-label="Wird geladen"
        >
          <span className="sr-only">Wird geladen</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <Card className="max-w-sm text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
        </Card>
      </div>
    );
  }

  // Empty state — no companies
  if (companies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <Card className="max-w-sm text-center py-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Noch keine Unternehmen
          </h2>
          <p className="text-gray-500 dark:text-dark-400 mb-4">
            Erstellen Sie Ihr erstes Unternehmen im Dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3
                       bg-primary-600 hover:bg-primary-700 text-white font-medium
                       rounded-lg transition-colors"
          >
            Zum Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-md space-y-6">

        {/* Company Selector */}
        <div className="text-center">
          <select
            value={selectedCompany?.id || ''}
            onChange={(e) => {
              const company = companies.find((c) => c.id === e.target.value);
              setSelectedCompany(company);
            }}
            className="px-6 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-xl
                       bg-white dark:bg-dark-800 text-gray-900 dark:text-white
                       text-xl font-bold text-center
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       cursor-pointer shadow-sm"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Big CTA Button */}
        {selectedCompany && (
          <Link
            href={`/review/${selectedCompany.slug}`}
            className="block w-full py-5 px-6 text-center text-xl font-bold text-white
                       bg-primary-600 hover:bg-primary-700
                       dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-dark-950
                       rounded-2xl shadow-lg hover:shadow-xl
                       transition-all transform hover:scale-[1.02]
                       focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800"
          >
            Jetzt Bewertung schreiben
            <span className="block text-sm font-normal mt-1 opacity-90">
              Schnell und einfach in 30 Sekunden
            </span>
          </Link>
        )}

        {/* QR Code — smaller, centered */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <QRCode url={getReviewUrl()} size={180} />
          </div>

          <p className="text-sm text-gray-500 dark:text-dark-400 mt-4 text-center">
            Oder QR-Code scannen
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Copy Review Link */}
          <button
            onClick={() => handleCopy('link')}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                        text-sm font-medium transition-all
                        ${copyState.link
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                        }`}
          >
            {copyState.link ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link kopiert!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Bewertungs-Link kopieren
              </>
            )}
          </button>

          {/* Google Actions Row */}
          <div className="flex gap-3">
            {/* Copy Google Link */}
            <button
              onClick={() => handleCopy('google')}
              disabled={!selectedCompany?.google_review_link}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                          text-sm font-medium transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${copyState.google
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                          }`}
              title="Google-Link kopieren"
            >
              {copyState.google ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              Google-Link
            </button>

            {/* Open Google Reviews */}
            <button
              onClick={handleOpenGoogle}
              disabled={!selectedCompany?.google_review_link}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                         text-sm font-medium transition-colors
                         bg-blue-600 text-white hover:bg-blue-700
                         dark:bg-blue-500 dark:hover:bg-blue-400
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Google Reviews direkt öffnen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Google öffnen
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
