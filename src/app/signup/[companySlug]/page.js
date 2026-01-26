'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmailSignupForm from '@/components/forms/EmailSignupForm';

/*
  Email Signup Page

  Public page where customers can subscribe to review reminders.
  Accessed via QR code or direct link.

  URL: /signup/[companySlug]

  FLOW:
  1. Customer scans QR code at business location
  2. Enters email to get review reminders
  3. Later receives email with review link
*/

export default function SignupPage() {
  const params = useParams();
  const companySlug = params.companySlug;

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
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
        console.error('Error fetching company:', err);
        setError('This company was not found. Please check the URL.');
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
            <Button>Back to Home</Button>
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
            alt={`${company.name} logo`}
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
          Stay connected and get reminders to share your experience
        </p>
      </div>

      {/* Signup Form Card */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Get Review Reminders
        </h2>
        <EmailSignupForm companyId={company.id} companyName={company.name} />
      </Card>

      {/* Alternative: Leave review now */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Ready to leave a review now?
        </p>
        <Link href={`/review/${company.slug}`}>
          <Button variant="secondary">Write a Review</Button>
        </Link>
      </div>
    </div>
  );
}
