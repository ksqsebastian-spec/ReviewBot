'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';

/*
  Analytics Dashboard

  Shows review generation statistics and projections.

  METRICS DISPLAYED:
  - Total reviews generated
  - Reviews by company
  - Conversion rate (copied reviews)
  - Growth trends
  - SEO benefit projection
*/

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalReviews: 0,
    copiedReviews: 0,
    totalSubscribers: 0,
    reviewsByCompany: [],
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      // Handle case when Supabase isn't initialized (during build)
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Total reviews and copied count
        const { data: reviewData } = await supabase
          .from('generated_reviews')
          .select('id, copied, company_id, created_at');

        const totalReviews = reviewData?.length || 0;
        const copiedReviews = reviewData?.filter((r) => r.copied).length || 0;

        // Reviews by company
        const { data: companyReviews } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            generated_reviews (id)
          `);

        const reviewsByCompany = (companyReviews || [])
          .map((c) => ({
            name: c.name,
            count: c.generated_reviews?.length || 0,
          }))
          .sort((a, b) => b.count - a.count);

        // Total subscribers
        const { count: subscriberCount } = await supabase
          .from('email_subscribers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);

        // Recent reviews (last 10)
        const { data: recent } = await supabase
          .from('generated_reviews')
          .select(`
            id,
            review_text,
            created_at,
            companies (name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        setStats({
          totalReviews,
          copiedReviews,
          totalSubscribers: subscriberCount || 0,
          reviewsByCompany,
        });
        setRecentReviews(recent || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Calculate conversion rate
  const conversionRate = stats.totalReviews > 0
    ? Math.round((stats.copiedReviews / stats.totalReviews) * 100)
    : 0;

  // SEO projection (estimated based on typical review impact)
  const estimatedSeoBoost = stats.copiedReviews * 2; // ~2% visibility increase per review

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your review generation performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Reviews Generated</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Reviews Copied</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.copiedReviews}</p>
          <p className="text-xs text-gray-500 mt-1">
            {conversionRate}% conversion rate
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Email Subscribers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSubscribers}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <p className="text-sm text-green-700">Est. SEO Impact</p>
          <p className="text-3xl font-bold text-green-800 mt-1">+{estimatedSeoBoost}%</p>
          <p className="text-xs text-green-600 mt-1">
            Local search visibility
          </p>
        </Card>
      </div>

      {/* Reviews by Company */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews by Company</h2>
        {stats.reviewsByCompany.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {stats.reviewsByCompany.map((company, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{company.name}</span>
                    <span className="text-sm text-gray-500">{company.count} reviews</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 ? (company.count / stats.totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Growth Projection */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Projected Growth</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">If you get 10 more reviews</p>
            <p className="text-2xl font-bold text-gray-900">+20%</p>
            <p className="text-xs text-gray-500">local search visibility</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">If you get 25 more reviews</p>
            <p className="text-2xl font-bold text-gray-900">+50%</p>
            <p className="text-xs text-gray-500">local search visibility</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">If you get 50 more reviews</p>
            <p className="text-2xl font-bold text-gray-900">+100%</p>
            <p className="text-xs text-gray-500">local search visibility</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * Estimates based on typical Google local ranking factors. Actual results may vary.
        </p>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews generated yet</p>
        ) : (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {review.companies?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{review.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips for More Reviews */}
      <Card className="bg-amber-50 border-amber-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Tips for More Reviews</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Place QR codes at checkout, reception, or on receipts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Ask satisfied customers directly to leave a review</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Send follow-up emails 1-2 days after service</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Respond to all reviews (positive and negative)</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
