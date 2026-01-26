import Sidebar from '@/components/layout/Sidebar';

/*
  Dashboard Layout

  Wraps all /dashboard/* pages with a sidebar navigation.
  This is a nested layout - it adds to the root layout, not replaces it.

  NEXT.JS LAYOUTS:
  - layout.js in a folder wraps all pages in that folder
  - They can be nested (root layout → dashboard layout → page)
  - Great for shared UI like sidebars that only appear in certain sections
*/

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </div>
  );
}
