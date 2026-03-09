'use client';

import { useState } from 'react';
import { getAllCompanies } from '@/lib/companyData';
import QRCode from '@/components/ui/QRCode';
import Card from '@/components/ui/Card';
import { copyToClipboard } from '@/lib/utils';

/*
  Home Page — Internal overview of all companies

  Not customer-facing. Customers scan the QR code and land directly
  on /review/[slug]. This page is for the business owner to see
  all companies, copy links, and print QR codes.
*/

export default function HomePage() {
  const companies = getAllCompanies();
  const [copyStates, setCopyStates] = useState({});

  const getReviewUrl = (slug) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${slug}`;
  };

  const handleCopy = async (companyId, slug) => {
    const success = await copyToClipboard(getReviewUrl(slug));
    if (success) {
      setCopyStates((prev) => ({ ...prev, [companyId]: true }));
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [companyId]: false }));
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Unternehmen
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {companies.map((company) => (
          <Card key={company.id} className="flex flex-col items-center text-center gap-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {company.name}
            </h2>

            <div className="bg-white p-3 rounded-xl">
              <QRCode url={getReviewUrl(company.slug)} size={140} />
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => handleCopy(company.id, company.slug)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${copyStates[company.id]
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                  }`}
              >
                {copyStates[company.id] ? 'Kopiert!' : 'Link kopieren'}
              </button>

              <a
                href={`/review/${company.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center
                           bg-primary-600 text-white hover:bg-primary-700
                           dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-dark-950
                           transition-colors"
              >
                Öffnen
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
