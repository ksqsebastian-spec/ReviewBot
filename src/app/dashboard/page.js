'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCompanyContext } from '@/contexts/CompanyContext';
import AddCompanyModal from '@/components/forms/AddCompanyModal';

/*
  Dashboard Overview Page - Simplified

  Shows quick stats and review tracking.
  This is the main page users see when entering the dashboard.

  FEATURES:
  - Stats: companies, subscribers, reviews generated, pending reviews
  - Add Company button (opens modal)
  - Cleanup inactive subscribers button
  - Reviews due per company table
*/

export default function DashboardPage() {
  const { selectedCompanyId, selectedCompany, refetchCompanies } = useCompanyContext();
  const [stats, setStats] = useState({
    companies: 0,
    subscribers: 0,
    reviews: 0,
    pendingReviews: 0,
  });
  const [reviewsByCompany, setReviewsByCompany] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  // Fetch stats function (memoized for reuse)
  const fetchStats = useCallback(async (showLoading = true) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      if (selectedCompanyId) {
        // Fetch stats for specific company
        const [subscribersRes, reviewsRes] = await Promise.all([
          supabase
            .from('subscriber_companies')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', selectedCompanyId),
          supabase
            .from('generated_reviews')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', selectedCompanyId),
        ]);

        let subscriberCount = subscribersRes.count;
        if (subscribersRes.error) {
          const { count } = await supabase
            .from('email_subscribers')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', selectedCompanyId)
            .eq('is_active', true);
          subscriberCount = count || 0;
        }

        // Count pending reviews for this company
        const { count: pendingCount } = await supabase
          .from('subscriber_companies')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', selectedCompanyId)
          .is('review_completed_at', null);

        setStats({
          companies: 1,
          subscribers: subscriberCount || 0,
          reviews: reviewsRes.count || 0,
          pendingReviews: pendingCount || 0,
        });
      } else {
        // Fetch global stats
        const [companiesRes, subscribersRes, reviewsRes] = await Promise.all([
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('subscribers').select('id', { count: 'exact', head: true }),
          supabase.from('generated_reviews').select('id', { count: 'exact', head: true }),
        ]);

        let subscriberCount = subscribersRes.count;
        if (subscribersRes.error) {
          const { count } = await supabase
            .from('email_subscribers')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);
          subscriberCount = count || 0;
        }

        // Count all pending reviews (no review_completed_at)
        const { count: pendingCount } = await supabase
          .from('subscriber_companies')
          .select('id', { count: 'exact', head: true })
          .is('review_completed_at', null);

        setStats({
          companies: companiesRes.count || 0,
          subscribers: subscriberCount || 0,
          reviews: reviewsRes.count || 0,
          pendingReviews: pendingCount || 0,
        });

        // Fetch reviews due per company
        const { data: subscriptionData } = await supabase
          .from('subscriber_companies')
          .select(`
            company_id,
            review_completed_at,
            next_notification_at,
            companies (id, name),
            subscribers (is_active)
          `);

        if (subscriptionData) {
          const now = new Date();
          const companyMap = {};

          subscriptionData.forEach((sub) => {
            if (!sub.companies || !sub.subscribers?.is_active) return;

            const companyId = sub.company_id;
            if (!companyMap[companyId]) {
              companyMap[companyId] = {
                id: companyId,
                name: sub.companies.name,
                dueNow: 0,
                pending: 0,
                completed: 0,
              };
            }

            if (sub.review_completed_at) {
              companyMap[companyId].completed++;
            } else {
              companyMap[companyId].pending++;
              if (sub.next_notification_at && new Date(sub.next_notification_at) <= now) {
                companyMap[companyId].dueNow++;
              }
            }
          });

          setReviewsByCompany(Object.values(companyMap).sort((a, b) => b.dueNow - a.dueNow));
        }
      }
    } catch (err) {
      // Error handled by state
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  // Fetch on mount and when company changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStats]);

  // Handle successful company creation
  const handleCompanyCreated = () => {
    fetchStats();
    if (refetchCompanies) refetchCompanies();
  };

  // Cleanup inactive subscribers (those who completed all their reviews)
  const handleCleanupInactive = async () => {
    if (!supabase) return;

    setCleaningUp(true);
    setCleanupResult(null);

    try {
      // Find all active subscribers with their company subscriptions
      const { data: subscribers, error: fetchError } = await supabase
        .from('subscribers')
        .select(`
          id,
          subscriber_companies (review_completed_at)
        `)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      // Filter to those where ALL companies have been reviewed
      const toDeactivate = (subscribers || []).filter(
        (sub) =>
          sub.subscriber_companies.length > 0 &&
          sub.subscriber_companies.every((sc) => sc.review_completed_at !== null)
      );

      if (toDeactivate.length === 0) {
        setCleanupResult({ count: 0, message: 'Keine inaktiven Abonnenten gefunden.' });
        return;
      }

      // Deactivate them
      const ids = toDeactivate.map((sub) => sub.id);
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ is_active: false })
        .in('id', ids);

      if (updateError) throw updateError;

      setCleanupResult({
        count: toDeactivate.length,
        message: `${toDeactivate.length} Abonnent${toDeactivate.length > 1 ? 'en' : ''} deaktiviert.`,
      });

      // Refresh stats
      fetchStats(false);
    } catch (err) {
      setCleanupResult({ count: 0, message: 'Fehler beim Bereinigen: ' + err.message });
    } finally {
      setCleaningUp(false);
    }
  };

  const statCards = [
    {
      label: 'Unternehmen',
      value: stats.companies,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'blue',
      hideWhenFiltered: true,
    },
    {
      label: 'Abonnenten',
      value: stats.subscribers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: 'Ausstehende Bewertungen',
      value: stats.pendingReviews,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      label: 'Bewertungen generiert',
      value: stats.reviews,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'amber',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const displayedStatCards = selectedCompanyId
    ? statCards.filter((s) => !s.hideWhenFiltered)
    : statCards;

  return (
    <div className="space-y-8">
      {/* Page Header with Add Company Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCompany ? selectedCompany.name : 'Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">
            {selectedCompanyId
              ? 'Statistiken für ausgewähltes Unternehmen'
              : 'Übersicht Ihrer Review-Plattform'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleCleanupInactive}
            disabled={cleaningUp}
          >
            {cleaningUp ? (
              <>
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Bereinigen...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Inaktive Abonnenten entfernen
              </>
            )}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neues Unternehmen
          </Button>
        </div>
      </div>

      {/* Cleanup Result Message */}
      {cleanupResult && (
        <div className={`p-4 rounded-lg ${cleanupResult.count > 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-50 text-gray-600 dark:bg-dark-800 dark:text-dark-300'}`}>
          {cleanupResult.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 gap-6 ${selectedCompanyId ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
        {displayedStatCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-dark-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reviews Due Per Company */}
      {!selectedCompanyId && reviewsByCompany.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bewertungen pro Unternehmen
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-dark-300">Unternehmen</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-dark-300">Jetzt fällig</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-dark-300">Ausstehend</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-dark-300">Abgeschlossen</th>
                </tr>
              </thead>
              <tbody>
                {reviewsByCompany.map((company) => (
                  <tr key={company.id} className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50">
                    <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">{company.name}</td>
                    <td className="py-3 px-2 text-center">
                      {company.dueNow > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {company.dueNow}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-dark-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {company.pending}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {company.completed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Getting Started Guide (shown when no companies) */}
      {!loading && stats.companies === 0 && !selectedCompanyId && (
        <Card className="border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/30">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erste Schritte
          </h2>
          <p className="text-gray-600 dark:text-dark-300 mb-4">
            Willkommen bei Review Bot! So richten Sie Ihr erstes Unternehmen ein:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-dark-200">
            <li>Klicken Sie oben auf &quot;Neues Unternehmen&quot;</li>
            <li>Geben Sie den Firmennamen und den Google-Bewertungslink ein</li>
            <li>Teilen Sie den QR-Code auf der Startseite mit Ihren Kunden</li>
          </ol>
        </Card>
      )}

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleCompanyCreated}
      />
    </div>
  );
}
