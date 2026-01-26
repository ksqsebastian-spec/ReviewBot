'use client';

import Sidebar from '@/components/layout/Sidebar';
import QRCodePanel from '@/components/dashboard/QRCodePanel';

/*
  Dashboard Layout

  Wraps all /dashboard/* pages with:
  - Sidebar navigation (left)
  - QR Code panel (right, collapsible)

  NEXT.JS LAYOUTS:
  - layout.js in a folder wraps all pages in that folder
  - They can be nested (root layout → dashboard layout → page)
  - Great for shared UI like sidebars that only appear in certain sections
*/

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
        {children}
      </div>

      {/* QR Code panel (collapsible, right side) */}
      <QRCodePanel language="de" />
    </div>
  );
}
