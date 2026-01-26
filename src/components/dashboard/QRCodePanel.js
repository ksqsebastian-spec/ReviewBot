'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { UI_TEXT, DEFAULT_LANGUAGE } from '@/lib/constants';
import QRCode from '@/components/ui/QRCode';
import Button from '@/components/ui/Button';

/*
  QR Code Sidebar Panel

  Collapsible panel for quick access to company QR codes.
  Used for in-person review collection (print and display).

  Features:
  - Company selector dropdown
  - Toggle between Review page and Signup page QR
  - Print functionality
  - Copy link button
*/

export default function QRCodePanel({ language = DEFAULT_LANGUAGE }) {
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [qrType, setQrType] = useState('review'); // 'review' or 'signup'
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const t = UI_TEXT[language] || UI_TEXT.de;

  // Fetch companies
  useEffect(() => {
    async function fetchCompanies() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, slug')
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
        if (data && data.length > 0) {
          setSelectedCompany(data[0]);
        }
      } catch (err) {
        // Silently fail - panel will show empty
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && companies.length === 0) {
      fetchCompanies();
    }
  }, [isOpen, companies.length]);

  // Generate URL based on type
  const getQRUrl = () => {
    if (!selectedCompany) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return qrType === 'review'
      ? `${baseUrl}/review/${selectedCompany.slug}`
      : `${baseUrl}/signup/${selectedCompany.slug}`;
  };

  // Copy URL to clipboard
  const handleCopy = async () => {
    const url = getQRUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Copy failed silently - user can try again
    }
  };

  // Print QR code
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
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .instruction {
            font-size: 18px;
            color: #666;
            margin-top: 20px;
          }
          .url {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="company-name">${selectedCompany?.name || ''}</div>
          ${printContent.innerHTML}
          <div class="instruction">
            ${qrType === 'review' ? t.scanToReview : t.scanToSignup}
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
    <>
      {/* Toggle Button (fixed position) - hidden on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:block
          bg-primary-600 dark:bg-primary-500 text-white dark:text-dark-950 px-2 py-4 rounded-l-lg
          hover:bg-primary-700 dark:hover:bg-primary-400 transition-all shadow-lg
          ${isOpen ? 'translate-x-full' : ''}
        `}
        title={t.qrCode}
        aria-label={t.qrCode}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-0 h-full w-80 bg-white dark:bg-dark-900 shadow-2xl z-50
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t.qrCode}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 rounded"
            aria-label="Panel schließen"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600 dark:border-primary-900 dark:border-t-primary-400"></div>
            </div>
          ) : companies.length === 0 ? (
            <p className="text-gray-500 dark:text-dark-400 text-center py-8">
              {language === 'de' ? 'Keine Unternehmen vorhanden' : 'No companies available'}
            </p>
          ) : (
            <>
              {/* Company Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                  {t.selectCompany}
                </label>
                <select
                  value={selectedCompany?.id || ''}
                  onChange={(e) => {
                    const company = companies.find((c) => c.id === e.target.value);
                    setSelectedCompany(company);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg
                             bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100
                             focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* QR Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setQrType('review')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${qrType === 'review'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                    }
                  `}
                >
                  {t.reviewPage}
                </button>
                <button
                  onClick={() => setQrType('signup')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${qrType === 'signup'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                    }
                  `}
                >
                  {t.signupPage}
                </button>
              </div>

              {/* QR Code Display */}
              <div ref={printRef} className="flex justify-center py-4">
                <QRCode url={getQRUrl()} size={200} />
              </div>

              {/* URL Display */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-dark-400 break-all">{getQRUrl()}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button onClick={handlePrint} className="w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {t.printQR}
                </Button>
                <Button variant="secondary" onClick={handleCopy} className="w-full">
                  {copied ? (
                    <span className="text-green-600 dark:text-green-400">
                      {language === 'de' ? 'Kopiert!' : 'Copied!'}
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      {language === 'de' ? 'Link kopieren' : 'Copy Link'}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
