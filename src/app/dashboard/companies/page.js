'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CompanyForm from '@/components/forms/CompanyForm';
import CompanyCard from '@/components/dashboard/CompanyCard';
import { useCompanyContext } from '@/contexts/CompanyContext';

/*
  Companies Management Page

  Lists all companies and provides CRUD operations.
  - View all companies
  - Add new company (opens modal or uses URL param)
  - Edit company (navigates to edit page)
  - Delete company (with confirmation)

  NOTE: useSearchParams requires Suspense boundary in Next.js 14+
  We wrap the component that uses it in Suspense to allow static generation.
*/

function CompaniesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchCompanies } = useCompanyContext();
  const showNewModal = searchParams.get('action') === 'new';

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(showNewModal);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Sync modal state with URL
  useEffect(() => {
    setShowModal(showNewModal);
  }, [showNewModal]);

  async function fetchCompanies() {
    // Handle case when Supabase isn't initialized (during build)
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      // Error handled by state
    } finally {
      setLoading(false);
    }
  }

  // Handle successful company creation
  function handleCreateSuccess(newCompany) {
    setCompanies((prev) => [newCompany, ...prev]);
    setShowModal(false);
    refetchCompanies(); // Sync the global company selector
    router.push('/dashboard/companies');
  }

  // Handle company deletion
  async function handleDelete(companyId) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      setDeleteConfirm(null);
      refetchCompanies(); // Sync the global company selector
    } catch (err) {
      // Silently fail - user can retry
    }
  }

  // Close modal and remove URL param
  function closeModal() {
    setShowModal(false);
    router.push('/dashboard/companies');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unternehmen</h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">
            Verwalten Sie Ihre Unternehmen und deren Bewertungseinstellungen
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Hinzufügen
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && companies.length === 0 && (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-dark-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Noch keine Unternehmen
          </h3>
          <p className="text-gray-500 dark:text-dark-400 mb-4">
            Beginnen Sie, indem Sie Ihr erstes Unternehmen hinzufügen.
          </p>
          <Button onClick={() => setShowModal(true)}>Erstes Unternehmen hinzufügen</Button>
        </Card>
      )}

      {/* Companies Grid — 2-column layout with prominent cards */}
      {!loading && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title="Neues Unternehmen">
        <CompanyForm onSuccess={handleCreateSuccess} onCancel={closeModal} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Unternehmen löschen"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-dark-300">
            Möchten Sie <strong className="text-gray-900 dark:text-white">{deleteConfirm?.name}</strong> wirklich löschen?
            Alle zugehörigen Beschreibungen und Daten werden ebenfalls gelöscht.
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">Diese Aktion kann nicht rückgängig gemacht werden.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm?.id)}>
              Löschen
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Wrap in Suspense to allow useSearchParams during static generation
export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    }>
      <CompaniesContent />
    </Suspense>
  );
}
