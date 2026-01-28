'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/*
  Sidebar Component

  Navigation sidebar for the dashboard area.
  Shows different sections: Companies, Email List, Analytics.

  WHY A SEPARATE SIDEBAR?
  The dashboard needs more navigation options than the main header.
  A sidebar keeps these organized without cluttering the main nav.
*/

export default function Sidebar() {
  const pathname = usePathname();

  // Dashboard navigation sections
  const sections = [
    {
      title: 'Management',
      links: [
        { href: '/dashboard', label: 'Übersicht', icon: 'home' },
        { href: '/dashboard/companies', label: 'Unternehmen', icon: 'building' },
      ],
    },
    {
      title: 'Tools',
      links: [
        { href: '/dashboard/qr-codes', label: 'QR-Codes', icon: 'qrcode' },
        { href: '/dashboard/signup-links', label: 'Anmelde-Links', icon: 'link' },
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

  // Simple icon components
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
    qrcode: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    link: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    mail: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

  return (
    <aside className="w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-6" aria-label="Dashboard-Navigation">
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
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
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
    </aside>
  );
}
