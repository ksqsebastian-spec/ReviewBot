'use client';

import Link from 'next/link';
import { APP_CONFIG } from '@/lib/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';

/*
  Header Component

  Simple branding bar with logo, app name, and theme toggle.
  No navigation needed — customers land directly on the review page via QR code.
*/

export default function Header() {
  return (
    <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              className="w-9 h-9"
              viewBox="0 0 40 56"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 2L6 10V18C6 22.4183 9.58172 26 14 26H26C30.4183 26 34 22.4183 34 18V10L20 2Z"
                className="fill-indigo-900 dark:fill-indigo-400"
              />
              <path
                d="M20 0L4 9L6 10L20 2L34 10L36 9L20 0Z"
                className="fill-indigo-900 dark:fill-indigo-400"
              />
              <text
                x="20"
                y="19"
                textAnchor="middle"
                className="fill-white dark:fill-indigo-900"
                fontSize="12"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                W
              </text>
              <rect
                x="17"
                y="26"
                width="6"
                height="24"
                rx="1"
                className="fill-indigo-900 dark:fill-indigo-400"
              />
              <rect
                x="23"
                y="40"
                width="6"
                height="3"
                rx="1"
                className="fill-indigo-900 dark:fill-indigo-400"
              />
              <rect
                x="23"
                y="46"
                width="4"
                height="3"
                rx="1"
                className="fill-indigo-900 dark:fill-indigo-400"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {APP_CONFIG.appName}
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
