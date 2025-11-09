// frontend/src/components/HeaderStatus.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAccount, getAllAccounts } from "../utils/indexdb";
import { useActiveAccount } from "../hooks/useActiveAccount";
import type { UserAccount } from "../utils/indexdb";

function shortAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function HeaderStatus(): JSX.Element {
  const { activeAddress, setActiveAccount, clearActiveAccount } = useActiveAccount();
  const navigate = useNavigate();

  // Ref for dialog element
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Error state for account selection
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // All accounts from IndexedDB
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>([]);

  // Load all accounts from IndexedDB
  useEffect(() => {
    async function loadAccounts() {
      try {
        const accounts = await getAllAccounts();
        setAllAccounts(accounts);
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    }

    loadAccounts();
  }, []);

  const isConnected = Boolean(activeAddress);

  const handleDisconnect = useCallback(async () => {
    try {
      clearActiveAccount();
      // Navigate to home page after disconnect
      navigate("/");
    } catch (err) {
      console.warn("disconnect failed", err);
    }
  }, [clearActiveAccount, navigate]);

  const handleSignIn = useCallback(async () => {
    try {
      // Load all accounts from IndexedDB
      const accounts = await getAllAccounts();
      setAllAccounts(accounts);

      // Show the account picker modal
      dialogRef.current?.showModal();
    } catch (err) {
      console.error("Failed to load accounts:", err);
    }
  }, []);

  const handleSelectAccount = useCallback(
    async (accountAddress: string) => {
      try {
        // Check if account has a userType in IndexedDB
        const userAccount = await getUserAccount(accountAddress);

        if (!userAccount) {
          setSelectionError("This account has no assigned user type. Please create an account through Sign Up first.");
          return;
        }

        // Clear any previous errors
        setSelectionError(null);

        // Set the selected account as active in this tab
        setActiveAccount(accountAddress);
        dialogRef.current?.close();

        // Redirect to appropriate dashboard based on userType
        const dashboardRoute = `/dashboard/${userAccount.userType}`;
        navigate(dashboardRoute);
      } catch (err) {
        console.error("Failed to set active account:", err);
        setSelectionError("Failed to verify account. Please try again.");
      }
    },
    [setActiveAccount, navigate]
  );

  const shortAddr = activeAddress ? shortAddress(activeAddress) : null;

  // Build badge label
  const pillLabel = isConnected ? (shortAddr || "Connected") : "Not connected";

  return (
    <div className="flex items-center whitespace-nowrap relative">
      {/* Connected state */}
      {isConnected && (
        <span
          aria-live="polite"
          className="badge badge-lg badge-success"
          title={activeAddress ?? undefined}
        >
          {pillLabel}
        </span>
      )}

      {/* Sign In button when disconnected */}
      {!isConnected && (
        <button
          type="button"
          onClick={() => void handleSignIn()}
          className="btn btn-primary btn-sm"
        >
          Sign In
        </button>
      )}

      {/* Disconnect button when connected */}
      {isConnected && (
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
            Choose an account to sign in
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
            {allAccounts.length === 0 ? (
              <div className="text-sm text-gray-500">
                No accounts available. Please create an account first.
              </div>
            ) : (
              <ul className="menu menu-vertical w-full">
                {allAccounts.map((account) => {
                  const displayUserType = account.userType.charAt(0).toUpperCase() + account.userType.slice(1);

                  // Different badge colors for each userType
                  const badgeColor =
                    account.userType === 'subject' ? 'badge-info' :
                    account.userType === 'experimenter' ? 'badge-success' :
                    'badge-warning';

                  return (
                    <li key={account.accountAddress}>
                      <button
                        type="button"
                        onClick={() => void handleSelectAccount(account.accountAddress)}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">
                            {account.displayName || shortAddress(account.accountAddress)}
                          </span>
                          <span className={`badge badge-sm ${badgeColor}`}>
                            {displayUserType}
                          </span>
                        </div>
                        {account.displayName && (
                          <span className="text-xs text-gray-500 font-mono mt-1">
                            {shortAddress(account.accountAddress)}
                          </span>
                        )}
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