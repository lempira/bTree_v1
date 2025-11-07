// frontend/src/components/HeaderStatus.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@txnlab/use-wallet";
import { isLocalNet } from "../chain/account-manager";

function shortAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatNetworkLabel(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes("mainnet")) return "TestNet".replace("Test", "Main"); // "MainNet"
  if (normalized.includes("testnet")) return "TestNet";
  if (normalized.includes("betanet")) return "BetaNet";
  if (normalized.includes("sandbox")) return "Sandbox";
  if (normalized.includes("local")) return "LocalNet";
  return value;
}

type ConnectionPhase = "connected" | "connecting" | "disconnected";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export default function HeaderStatus(): JSX.Element {
  const wallet = useWallet();
  const { activeAddress, activeAccount, connectedAccounts, providers, clients } = wallet;

  // State for account picker modal
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Active provider (assume single wallet)
  const activeProvider = useMemo(
    () => providers?.find((p) => (p as any).isActive) ?? providers?.[0],
    [providers]
  );
  const providerId = (activeProvider as any)?.metadata?.id;
  const providerName = (activeProvider as any)?.metadata?.name ?? "Wallet";

  // Infer network label once
  const networkLabel = useMemo(() => {
    const providerNetwork = (activeProvider as any)?.network as string | undefined;

    const providerClient = providerId && clients ? (clients as any)[providerId] : undefined;
    const clientNetwork =
      (providerClient?.network as string | undefined) ??
      (providerClient?.genesisID as string | undefined) ??
      (providerClient?.genesisId as string | undefined) ??
      (providerClient?.genesisHash as string | undefined);

    const envFallback = (import.meta as any)?.env?.VITE_NETWORK as string | undefined;

    const inferred = providerNetwork ?? clientNetwork ?? envFallback;
    return formatNetworkLabel(inferred);
  }, [activeProvider, clients, providerId]);

  // Derive address
  const address = useMemo(() => {
    const addr =
      activeAccount?.address ||
      activeAddress ||
      (connectedAccounts?.length ? connectedAccounts[0]?.address : null);
    return addr ?? null;
  }, [activeAccount, activeAddress, connectedAccounts]);

  const isConnected = Boolean(address);
  const isConnectingFlag = Boolean(
    (wallet as any)?.isConnecting || (wallet as any)?.status === "CONNECTING"
  );

  // Debounce "connecting" flicker
  const [showConnecting, setShowConnecting] = useState(isConnectingFlag);
  useEffect(() => {
    if (isConnectingFlag && address) {
      const t = window.setTimeout(() => setShowConnecting(false), 50);
      return () => window.clearTimeout(t);
    }
    setShowConnecting(isConnectingFlag);
    return undefined;
  }, [address, isConnectingFlag]);

  const phase: ConnectionPhase = useMemo(() => {
    if (isConnected) return "connected";
    return showConnecting ? "connecting" : "disconnected";
  }, [isConnected, showConnecting]);

  const handleDisconnect = useCallback(async () => {
    const target = activeProvider ?? providers?.[0];
    try {
      await (target as any)?.disconnect?.();
    } catch (err) {
      console.warn("disconnect failed", err);
    }
  }, [activeProvider, providers]);

  const handleSignIn = useCallback(async () => {
    if (!isLocalNet()) {
      console.warn("Sign in is only available on LocalNet");
      return;
    }

    const target = activeProvider ?? providers?.[0];
    if (!target) {
      console.warn("No wallet provider available");
      return;
    }

    try {
      // Connect to KMD provider - this automatically fetches all accounts
      await target.connect();

      // Set as active provider if not already
      if (!target.isActive) {
        target.setActiveProvider?.();
      }

      // Show the account picker modal
      setShowAccountPicker(true);
    } catch (err) {
      console.error("Failed to connect to KMD:", err);
    }
  }, [activeProvider, providers]);

  const handleSelectAccount = useCallback(
    (accountAddress: string) => {
      const target = activeProvider ?? providers?.[0];
      if (!target) {
        console.warn("No wallet provider available");
        return;
      }

      try {
        // Set the selected account as active
        target.setActiveAccount?.(accountAddress);
        setShowAccountPicker(false);
      } catch (err) {
        console.error("Failed to set active account:", err);
      }
    },
    [activeProvider, providers]
  );

  const shortAddr = useMemo(() => (address ? shortAddress(address) : null), [address]);

  // Build a single pill label; network appears ONLY here
  const pillLabel = useMemo(() => {
    if (phase === "connecting") return "Connecting...";
    if (phase === "connected") {
      const parts = ["Connected", providerName, networkLabel].filter(Boolean);
      const baseLabel = parts.join(" \u2022 ");
      return shortAddr ? `${baseLabel} <${shortAddr}>` : baseLabel;
    }
    return "Not connected";
  }, [phase, providerName, networkLabel, shortAddr]);

  return (
    <div className="flex items-center whitespace-nowrap relative">
      {/* Connecting or Connected state */}
      {phase !== "disconnected" && (
        <span
          aria-live="polite"
          className={classNames(
            "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium",
            phase === "connected" && "bg-green-100 text-green-800",
            phase === "connecting" && "bg-yellow-100 text-yellow-800"
          )}
          title={phase === "connected" ? address ?? undefined : undefined}
        >
          {pillLabel}
        </span>
      )}

      {/* Sign In button when disconnected */}
      {phase === "disconnected" && (
        <button
          type="button"
          onClick={() => void handleSignIn()}
          className="inline-flex h-8 items-center rounded-full border border-blue-600 bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Sign In
        </button>
      )}

      {/* Disconnect button when connected */}
      {phase === "connected" && (
        <button
          type="button"
          onClick={() => void handleDisconnect()}
          className="inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium text-gray-800 transition hover:bg-gray-50 ml-2"
        >
          Disconnect
        </button>
      )}

      {/* Account picker modal */}
      {showAccountPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setShowAccountPicker(false)}
          />

          {/* Modal */}
          <div
            className="absolute right-0 top-10 z-50 w-80 rounded-lg border bg-white shadow-xl"
            style={{ maxHeight: "400px", overflow: "auto" }}
          >
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Account</h3>
              <p className="text-xs text-gray-600 mt-1">
                Choose a KMD account to sign in
              </p>
            </div>

            <div className="py-2">
              {connectedAccounts.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-500">
                  No KMD accounts available
                </div>
              ) : (
                connectedAccounts.map((acc, idx) => (
                  <button
                    key={acc.address}
                    type="button"
                    onClick={() => handleSelectAccount(acc.address)}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <span className="font-mono text-gray-900">{shortAddress(acc.address)}</span>
                    <span className="text-gray-500">Account {idx + 1}</span>
                  </button>
                ))
              )}
            </div>

            <div className="border-t px-4 py-2">
              <button
                type="button"
                onClick={() => setShowAccountPicker(false)}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

