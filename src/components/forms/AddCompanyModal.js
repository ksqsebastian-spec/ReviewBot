'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/*
  CompanyModal Component (Add/Edit)

  Modal for adding a new company or editing an existing one.
  Slug is auto-generated from name (hidden from user).

  Props:
  - isOpen: boolean
  - onClose: function
  - onSuccess: function(company)
  - company: object (optional) - if provided, modal is in edit mode
*/

export default function AddCompanyModal({ isOpen, onClose, onSuccess, company = null }) {
  const isEditMode = !!company;
  const [name, setName] = useState('');
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form when editing, reset when closing
  useEffect(() => {
    if (isOpen && company) {
      setName(company.name || '');
      setGoogleReviewLink(company.google_review_link || '');
    } else if (!isOpen) {
      setName('');
      setGoogleReviewLink('');
      setError(null);
    }
  }, [isOpen, company]);

  // Generate slug from name (internal, not shown to user)
  const generateSlug = (companyName) => {
    return companyName
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const replacements = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
        return replacements[match];
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Bitte geben Sie einen Firmennamen ein.');
      return;
    }

    if (!googleReviewLink.trim()) {
      setError('Bitte geben Sie den Google Bewertungslink ein.');
      return;
    }

    setSaving(true);

    try {
      if (isEditMode) {
        // Update existing company
        const updates = {
          name: name.trim(),
          google_review_link: googleReviewLink.trim(),
        };

        // Only update slug if name changed
        if (name.trim() !== company.name) {
          updates.slug = generateSlug(name);
        }

        const { data, error: updateError } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', company.id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (onSuccess) onSuccess(data);
      } else {
        // Create new company
        const slug = generateSlug(name);
        if (!slug) {
          setError('Der Firmenname ergibt keinen gültigen URL-Slug.');
          setSaving(false);
          return;
        }

        // Check if slug already exists
        const { data: existing } = await supabase
          .from('companies')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existing) {
          setError('Ein Unternehmen mit diesem Namen existiert bereits.');
          setSaving(false);
          return;
        }

        const { data, error: insertError } = await supabase
          .from('companies')
          .insert({
            name: name.trim(),
            slug: slug,
            google_review_link: googleReviewLink.trim(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (onSuccess) onSuccess(data);
      }

      onClose();
    } catch (err) {
      console.error('CompanyModal: Fehler beim Speichern:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Unternehmen bearbeiten' : 'Neues Unternehmen'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
            Firmenname *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Muster GmbH"
            autoFocus
          />
        </div>

        {/* Google Review URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
            Google Bewertungslink *
          </label>
          <Input
            type="url"
            value={googleReviewLink}
            onChange={(e) => setGoogleReviewLink(e.target.value)}
            placeholder="https://g.page/r/..."
          />
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            Der Link zu Ihrer Google-Bewertungsseite
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button type="submit" loading={saving}>
            {isEditMode ? 'Speichern' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
