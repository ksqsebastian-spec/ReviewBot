'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import { useCompanyContext } from '@/contexts/CompanyContext';

/*
  Anmelde-Links Seite

  Übersicht der Unternehmen mit ihren Anmelde-URLs.
  Uses global CompanyContext — filters by selected company or shows all.

  FUNKTIONEN:
  - Liste der Unternehmen mit Anmelde-URLs
  - Kopierfunktion für jeden Link
  - QR-Code Miniaturansicht
  - Direktlink zur öffentlichen Anmeldeseite
*/

export default function SignupLinksPage() {
  const { companies: allCompanies, selectedCompanyId, loading } = useCompanyContext();
  const [copiedId, setCopiedId] = useState(null);

  // Filter by selected company, or show all
  const companies = selectedCompanyId
    ? allCompanies.filter((c) => c.id === selectedCompanyId)
    : allCompanies;

  // URL generieren
  const getSignupUrl = (slug) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/signup/${slug}`;
  };

  const getReviewUrl = (slug) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${slug}`;
  };

  // Link kopieren
  const handleCopy = async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Kopieren fehlgeschlagen
    }
  };

  return (
    <div className="space-y-6">
      {/* Seitenkopf */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Anmelde-Links</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">
          Teilen Sie diese Links mit Ihren Kunden für die E-Mail-Anmeldung
        </p>
      </div>

      {/* Ladezustand */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      )}

      {/* Leerer Zustand */}
      {!loading && companies.length === 0 && (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-dark-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Keine Unternehmen vorhanden
          </h3>
          <p className="text-gray-500 dark:text-dark-400 mb-4">
            Erstellen Sie zuerst ein Unternehmen, um Anmelde-Links zu erhalten.
          </p>
          <Link href="/dashboard/companies?action=new">
            <Button>Unternehmen erstellen</Button>
          </Link>
        </Card>
      )}

      {/* Unternehmensliste */}
      {!loading && companies.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {companies.map((company) => (
            <Card key={company.id} className="p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* QR-Code Miniatur */}
                <div className="p-4 bg-gray-50 dark:bg-dark-800 flex items-center justify-center md:w-32">
                  <QRCode url={getSignupUrl(company.slug)} size={80} />
                </div>

                {/* Inhalt */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                        Slug: {company.slug}
                      </p>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mt-4 space-y-3">
                    {/* Anmelde-Link */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-500 dark:text-dark-400 mb-0.5">Anmelde-Link:</p>
                        <p className="text-sm text-gray-900 dark:text-dark-100 font-mono break-all">
                          {getSignupUrl(company.slug)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleCopy(`signup-${company.id}`, getSignupUrl(company.slug))}
                        className="shrink-0"
                      >
                        {copiedId === `signup-${company.id}` ? (
                          <span className="text-green-600 dark:text-green-400">Kopiert!</span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </Button>
                    </div>

                    {/* Bewertungs-Link */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-500 dark:text-dark-400 mb-0.5">Bewertungs-Link:</p>
                        <p className="text-sm text-gray-900 dark:text-dark-100 font-mono break-all">
                          {getReviewUrl(company.slug)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleCopy(`review-${company.id}`, getReviewUrl(company.slug))}
                        className="shrink-0"
                      >
                        {copiedId === `review-${company.id}` ? (
                          <span className="text-green-600 dark:text-green-400">Kopiert!</span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Aktionen */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={getSignupUrl(company.slug)}
                      target="_blank"
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Anmeldeseite öffnen →
                    </Link>
                    <span className="text-gray-300 dark:text-dark-600">|</span>
                    <Link
                      href={getReviewUrl(company.slug)}
                      target="_blank"
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Bewertungsseite öffnen →
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info-Box */}
      {!loading && companies.length > 0 && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Unterschied zwischen den Links
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-dark-200">
            <p>
              <strong>Anmelde-Link:</strong> Kunden können sich für regelmäßige E-Mail-Erinnerungen anmelden,
              um später eine Bewertung abzugeben.
            </p>
            <p>
              <strong>Bewertungs-Link:</strong> Kunden werden direkt zur Bewertungsseite weitergeleitet,
              wo sie sofort eine Bewertung erstellen können.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
