'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/lib/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';
import HeaderCompanySelector from '@/components/layout/HeaderCompanySelector';

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
    { href: '/companies', label: 'Unternehmen' },
    { href: '/dashboard', label: 'Dashboard' },
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
          <Link href="/" className="flex items-center gap-2.5">
            {/* Speech bubble with 5 stars - represents reviews + quality */}
            <svg
              className="w-9 h-9"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              {/* Speech bubble background */}
              <path
                d="M4 8C4 5.79086 5.79086 4 8 4H32C34.2091 4 36 5.79086 36 8V24C36 26.2091 34.2091 28 32 28H14L8 34V28H8C5.79086 28 4 26.2091 4 24V8Z"
                className="fill-primary-500 dark:fill-primary-400"
              />
              {/* 5 Stars inside */}
              <g className="fill-white dark:fill-dark-900">
                {/* Star 1 */}
                <path d="M8 14l.72 1.45 1.6.23-1.16 1.13.27 1.59L8 17.6l-1.43.8.27-1.59-1.16-1.13 1.6-.23L8 14z" />
                {/* Star 2 */}
                <path d="M14 14l.72 1.45 1.6.23-1.16 1.13.27 1.59-1.43-.8-1.43.8.27-1.59-1.16-1.13 1.6-.23L14 14z" />
                {/* Star 3 */}
                <path d="M20 14l.72 1.45 1.6.23-1.16 1.13.27 1.59-1.43-.8-1.43.8.27-1.59-1.16-1.13 1.6-.23L20 14z" />
                {/* Star 4 */}
                <path d="M26 14l.72 1.45 1.6.23-1.16 1.13.27 1.59-1.43-.8-1.43.8.27-1.59-1.16-1.13 1.6-.23L26 14z" />
                {/* Star 5 */}
                <path d="M32 14l.72 1.45 1.6.23-1.16 1.13.27 1.59-1.43-.8-1.43.8.27-1.59-1.16-1.13 1.6-.23L32 14z" />
              </g>
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

            {/* Company Selector — only visible on dashboard pages */}
            {pathname.startsWith('/dashboard') && (
              <div className="hidden sm:block border-l border-gray-200 dark:border-dark-700 pl-2 ml-1">
                <HeaderCompanySelector />
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
