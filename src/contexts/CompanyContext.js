'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/*
  CompanyContext

  Provides global company selection state across all dashboard pages.
  The Header shows a company selector on /dashboard/* routes, and each
  dashboard page reads the selected company to filter its data.

  WHY A CONTEXT?
  Multiple dashboard pages and the Header all need access to the same
  "which company is selected?" state. Context avoids prop drilling and
  keeps selection in sync across page navigations.

  PERSISTENCE:
  Selected company ID is stored in localStorage so it survives
  page refreshes (same pattern as the useTheme hook).

  LAZY LOADING:
  Companies are only fetched from Supabase when the user visits a
  /dashboard route, avoiding unnecessary API calls on public pages.
*/

const STORAGE_KEY = 'selected-company-id';

const CompanyContext = createContext(undefined);

export function CompanyProvider({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Read persisted selection from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== 'null') {
        setSelectedCompanyIdState(saved);
      }
    } catch {
      // localStorage unavailable (SSR or privacy mode)
    }
  }, []);

  // Fetch companies when a dashboard page is first visited
  useEffect(() => {
    if (!isDashboard || hasFetched || !supabase) return;

    async function fetchCompanies() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, slug')
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
      } catch {
        // Fetch failed — selector will be empty
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }

    fetchCompanies();
  }, [isDashboard, hasFetched]);

  // Setter that also persists to localStorage
  const setSelectedCompanyId = useCallback((id) => {
    setSelectedCompanyIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id ?? 'null');
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Refetch companies after create/delete operations
  const refetchCompanies = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch {
      // Silently fail
    }
  }, []);

  // Derived: full company object for the selected ID
  const selectedCompany = selectedCompanyId
    ? companies.find((c) => c.id === selectedCompanyId) || null
    : null;

  return (
    <CompanyContext.Provider
      value={{
        companies,
        selectedCompanyId,
        selectedCompany,
        setSelectedCompanyId,
        loading,
        refetchCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
}
