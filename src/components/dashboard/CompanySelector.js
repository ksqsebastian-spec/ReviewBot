'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

/*
  Company Selector Component

  Dropdown to switch between viewing all companies or a specific company.
  Used in dashboard pages to filter data by company context.

  WHY THIS PATTERN?
  Instead of separate routes for each company, we use a context switcher.
  This keeps navigation simple while allowing focused views.

  Props:
  - selectedCompanyId: Currently selected company ID (null = all)
  - onCompanyChange: Callback when selection changes
  - showAllOption: Whether to show "All Companies" option (default: true)
*/

export default function CompanySelector({
  selectedCompanyId = null,
  onCompanyChange,
  showAllOption = true
}) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, slug')
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Handle selection change
  const handleChange = (e) => {
    const value = e.target.value;
    // Convert 'all' to null, otherwise keep the UUID
    onCompanyChange(value === 'all' ? null : value);
  };

  if (loading) {
    return (
      <div className="w-48 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
    );
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-gray-500">Keine Unternehmen vorhanden</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="company-selector" className="text-sm font-medium text-gray-700">
        Unternehmen:
      </label>
      <select
        id="company-selector"
        value={selectedCompanyId || 'all'}
        onChange={handleChange}
        className="
          px-3 py-2 border border-gray-300 rounded-lg
          bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          text-sm font-medium
        "
      >
        {showAllOption && (
          <option value="all">Alle Unternehmen</option>
        )}
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}
