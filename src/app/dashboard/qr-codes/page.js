'use client';

import { useState, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import { useCompanyContext } from '@/contexts/CompanyContext';

/*
  QR-Codes Seite

  Dedizierte Seite zum Generieren und Drucken von QR-Codes.
  Uses global CompanyContext for company selection (header dropdown).

  FUNKTIONEN:
  - Umschalten zwischen Bewertungs- und Anmelde-QR
  - Druckfunktion mit Firmenname
  - Link kopieren
*/

export default function QRCodesPage() {
  const { companies, selectedCompany: contextCompany, loading } = useCompanyContext();
  const [qrType, setQrType] = useState('review');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  // QR codes are per-company — if "Alle" selected, use first company
  const selectedCompany = contextCompany || companies[0] || null;

  // URL basierend auf Typ generieren
  const getQRUrl = () => {
    if (!selectedCompany) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return qrType === 'review'
      ? `${baseUrl}/review/${selectedCompany.slug}`
      : `${baseUrl}/signup/${selectedCompany.slug}`;
  };

  // URL in Zwischenablage kopieren
  const handleCopy = async () => {
    const url = getQRUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Kopieren fehlgeschlagen
    }
  };

  // QR-Code drucken
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedCompany?.name || 'QR Code'}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: system-ui, sans-serif;
          }
          .qr-container {
            text-align: center;
            padding: 40px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 24px;
          }
          .instruction {
            font-size: 20px;
            color: #444;
            margin-top: 24px;
          }
          .url {
            font-size: 12px;
            color: #999;
            margin-top: 12px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="company-name">${selectedCompany?.name || ''}</div>
          ${printContent.innerHTML}
          <div class="instruction">
            ${qrType === 'review' ? 'Scannen Sie den Code, um eine Bewertung abzugeben' : 'Scannen Sie den Code, um sich für Erinnerungen anzumelden'}
          </div>
          <div class="url">${getQRUrl()}</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Seitenkopf */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR-Codes</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">
          Erstellen und drucken Sie QR-Codes für Ihre Unternehmen
        </p>
      </div>

      {/* Ladezustand */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      )}

      {/* Leerer Zustand */}
      {!loading && companies.length === 0 && (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-dark-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Keine Unternehmen vorhanden
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Erstellen Sie zuerst ein Unternehmen, um QR-Codes zu generieren.
          </p>
        </Card>
      )}

      {/* QR-Code Generator */}
      {!loading && companies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Einstellungen */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Einstellungen
            </h2>

            {/* QR-Typ Auswahl */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                QR-Code Typ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setQrType('review')}
                  className={`
                    flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors
                    ${qrType === 'review'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Bewertungsseite</span>
                  </div>
                </button>
                <button
                  onClick={() => setQrType('signup')}
                  className={`
                    flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors
                    ${qrType === 'signup'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Anmeldeseite</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Link */}
            <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Link:</p>
              <p className="text-sm text-gray-900 dark:text-dark-100 break-all font-mono">
                {getQRUrl()}
              </p>
            </div>
          </Card>

          {/* QR-Code Vorschau */}
          <Card className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 self-start">
              Vorschau
            </h2>

            {/* QR-Code */}
            <div
              ref={printRef}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700"
            >
              <QRCode url={getQRUrl()} size={240} />
            </div>

            <p className="text-sm text-gray-500 dark:text-dark-400 mt-4 text-center">
              {qrType === 'review'
                ? 'Kunden scannen diesen Code, um eine Bewertung abzugeben'
                : 'Kunden scannen diesen Code, um sich für Erinnerungen anzumelden'
              }
            </p>

            {/* Aktionen */}
            <div className="flex gap-3 mt-6 w-full max-w-xs">
              <Button onClick={handlePrint} className="flex-1">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Drucken
              </Button>
              <Button variant="secondary" onClick={handleCopy} className="flex-1">
                {copied ? (
                  <span className="text-green-600 dark:text-green-400">Kopiert!</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Kopieren
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tipps */}
      {!loading && companies.length > 0 && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Tipps zur Verwendung
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-dark-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400">•</span>
              Platzieren Sie QR-Codes an der Kasse, auf Quittungen oder Tischaufstellern
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400">•</span>
              Drucken Sie den QR-Code groß genug, damit er leicht gescannt werden kann (min. 3x3 cm)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400">•</span>
              Verwenden Sie die Anmeldeseite für E-Mail-Erinnerungen und die Bewertungsseite für direkte Bewertungen
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
