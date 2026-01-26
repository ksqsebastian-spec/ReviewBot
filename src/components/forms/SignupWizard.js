'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isValidEmail } from '@/lib/utils';
import { DEFAULT_LANGUAGE, DEFAULT_NOTIFICATION_INTERVAL } from '@/lib/constants';
import {
  StepIndicator,
  SignupStep1Email,
  SignupStep2Companies,
  SignupStep3Preferences,
  SignupStep4Success,
} from './signup';

/*
  Multi-Step Signup Wizard

  Guided process for subscribing to review reminders.
  Allows subscribing to multiple companies with custom preferences.

  STEPS:
  1. Email Entry - Check if existing subscriber
  2. Company Selection - Choose which companies to follow
  3. Preferences - Notification interval, time, language
  4. Confirmation - Summary and success
*/

const WIZARD_STEPS = [
  { num: 1, label: 'E-Mail' },
  { num: 2, label: 'Unternehmen' },
  { num: 3, label: 'Einstellungen' },
  { num: 4, label: 'Fertig' },
];

export default function SignupWizard({ initialCompanyId, initialCompanyName }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    selectedCompanies: initialCompanyId ? [initialCompanyId] : [],
    completedCompanies: [],
    notificationInterval: DEFAULT_NOTIFICATION_INTERVAL,
    preferredTimeSlot: 'morning',
    preferredLanguage: DEFAULT_LANGUAGE,
  });

  // Available companies
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Existing subscriber check
  const [existingSubscriber, setExistingSubscriber] = useState(null);

  // Fetch companies when reaching step 2
  useEffect(() => {
    if (step === 2 && companies.length === 0) {
      fetchCompanies();
    }
  }, [step, companies.length]);

  const fetchCompanies = async () => {
    if (!supabase) return;
    setLoadingCompanies(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      // Silently fail - companies will show empty
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Step 1: Email check
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(formData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    if (!supabase) {
      setError('Datenbankverbindung nicht verfügbar. Bitte versuchen Sie es später.');
      return;
    }

    setLoading(true);
    try {
      const { data: existingSub, error: subError } = await supabase
        .from('subscribers')
        .select(`*, subscriber_companies (company_id, review_completed_at)`)
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (existingSub && !subError) {
        setExistingSubscriber(existingSub);
        const activeCompanyIds = (existingSub.subscriber_companies || [])
          .filter((sc) => !sc.review_completed_at)
          .map((sc) => sc.company_id);
        const completedCompanyIds = (existingSub.subscriber_companies || [])
          .filter((sc) => sc.review_completed_at)
          .map((sc) => sc.company_id);

        setFormData((prev) => ({
          ...prev,
          name: existingSub.name || prev.name,
          notificationInterval: existingSub.notification_interval_days || prev.notificationInterval,
          preferredTimeSlot: existingSub.preferred_time_slot || prev.preferredTimeSlot,
          preferredLanguage: existingSub.preferred_language || prev.preferredLanguage,
          selectedCompanies: [
            ...new Set([
              ...(completedCompanyIds.includes(initialCompanyId) ? [] : prev.selectedCompanies),
              ...activeCompanyIds,
            ]),
          ],
          completedCompanies: completedCompanyIds,
        }));
      }
      setStep(2);
    } catch (err) {
      // New subscriber - continue to step 2
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Toggle company selection
  const toggleCompany = (companyId) => {
    setFormData((prev) => ({
      ...prev,
      selectedCompanies: prev.selectedCompanies.includes(companyId)
        ? prev.selectedCompanies.filter((id) => id !== companyId)
        : [...prev.selectedCompanies, companyId],
    }));
  };

  // Select/deselect all companies
  const toggleAllCompanies = () => {
    setFormData((prev) => ({
      ...prev,
      selectedCompanies:
        prev.selectedCompanies.length === companies.length
          ? initialCompanyId ? [initialCompanyId] : []
          : companies.map((c) => c.id),
    }));
  };

  // Step 2: Company selection
  const handleCompanySubmit = (e) => {
    e.preventDefault();
    if (formData.selectedCompanies.length === 0) {
      setError('Bitte wählen Sie mindestens ein Unternehmen aus');
      return;
    }
    setError(null);
    setStep(3);
  };

  // Step 3: Save preferences
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Datenbankverbindung nicht verfügbar');
      setLoading(false);
      return;
    }

    try {
      const email = formData.email.toLowerCase().trim();
      let subscriberId;

      if (existingSubscriber) {
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({
            name: formData.name.trim() || null,
            notification_interval_days: formData.notificationInterval,
            preferred_time_slot: formData.preferredTimeSlot,
            preferred_language: formData.preferredLanguage,
          })
          .eq('id', existingSubscriber.id);
        if (updateError) throw updateError;
        subscriberId = existingSubscriber.id;
      } else {
        const { data: newSub, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            email,
            name: formData.name.trim() || null,
            notification_interval_days: formData.notificationInterval,
            preferred_time_slot: formData.preferredTimeSlot,
            preferred_language: formData.preferredLanguage,
          })
          .select()
          .single();

        if (insertError) {
          // Fallback to old table
          for (const companyId of formData.selectedCompanies) {
            try {
              await supabase.from('email_subscribers').insert({
                company_id: companyId,
                email,
                name: formData.name.trim() || null,
              });
            } catch (err) {
              // Already subscribed - continue silently
            }
          }
          setStep(4);
          return;
        }
        subscriberId = newSub.id;
      }

      // Add company subscriptions
      const existingCompanyIds = existingSubscriber
        ? (existingSubscriber.subscriber_companies || []).map((sc) => sc.company_id)
        : [];
      const newCompanyIds = formData.selectedCompanies.filter(
        (id) => !existingCompanyIds.includes(id)
      );

      if (newCompanyIds.length > 0) {
        const subscriptions = newCompanyIds.map((companyId) => ({
          subscriber_id: subscriberId,
          company_id: companyId,
          next_notification_at: calculateNextNotification(formData.notificationInterval),
        }));

        const { error: subCompanyError } = await supabase
          .from('subscriber_companies')
          .insert(subscriptions);
        if (subCompanyError) throw subCompanyError;
      }

      setStep(4);
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate next notification with randomization
  const calculateNextNotification = (intervalDays) => {
    const now = new Date();

    if (intervalDays === 0) {
      return new Date(now.getTime() + 10 * 1000).toISOString();
    }

    if (intervalDays < 1) {
      const minutes = Math.round(intervalDays * 24 * 60);
      return new Date(now.getTime() + minutes * 60 * 1000).toISOString();
    }

    const variance = Math.floor(intervalDays * 0.33);
    const randomDays = intervalDays + Math.floor(Math.random() * (variance * 2 + 1)) - variance;

    let hour;
    switch (formData.preferredTimeSlot) {
      case 'morning': hour = 8 + Math.floor(Math.random() * 4); break;
      case 'afternoon': hour = 12 + Math.floor(Math.random() * 5); break;
      case 'evening': hour = 17 + Math.floor(Math.random() * 4); break;
      default: hour = 9 + Math.floor(Math.random() * 10);
    }

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + randomDays);
    nextDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    const dayOfWeek = nextDate.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.2) {
      nextDate.setDate(nextDate.getDate() + (dayOfWeek === 0 ? 1 : -1));
    }

    return nextDate.toISOString();
  };

  // Get selected company names for success screen
  const getSelectedCompanyNames = () => {
    return companies
      .filter((c) => formData.selectedCompanies.includes(c.id))
      .map((c) => c.name);
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SignupStep1Email
            formData={formData}
            setFormData={setFormData}
            error={error}
            loading={loading}
            onSubmit={handleEmailSubmit}
          />
        );
      case 2:
        return (
          <SignupStep2Companies
            formData={formData}
            companies={companies}
            loadingCompanies={loadingCompanies}
            existingSubscriber={existingSubscriber}
            initialCompanyId={initialCompanyId}
            error={error}
            onToggleCompany={toggleCompany}
            onToggleAll={toggleAllCompanies}
            onBack={() => setStep(1)}
            onSubmit={handleCompanySubmit}
          />
        );
      case 3:
        return (
          <SignupStep3Preferences
            formData={formData}
            setFormData={setFormData}
            error={error}
            loading={loading}
            onBack={() => setStep(2)}
            onSubmit={handlePreferencesSubmit}
          />
        );
      case 4:
        return (
          <SignupStep4Success
            formData={formData}
            selectedCompanyNames={getSelectedCompanyNames()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <StepIndicator currentStep={step} steps={WIZARD_STEPS} />
      {renderStep()}
    </div>
  );
}
