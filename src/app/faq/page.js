import Card from '@/components/ui/Card';

/*
  FAQ-Seite

  Häufig gestellte Fragen und Best Practices für die Bewertungssammlung.
  Dies ist eine Server-Komponente (keine Client-Interaktivität erforderlich).

  ABSCHNITTE:
  1. So funktioniert es
  2. Best Practices
  3. Dos und Don'ts
  4. Wie oft nach Bewertungen fragen
*/

export const metadata = {
  title: 'FAQ & Best Practices',
  description: 'Lernen Sie, wie Sie Kundenbewertungen effektiv sammeln und verwalten',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'Wie funktioniert Review Bot?',
      answer:
        'Review Bot hilft Ihren Kunden beim Schreiben von Bewertungen, indem es vorformulierte Phrasen anbietet, die sie auswählen können. Die Kunden wählen Phrasen, die ihre Erfahrung beschreiben, und das Tool kombiniert sie zu einer natürlich klingenden Bewertung. Dann kopieren sie die Bewertung und klicken zu Google, um sie einzufügen.',
    },
    {
      question: 'Handelt es sich um gefälschte Bewertungen?',
      answer:
        'Nein! Der Kunde schreibt immer noch seine eigene Bewertung – er bekommt nur Hilfe bei der Strukturierung. Die ausgewählten Phrasen beschreiben die echte Erfahrung des Kunden. Das erleichtert es Kunden, die eine Bewertung hinterlassen möchten, aber Schwierigkeiten beim Schreiben haben. Die Bewertung spiegelt immer die tatsächliche Erfahrung wider.',
    },
    {
      question: 'Wie bekomme ich meinen Google-Bewertungslink?',
      answer:
        'Gehen Sie zu Ihrem Google Unternehmensprofil und klicken Sie auf "Mehr Rezensionen erhalten" oder suchen Sie nach "Google Bewertungslink Generator". Sie erhalten einen direkten Link, der Kunden direkt zum Bewertungsformular führt. Fügen Sie diesen Link beim Einrichten Ihres Unternehmens in Review Bot ein.',
    },
    {
      question: 'Können Kunden die generierte Bewertung anpassen?',
      answer:
        'Ja! Der generierte Text ist nur ein Ausgangspunkt. Kunden können (und sollten) ihn vor dem Posten bearbeiten, um persönliche Details hinzuzufügen oder die Formulierung anzupassen. Das macht jede Bewertung einzigartig und authentisch.',
    },
    {
      question: 'Wie funktionieren die E-Mail-Erinnerungen?',
      answer:
        'Kunden können sich per QR-Code oder Link anmelden, um Bewertungserinnerungen zu erhalten. Derzeit exportieren Sie die E-Mail-Liste und senden Erinnerungen manuell über Ihr bevorzugtes E-Mail-Tool. Automatische Erinnerungen sind für ein zukünftiges Update geplant.',
    },
  ];

  const bestPractices = [
    {
      title: 'Zum richtigen Zeitpunkt fragen',
      description:
        'Bitten Sie um Bewertungen, wenn Kunden am zufriedensten sind – direkt nach einem erfolgreichen Service, einer positiven Interaktion oder wenn sie ihre Zufriedenheit äußern. Timing ist alles.',
    },
    {
      title: 'Machen Sie es einfach',
      description:
        'Nutzen Sie QR-Codes an der Kasse, fügen Sie Links auf Quittungen ein und senden Sie Follow-up-E-Mails. Je weniger Schritte, desto mehr Bewertungen erhalten Sie.',
    },
    {
      title: 'Auf jede Bewertung antworten',
      description:
        'Bedanken Sie sich bei positiven Bewertern und gehen Sie professionell auf negatives Feedback ein. Das zeigt, dass Sie sich kümmern, und ermutigt andere, Bewertungen zu hinterlassen.',
    },
    {
      title: 'Bleiben Sie konsequent',
      description:
        'Fragen Sie nicht nur einmal. Machen Sie Bewertungsanfragen zu einem Teil Ihres regelmäßigen Prozesses. Stetiges Wachstum schlägt sporadische Ausbrüche.',
    },
    {
      title: 'Schulen Sie Ihr Team',
      description:
        'Jeder sollte wissen, wie man natürlich um Bewertungen bittet. "Wenn Ihnen Ihr Besuch gefallen hat, würden wir uns über eine Bewertung freuen!" funktioniert besser als einstudierte Anfragen.',
    },
  ];

  const dos = [
    'Fragen Sie zufriedene Kunden direkt',
    'Nutzen Sie QR-Codes an sichtbaren Stellen',
    'Senden Sie 1-2 Tage nach dem Service eine Follow-up-E-Mail',
    'Bedanken Sie sich bei Kunden, die Bewertungen hinterlassen',
    'Reagieren Sie professionell auf negative Bewertungen',
    'Gestalten Sie den Bewertungsprozess so einfach wie möglich',
    'Verteilen Sie Ihre Bewertungsanfragen natürlich über die Zeit',
  ];

  const donts = [
    'Bieten Sie niemals Anreize für Bewertungen an (verstößt gegen Google-Richtlinien)',
    'Fragen Sie nicht jeden – konzentrieren Sie sich auf zufriedene Kunden',
    'Senden Sie nicht zu viele Erinnerungs-E-Mails',
    'Streiten Sie nicht öffentlich mit negativen Bewertern',
    'Fälschen Sie keine Bewertungen und nutzen Sie keine Bewertungsfarmen',
    'Ignorieren Sie negatives Feedback nicht',
    'Bewerten Sie nicht Ihr eigenes Unternehmen',
  ];

  const frequency = [
    {
      scenario: 'Dienstleistungsunternehmen (Zahnarzt, Friseur, etc.)',
      recommendation: 'Fragen Sie nach jedem Termin, einmal nachfassen wenn nach 3 Tagen keine Bewertung erfolgt',
    },
    {
      scenario: 'Einzelhandelsgeschäft',
      recommendation: 'QR-Code auf Quittungen, bei außergewöhnlichen Erlebnissen mündlich fragen',
    },
    {
      scenario: 'Restaurant',
      recommendation: 'QR-Code auf Tischaufstellern oder Quittungen, bei positiven Interaktionen fragen',
    },
    {
      scenario: 'E-Mail-Listen-Abonnenten',
      recommendation: 'Senden Sie monatliche Erinnerungen, nicht mehr als einmal pro Monat pro Person',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Seitenkopf */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          FAQ & Best Practices
        </h1>
        <p className="text-lg text-gray-600 dark:text-dark-300">
          Alles, was Sie über effektives und ethisches Sammeln von Bewertungen wissen müssen
        </p>
      </div>

      {/* FAQs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Häufig gestellte Fragen
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-dark-300">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12" id="best-practices">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((practice, index) => (
            <Card key={index}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{practice.title}</h3>
              <p className="text-gray-600 dark:text-dark-300 text-sm">{practice.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Dos und Don'ts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Dos und Don&apos;ts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tun Sie
            </h3>
            <ul className="space-y-2">
              {dos.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                  <span className="text-green-500 dark:text-green-400 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900">
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Vermeiden Sie
            </h3>
            <ul className="space-y-2">
              {donts.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                  <span className="text-red-500 dark:text-red-400 mt-1">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Wie oft fragen */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Wie oft sollten Sie fragen?
        </h2>
        <Card>
          <div className="space-y-4">
            {frequency.map((item, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-dark-700 pb-4 last:border-0 last:pb-0">
                <p className="font-medium text-gray-900 dark:text-white">{item.scenario}</p>
                <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* SEO-Vorteile */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Warum Bewertungen für SEO wichtig sind
        </h2>
        <Card className="bg-primary-50 border-primary-200 dark:bg-primary-950/30 dark:border-primary-900">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-dark-200">
              Google-Bewertungen beeinflussen direkt Ihr lokales Suchranking. Hier ist der Grund:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-dark-200">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold">1.</span>
                <span><strong>Anzahl der Bewertungen</strong> signalisiert Legitimität und Beliebtheit des Unternehmens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold">2.</span>
                <span><strong>Qualität der Bewertungen</strong> (Sternebewertung) beeinflusst die Klickrate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold">3.</span>
                <span><strong>Aktualität der Bewertungen</strong> zeigt aktiven, aktuellen Geschäftsbetrieb</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold">4.</span>
                <span><strong>Antworten auf Bewertungen</strong> demonstrieren Kundenengagement</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-dark-400 mt-4">
              Unternehmen mit 50+ Bewertungen sehen typischerweise 25-50% mehr Sichtbarkeit in lokalen Suchergebnissen
              im Vergleich zu Unternehmen mit weniger als 10 Bewertungen.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
