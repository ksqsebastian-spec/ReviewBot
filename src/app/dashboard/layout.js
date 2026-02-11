/*
  Dashboard Layout

  Wraps all /dashboard/* pages with consistent styling.
  Simple layout with padding - QR functionality has been moved
  to individual company cards in the dashboard page.

  NEXT.JS LAYOUTS:
  - layout.js in a folder wraps all pages in that folder
  - They can be nested (root layout → dashboard layout → page)
*/

export default function DashboardLayout({ children }) {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-950">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
