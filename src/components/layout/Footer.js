import { APP_CONFIG } from '@/lib/constants';

/*
  Footer Component

  Simple footer with copyright.
  This is a Server Component (no 'use client') since it has no interactivity.
*/

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-sm text-gray-500 dark:text-dark-400 text-center">
          © {currentYear} {APP_CONFIG.appName}. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
