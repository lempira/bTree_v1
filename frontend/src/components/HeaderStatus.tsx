// frontend/src/components/HeaderStatus.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@txnlab/use-wallet";
import { isLocalNet } from "../chain/account-manager";
import { getUserAccount } from "../utils/indexdb";

function shortAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

type ConnectionPhase = "connected" | "connecting" | "disconnected";

export default function HeaderStatus(): JSX.Element {
  const wallet = useWallet();
  const { activeAddress, activeAccount, connectedAccounts, providers } = wallet;

  // Ref for dialog element
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Error state for account selection
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Map of account addresses to userTypes
  const [accountUserTypes, setAccountUserTypes] = useState<Map<string, string>>(new Map());

  // Active provider (assume single wallet)
  const activeProvider = useMemo(
    () => providers?.find((p) => (p as any).isActive) ?? providers?.[0],
    [providers]
  );

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
      dialogRef.current?.showModal();
    } catch (err) {
      console.error("Failed to connect to KMD:", err);
    }
  }, [activeProvider, providers]);

  // Load userTypes for all connected accounts when they change
  useEffect(() => {
    async function loadUserTypes() {
      const userTypeMap = new Map<string, string>();

      for (const acc of connectedAccounts) {
        const userAccount = await getUserAccount(acc.address);
        if (userAccount) {
          userTypeMap.set(acc.address, userAccount.userType);
        }
      }

      setAccountUserTypes(userTypeMap);
    }

    if (connectedAccounts.length > 0) {
      void loadUserTypes();
    }
  }, [connectedAccounts]);

  const handleSelectAccount = useCallback(
    async (accountAddress: string) => {
      const target = activeProvider ?? providers?.[0];
      if (!target) {
        console.warn("No wallet provider available");
        return;
      }

      try {
        // Check if account has a userType in IndexedDB
        const userAccount = await getUserAccount(accountAddress);

        if (!userAccount) {
          setSelectionError("This account has no assigned user type. Please create an account through Sign Up first.");
          return;
        }

        // Clear any previous errors
        setSelectionError(null);

        // Set the selected account as active
        target.setActiveAccount?.(accountAddress);
        dialogRef.current?.close();
      } catch (err) {
        console.error("Failed to set active account:", err);
        setSelectionError("Failed to verify account. Please try again.");
      }
    },
    [activeProvider, providers]
  );

  const shortAddr = useMemo(() => (address ? shortAddress(address) : null), [address]);

  // Build badge label
  const pillLabel = useMemo(() => {
    if (phase === "connecting") return "Connecting...";
    if (phase === "connected") {
      return shortAddr || "Connected";
    }
    return "Not connected";
  }, [phase, shortAddr]);

  return (
    <div className="flex items-center whitespace-nowrap relative">
      {/* Connecting or Connected state */}
      {phase !== "disconnected" && (
        <span
          aria-live="polite"
          className={`badge badge-lg ${
            phase === "connected" ? "badge-success" : "badge-warning"
          }`}
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
          className="btn btn-primary btn-sm"
        >
          Sign In
        </button>
      )}

      {/* Disconnect button when connected */}
      {phase === "connected" && (
        <button
          type="button"
          onClick={() => void handleDisconnect()}
          className="btn btn-outline btn-sm ml-2"
        >
          Disconnect
        </button>
      )}

      {/* Account picker modal */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Select Account</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose a KMD account to sign in
          </p>

          {selectionError && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{selectionError}</span>
            </div>
          )}

          <div className="py-4">
            {connectedAccounts.length === 0 ? (
              <div className="text-sm text-gray-500">
                No KMD accounts available
              </div>
            ) : (
              <ul className="menu menu-vertical w-full">
                {connectedAccounts.map((acc) => {
                  const userType = accountUserTypes.get(acc.address);
                  const displayUserType = userType
                    ? userType.charAt(0).toUpperCase() + userType.slice(1)
                    : "No userType";

                  return (
                    <li key={acc.address}>
                      <button
                        type="button"
                        onClick={() => void handleSelectAccount(acc.address)}
                        className="flex items-center justify-between"
                      >
                        <span className="font-mono">{shortAddress(acc.address)}</span>
                        <span className={`badge badge-sm ${userType ? 'badge-primary' : 'badge-error'}`}>
                          {displayUserType}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm" onClick={() => setSelectionError(null)}>Cancel</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setSelectionError(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}