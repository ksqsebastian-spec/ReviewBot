'use client';

import { useState, useRef, useCallback } from 'react';
import { getAllCompanies } from '@/lib/companyData';
import QRCode from '@/components/ui/QRCode';
import Card from '@/components/ui/Card';
import { copyToClipboard } from '@/lib/utils';

/*
  Home Page — QR Code Export & Management

  Internal page for the business owner to:
  - View all company QR codes at a glance
  - Copy review links
  - Copy QR codes as images (for flyers, emails, etc.)
  - Print individual or all QR codes
  - Open the review page to test it

  Not customer-facing. Customers scan the QR code and land on /review/[slug].
*/

export default function HomePage() {
  const companies = getAllCompanies();
  const [feedback, setFeedback] = useState({});
  const printRef = useRef(null);

  const getReviewUrl = (slug) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/review/${slug}`;
  };

  // Show temporary feedback on a button (e.g. "Kopiert!")
  const showFeedback = useCallback((key, message) => {
    setFeedback((prev) => ({ ...prev, [key]: message }));
    setTimeout(() => {
      setFeedback((prev) => ({ ...prev, [key]: null }));
    }, 2000);
  }, []);

  // Copy the review link to clipboard
  const handleCopyLink = async (company) => {
    const success = await copyToClipboard(getReviewUrl(company.slug));
    if (success) showFeedback(`link-${company.id}`, 'Link kopiert!');
  };

  // Copy QR code as a PNG image to clipboard
  const handleCopyQR = async (company) => {
    const svg = document.querySelector(`[data-qr="${company.id}"] svg`);
    if (!svg) return;

    try {
      // Convert SVG to canvas, then to PNG blob
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      });

      // Render at 2x for crisp output
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      showFeedback(`qr-${company.id}`, 'QR kopiert!');
    } catch {
      // Fallback: download as file if clipboard API not supported
      handleDownloadQR(company);
    }
  };

  // Download QR code as PNG
  const handleDownloadQR = (company) => {
    const svg = document.querySelector(`[data-qr="${company.id}"] svg`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = `qr-${company.slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    showFeedback(`qr-${company.id}`, 'Heruntergeladen!');
  };

  // Print all QR codes on one page
  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cards = companies.map((company) => {
      const url = getReviewUrl(company.slug);
      return `
        <div style="text-align:center; page-break-inside:avoid; padding:24px;">
          <h2 style="margin:0 0 8px; font-size:18px;">${company.name}</h2>
          <div id="qr-${company.id}" style="display:inline-block; padding:12px; background:#fff;"></div>
          <p style="margin:8px 0 0; font-size:11px; color:#666; word-break:break-all;">${url}</p>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR-Codes drucken</title>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"><\/script>
        <style>
          body { font-family: system-ui, sans-serif; margin: 24px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          @media print { body { margin: 12px; } }
        </style>
      </head>
      <body>
        <div class="grid">${cards}</div>
        <script>
          const companies = ${JSON.stringify(companies.map((c) => ({ id: c.id, slug: c.slug })))};
          const origin = "${typeof window !== 'undefined' ? window.location.origin : ''}";
          companies.forEach(c => {
            const el = document.getElementById('qr-' + c.id);
            if (el) {
              const canvas = document.createElement('canvas');
              QRCode.toCanvas(canvas, origin + '/review/' + c.slug, { width: 200, margin: 0 }, () => {
                el.appendChild(canvas);
              });
            }
          });
          // Wait for QR codes to render, then trigger print
          setTimeout(() => { window.print(); }, 500);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header with Print All button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          QR-Codes & Links
        </h1>

        <button
          onClick={handlePrintAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-gray-900 text-white hover:bg-gray-800
                     dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100
                     transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Alle drucken
        </button>
      </div>

      {/* Company Grid */}
      <div ref={printRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="flex flex-col items-center text-center gap-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {company.name}
            </h2>

            {/* QR Code (data-qr used for copy/download) */}
            <div data-qr={company.id} className="bg-white p-3 rounded-xl shadow-sm">
              <QRCode url={getReviewUrl(company.slug)} size={160} />
            </div>

            {/* URL preview */}
            <p className="text-xs text-gray-400 dark:text-dark-500 break-all px-2">
              /review/{company.slug}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 w-full">
              {/* Row 1: Copy Link + Copy QR */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(company)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${feedback[`link-${company.id}`]
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                    }`}
                >
                  {feedback[`link-${company.id}`] ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feedback[`link-${company.id}`]}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                      </svg>
                      Link
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopyQR(company)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${feedback[`qr-${company.id}`]
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700'
                    }`}
                >
                  {feedback[`qr-${company.id}`] ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feedback[`qr-${company.id}`]}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                      QR kopieren
                    </>
                  )}
                </button>
              </div>

              {/* Row 2: Download + Open */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadQR(company)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                             bg-gray-100 text-gray-700 hover:bg-gray-200
                             dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700
                             transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PNG laden
                </button>

                <a
                  href={`/review/${company.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-center
                             bg-primary-600 text-white hover:bg-primary-700
                             dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-dark-950
                             transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Öffnen
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
