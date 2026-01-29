'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/*
  Settings Page - Simplified

  Minimal settings page with just the essential email function.
  Automated emails are sent daily at 9 AM via Vercel Cron.
*/

export default function SettingsPage() {
  const [sendingDue, setSendingDue] = useState(false);
  const [dueResult, setDueResult] = useState(null);

  // Send all due emails manually
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

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">
          E-Mail-Versand verwalten
        </p>
      </div>

      {/* Send Due Emails */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          E-Mail-Versand
        </h2>

        <p className="text-sm text-gray-600 dark:text-dark-300 mb-4">
          E-Mails werden automatisch täglich um 9 Uhr versendet.
          Mit dieser Funktion können Sie fällige E-Mails sofort manuell versenden.
        </p>

        <Button
          onClick={handleSendDueEmails}
          loading={sendingDue}
        >
          Fällige E-Mails jetzt senden
        </Button>

        {dueResult && (
          <p className={`text-sm mt-3 ${dueResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {dueResult.message}
          </p>
        )}
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Automatischer Versand</h3>
        <p className="text-sm text-gray-700 dark:text-dark-300">
          Bewertungserinnerungen werden automatisch täglich um 9 Uhr an alle fälligen Abonnenten gesendet.
          Sie müssen nichts weiter tun.
        </p>
      </Card>
    </div>
  );
}
