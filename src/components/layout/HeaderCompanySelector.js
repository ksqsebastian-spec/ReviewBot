'use client';

import { useCompanyContext } from '@/contexts/CompanyContext';

/*
  HeaderCompanySelector

  Compact dropdown displayed in the Header bar on dashboard routes.
  Allows switching between "Alle Unternehmen" (all) and a specific company.

  WHY IN THE HEADER?
  Users wanted one central place to switch the active company, rather than
  individual selectors on each dashboard page. Placing it in the Header
  makes the selection visible and accessible from every dashboard page.

  The context (CompanyContext) handles state persistence via localStorage
  so the selection survives page navigations and refreshes.
*/

export default function HeaderCompanySelector() {
  const { companies, selectedCompanyId, setSelectedCompanyId, loading } = useCompanyContext();

  if (loading) {
    return (
      <div className="w-36 h-8 bg-gray-100 dark:bg-dark-800 rounded-lg animate-pulse" />
    );
  }

  if (companies.length === 0) return null;

  return (
    <select
      value={selectedCompanyId || 'all'}
      onChange={(e) => {
        const value = e.target.value;
        setSelectedCompanyId(value === 'all' ? null : value);
      }}
      className="
        px-3 py-1.5 text-sm font-medium rounded-lg border
        border-gray-200 bg-white text-gray-700
        dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        cursor-pointer max-w-[200px] truncate
      "
      aria-label="Unternehmen auswählen"
    >
      <option value="all">Alle Unternehmen</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  );
}
