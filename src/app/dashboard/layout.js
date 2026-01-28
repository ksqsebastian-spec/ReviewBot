'use client';

import QRCodePanel from '@/components/dashboard/QRCodePanel';

/*
  Dashboard Layout

  Wraps all /dashboard/* pages with:
  - QR Code panel (right, collapsible)

  Note: Sidebar is now in the root layout (visible on all pages).

  NEXT.JS LAYOUTS:
  - layout.js in a folder wraps all pages in that folder
  - They can be nested (root layout → dashboard layout → page)
*/

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-1">
      {/* Main content area */}
      <div className="flex-1 min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-950">
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
