import { APP_CONFIG } from '@/lib/constants';

/*
  Footer Component

  Simple footer with copyright and useful links.
  This is a Server Component (no 'use client') since it has no interactivity.

  WHY SERVER COMPONENTS?
  Next.js 14 uses React Server Components by default.
  Components without interactivity (no useState, no event handlers)
  can be server-rendered, which is faster and reduces JavaScript sent to browser.
*/

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-500 dark:text-dark-400">
            © {currentYear} {APP_CONFIG.appName}. Alle Rechte vorbehalten.
          </p>

          {/* Links */}
          <nav className="flex items-center gap-4" aria-label="Footer-Navigation">
            <a
              href="/faq"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-dark-200"
            >
              FAQ
            </a>
            <a
              href="/faq#best-practices"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-dark-200"
            >
              Best Practices
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
