'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/*
  Companies Page

  Public directory of all registered companies.
  Each card links to the company's review and signup pages.

  Previously this content was on the home page;
  moved here to keep the main landing page minimal (QR + newsletter).
*/

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompanies() {
      if (!supabase) {
        setError('Datenbankverbindung nicht verfügbar.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('id, name, slug, logo_url, google_review_link')
          .order('name');

        if (fetchError) throw fetchError;
        setCompanies(data || []);
      } catch (err) {
        setError('Unternehmen konnten nicht geladen werden. Bitte erneut versuchen.');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600"
            role="status"
            aria-label="Wird geladen"
          >
            <span className="sr-only">Wird geladen</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="max-w-sm mx-auto text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Unternehmen
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">
          Wählen Sie ein Unternehmen, um eine Bewertung abzugeben oder sich für Erinnerungen anzumelden.
        </p>
      </div>

      {/* Empty state */}
      {companies.length === 0 ? (
        <Card className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Noch keine Unternehmen
          </h2>
          <p className="text-gray-500 dark:text-dark-400">
            Es sind noch keine Unternehmen registriert.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Card key={company.id} className="flex flex-col">
              {/* Company Identity */}
              <div className="flex items-center gap-3 mb-4">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={`${company.name} Logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {company.name}
                </h2>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Link href={`/review/${company.slug}`} className="flex-1">
                  <Button className="w-full text-sm">Bewerten</Button>
                </Link>
                <Link href={`/signup/${company.slug}`} className="flex-1">
                  <Button variant="secondary" className="w-full text-sm">Anmelden</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
