'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isValidEmail } from '@/lib/utils';
import {
  NOTIFICATION_INTERVALS,
  TEST_INTERVALS,
  ALL_NOTIFICATION_INTERVALS,
  TIME_SLOTS,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  DEFAULT_NOTIFICATION_INTERVAL,
} from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/*
  Multi-Step Signup Wizard

  Guided process for subscribing to review reminders.
  Allows subscribing to multiple companies with custom preferences.

  STEPS:
  1. Email Entry - Check if existing subscriber
  2. Company Selection - Choose which companies to follow
  3. Preferences - Notification interval, time, language
  4. Confirmation - Summary and success

  WHY MULTI-STEP?
  - Better user experience than a long single form
  - Can check for existing subscriber before showing all options
  - Progressive disclosure reduces cognitive load
*/

export default function SignupWizard({ initialCompanyId, initialCompanyName }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    selectedCompanies: initialCompanyId ? [initialCompanyId] : [],
    completedCompanies: [], // Companies where review is already done
    notificationInterval: DEFAULT_NOTIFICATION_INTERVAL,
    preferredTimeSlot: 'morning',
    preferredLanguage: DEFAULT_LANGUAGE,
  });

  // Available companies
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Existing subscriber check
  const [existingSubscriber, setExistingSubscriber] = useState(null);

  // Fetch all companies when reaching step 2
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
      console.error('Error fetching companies:', err);
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
      // Check if subscriber exists in new table
      const { data: existingSub, error: subError } = await supabase
        .from('subscribers')
        .select(`
          *,
          subscriber_companies (
            company_id,
            review_completed_at
          )
        `)
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (existingSub && !subError) {
        // Existing subscriber found
        setExistingSubscriber(existingSub);

        // Get company IDs where review is NOT completed (can still subscribe)
        const activeCompanyIds = (existingSub.subscriber_companies || [])
          .filter((sc) => !sc.review_completed_at)
          .map((sc) => sc.company_id);

        // Get company IDs where review IS completed (cannot resubscribe)
        const completedCompanyIds = (existingSub.subscriber_companies || [])
          .filter((sc) => sc.review_completed_at)
          .map((sc) => sc.company_id);

        // Pre-fill their preferences
        setFormData((prev) => ({
          ...prev,
          name: existingSub.name || prev.name,
          notificationInterval: existingSub.notification_interval_days || prev.notificationInterval,
          preferredTimeSlot: existingSub.preferred_time_slot || prev.preferredTimeSlot,
          preferredLanguage: existingSub.preferred_language || prev.preferredLanguage,
          selectedCompanies: [
            ...new Set([
              // Keep initial company if not completed
              ...(completedCompanyIds.includes(initialCompanyId) ? [] : prev.selectedCompanies),
              ...activeCompanyIds,
            ]),
          ],
          completedCompanies: completedCompanyIds,
        }));
      }

      setStep(2);
    } catch (err) {
      // No existing subscriber is fine, proceed
      console.log('New subscriber');
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
          ? initialCompanyId
            ? [initialCompanyId]
            : []
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

  // Step 3: Preferences
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

      // Create or update subscriber
      let subscriberId;

      if (existingSubscriber) {
        // Update existing subscriber
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
        // Try new subscribers table first
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
          // If new table doesn't exist, fall back to old table for each company
          for (const companyId of formData.selectedCompanies) {
            try {
              await supabase.from('email_subscribers').insert({
                company_id: companyId,
                email,
                name: formData.name.trim() || null,
              });
            } catch (err) {
              // Duplicate is okay - they're already subscribed
              console.log('Already subscribed to company:', companyId);
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
      console.error('Error saving subscription:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate next notification with randomization
  const calculateNextNotification = (intervalDays) => {
    const now = new Date();

    // Handle test intervals (0 = now, fractional = minutes)
    if (intervalDays === 0) {
      // "Now" - set to 10 seconds from now
      return new Date(now.getTime() + 10 * 1000).toISOString();
    }

    if (intervalDays < 1) {
      // Fractional day = minutes (e.g., 0.00139 ~= 2 minutes)
      const minutes = Math.round(intervalDays * 24 * 60);
      return new Date(now.getTime() + minutes * 60 * 1000).toISOString();
    }

    // Regular intervals with variance
    // Add variance: ±33% of interval
    const variance = Math.floor(intervalDays * 0.33);
    const randomDays = intervalDays + Math.floor(Math.random() * (variance * 2 + 1)) - variance;

    // Random hour based on time slot
    let hour;
    switch (formData.preferredTimeSlot) {
      case 'morning':
        hour = 8 + Math.floor(Math.random() * 4); // 8-11
        break;
      case 'afternoon':
        hour = 12 + Math.floor(Math.random() * 5); // 12-16
        break;
      case 'evening':
        hour = 17 + Math.floor(Math.random() * 4); // 17-20
        break;
      default:
        hour = 9 + Math.floor(Math.random() * 10); // 9-18
    }

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + randomDays);
    nextDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    // Avoid weekends (80% of the time)
    const dayOfWeek = nextDate.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.2) {
      nextDate.setDate(nextDate.getDate() + (dayOfWeek === 0 ? 1 : -1));
    }

    return nextDate.toISOString();
  };

  // Get selected company names for summary
  const getSelectedCompanyNames = () => {
    return companies
      .filter((c) => formData.selectedCompanies.includes(c.id))
      .map((c) => c.name);
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'E-Mail' },
      { num: 2, label: 'Unternehmen' },
      { num: 3, label: 'Einstellungen' },
      { num: 4, label: 'Fertig' },
    ];

    return (
      <div className="flex justify-center mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= s.num
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {step > s.num ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.num
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-1 ${
                  step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Step 1: Email entry
  if (step === 1) {
    return (
      <div>
        {renderStepIndicator()}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Für Bewertungserinnerungen anmelden
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Geben Sie Ihre E-Mail-Adresse ein, um zu beginnen
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label="E-Mail-Adresse *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="ihre@email.de"
            required
            autoFocus
          />

          <Input
            label="Name (optional)"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ihr Name"
          />

          <Button type="submit" loading={loading} className="w-full">
            Weiter
          </Button>
        </form>
      </div>
    );
  }

  // Step 2: Company selection
  if (step === 2) {
    return (
      <div>
        {renderStepIndicator()}
        <form onSubmit={handleCompanySubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Unternehmen auswählen
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Von welchen Unternehmen möchten Sie Erinnerungen erhalten?
            </p>
          </div>

          {existingSubscriber && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              Willkommen zurück! Wir haben Ihre bestehenden Einstellungen geladen.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loadingCompanies ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Select All button */}
              <button
                type="button"
                onClick={toggleAllCompanies}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {formData.selectedCompanies.length === companies.length
                  ? 'Auswahl aufheben'
                  : 'Alle auswählen'}
              </button>

              {/* Company list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {companies.map((company) => {
                  const isCompleted = formData.completedCompanies?.includes(company.id);
                  return (
                    <label
                      key={company.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border-2 transition-colors
                        ${isCompleted
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                          : formData.selectedCompanies.includes(company.id)
                            ? 'border-primary-500 bg-primary-50 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedCompanies.includes(company.id)}
                        onChange={() => !isCompleted && toggleCompany(company.id)}
                        disabled={isCompleted}
                        className="w-4 h-4 text-primary-600 rounded disabled:opacity-50"
                      />
                      <span className={`font-medium ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                        {company.name}
                      </span>
                      {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Bereits bewertet
                        </span>
                      )}
                      {company.id === initialCompanyId && !isCompleted && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                          Aktuell
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Zurück
            </Button>
            <Button type="submit" className="flex-1">
              Weiter
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: Preferences
  if (step === 3) {
    return (
      <div>
        {renderStepIndicator()}
        <form onSubmit={handlePreferencesSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Ihre Einstellungen
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Wie oft möchten Sie erinnert werden?
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Notification interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Erinnerungsintervall
            </label>
            <select
              value={formData.notificationInterval}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notificationInterval: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {/* Regular intervals */}
              {NOTIFICATION_INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label.de}
                </option>
              ))}
              {/* Test intervals - for testing email delivery */}
              <optgroup label="--- Test ---">
                {TEST_INTERVALS.map((interval) => (
                  <option key={`test-${interval.value}`} value={interval.value}>
                    {interval.label.de}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Preferred time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bevorzugte Tageszeit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, preferredTimeSlot: slot.value }))
                  }
                  className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-colors
                    ${formData.preferredTimeSlot === slot.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {slot.label.de}
                </button>
              ))}
            </div>
          </div>

          {/* Language preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprache
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, preferredLanguage: lang.code }))
                  }
                  className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-colors
                    ${formData.preferredLanguage === lang.code
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Zurück
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Anmelden
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div>
      {renderStepIndicator()}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erfolgreich angemeldet!
        </h3>
        <p className="text-gray-600 mb-4">
          Sie erhalten jetzt Bewertungserinnerungen für:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {getSelectedCompanyNames().map((name) => (
            <span
              key={name}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          {formData.preferredLanguage === 'de'
            ? `Sie werden etwa ${NOTIFICATION_INTERVALS.find((i) => i.value === formData.notificationInterval)?.label.de.toLowerCase()} erinnert.`
            : `You will be reminded approximately ${NOTIFICATION_INTERVALS.find((i) => i.value === formData.notificationInterval)?.label.en.toLowerCase()}.`}
        </p>
      </div>
    </div>
  );
}
