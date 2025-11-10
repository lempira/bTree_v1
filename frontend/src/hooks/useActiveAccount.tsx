import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

const STORAGE_KEY = 'btree_active_account';

interface ActiveAccountContextType {
  activeAddress: string | null;
  setActiveAccount: (accountId: string) => void;
  clearActiveAccount: () => void;
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(undefined);

export function ActiveAccountProvider({ children }: { children: ReactNode }) {
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

  return (
    <ActiveAccountContext.Provider
      value={{
        activeAddress,
        setActiveAccount: setActive,
        clearActiveAccount: clearActive,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
}

export function useActiveAccount() {
  const context = useContext(ActiveAccountContext);
  if (context === undefined) {
    throw new Error('useActiveAccount must be used within an ActiveAccountProvider');
  }
  return context;
}