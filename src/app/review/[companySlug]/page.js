'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { generateReview } from '@/lib/utils';
import { REVIEW_TEMPLATES, APP_CONFIG } from '@/lib/constants';
import { getCompanyBySlug } from '@/lib/companyData';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DescriptorChips from '@/components/review/DescriptorChips';
import ReviewPreview from '@/components/review/ReviewPreview';
import ReviewActions from '@/components/review/ReviewActions';

/*
  Review Page — Customer-Facing Review Wizard

  URL: /review/[companySlug] (e.g., /review/brink)
  Customers reach this page by scanning a QR code.

  HOW IT WORKS:
  1. Loads company info and descriptors from hardcoded data
  2. Customer selects descriptor chips that match their experience
  3. Review text is generated in real-time from selections
  4. Customer copies the review and clicks the Google Reviews link
*/

export default function ReviewPage() {
  const params = useParams();
  const companySlug = params.companySlug;

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedDescriptors, setSelectedDescriptors] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load company and descriptors from hardcoded data
  useEffect(() => {
    if (!companySlug) return;

    const companyData = getCompanyBySlug(companySlug);

    if (!companyData) {
      setError('Dieses Unternehmen wurde nicht gefunden.');
      setLoading(false);
      return;
    }

    setCompany(companyData);
    setCategories(companyData.categories || []);
    setLoading(false);
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
          <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Company Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
        <p className="text-gray-600 dark:text-dark-300 mt-1">Bewertung hinterlassen</p>
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
                />
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
