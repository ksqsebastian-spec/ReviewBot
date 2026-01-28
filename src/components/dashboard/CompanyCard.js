'use client';

import Link from 'next/link';

/*
  CompanyCard

  A prominent card for the companies dashboard page.
  Displays company identity and action buttons in a visual layout.

  WHY A SEPARATE COMPONENT?
  The companies page would exceed 150 lines with inline card markup.
  Extracting the card keeps each file focused and under the line limit.
*/

export default function CompanyCard({ company, onDelete }) {
  return (
    <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Company Identity */}
      <div className="flex items-center gap-4 mb-4">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} Logo`}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {company.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {company.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-400 font-mono">
            /review/{company.slug}
          </p>
        </div>
      </div>

      {/* Google Review Link (if available) */}
      {company.google_review_link && (
        <a
          href={company.google_review_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 truncate"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">Google Bewertungen</span>
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-dark-700">
        <Link
          href={`/review/${company.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 dark:text-dark-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          title="Bewertungsseite öffnen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ansehen
        </Link>

        <Link
          href={`/dashboard/companies/${company.id}`}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 dark:text-dark-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          title="Unternehmen bearbeiten"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Bearbeiten
        </Link>

        <button
          onClick={() => onDelete(company)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-dark-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
          title="Unternehmen löschen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Löschen
        </button>
      </div>
    </div>
  );
}
