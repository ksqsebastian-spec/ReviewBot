'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import QRCode from '@/components/ui/QRCode';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/*
  Home Page — Kiosk-Ready Landing

  Minimal page designed for display at business locations (tablet, screen).
  Shows a QR code for the selected company's review page.

  LAYOUT:
  1. Company selector (dropdown)
  2. Large QR code → /review/[slug]
  3. Reviews stats box showing generated reviews per company
*/

export default function HomePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewStats, setReviewStats] = useState([]);

  // Fetch companies and review stats on mount
  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setError('Datenbankverbindung nicht verfügbar.');
        setLoading(false);
        return;
      }

      try {
        // Fetch companies
        const { data: companiesData, error: fetchError } = await supabase
          .from('companies')
          .select('id, name, slug')
          .order('name');

        if (fetchError) throw fetchError;
        setCompanies(companiesData || []);
        if (companiesData && companiesData.length > 0) {
          setSelectedCompany(companiesData[0]);
        }

        // Fetch review counts per company
        const { data: reviewData } = await supabase
          .from('generated_reviews')
          .select('company_id, companies (id, name)')
          .not('company_id', 'is', null);

        if (reviewData) {
          const statsMap = {};
          reviewData.forEach((review) => {
            if (!review.companies) return;
            const companyId = review.company_id;
            if (!statsMap[companyId]) {
              statsMap[companyId] = { id: companyId, name: review.companies.name, count: 0 };
            }
            statsMap[companyId].count++;
          });
          setReviewStats(Object.values(statsMap).sort((a, b) => b.count - a.count));
        }
      } catch (err) {
        console.error('Homepage: Fehler beim Laden:', err);
        setError('Unternehmen konnten nicht geladen werden. Bitte erneut versuchen.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Build review URL for the selected company
  const getReviewUrl = () => {
    if (!selectedCompany) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${selectedCompany.slug}`;
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
          <Button onClick={() => router.push('/dashboard/companies')}>
            Zum Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-md space-y-8">

        {/* Company Selector - always show dropdown */}
        <div className="text-center">
          <select
            value={selectedCompany?.id || ''}
            onChange={(e) => {
              const company = companies.find((c) => c.id === e.target.value);
              setSelectedCompany(company);
            }}
            className="px-6 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-xl
                       bg-white dark:bg-dark-800 text-gray-900 dark:text-white
                       text-2xl font-bold text-center
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

        {/* QR Code — large, centered, always on white for scannability */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <QRCode url={getReviewUrl()} size={280} />
          </div>

          <p className="text-lg font-medium text-gray-900 dark:text-white mt-6 text-center">
            Scannen & Bewertung abgeben
          </p>
          <p className="text-sm text-gray-400 dark:text-dark-500 font-mono mt-1 text-center break-all">
            {selectedCompany ? `/review/${selectedCompany.slug}` : ''}
          </p>
        </div>

        {/* Reviews Stats Box */}
        {reviewStats.length > 0 && (
          <Card className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-200 mb-3">
              Generierte Bewertungen
            </h3>
            <div className="space-y-2">
              {reviewStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-dark-700 last:border-0"
                >
                  <span className="text-sm text-gray-600 dark:text-dark-300">{stat.name}</span>
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-500 mt-3 text-center">
              Bewertungen über diese Plattform erstellt
            </p>
          </Card>
        )}

      </div>
    </div>
  );
}
