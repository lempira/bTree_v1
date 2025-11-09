import React, { useState, useEffect } from "react";
import { useWallet, PROVIDER_ID } from "@txnlab/use-wallet";
import { getUserAccount } from "../utils/indexdb";

function shortAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function AccountSelector() {
  const { providers, activeAddress, activeAccount } = useWallet();
  const pera = providers?.find((p) => p.metadata.id === PROVIDER_ID.PERA);
  const accounts = pera?.accounts || [];
  const [accountAliases, setAccountAliases] = useState<Map<string, string>>(new Map());

  // Load aliases for all accounts
  useEffect(() => {
    async function loadAliases() {
      const aliasMap = new Map<string, string>();

      for (const acc of accounts) {
        const userAccount = await getUserAccount(acc.address);
        if (userAccount?.displayName) {
          aliasMap.set(acc.address, userAccount.displayName);
        }
      }

      setAccountAliases(aliasMap);
    }

    if (accounts.length > 0) {
      void loadAliases();
    }
  }, [accounts]);

  if (!pera || accounts.length <= 1) return null;

  const current = activeAddress || activeAccount?.address || accounts[0]?.address || "";

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addr = e.target.value;
    try { pera.setActiveAccount(addr); } catch {}
  };

  const getDisplayText = (address: string): string => {
    const alias = accountAliases.get(address);
    if (alias) {
      return `${alias} (${shortAddress(address)})`;
    }
    return shortAddress(address);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label htmlFor="acctSel" style={{ fontSize: 13, color: "#444" }}>Account:</label>
      <select id="acctSel" value={current} onChange={onChange} style={{ padding: "6px 8px", borderRadius: 6 }}>
        {accounts.map((a) => (
          <option key={a.address} value={a.address}>
            {getDisplayText(a.address)}
          </option>
        ))}
      </select>
    </div>
  );
}

