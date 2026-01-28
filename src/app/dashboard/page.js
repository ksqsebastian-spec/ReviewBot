'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import { useCompanyContext } from '@/contexts/CompanyContext';

/*
  Dashboard Overview Page

  Shows quick stats and recent activity.
  This is the first page users see when entering the dashboard.

  FEATURES:
  - Company selector to filter by specific company or view all
  - Stats: companies, subscribers, reviews generated
  - Quick actions for common tasks
  - Getting started guide for new users
*/

export default function DashboardPage() {
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  const [stats, setStats] = useState({
    companies: 0,
    subscribers: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

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
            // Check new subscribers table first, fall back to old email_subscribers
            supabase
              .from('subscriber_companies')
              .select('id', { count: 'exact', head: true })
              .eq('company_id', selectedCompanyId),
            supabase
              .from('generated_reviews')
              .select('id', { count: 'exact', head: true })
              .eq('company_id', selectedCompanyId),
          ]);

          // If subscriber_companies fails, try old table
          let subscriberCount = subscribersRes.count;
          if (subscribersRes.error) {
            const { count } = await supabase
              .from('email_subscribers')
              .select('id', { count: 'exact', head: true })
              .eq('company_id', selectedCompanyId)
              .eq('is_active', true);
            subscriberCount = count || 0;
          }

          setStats({
            companies: 1,
            subscribers: subscriberCount || 0,
            reviews: reviewsRes.count || 0,
          });
        } else {
          // Fetch global stats
          const [companiesRes, subscribersRes, reviewsRes] = await Promise.all([
            supabase.from('companies').select('id', { count: 'exact', head: true }),
            // Try new subscribers table first
            supabase.from('subscribers').select('id', { count: 'exact', head: true }),
            supabase.from('generated_reviews').select('id', { count: 'exact', head: true }),
          ]);

          // If subscribers table fails, try old email_subscribers
          let subscriberCount = subscribersRes.count;
          if (subscribersRes.error) {
            const { count } = await supabase
              .from('email_subscribers')
              .select('id', { count: 'exact', head: true })
              .eq('is_active', true);
            subscriberCount = count || 0;
          }

          setStats({
            companies: companiesRes.count || 0,
            subscribers: subscriberCount || 0,
            reviews: reviewsRes.count || 0,
          });
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

  // Auto-refresh when tab becomes visible (handles stale data)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats(false); // Don't show loading spinner for background refresh
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStats]);

  const statCards = [
    {
      label: 'Unternehmen',
      value: stats.companies,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/dashboard/companies',
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
      href: '/dashboard/subscribers',
      color: 'green',
    },
    {
      label: 'Bewertungen generiert',
      value: stats.reviews,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      href: '/dashboard/analytics',
      color: 'amber',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  // Filter stat cards when company is selected
  const displayedStatCards = selectedCompanyId
    ? statCards.filter((s) => !s.hideWhenFiltered)
    : statCards;

  return (
    <div className="space-y-8">
      {/* Page Header */}
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

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 gap-6 ${selectedCompanyId ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {displayedStatCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/companies?action=new"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors
                       dark:border-dark-700 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
          >
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Neues Unternehmen</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">Neues Unternehmen für Bewertungen einrichten</p>
            </div>
          </Link>

          <Link
            href="/dashboard/subscribers"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors
                       dark:border-dark-700 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
          >
            <div className="p-2 bg-green-100 rounded-lg text-green-600 dark:bg-green-900/40 dark:text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Abonnenten anzeigen</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">E-Mail-Liste verwalten</p>
            </div>
          </Link>
        </div>
      </Card>

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
            <li>Fügen Sie Beschreibungen hinzu, die Kunden auswählen können</li>
            <li>Teilen Sie den Bewertungslink mit Ihren Kunden</li>
          </ol>
        </Card>
      )}
    </div>
  );
}
