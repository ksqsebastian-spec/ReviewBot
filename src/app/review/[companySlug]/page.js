'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
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

  HOW IT WORKS:
  1. Fetches company info and descriptors from Supabase
  2. User selects descriptors by clicking chips
  3. Review is generated in real-time from selections
  4. User copies review and clicks link to Google

  DYNAMIC ROUTING:
  The [companySlug] folder name creates a dynamic route.
  useParams() gives us the actual slug from the URL.
*/

export default function ReviewPage() {
  // Get the company slug from URL
  const params = useParams();
  const companySlug = params.companySlug;

  // State management
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedDescriptors, setSelectedDescriptors] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch company and descriptors on mount
  useEffect(() => {
    async function fetchData() {
      // Handle case when Supabase isn't initialized (during build)
      if (!supabase) {
        setError('Database connection not available. Please check configuration.');
        setLoading(false);
        return;
      }

      try {
        // First, get the company by slug
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', companySlug)
          .single();

        if (companyError) throw companyError;
        if (!companyData) throw new Error('Company not found');

        setCompany(companyData);

        // Then, get categories with their descriptors
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
        console.error('Error fetching data:', err);
        setError(
          err.message === 'Company not found'
            ? 'This company was not found. Please check the URL.'
            : MESSAGES.error.generic
        );
      } finally {
        setLoading(false);
      }
    }

    if (companySlug) {
      fetchData();
    }
  }, [companySlug]);

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
  // useMemo prevents recalculating on every render
  const reviewText = useMemo(() => {
    if (selectedDescriptors.size < APP_CONFIG.minDescriptorsForReview) {
      return '';
    }

    // Find the text for each selected descriptor
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

  // Track when review is copied (for analytics)
  const handleCopy = async () => {
    if (!company || !supabase) return;

    try {
      // Record the generated review for analytics
      await supabase.from('generated_reviews').insert({
        company_id: company.id,
        review_text: reviewText,
        copied: true,
      });
    } catch (err) {
      // Don't block user experience for analytics failures
      console.error('Failed to track review copy:', err);
    }
  };

  // Track when Google link is clicked (for analytics)
  const handleLinkClick = async () => {
    // Could update the generated_review record here
    // For now, we'll keep it simple
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
            <Button>Back to Home</Button>
          </Link>
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
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to companies
        </Link>

        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {company.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600">Leave a review</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="space-y-8">
        {/* Empty state if no descriptors */}
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No review options have been set up for this company yet.
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
            <hr className="border-gray-200" />

            {/* Review Preview */}
            <ReviewPreview
              reviewText={reviewText}
              minSelections={APP_CONFIG.minDescriptorsForReview}
              currentSelections={selectedDescriptors.size}
            />

            {/* Actions */}
            {selectedDescriptors.size >= APP_CONFIG.minDescriptorsForReview && (
              <>
                <hr className="border-gray-200" />
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
