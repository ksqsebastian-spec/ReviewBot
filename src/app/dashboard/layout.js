'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import QRCodePanel from '@/components/dashboard/QRCodePanel';
import MobileNav from '@/components/layout/MobileNav';

/*
  Dashboard Layout

  Wraps all /dashboard/* pages with:
  - Sidebar navigation (left, hidden on mobile)
  - Mobile navigation (hamburger menu on mobile)
  - QR Code panel (right, collapsible)

  NEXT.JS LAYOUTS:
  - layout.js in a folder wraps all pages in that folder
  - They can be nested (root layout → dashboard layout → page)
  - Great for shared UI like sidebars that only appear in certain sections
*/

export default function DashboardLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex">
      {/* Desktop Sidebar navigation */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        {/* Mobile header with hamburger */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
                       dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Menü öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>

      {/* QR Code panel (collapsible, right side) */}
      <QRCodePanel language="de" />
    </div>
  );
}
