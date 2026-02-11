'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import CompanyCard from '@/components/dashboard/CompanyCard';
import QRModal from '@/components/dashboard/QRModal';
import AddCompanyModal from '@/components/forms/AddCompanyModal';
import GettingStarted from '@/components/dashboard/GettingStarted';

/*
  Dashboard Overview Page

  Displays all companies in a grid layout for easy management.
  Each company card provides quick access to:
  - QR code (click to enlarge)
  - Copy review wizard link
  - Copy/open Google Reviews link
  - Edit company or descriptors

  WHY THIS DESIGN?
  Previous design required switching between companies via a dropdown.
  New design shows everything at once, reducing cognitive load and clicks.
  Users can manage multiple companies efficiently from one view.
*/

export default function DashboardPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [qrModalCompany, setQrModalCompany] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all companies
  const fetchCompanies = useCallback(async (showLoading = true) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug, google_review_link, description, logo_url')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Dashboard: Fehler beim Laden der Unternehmen:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCompanies(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchCompanies]);

  // Handle company saved (add or edit)
  const handleCompanySaved = () => {
    fetchCompanies();
    setShowAddModal(false);
    setEditingCompany(null);
  };

  // Handle edit company
  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowAddModal(true);
  };

  // Handle delete company
  const handleDeleteCompany = async (company) => {
    if (!confirm(`Unternehmen "${company.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    setDeletingId(company.id);
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

      if (error) throw error;
      fetchCompanies();
    } catch (err) {
      console.error('Dashboard: Fehler beim Löschen des Unternehmens:', err);
      alert('Unternehmen konnte nicht gelöscht werden.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle QR code click
  const handleQRClick = (company) => {
    setQrModalCompany(company);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600"
          role="status"
          aria-label="Wird geladen"
        >
          <span className="sr-only">Wird geladen</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">
            {companies.length === 0
              ? 'Erstellen Sie Ihr erstes Unternehmen'
              : `${companies.length} ${companies.length === 1 ? 'Unternehmen' : 'Unternehmen'}`
            }
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCompany(null);
            setShowAddModal(true);
          }}
          className="text-sm px-4 py-2"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neues Unternehmen
        </Button>
      </div>

      {/* Company Grid */}
      {companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onQRClick={handleQRClick}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
            />
          ))}
        </div>
      ) : (
        <GettingStarted />
      )}

      {/* Add/Edit Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCompany(null);
        }}
        onSuccess={handleCompanySaved}
        company={editingCompany}
      />

      {/* QR Code Modal */}
      <QRModal
        isOpen={!!qrModalCompany}
        onClose={() => setQrModalCompany(null)}
        company={qrModalCompany}
      />
    </div>
  );
}
