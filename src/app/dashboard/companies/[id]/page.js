'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AddCompanyModal from '@/components/forms/AddCompanyModal';

/*
  Company Edit Page

  Displays company details and allows editing of descriptor categories
  and individual descriptors for review generation.

  URL: /dashboard/companies/[id]
*/

export default function CompanyEditPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id;

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New category input
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // New descriptor inputs (per category)
  const [newDescriptors, setNewDescriptors] = useState({});

  // Editing category name
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Fetch company and descriptors
  const fetchData = useCallback(async () => {
    if (!supabase || !companyId) return;

    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, slug, google_review_link')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch categories with descriptors
      const { data: categoryData, error: categoryError } = await supabase
        .from('descriptor_categories')
        .select(`
          id, name, sort_order,
          descriptors ( id, text )
        `)
        .eq('company_id', companyId)
        .order('sort_order');

      if (categoryError) throw categoryError;
      setCategories(categoryData || []);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setError('Unternehmen konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setAddingCategory(true);
    try {
      const { error } = await supabase
        .from('descriptor_categories')
        .insert({
          company_id: companyId,
          name: newCategoryName.trim(),
          sort_order: categories.length,
        });

      if (error) throw error;
      setNewCategoryName('');
      fetchData();
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Kategorie:', err);
      alert('Kategorie konnte nicht hinzugefügt werden.');
    } finally {
      setAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Kategorie "${categoryName}" und alle zugehörigen Beschreibungen löschen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('descriptor_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Fehler beim Löschen der Kategorie:', err);
      alert('Kategorie konnte nicht gelöscht werden.');
    }
  };

  // Rename category
  const handleRenameCategory = async (categoryId) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('descriptor_categories')
        .update({ name: editingCategoryName.trim() })
        .eq('id', categoryId);

      if (error) throw error;
      setEditingCategoryId(null);
      setEditingCategoryName('');
      fetchData();
    } catch (err) {
      console.error('Fehler beim Umbenennen der Kategorie:', err);
      alert('Kategorie konnte nicht umbenannt werden.');
    }
  };

  // Add descriptor to category
  const handleAddDescriptor = async (categoryId) => {
    const text = newDescriptors[categoryId]?.trim();
    if (!text) return;

    try {
      const { error } = await supabase
        .from('descriptors')
        .insert({
          category_id: categoryId,
          text: text,
        });

      if (error) throw error;
      setNewDescriptors((prev) => ({ ...prev, [categoryId]: '' }));
      fetchData();
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Beschreibung:', err);
      alert('Beschreibung konnte nicht hinzugefügt werden.');
    }
  };

  // Delete descriptor
  const handleDeleteDescriptor = async (descriptorId) => {
    try {
      const { error } = await supabase
        .from('descriptors')
        .delete()
        .eq('id', descriptorId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Fehler beim Löschen der Beschreibung:', err);
      alert('Beschreibung konnte nicht gelöscht werden.');
    }
  };

  // Handle company updated via modal
  const handleCompanyUpdated = () => {
    fetchData();
    setShowEditModal(false);
  };

  // Delete company
  const handleDeleteCompany = async () => {
    if (!confirm(`Unternehmen "${company.name}" wirklich löschen? Alle Bewertungsbeschreibungen werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    setDeleting(true);
    try {
      // Delete the company (cascades to descriptor_categories and descriptors)
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Fehler beim Löschen des Unternehmens:', err);
      alert('Unternehmen konnte nicht gelöscht werden.');
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-dark-400 dark:hover:text-white"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zum Dashboard
        </Link>
        <Card className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error || 'Unternehmen nicht gefunden'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-dark-400 dark:hover:text-white"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Zurück zum Dashboard
      </Link>

      {/* Company Header */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {company.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-dark-400 font-mono">
                /review/{company.slug}
              </p>
              {company.google_review_link && (
                <a
                  href={company.google_review_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Google Bewertungslink
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(true)}
              className="text-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Bearbeiten
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeleteCompany}
              loading={deleting}
              className="text-sm !text-red-600 hover:!bg-red-50 dark:!text-red-400 dark:hover:!bg-red-900/20"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Löschen
            </Button>
          </div>
        </div>
      </Card>

      {/* Descriptor Categories Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bewertungsbeschreibungen
        </h2>
        <p className="text-sm text-gray-600 dark:text-dark-400 mb-6">
          Diese Beschreibungen werden Kunden angezeigt, um ihre Bewertung zu formulieren.
        </p>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id} className="!p-4">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                {editingCategoryId === category.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="!py-1 !text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameCategory(category.id);
                        if (e.key === 'Escape') setEditingCategoryId(null);
                      }}
                    />
                    <button
                      onClick={() => handleRenameCategory(category.id)}
                      className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      title="Speichern"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingCategoryId(null)}
                      className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 rounded"
                      title="Abbrechen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-gray-800 dark:text-dark-100">
                    {category.name}
                  </h3>
                )}

                {editingCategoryId !== category.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingCategoryName(category.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-dark-200 dark:hover:bg-dark-800 rounded"
                      title="Kategorie umbenennen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Kategorie löschen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Descriptors */}
              <div className="space-y-2">
                {category.descriptors && category.descriptors.length > 0 ? (
                  category.descriptors.map((descriptor) => (
                    <div
                      key={descriptor.id}
                      className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-dark-800 rounded-lg group"
                    >
                      <span className="text-sm text-gray-700 dark:text-dark-200">
                        {descriptor.text}
                      </span>
                      <button
                        onClick={() => handleDeleteDescriptor(descriptor.id)}
                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Beschreibung löschen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-dark-500 italic py-2">
                    Noch keine Beschreibungen
                  </p>
                )}

                {/* Add descriptor input */}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={newDescriptors[category.id] || ''}
                    onChange={(e) => setNewDescriptors((prev) => ({
                      ...prev,
                      [category.id]: e.target.value,
                    }))}
                    placeholder="Neue Beschreibung hinzufügen..."
                    className="!py-1.5 !text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddDescriptor(category.id);
                    }}
                  />
                  <Button
                    onClick={() => handleAddDescriptor(category.id)}
                    className="!py-1.5 !px-3 text-sm"
                    disabled={!newDescriptors[category.id]?.trim()}
                  >
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Empty state */}
          {categories.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-500 dark:text-dark-400">
                Noch keine Kategorien vorhanden.
              </p>
            </Card>
          )}

          {/* Add new category */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Neuer Kategoriename..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory();
              }}
            />
            <Button
              onClick={handleAddCategory}
              loading={addingCategory}
              disabled={!newCategoryName.trim()}
            >
              Kategorie hinzufügen
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Company Modal */}
      <AddCompanyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleCompanyUpdated}
        company={company}
      />
    </div>
  );
}
