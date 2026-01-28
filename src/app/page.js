'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import QRCode from '@/components/ui/QRCode';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

/*
  Home Page — Kiosk-Ready Landing

  Minimal page designed for display at business locations (tablet, screen).
  Shows a QR code for the selected company's review page,
  plus an inline newsletter signup that redirects to the full wizard.

  LAYOUT:
  1. Company selector (dropdown)
  2. Large QR code → /review/[slug]
  3. Divider
  4. Newsletter email input → redirects to /signup/[slug]?email=...
*/

export default function HomePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  // Fetch companies on mount
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
          .select('id, name, slug')
          .order('name');

        if (fetchError) throw fetchError;
        setCompanies(data || []);
        if (data && data.length > 0) {
          setSelectedCompany(data[0]);
        }
      } catch (err) {
        setError('Unternehmen konnten nicht geladen werden. Bitte erneut versuchen.');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Build review URL for the selected company
  const getReviewUrl = () => {
    if (!selectedCompany) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${selectedCompany.slug}`;
  };

  // Handle newsletter signup — redirect to wizard with email pre-filled
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !selectedCompany) return;
    router.push(`/signup/${selectedCompany.slug}?email=${encodeURIComponent(email)}`);
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

        {/* Company Selector */}
        {companies.length > 1 && (
          <div className="text-center">
            <select
              value={selectedCompany?.id || ''}
              onChange={(e) => {
                const company = companies.find((c) => c.id === e.target.value);
                setSelectedCompany(company);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl
                         bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100
                         text-center font-medium
                         focus:outline-none focus:ring-2 focus:ring-primary-500
                         appearance-none cursor-pointer"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Single company name display */}
        {companies.length === 1 && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            {selectedCompany?.name}
          </h2>
        )}

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

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700" />
          <span className="text-sm text-gray-400 dark:text-dark-500">oder</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700" />
        </div>

        {/* Newsletter Signup */}
        <div className="text-center space-y-3">
          <p className="text-gray-600 dark:text-dark-300 font-medium">
            Für Erinnerungen anmelden
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={!email.includes('@')}>
              Anmelden
            </Button>
          </form>
          <p className="text-xs text-gray-400 dark:text-dark-500">
            Sie werden zur Anmeldung weitergeleitet
          </p>
        </div>

      </div>
    </div>
  );
}
