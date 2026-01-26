'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CompanyForm from '@/components/forms/CompanyForm';

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
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle successful company creation
  function handleCreateSuccess(newCompany) {
    setCompanies((prev) => [newCompany, ...prev]);
    setShowModal(false);
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
    } catch (err) {
      console.error('Error deleting company:', err);
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
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">
            Manage your businesses and their review settings
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Company
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
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No companies yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first company.
          </p>
          <Button onClick={() => setShowModal(true)}>Add Your First Company</Button>
        </Card>
      )}

      {/* Companies List */}
      {!loading && companies.length > 0 && (
        <div className="grid gap-4">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo or initial */}
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-600">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Company info */}
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">/review/{company.slug}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/review/${company.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View review page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                  <Link
                    href={`/dashboard/companies/${company.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit company"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(company)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete company"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title="Add New Company">
        <CompanyForm onSuccess={handleCreateSuccess} onCancel={closeModal} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Company"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
            This will also delete all associated descriptors and data.
          </p>
          <p className="text-sm text-red-600">This action cannot be undone.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm?.id)}>
              Delete Company
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
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
