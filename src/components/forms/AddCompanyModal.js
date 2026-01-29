'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/*
  AddCompanyModal Component

  Simple modal for adding a new company directly from the dashboard.
  Slug is auto-generated from name (hidden from user).
*/

export default function AddCompanyModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setGoogleReviewUrl('');
      setError(null);
    }
  }, [isOpen]);

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

    const slug = generateSlug(name);
    if (!slug) {
      setError('Der Firmenname ergibt keinen gültigen URL-Slug.');
      return;
    }

    setSaving(true);

    try {
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

      // Create company
      const { data, error: insertError } = await supabase
        .from('companies')
        .insert({
          name: name.trim(),
          slug: slug,
          google_review_url: googleReviewUrl.trim() || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Success - notify parent and close
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neues Unternehmen">
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
            Google Bewertungslink
          </label>
          <Input
            type="url"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
          />
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            Optional: Link zur Google-Bewertungsseite
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
            Erstellen
          </Button>
        </div>
      </form>
    </Modal>
  );
}
