'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  NOTIFICATION_INTERVALS,
  TEST_INTERVALS,
  DEFAULT_NOTIFICATION_INTERVAL,
} from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/*
  Settings Page

  App-wide configuration for:
  - Default notification interval
  - Email sender settings
  - Test email sending

  NOTE: German-only interface
*/

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    default_language: 'de',
    default_notification_interval_days: DEFAULT_NOTIFICATION_INTERVAL,
    min_days_between_emails: 3,
    email_from_name: 'Review Bot',
    email_from_address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { success: boolean, message: string }

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [sendingDue, setSendingDue] = useState(false);
  const [dueResult, setDueResult] = useState(null);

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
        // If table doesn't exist, we'll use defaults and show a warning
        console.warn('Could not load settings:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaveResult(null); // Clear previous save result
  };

  // Save settings with visible feedback
  const handleSave = async () => {
    if (!supabase) {
      setSaveResult({ success: false, message: 'Datenbankverbindung nicht verfügbar.' });
      return;
    }

    setSaving(true);
    setSaveResult(null);

    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSaveResult({ success: true, message: 'Einstellungen erfolgreich gespeichert!' });
      setTimeout(() => setSaveResult(null), 5000);
    } catch (err) {
      setSaveResult({
        success: false,
        message: `Speichern fehlgeschlagen: ${err.message || 'Unbekannter Fehler'}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Send test email to specific address
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({
        success: false,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      });
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
        setTestResult({
          success: true,
          message: 'Test-E-Mail erfolgreich gesendet! Prüfen Sie Ihren Posteingang.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'E-Mail konnte nicht gesendet werden.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'E-Mail konnte nicht gesendet werden. Bitte Verbindung prüfen.',
      });
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
          message: `Erinnerungen versendet: ${data.sent} erfolgreich, ${data.failed} fehlgeschlagen`,
        });
      } else {
        setDueResult({
          success: false,
          message: data.error || 'E-Mails konnten nicht gesendet werden.',
        });
      }
    } catch (err) {
      setDueResult({
        success: false,
        message: 'E-Mails konnten nicht gesendet werden. Bitte Verbindung prüfen.',
      });
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">
          App-weite Konfiguration
        </p>
      </div>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Benachrichtigungen
        </h2>

        <div className="space-y-4">
          {/* Default Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Standard-Benachrichtigungsintervall
            </label>
            <select
              value={settings.default_notification_interval_days}
              onChange={(e) => handleChange('default_notification_interval_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500
                         dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100"
            >
              {NOTIFICATION_INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label.de}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Days Between Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Minimale Tage zwischen E-Mails
            </label>
            <Input
              type="number"
              min={1}
              max={14}
              value={settings.min_days_between_emails}
              onChange={(e) => handleChange('min_days_between_emails', parseInt(e.target.value) || 3)}
            />
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              Verhindert Spam durch Begrenzung der E-Mail-Häufigkeit
            </p>
          </div>
        </div>
      </Card>

      {/* Email Settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">E-Mail-Einstellungen</h2>

        <div className="space-y-4">
          {/* From Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Absendername
            </label>
            <Input
              value={settings.email_from_name}
              onChange={(e) => handleChange('email_from_name', e.target.value)}
              placeholder="Review Bot"
            />
          </div>

          {/* From Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Absenderadresse
            </label>
            <Input
              type="email"
              value={settings.email_from_address || ''}
              onChange={(e) => handleChange('email_from_address', e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              Optional: Wird im E-Mail-Header angezeigt (Gmail SMTP verwendet Ihre Gmail-Adresse)
            </p>
          </div>
        </div>
      </Card>

      {/* Test Email Section */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          E-Mail-Test
        </h2>

        <div className="space-y-4">
          {/* Send Test Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Test-E-Mail senden
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
                Senden
              </Button>
            </div>
            {testResult && (
              <p className={`text-sm mt-2 ${testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {testResult.message}
              </p>
            )}
          </div>

          {/* Divider */}
          <hr className="border-amber-200 dark:border-amber-900" />

          {/* Send Due Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Fällige E-Mails jetzt senden
            </label>
            <p className="text-sm text-gray-600 dark:text-dark-300 mb-3">
              Sendet E-Mails an alle Abonnenten, deren Benachrichtigungszeit erreicht ist.
            </p>
            <Button
              onClick={handleSendDueEmails}
              loading={sendingDue}
              variant="secondary"
            >
              Fällige E-Mails senden
            </Button>
            {dueResult && (
              <p className={`text-sm mt-2 ${dueResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {dueResult.message}
              </p>
            )}
          </div>

          {/* Test Intervals Info */}
          <div className="bg-white dark:bg-dark-800 rounded-lg p-3 text-sm text-gray-600 dark:text-dark-300">
            <p className="font-medium text-gray-700 dark:text-dark-200 mb-1">
              Test-Intervalle:
            </p>
            <ul className="list-disc list-inside">
              {TEST_INTERVALS.map((interval) => (
                <li key={interval.value}>
                  {interval.label.de}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-gray-500 dark:text-dark-400">
              Wählen Sie diese beim Anmelden, um E-Mails sofort oder in 2 Minuten zu erhalten.
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button with visible feedback */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} loading={saving}>
          Speichern
        </Button>
        {saveResult && (
          <span className={`font-medium ${saveResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {saveResult.message}
          </span>
        )}
      </div>
    </div>
  );
}
