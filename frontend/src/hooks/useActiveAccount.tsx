import { useState, useCallback } from 'react';

const STORAGE_KEY = 'btree_active_account';

export function useActiveAccount() {
  const [activeAddress, setActiveAddress] = useState<string | null>(() => {
    // Initialize from sessionStorage (per-tab storage)
    return sessionStorage.getItem(STORAGE_KEY);
  });

  const setActive = useCallback((accountId: string) => {
    sessionStorage.setItem(STORAGE_KEY, accountId);
    setActiveAddress(accountId);
  }, []);

  const clearActive = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setActiveAddress(null);
  }, []);

  return {
    activeAddress,
    setActiveAccount: setActive,
    clearActiveAccount: clearActive,
  };
}