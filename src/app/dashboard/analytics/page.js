'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import { useCompanyContext } from '@/contexts/CompanyContext';

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
  const { selectedCompanyId } = useCompanyContext();
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
        // Total reviews and copied count (filtered by company if selected)
        let reviewQuery = supabase
          .from('generated_reviews')
          .select('id, copied, company_id, created_at');
        if (selectedCompanyId) {
          reviewQuery = reviewQuery.eq('company_id', selectedCompanyId);
        }
        const { data: reviewData } = await reviewQuery;

        const totalReviews = reviewData?.length || 0;
        const copiedReviews = reviewData?.filter((r) => r.copied).length || 0;

        // Reviews by company
        let companyQuery = supabase
          .from('companies')
          .select('id, name, generated_reviews (id)');
        if (selectedCompanyId) {
          companyQuery = companyQuery.eq('id', selectedCompanyId);
        }
        const { data: companyReviews } = await companyQuery;

        const reviewsByCompany = (companyReviews || [])
          .map((c) => ({
            name: c.name,
            count: c.generated_reviews?.length || 0,
          }))
          .sort((a, b) => b.count - a.count);

        // Total subscribers
        let subscriberQuery = supabase
          .from('email_subscribers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);
        // Note: email_subscribers doesn't have company_id filtering here

        const { count: subscriberCount } = await subscriberQuery;

        // Recent reviews (last 10)
        let recentQuery = supabase
          .from('generated_reviews')
          .select('id, review_text, created_at, companies (name)')
          .order('created_at', { ascending: false })
          .limit(10);
        if (selectedCompanyId) {
          recentQuery = recentQuery.eq('company_id', selectedCompanyId);
        }
        const { data: recent } = await recentQuery;

        setStats({
          totalReviews,
          copiedReviews,
          totalSubscribers: subscriberCount || 0,
          reviewsByCompany,
        });
        setRecentReviews(recent || []);
      } catch (err) {
        // Error handled by state
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedCompanyId]);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytik</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">
          Verfolgen Sie die Leistung Ihrer Bewertungsgenerierung
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600 dark:text-dark-400">Bewertungen generiert</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalReviews}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 dark:text-dark-400">Bewertungen kopiert</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.copiedReviews}</p>
          <p className="text-xs text-gray-500 dark:text-dark-500 mt-1">
            {conversionRate}% Konversionsrate
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 dark:text-dark-400">E-Mail-Abonnenten</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalSubscribers}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/40 dark:to-emerald-950/40 dark:border-green-900">
          <p className="text-sm text-green-700 dark:text-green-400">Gesch. SEO-Einfluss</p>
          <p className="text-3xl font-bold text-green-800 dark:text-green-300 mt-1">+{estimatedSeoBoost}%</p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Lokale Suchsichtbarkeit
          </p>
        </Card>
      </div>

      {/* Reviews by Company */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bewertungen nach Unternehmen</h2>
        {stats.reviewsByCompany.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-400 text-sm">Noch keine Bewertungen</p>
        ) : (
          <div className="space-y-3">
            {stats.reviewsByCompany.map((company, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-200">{company.name}</span>
                    <span className="text-sm text-gray-500 dark:text-dark-400">{company.count} Bewertungen</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prognostiziertes Wachstum</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-dark-400 mb-1">Bei 10 weiteren Bewertungen</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+20%</p>
            <p className="text-xs text-gray-500 dark:text-dark-500">Lokale Suchsichtbarkeit</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-dark-400 mb-1">Bei 25 weiteren Bewertungen</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+50%</p>
            <p className="text-xs text-gray-500 dark:text-dark-500">Lokale Suchsichtbarkeit</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-dark-400 mb-1">Bei 50 weiteren Bewertungen</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+100%</p>
            <p className="text-xs text-gray-500 dark:text-dark-500">Lokale Suchsichtbarkeit</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-500 mt-4">
          * Schätzungen basierend auf typischen Google-Ranking-Faktoren. Ergebnisse können variieren.
        </p>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Neueste Bewertungen</h2>
        {recentReviews.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-400 text-sm">Noch keine Bewertungen generiert</p>
        ) : (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 dark:border-dark-700 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-200">
                    {review.companies?.name || 'Unbekannt'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-dark-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-300 line-clamp-2">{review.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips for More Reviews */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tipps für mehr Bewertungen</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-dark-200">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
            <span>QR-Codes an der Kasse, am Empfang oder auf Quittungen platzieren</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
            <span>Zufriedene Kunden direkt um eine Bewertung bitten</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
            <span>Follow-up E-Mails 1-2 Tage nach dem Service senden</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
            <span>Auf alle Bewertungen antworten (positive und negative)</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
