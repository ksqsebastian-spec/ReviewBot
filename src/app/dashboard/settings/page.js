'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  LANGUAGES,
  NOTIFICATION_INTERVALS,
  TEST_INTERVALS,
  UI_TEXT,
  DEFAULT_LANGUAGE,
  DEFAULT_NOTIFICATION_INTERVAL,
} from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/*
  Settings Page

  App-wide configuration for:
  - Language preference (German/English)
  - Default notification interval
  - Email sender settings
  - Test email sending
*/

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    default_language: DEFAULT_LANGUAGE,
    default_notification_interval_days: DEFAULT_NOTIFICATION_INTERVAL,
    min_days_between_emails: 3,
    email_from_name: 'Review Bot',
    email_from_address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [sendingDue, setSendingDue] = useState(false);
  const [dueResult, setDueResult] = useState(null);

  // Get UI text based on current language
  const t = UI_TEXT[settings.default_language] || UI_TEXT.de;

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  // Save settings
  const handleSave = async () => {
    if (!supabase) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Send test email to specific address
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: 'Bitte E-Mail-Adresse eingeben' });
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'test', email: testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({ success: true, message: `E-Mail gesendet an ${testEmail}` });
      } else {
        setTestResult({ success: false, message: data.error || 'Fehler beim Senden' });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  // Send all due emails
  const handleSendDueEmails = async () => {
    setSendingDue(true);
    setDueResult(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'due' }),
      });

      const data = await response.json();

      if (response.ok) {
        setDueResult({
          success: true,
          message: `${data.sent} E-Mails gesendet, ${data.failed} fehlgeschlagen`,
        });
      } else {
        setDueResult({ success: false, message: data.error || 'Fehler beim Senden' });
      }
    } catch (err) {
      setDueResult({ success: false, message: err.message });
    } finally {
      setSendingDue(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.settingsTitle}</h1>
        <p className="text-gray-600 mt-1">
          {settings.default_language === 'de'
            ? 'App-weite Konfiguration'
            : 'App-wide configuration'}
        </p>
      </div>

      {/* Language Settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.languageLabel}</h2>
        <div className="space-y-3">
          {Object.values(LANGUAGES).map((lang) => (
            <label
              key={lang.code}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors
                ${settings.default_language === lang.code
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="language"
                value={lang.code}
                checked={settings.default_language === lang.code}
                onChange={() => handleChange('default_language', lang.code)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="font-medium">{lang.nativeName}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {settings.default_language === 'de' ? 'Benachrichtigungen' : 'Notifications'}
        </h2>

        <div className="space-y-4">
          {/* Default Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.defaultIntervalLabel}
            </label>
            <select
              value={settings.default_notification_interval_days}
              onChange={(e) => handleChange('default_notification_interval_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {NOTIFICATION_INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label[settings.default_language]}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Days Between Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.default_language === 'de'
                ? 'Minimale Tage zwischen E-Mails'
                : 'Minimum days between emails'}
            </label>
            <Input
              type="number"
              min={1}
              max={14}
              value={settings.min_days_between_emails}
              onChange={(e) => handleChange('min_days_between_emails', parseInt(e.target.value) || 3)}
            />
            <p className="text-sm text-gray-500 mt-1">
              {settings.default_language === 'de'
                ? 'Verhindert Spam durch Begrenzung der E-Mail-Häufigkeit'
                : 'Prevents spam by limiting email frequency'}
            </p>
          </div>
        </div>
      </Card>

      {/* Email Settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.emailSettingsTitle}</h2>

        <div className="space-y-4">
          {/* From Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.default_language === 'de' ? 'Absendername' : 'From Name'}
            </label>
            <Input
              value={settings.email_from_name}
              onChange={(e) => handleChange('email_from_name', e.target.value)}
              placeholder="Review Bot"
            />
          </div>

          {/* From Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.default_language === 'de' ? 'Absenderadresse' : 'From Address'}
            </label>
            <Input
              type="email"
              value={settings.email_from_address || ''}
              onChange={(e) => handleChange('email_from_address', e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              {settings.default_language === 'de'
                ? 'Muss in Resend verifiziert sein'
                : 'Must be verified in Resend'}
            </p>
          </div>
        </div>
      </Card>

      {/* Test Email Section */}
      <Card className="border-amber-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {settings.default_language === 'de' ? 'E-Mail-Test' : 'Email Testing'}
        </h2>

        <div className="space-y-4">
          {/* Send Test Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.default_language === 'de'
                ? 'Test-E-Mail senden'
                : 'Send Test Email'}
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1"
              />
              <Button
                onClick={handleSendTestEmail}
                loading={sendingTest}
                variant="secondary"
              >
                {settings.default_language === 'de' ? 'Senden' : 'Send'}
              </Button>
            </div>
            {testResult && (
              <p className={`text-sm mt-2 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.message}
              </p>
            )}
          </div>

          {/* Divider */}
          <hr className="border-amber-200" />

          {/* Send Due Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.default_language === 'de'
                ? 'Faellige E-Mails jetzt senden'
                : 'Send Due Emails Now'}
            </label>
            <p className="text-sm text-gray-600 mb-3">
              {settings.default_language === 'de'
                ? 'Sendet E-Mails an alle Abonnenten, deren Benachrichtigungszeit erreicht ist.'
                : 'Sends emails to all subscribers whose notification time has passed.'}
            </p>
            <Button
              onClick={handleSendDueEmails}
              loading={sendingDue}
              variant="secondary"
            >
              {settings.default_language === 'de'
                ? 'Faellige E-Mails senden'
                : 'Send Due Emails'}
            </Button>
            {dueResult && (
              <p className={`text-sm mt-2 ${dueResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {dueResult.message}
              </p>
            )}
          </div>

          {/* Test Intervals Info */}
          <div className="bg-white rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">
              {settings.default_language === 'de' ? 'Test-Intervalle:' : 'Test Intervals:'}
            </p>
            <ul className="list-disc list-inside">
              {TEST_INTERVALS.map((interval) => (
                <li key={interval.value}>
                  {interval.label[settings.default_language]}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-gray-500">
              {settings.default_language === 'de'
                ? 'Waehlen Sie diese beim Anmelden, um E-Mails sofort oder in 2 Minuten zu erhalten.'
                : 'Select these during signup to receive emails immediately or in 2 minutes.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} loading={saving}>
          {t.save}
        </Button>
        {saved && (
          <span className="text-green-600 font-medium">
            {t.savedSuccessfully}
          </span>
        )}
      </div>
    </div>
  );
}
