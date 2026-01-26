'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  LANGUAGES,
  NOTIFICATION_INTERVALS,
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
