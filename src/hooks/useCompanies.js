'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

/*
  useCompanies Hook

  Fetches and manages company data.
  Reusable across components that need company list.

  WHY A HOOK?
  - Same fetch logic used in 4+ places
  - Centralizes error handling
  - Consistent loading states
  - Easy to extend (add caching, filtering, etc.)
*/

export default function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    if (!supabase) {
      setError('Datenbankverbindung nicht verfügbar');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('id, name, slug')
        .order('name');

      if (fetchError) throw fetchError;
      setCompanies(data || []);
    } catch (err) {
      setError('Unternehmen konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies,
  };
}
