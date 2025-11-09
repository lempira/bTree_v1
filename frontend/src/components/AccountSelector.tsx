import React, { useState, useEffect } from "react";
import { getAllAccounts } from "../utils/indexdb";
import { useActiveAccount } from "../hooks/useActiveAccount";
import type { UserAccount } from "../utils/indexdb";

function shortAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function AccountSelector() {
  const { activeAddress, setActiveAccount } = useActiveAccount();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);

  // Load all accounts from IndexedDB
  useEffect(() => {
    async function loadAccounts() {
      try {
        const allAccounts = await getAllAccounts();
        setAccounts(allAccounts);
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    }

    loadAccounts();
  }, []);

  // Don't show selector if 0 or 1 accounts
  if (accounts.length <= 1) return null;

  const current = activeAddress || accounts[0]?.accountAddress || "";

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addr = e.target.value;
    try {
      setActiveAccount(addr);
    } catch (err) {
      console.error("Failed to set active account:", err);
    }
  };

  const getDisplayText = (account: UserAccount): string => {
    if (account.displayName) {
      return `${account.displayName} (${shortAddress(account.accountAddress)})`;
    }
    return shortAddress(account.accountAddress);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label htmlFor="acctSel" style={{ fontSize: 13, color: "#444" }}>Account:</label>
      <select id="acctSel" value={current} onChange={onChange} style={{ padding: "6px 8px", borderRadius: 6 }}>
        {accounts.map((account) => (
          <option key={account.accountAddress} value={account.accountAddress}>
            {getDisplayText(account)}
          </option>
        ))}
      </select>
    </div>
  );
}

