'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isValidEmail } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/*
  EmailSignupForm Component

  Allows customers to sign up for review reminders.
  Used on the public signup page (linked via QR code).

  FEATURES:
  - Email validation
  - Duplicate detection (same email + company)
  - Success/error feedback
  - Optional name field
*/

/**
 * @param {Object} props
 * @param {string} props.companyId - Company UUID to associate subscriber with
 * @param {string} props.companyName - Company name for display
 */
export default function EmailSignupForm({ companyId, companyName }) {
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Handle case when Supabase isn't initialized
    if (!supabase) {
      setError('Database connection not available. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('email_subscribers')
        .insert({
          company_id: companyId,
          email: formData.email.toLowerCase().trim(),
          name: formData.name.trim() || null,
        });

      if (insertError) {
        // Handle duplicate email
        if (insertError.code === '23505') {
          setError('This email is already subscribed!');
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error subscribing:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          You&apos;re subscribed!
        </h3>
        <p className="text-gray-600">
          We&apos;ll send you a reminder when it&apos;s time to leave a review for {companyName}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Email Address *"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Name (optional)"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your name"
      />

      <Button type="submit" loading={loading} className="w-full">
        Subscribe for Reminders
      </Button>

      <p className="text-xs text-gray-500 text-center">
        We&apos;ll occasionally remind you to leave a review. Unsubscribe anytime.
      </p>
    </form>
  );
}
