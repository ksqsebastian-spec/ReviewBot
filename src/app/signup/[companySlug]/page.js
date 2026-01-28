'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SignupWizard from '@/components/forms/SignupWizard';

/*
  Email Signup Page

  Public page where customers can subscribe to review reminders.
  Accessed via QR code, direct link, or home page newsletter form.

  URL: /signup/[companySlug]
  Optional: ?email=user@example.com (pre-fills email from home page)

  FLOW:
  1. Customer scans QR code or enters email on home page
  2. Multi-step wizard guides them through signup
  3. Can subscribe to multiple companies
  4. Set notification preferences (interval, time, language)
  5. Later receives personalized email reminders
*/

function SignupPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companySlug = params.companySlug;
  const initialEmail = searchParams.get('email') || '';

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      // Handle case when Supabase isn't initialized (during build)
      if (!supabase) {
        setError('Datenbankverbindung nicht verfügbar. Bitte prüfen Sie die Konfiguration.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', companySlug)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Company not found');

        setCompany(data);
      } catch (err) {
        // Error handled by state
        setError('Dieses Unternehmen wurde nicht gefunden. Bitte prüfen Sie die URL.');
      } finally {
        setLoading(false);
      }
    }

    if (companySlug) {
      fetchCompany();
    }
  }, [companySlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button>Zur Startseite</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Company Header */}
      <div className="text-center mb-8">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} Logo`}
            className="w-20 h-20 rounded-lg object-cover mx-auto mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary-600">
              {company.name.charAt(0)}
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-600 mt-2">
          Bleiben Sie in Verbindung und erhalten Sie Erinnerungen, um Ihre Erfahrung zu teilen
        </p>
      </div>

      {/* Multi-Step Signup Wizard */}
      <Card>
        <SignupWizard
          initialCompanyId={company.id}
          initialCompanyName={company.name}
          initialEmail={initialEmail}
        />
      </Card>

      {/* Alternative: Leave review now */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Moechten Sie jetzt eine Bewertung hinterlassen?
        </p>
        <Link href={`/review/${company.slug}`}>
          <Button variant="secondary">Bewertung schreiben</Button>
        </Link>
      </div>
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
