'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import CompanyForm from '@/components/forms/CompanyForm';
import QRCode from '@/components/ui/QRCode';

/*
  Company Edit Page

  Edit company details and manage descriptors (the phrases customers select).

  SECTIONS:
  1. Company Info - edit name, links, etc.
  2. Descriptors - manage categories and phrases
  3. QR Code - for sharing the review link
*/

export default function CompanyEditPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id;

  // State
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDescriptor, setNewDescriptor] = useState({ categoryId: null, text: '' });

  // Fetch company and descriptors
  useEffect(() => {
    async function fetchData() {
      // Handle case when Supabase isn't initialized (during build)
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Fetch company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // Fetch categories with descriptors
        const { data: categoryData, error: categoryError } = await supabase
          .from('descriptor_categories')
          .select(`
            id,
            name,
            sort_order,
            descriptors (
              id,
              text
            )
          `)
          .eq('company_id', companyId)
          .order('sort_order');

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);
      } catch (err) {
        // Error handled by state
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  // Company update handlers
  function handleCompanyUpdate(updatedCompany) {
    setCompany(updatedCompany);
    setShowEditModal(false);
  }

  // Category handlers
  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('descriptor_categories')
        .insert({
          company_id: companyId,
          name: newCategoryName.trim(),
          sort_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) => [...prev, { ...data, descriptors: [] }]);
      setNewCategoryName('');
    } catch (err) {
      // Silently fail
    }
  }

  async function handleUpdateCategory(categoryId, newName) {
    try {
      const { error } = await supabase
        .from('descriptor_categories')
        .update({ name: newName })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, name: newName } : cat))
      );
      setEditingCategory(null);
    } catch (err) {
      // Silently fail
    }
  }

  async function handleDeleteCategory(categoryId) {
    if (!confirm('Diese Kategorie und alle zugehörigen Beschreibungen löschen?')) return;

    try {
      const { error } = await supabase
        .from('descriptor_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (err) {
      // Silently fail
    }
  }

  // Descriptor handlers
  async function handleAddDescriptor(categoryId) {
    if (!newDescriptor.text.trim() || newDescriptor.categoryId !== categoryId) return;

    try {
      const { data, error } = await supabase
        .from('descriptors')
        .insert({
          category_id: categoryId,
          text: newDescriptor.text.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, descriptors: [...cat.descriptors, data] }
            : cat
        )
      );
      setNewDescriptor({ categoryId: null, text: '' });
    } catch (err) {
      // Silently fail
    }
  }

  async function handleDeleteDescriptor(categoryId, descriptorId) {
    try {
      const { error } = await supabase
        .from('descriptors')
        .delete()
        .eq('id', descriptorId);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, descriptors: cat.descriptors.filter((d) => d.id !== descriptorId) }
            : cat
        )
      );
    } catch (err) {
      // Silently fail
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  // Not found state
  if (!company) {
    return (
      <Card className="text-center">
        <p className="text-gray-600 dark:text-dark-400 mb-4">Unternehmen nicht gefunden</p>
        <Link href="/dashboard/companies">
          <Button>Zurück zu Unternehmen</Button>
        </Link>
      </Card>
    );
  }

  const reviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/review/${company.slug}`
    : `/review/${company.slug}`;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/companies"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-dark-200 mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu Unternehmen
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
        </div>
        <Button onClick={() => setShowEditModal(true)}>Unternehmen bearbeiten</Button>
      </div>

      {/* Company Info Card */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-gray-600 dark:text-dark-300">{company.description || 'Keine Beschreibung'}</p>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                Bewertungslink: <span className="font-mono">/review/{company.slug}</span>
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <QRCode url={reviewUrl} size={100} />
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-2">Scannen für Bewertungsseite</p>
          </div>
        </div>
      </Card>

      {/* Descriptors Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bewertungsbeschreibungen</h2>
        <p className="text-gray-600 dark:text-dark-400 mb-6">
          Diese Phrasen können Kunden beim Schreiben von Bewertungen auswählen.
          Organisieren Sie sie in Kategorien für eine bessere Nutzererfahrung.
        </p>

        {/* Category List */}
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category.id}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <Input
                      defaultValue={category.name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateCategory(category.id, e.target.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingCategory(null);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      variant="secondary"
                      onClick={() => setEditingCategory(null)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCategory(category.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-dark-400 dark:hover:text-dark-200 dark:hover:bg-dark-700 rounded"
                    title="Kategorie umbenennen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-dark-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 rounded"
                    title="Kategorie löschen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Descriptors */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category.descriptors.map((descriptor) => (
                  <div
                    key={descriptor.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-dark-700 rounded-full text-sm text-gray-800 dark:text-dark-200 group"
                  >
                    <span>{descriptor.text}</span>
                    <button
                      onClick={() => handleDeleteDescriptor(category.id, descriptor.id)}
                      className="p-0.5 text-gray-400 hover:text-red-600 dark:text-dark-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {category.descriptors.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-dark-500 italic">Noch keine Beschreibungen</p>
                )}
              </div>

              {/* Add Descriptor Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Neue Beschreibung hinzufügen..."
                  value={newDescriptor.categoryId === category.id ? newDescriptor.text : ''}
                  onChange={(e) => setNewDescriptor({ categoryId: category.id, text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDescriptor(category.id);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAddDescriptor(category.id)}
                  disabled={!newDescriptor.text.trim() || newDescriptor.categoryId !== category.id}
                >
                  Hinzufügen
                </Button>
              </div>
            </Card>
          ))}

          {/* Add Category */}
          <Card className="border-dashed">
            <div className="flex gap-2">
              <Input
                placeholder="Neuer Kategoriename..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                Kategorie hinzufügen
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Company Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Unternehmen bearbeiten">
        <CompanyForm
          company={company}
          onSuccess={handleCompanyUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
}
