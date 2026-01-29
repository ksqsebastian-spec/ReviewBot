'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { useCompanyContext } from '@/contexts/CompanyContext';
import AddCompanyModal from '@/components/forms/AddCompanyModal';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ReviewsTable from '@/components/dashboard/ReviewsTable';
import GettingStarted from '@/components/dashboard/GettingStarted';

/*
  Dashboard Overview Page

  Shows quick stats and review tracking.
  Components extracted to keep this file under 150 lines:
  - StatsGrid: Stat cards display
  - ReviewsTable: Reviews by company table
  - GettingStarted: Welcome guide for new users
*/

export default function DashboardPage() {
  const { selectedCompanyId, selectedCompany, refetchCompanies } = useCompanyContext();
  const [stats, setStats] = useState({ companies: 0, subscribers: 0, reviews: 0, pendingReviews: 0 });
  const [reviewsByCompany, setReviewsByCompany] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  const fetchStats = useCallback(async (showLoading = true) => {
    if (!supabase) { setLoading(false); return; }
    if (showLoading) setLoading(true);

    try {
      if (selectedCompanyId) {
        const [subscribersRes, reviewsRes, pendingRes] = await Promise.all([
          supabase.from('subscriber_companies').select('id', { count: 'exact', head: true }).eq('company_id', selectedCompanyId),
          supabase.from('generated_reviews').select('id', { count: 'exact', head: true }).eq('company_id', selectedCompanyId),
          supabase.from('subscriber_companies').select('id', { count: 'exact', head: true }).eq('company_id', selectedCompanyId).is('review_completed_at', null),
        ]);
        setStats({ companies: 1, subscribers: subscribersRes.count || 0, reviews: reviewsRes.count || 0, pendingReviews: pendingRes.count || 0 });
      } else {
        const [companiesRes, subscribersRes, reviewsRes, pendingRes] = await Promise.all([
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('subscribers').select('id', { count: 'exact', head: true }),
          supabase.from('generated_reviews').select('id', { count: 'exact', head: true }),
          supabase.from('subscriber_companies').select('id', { count: 'exact', head: true }).is('review_completed_at', null),
        ]);
        setStats({ companies: companiesRes.count || 0, subscribers: subscribersRes.count || 0, reviews: reviewsRes.count || 0, pendingReviews: pendingRes.count || 0 });

        const { data: subscriptionData } = await supabase
          .from('subscriber_companies')
          .select(`company_id, review_completed_at, next_notification_at, companies (id, name), subscribers (is_active)`);

        if (subscriptionData) {
          const now = new Date();
          const companyMap = {};
          subscriptionData.forEach((sub) => {
            if (!sub.companies || !sub.subscribers?.is_active) return;
            const companyId = sub.company_id;
            if (!companyMap[companyId]) {
              companyMap[companyId] = { id: companyId, name: sub.companies.name, dueNow: 0, pending: 0, completed: 0 };
            }
            if (sub.review_completed_at) {
              companyMap[companyId].completed++;
            } else {
              companyMap[companyId].pending++;
              if (sub.next_notification_at && new Date(sub.next_notification_at) <= now) companyMap[companyId].dueNow++;
            }
          });
          setReviewsByCompany(Object.values(companyMap).sort((a, b) => b.dueNow - a.dueNow));
        }
      }
    } catch (err) {
      console.error('Dashboard: Fehler beim Laden der Statistiken:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') fetchStats(false); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStats]);

  const handleCompanyCreated = () => { fetchStats(); if (refetchCompanies) refetchCompanies(); };

  const handleCleanupInactive = async () => {
    if (!supabase) return;
    setCleaningUp(true);
    setCleanupResult(null);

    try {
      const { data: subscribers, error: fetchError } = await supabase
        .from('subscribers')
        .select(`id, subscriber_companies (review_completed_at)`)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const toDeactivate = (subscribers || []).filter(
        (sub) => sub.subscriber_companies.length > 0 && sub.subscriber_companies.every((sc) => sc.review_completed_at !== null)
      );

      if (toDeactivate.length === 0) {
        setCleanupResult({ count: 0, message: 'Keine inaktiven Abonnenten gefunden.' });
        return;
      }

      const { error: updateError } = await supabase.from('subscribers').update({ is_active: false }).in('id', toDeactivate.map((s) => s.id));
      if (updateError) throw updateError;

      setCleanupResult({ count: toDeactivate.length, message: `${toDeactivate.length} Abonnent${toDeactivate.length > 1 ? 'en' : ''} deaktiviert.` });
      fetchStats(false);
    } catch (err) {
      console.error('Dashboard: Fehler beim Bereinigen:', err);
      setCleanupResult({ count: 0, message: 'Fehler beim Bereinigen: ' + err.message });
    } finally {
      setCleaningUp(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany ? selectedCompany.name : 'Dashboard'}</h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">{selectedCompanyId ? 'Statistiken für ausgewähltes Unternehmen' : 'Übersicht Ihrer Review-Plattform'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleCleanupInactive} disabled={cleaningUp}>
            <svg className={`w-5 h-5 mr-2 ${cleaningUp ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {cleaningUp ? 'Bereinigen...' : 'Inaktive Abonnenten entfernen'}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neues Unternehmen
          </Button>
        </div>
      </div>

      {cleanupResult && (
        <div className={`p-4 rounded-lg ${cleanupResult.count > 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-50 text-gray-600 dark:bg-dark-800 dark:text-dark-300'}`}>
          {cleanupResult.message}
        </div>
      )}

      <StatsGrid stats={stats} loading={loading} selectedCompanyId={selectedCompanyId} />
      {!selectedCompanyId && <ReviewsTable reviewsByCompany={reviewsByCompany} />}
      {!loading && stats.companies === 0 && !selectedCompanyId && <GettingStarted />}
      <AddCompanyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleCompanyCreated} />
    </div>
  );
}
