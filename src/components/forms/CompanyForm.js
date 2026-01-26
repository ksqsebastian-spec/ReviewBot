'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createSlug } from '@/lib/utils';
import { DEFAULT_DESCRIPTOR_CATEGORIES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/*
  CompanyForm Component

  Form for creating and editing companies.
  Handles both new companies and editing existing ones.

  FEATURES:
  - Auto-generates URL slug from company name
  - Validates required fields
  - Option to add default descriptors for new companies
  - Handles form submission and error states
*/

/**
 * @param {Object} props
 * @param {Object} props.company - Existing company data (for editing) or null
 * @param {Function} props.onSuccess - Called after successful save with company data
 * @param {Function} props.onCancel - Called when form is cancelled
 */
export default function CompanyForm({ company = null, onSuccess, onCancel }) {
  const isEditing = !!company;

  // Form state
  const [formData, setFormData] = useState({
    name: company?.name || '',
    slug: company?.slug || '',
    google_review_link: company?.google_review_link || '',
    description: company?.description || '',
    logo_url: company?.logo_url || '',
  });
  const [addDefaultDescriptors, setAddDefaultDescriptors] = useState(!isEditing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-generate slug from name (only for new companies)
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: createSlug(formData.name),
      }));
    }
  }, [formData.name, isEditing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Company name is required');
      setLoading(false);
      return;
    }
    if (!formData.google_review_link.trim()) {
      setError('Google review link is required');
      setLoading(false);
      return;
    }

    // Handle case when Supabase isn't initialized
    if (!supabase) {
      setError('Database connection not available. Please check configuration.');
      setLoading(false);
      return;
    }

    try {
      let savedCompany;

      if (isEditing) {
        // Update existing company
        const { data, error: updateError } = await supabase
          .from('companies')
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            google_review_link: formData.google_review_link.trim(),
            description: formData.description.trim(),
            logo_url: formData.logo_url.trim() || null,
          })
          .eq('id', company.id)
          .select()
          .single();

        if (updateError) throw updateError;
        savedCompany = data;
      } else {
        // Create new company
        const { data, error: insertError } = await supabase
          .from('companies')
          .insert({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            google_review_link: formData.google_review_link.trim(),
            description: formData.description.trim(),
            logo_url: formData.logo_url.trim() || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        savedCompany = data;

        // Add default descriptors if requested
        if (addDefaultDescriptors && savedCompany) {
          await addDefaultDescriptorsToCompany(savedCompany.id);
        }
      }

      onSuccess?.(savedCompany);
    } catch (err) {
      console.error('Error saving company:', err);
      // Handle duplicate slug error
      if (err.code === '23505') {
        setError('A company with this URL slug already exists. Please use a different name.');
      } else {
        setError('Failed to save company. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add default descriptors
  async function addDefaultDescriptorsToCompany(companyId) {
    for (const category of DEFAULT_DESCRIPTOR_CATEGORIES) {
      // Create category
      const { data: categoryData, error: categoryError } = await supabase
        .from('descriptor_categories')
        .insert({
          company_id: companyId,
          name: category.name,
          sort_order: DEFAULT_DESCRIPTOR_CATEGORIES.indexOf(category),
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error creating category:', categoryError);
        continue;
      }

      // Create descriptors for this category
      const descriptors = category.descriptors.map((text) => ({
        category_id: categoryData.id,
        text,
      }));

      const { error: descriptorError } = await supabase
        .from('descriptors')
        .insert(descriptors);

      if (descriptorError) {
        console.error('Error creating descriptors:', descriptorError);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Company Name */}
      <Input
        label="Company Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Sunrise Dental Clinic"
        required
      />

      {/* URL Slug */}
      <div>
        <Input
          label="URL Slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="e.g., sunrise-dental-clinic"
        />
        <p className="mt-1 text-sm text-gray-500">
          Review page URL: /review/{formData.slug || 'your-company-slug'}
        </p>
      </div>

      {/* Google Review Link */}
      <Input
        label="Google Review Link *"
        name="google_review_link"
        value={formData.google_review_link}
        onChange={handleChange}
        placeholder="https://g.page/r/..."
        required
      />
      <p className="-mt-4 text-sm text-gray-500">
        Find this in your Google Business Profile under &quot;Get more reviews&quot;
      </p>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
          placeholder="Brief description of your business"
        />
      </div>

      {/* Logo URL */}
      <Input
        label="Logo URL"
        name="logo_url"
        value={formData.logo_url}
        onChange={handleChange}
        placeholder="https://example.com/logo.png"
      />

      {/* Default descriptors checkbox (only for new companies) */}
      {!isEditing && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={addDefaultDescriptors}
            onChange={(e) => setAddDefaultDescriptors(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Add default review descriptors (recommended)
          </span>
        </label>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {isEditing ? 'Save Changes' : 'Create Company'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
