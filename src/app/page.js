'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/*
  Home Page (Landing Page)

  Shows all companies that can be reviewed.
  Users click on a company to go to its review generation page.

  STATE MANAGEMENT:
  - companies: Array of company objects from database
  - loading: Shows loading spinner while fetching
  - error: Displays error message if fetch fails
*/

export default function HomePage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch companies when component mounts
  useEffect(() => {
    async function fetchCompanies() {
      // Handle case when Supabase isn't initialized (during build)
      if (!supabase) {
        setError('Datenbankverbindung nicht verfügbar. Bitte Konfiguration prüfen.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('*')
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Bewertung hinterlassen
        </h1>
        <p className="text-lg text-gray-600 dark:text-dark-300 max-w-2xl mx-auto">
          Wählen Sie ein Unternehmen aus, um schnell eine professionelle Bewertung zu erstellen.
          Ihr Feedback hilft anderen bei ihrer Entscheidung.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600
                       dark:border-primary-900 dark:border-t-primary-400"
            role="status"
            aria-label="Wird geladen"
          >
            <span className="sr-only">Wird geladen</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="max-w-md mx-auto text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && companies.length === 0 && (
        <Card className="max-w-md mx-auto text-center">
          <div className="py-8">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-dark-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Noch keine Unternehmen
            </h3>
            <p className="text-gray-500 dark:text-dark-400 mb-4">
              Fügen Sie Ihr erstes Unternehmen über das Dashboard hinzu.
            </p>
            <Link href="/dashboard/companies">
              <Button>Zum Dashboard</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Company Grid */}
      {!loading && !error && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/review/${company.slug}`}
              className="block group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 group-hover:border-primary-300 dark:group-hover:border-primary-600">
                <div className="flex items-start gap-4">
                  {/* Company Logo or Placeholder */}
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} Logo`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Company Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {company.name}
                    </h3>
                    {company.description && (
                      <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 line-clamp-2">
                        {company.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-dark-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
