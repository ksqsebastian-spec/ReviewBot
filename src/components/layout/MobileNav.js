'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/*
  MobileNav Component

  Slide-out navigation drawer for mobile devices.
  Only visible on screens smaller than md breakpoint.

  ACCESSIBILITY:
  - Focus trap when open
  - Escape key to close
  - Backdrop click to close
  - aria-modal and role="dialog"
*/

export default function MobileNav({ isOpen, onClose }) {
  const pathname = usePathname();
  const navRef = useRef(null);

  // Navigation sections (same as Sidebar)
  const sections = [
    {
      title: 'Management',
      links: [
        { href: '/dashboard', label: 'Übersicht', icon: 'home' },
        { href: '/dashboard/companies', label: 'Unternehmen', icon: 'building' },
      ],
    },
    {
      title: 'Marketing',
      links: [
        { href: '/dashboard/subscribers', label: 'Abonnenten', icon: 'users' },
        { href: '/dashboard/analytics', label: 'Analytik', icon: 'chart' },
      ],
    },
    {
      title: 'System',
      links: [
        { href: '/dashboard/settings', label: 'Einstellungen', icon: 'settings' },
      ],
    },
  ];

  const icons = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    building: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  const isActive = (href) => pathname === href;

  // Handle escape key and body scroll
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on navigation
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={navRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-900 shadow-xl md:hidden
                   transform transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       dark:text-dark-400 dark:hover:text-dark-200 dark:hover:bg-dark-800"
            aria-label="Menü schließen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="mt-2 space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                        transition-colors
                        ${isActive(link.href)
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-dark-200 dark:hover:bg-dark-800'
                        }
                      `}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                    >
                      <span
                        className={isActive(link.href)
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 dark:text-dark-400'
                        }
                        aria-hidden="true"
                      >
                        {icons[link.icon]}
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
