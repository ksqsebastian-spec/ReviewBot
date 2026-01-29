'use client';

import Card from '@/components/ui/Card';

/*
  GettingStarted Component

  Displays a welcome guide for new users with no companies yet.
  Extracted from Dashboard page to keep components under 150 lines.
*/

export default function GettingStarted() {
  return (
    <Card className="border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/30">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Erste Schritte
      </h2>
      <p className="text-gray-600 dark:text-dark-300 mb-4">
        Willkommen bei Review Bot! So richten Sie Ihr erstes Unternehmen ein:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-dark-200">
        <li>Klicken Sie oben auf &quot;Neues Unternehmen&quot;</li>
        <li>Geben Sie den Firmennamen und den Google-Bewertungslink ein</li>
        <li>Teilen Sie den QR-Code auf der Startseite mit Ihren Kunden</li>
      </ol>
    </Card>
  );
}
