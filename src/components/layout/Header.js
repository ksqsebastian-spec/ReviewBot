'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/lib/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';

/*
  Header Component

  The main navigation bar shown across all pages.

  WHY usePathname?
  We highlight the current page's nav link so users know where they are.
  usePathname() returns the current URL path (e.g., "/dashboard").
*/

export default function Header() {
  const pathname = usePathname();

  // Navigation links configuration
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/faq', label: 'FAQ' },
  ];

  // Helper to check if link is active
  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-primary-600 dark:text-primary-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {APP_CONFIG.appName}
            </span>
          </Link>

          {/* Navigation Links + Theme Toggle */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(link.href)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-dark-200 dark:hover:text-white dark:hover:bg-dark-800'
                    }
                  `}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
