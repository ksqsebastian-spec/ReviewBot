'use client';

import { useState, useEffect } from 'react';
import { getAllCompanies } from '@/lib/companyData';

/*
  useCompanies Hook

  Returns the hardcoded company list.
  Keeps the same API (companies, loading, error, refetch) so all
  consuming components work without changes.

  WHY KEEP THE HOOK?
  - Components already import it — no need to update every consumer
  - The loading/error/refetch interface stays consistent
  - If we ever go back to Supabase, we only change this file
*/

export default function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCompanies(getAllCompanies());
    setLoading(false);
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: () => setCompanies(getAllCompanies()),
  };
}
