'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { generateReview } from '@/lib/utils';
import { REVIEW_TEMPLATES, APP_CONFIG, MESSAGES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DescriptorChips from '@/components/review/DescriptorChips';
import ReviewPreview from '@/components/review/ReviewPreview';
import ReviewActions from '@/components/review/ReviewActions';

/*
  Review Page

  The main review generation page for a specific company.
  URL: /review/[companySlug] (e.g., /review/sunrise-dental)
  Optional: ?sid=subscriberId (from email link)

  HOW IT WORKS:
  1. Fetches company info and descriptors from Supabase
  2. Checks if subscriber has already reviewed (if sid provided)
  3. User selects descriptors by clicking chips
  4. Review is generated in real-time from selections
  5. User copies review and clicks link to Google
  6. Marks review as completed for that subscriber

  SUBSCRIBER TRACKING:
  When accessed via email link (?sid=xxx), we track:
  - Whether they've already reviewed this company
  - When they complete their review (copy + click Google)
*/

function ReviewPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companySlug = params.companySlug;
  const subscriberId = searchParams.get('sid'); // Subscriber ID from email link

  // State management
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedDescriptors, setSelectedDescriptors] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscriber state
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);

  // Fetch company and descriptors on mount
  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setError('Datenbankverbindung nicht verfügbar.');
        setLoading(false);
        return;
      }

      try {
        // Get the company by slug
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', companySlug)
          .single();

        if (companyError) throw companyError;
        if (!companyData) throw new Error('Company not found');

        setCompany(companyData);

        // Check if subscriber already reviewed this company
        if (subscriberId) {
          const { data: subCompany } = await supabase
            .from('subscriber_companies')
            .select('review_completed_at')
            .eq('subscriber_id', subscriberId)
            .eq('company_id', companyData.id)
            .single();

          if (subCompany?.review_completed_at) {
            setAlreadyReviewed(true);
          }
        }

        // Get categories with their descriptors
        const { data: categoryData, error: categoryError } = await supabase
          .from('descriptor_categories')
          .select(`
            id,
            name,
            sort_order,
            descriptors (
              id,
              text
            )
          `)
          .eq('company_id', companyData.id)
          .order('sort_order');

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);

      } catch (err) {
        // Error handled by state
        setError(
          err.message === 'Company not found'
            ? 'Dieses Unternehmen wurde nicht gefunden.'
            : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
        );
      } finally {
        setLoading(false);
      }
    }

    if (companySlug) {
      fetchData();
    }
  }, [companySlug, subscriberId]);

  // Toggle descriptor selection
  const handleToggle = (descriptorId) => {
    setSelectedDescriptors((prev) => {
      const next = new Set(prev);
      if (next.has(descriptorId)) {
        next.delete(descriptorId);
      } else {
        next.add(descriptorId);
      }
      return next;
    });
  };

  // Generate review text from selected descriptors
  const reviewText = useMemo(() => {
    if (selectedDescriptors.size < APP_CONFIG.minDescriptorsForReview) {
      return '';
    }

    const selectedTexts = [];
    categories.forEach((category) => {
      category.descriptors.forEach((descriptor) => {
        if (selectedDescriptors.has(descriptor.id)) {
          selectedTexts.push(descriptor.text);
        }
      });
    });

    return generateReview(selectedTexts, REVIEW_TEMPLATES);
  }, [selectedDescriptors, categories]);

  // Mark review as completed for subscriber
  // Also auto-deactivates subscriber if all companies have been reviewed
  const markReviewCompleted = async () => {
    if (!subscriberId || !company || !supabase || reviewCompleted) return;

    try {
      // Update subscriber_companies to mark review as completed
      const { error: updateError } = await supabase
        .from('subscriber_companies')
        .update({ review_completed_at: new Date().toISOString() })
        .eq('subscriber_id', subscriberId)
        .eq('company_id', company.id);

      if (updateError) {
        // Continue silently - don't block user experience
      } else {
        setReviewCompleted(true);

        // Check if all companies have been reviewed - auto-deactivate if so
        const { data: remaining } = await supabase
          .from('subscriber_companies')
          .select('id')
          .eq('subscriber_id', subscriberId)
          .is('review_completed_at', null);

        if (!remaining || remaining.length === 0) {
          // All companies reviewed — deactivate subscriber (no more emails needed)
          await supabase
            .from('subscribers')
            .update({ is_active: false })
            .eq('id', subscriberId);
        }
      }
    } catch (err) {
      // Continue silently
    }
  };

  // Track when review is copied
  const handleCopy = async () => {
    if (!company || !supabase) return;

    try {
      await supabase.from('generated_reviews').insert({
        company_id: company.id,
        review_text: reviewText,
        copied: true,
      });
    } catch (err) {
      // Tracking failed silently
    }
  };

  // Track when Google link is clicked - this completes the review
  const handleLinkClick = async () => {
    // Mark the review as completed for this subscriber
    await markReviewCompleted();
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button>Zur Startseite</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Already reviewed state
  if (alreadyReviewed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Vielen Dank für Ihre Bewertung!
          </h2>
          <p className="text-gray-600 dark:text-dark-300 mb-4">
            Sie haben bereits eine Bewertung für {company.name} abgegeben.
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            Sie werden keine weiteren Erinnerungen für dieses Unternehmen erhalten.
          </p>
        </Card>
      </div>
    );
  }

  // Review completed state (just completed)
  if (reviewCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Vielen Dank!
          </h2>
          <p className="text-gray-600 dark:text-dark-300 mb-4">
            Ihre Bewertung für {company.name} wurde erfasst.
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            Sie werden keine weiteren Erinnerungen für dieses Unternehmen erhalten.
          </p>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Company Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-dark-200 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </Link>

        <div className="flex items-center gap-4">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
            <p className="text-gray-600 dark:text-dark-300">Bewertung hinterlassen</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="space-y-8">
        {/* Empty state if no descriptors */}
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-dark-400">
              Für dieses Unternehmen wurden noch keine Bewertungsoptionen eingerichtet.
            </p>
          </div>
        ) : (
          <>
            {/* Descriptor Selection */}
            <DescriptorChips
              categories={categories}
              selected={selectedDescriptors}
              onToggle={handleToggle}
              maxSelections={APP_CONFIG.maxDescriptorsPerReview}
            />

            {/* Divider */}
            <hr className="border-gray-200 dark:border-dark-700" />

            {/* Review Preview */}
            <ReviewPreview
              reviewText={reviewText}
              minSelections={APP_CONFIG.minDescriptorsForReview}
              currentSelections={selectedDescriptors.size}
            />

            {/* Actions */}
            {selectedDescriptors.size >= APP_CONFIG.minDescriptorsForReview && (
              <>
                <hr className="border-gray-200 dark:border-dark-700" />
                <ReviewActions
                  reviewText={reviewText}
                  googleReviewUrl={company.google_review_link}
                  disabled={!reviewText}
                  onCopy={handleCopy}
                  onLinkClick={handleLinkClick}
                />
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// Wrapper component with Suspense for useSearchParams
export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
