'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCompanyContext } from '@/contexts/CompanyContext';
import AddCompanyModal from '@/components/forms/AddCompanyModal';
import GettingStarted from '@/components/dashboard/GettingStarted';

/*
  Dashboard Overview Page

  Simple dashboard showing companies and generated reviews.
  QR codes are managed via the QRCodePanel sidebar.
*/

export default function DashboardPage() {
  const { selectedCompanyId, selectedCompany, refetchCompanies, companies } = useCompanyContext();
  const [stats, setStats] = useState({ companies: 0, reviews: 0 });
  const [reviewsByCompany, setReviewsByCompany] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [resetting, setResetting] = useState(false);

  const fetchStats = useCallback(async (showLoading = true) => {
    if (!supabase) { setLoading(false); return; }
    if (showLoading) setLoading(true);

    try {
      if (selectedCompanyId) {
        const { count: reviewCount } = await supabase
          .from('generated_reviews')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', selectedCompanyId);

        setStats({ companies: 1, reviews: reviewCount || 0 });
      } else {
        const [companiesRes, reviewsRes] = await Promise.all([
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('generated_reviews').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          companies: companiesRes.count || 0,
          reviews: reviewsRes.count || 0,
        });

        // Fetch reviews per company for the table
        const { data: reviewData } = await supabase
          .from('generated_reviews')
          .select('company_id, companies (id, name)')
          .not('company_id', 'is', null);

        if (reviewData) {
          const companyMap = {};
          reviewData.forEach((review) => {
            if (!review.companies) return;
            const companyId = review.company_id;
            if (!companyMap[companyId]) {
              companyMap[companyId] = { id: companyId, name: review.companies.name, count: 0 };
            }
            companyMap[companyId].count++;
          });
          setReviewsByCompany(Object.values(companyMap).sort((a, b) => b.count - a.count));
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

  const handleCompanySaved = () => {
    fetchStats();
    if (refetchCompanies) refetchCompanies();
    setEditingCompany(null);
  };

  const handleResetReviews = async () => {
    if (!confirm('Alle generierten Bewertungen löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setResetting(true);
    try {
      const { error } = await supabase.from('generated_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      fetchStats();
    } catch (err) {
      console.error('Dashboard: Fehler beim Zurücksetzen:', err);
      alert('Fehler beim Zurücksetzen der Bewertungen.');
    } finally {
      setResetting(false);
    }
  };

  const handleEditCompany = () => {
    if (selectedCompany) {
      // Find full company data from companies list
      const fullCompany = companies.find(c => c.id === selectedCompanyId);
      setEditingCompany(fullCompany || selectedCompany);
      setShowAddModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCompany ? selectedCompany.name : 'Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {selectedCompanyId ? 'Statistiken für ausgewähltes Unternehmen' : 'Übersicht Ihrer Review-Plattform'}
            </p>
          </div>
          {/* Edit button when company selected */}
          {selectedCompany && (
            <button
              onClick={handleEditCompany}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
              title="Unternehmen bearbeiten"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {/* Reset reviews button */}
          <Button
            variant="secondary"
            onClick={handleResetReviews}
            loading={resetting}
            className="text-sm px-3 py-2"
            title="Testdaten löschen"
          >
            <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </Button>
          {/* Add company button */}
          <Button onClick={() => { setEditingCompany(null); setShowAddModal(true); }} className="text-sm px-3 py-2 sm:px-4 sm:py-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Neues Unternehmen</span>
            <span className="sm:hidden">Neu</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-4 ${selectedCompanyId ? '' : 'sm:grid-cols-2'}`}>
        {!selectedCompanyId && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-400">Unternehmen</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.companies}
                </p>
              </div>
            </div>
          </Card>
        )}
        <Card className={selectedCompanyId ? 'col-span-2' : ''}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-400">Bewertungen generiert</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.reviews}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reviews by Company - hidden on mobile */}
      {!selectedCompanyId && reviewsByCompany.length > 0 && (
        <Card className="hidden sm:block">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bewertungen pro Unternehmen
          </h2>
          <div className="space-y-2">
            {reviewsByCompany.map((company) => (
              <div key={company.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-800 last:border-0">
                <span className="font-medium text-gray-900 dark:text-white">{company.name}</span>
                <span className="text-sm px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {company.count} {company.count === 1 ? 'Bewertung' : 'Bewertungen'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Getting Started */}
      {!loading && stats.companies === 0 && !selectedCompanyId && <GettingStarted />}

      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingCompany(null); }}
        onSuccess={handleCompanySaved}
        company={editingCompany}
      />
    </div>
  );
}
