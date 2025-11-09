import { useState, useCallback, useMemo } from 'react'
import { createNewAccount, isLocalNet } from '../chain/account-manager'
import { NavLink, useNavigate } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet'
import type { UserType } from '../utils/indexdb'

function shortAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

export default function SignUp(): JSX.Element {
  const [creating, setCreating] = useState(false)
  const [createdAddress, setCreatedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedUserType, setSelectedUserType] = useState<UserType>('subject')
  const [alias, setAlias] = useState('')
  const navigate = useNavigate()
  const wallet = useWallet()
  const { providers } = wallet

  // Get active provider (KMD on LocalNet)
  const activeProvider = useMemo(
    () => providers?.find((p) => (p as any).isActive) ?? providers?.[0],
    [providers]
  )

  const handleCreateAccount = useCallback(async () => {
    if (!isLocalNet()) {
      setError('Account creation is only available on LocalNet')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newAddress = await createNewAccount(selectedUserType, alias.trim() || undefined)
      setCreatedAddress(newAddress)
      console.log('Account created successfully:', newAddress)

      // Connect to wallet provider and sign in the new account
      const target = activeProvider ?? providers?.[0]
      if (target) {
        try {
          // Connect to KMD if not already connected
          if (!target.isActive) {
            await target.connect()
            target.setActiveProvider?.()
          }

          // Set the newly created account as active
          target.setActiveAccount?.(newAddress)
          console.log('Signed in as:', newAddress)
        } catch (walletErr) {
          console.error('Failed to sign in to wallet:', walletErr)
        }
      }

      // Redirect to appropriate dashboard after successful account creation
      const dashboardRoute = `/dashboard/${selectedUserType}`
      navigate(dashboardRoute)
    } catch (err: any) {
      console.error('Failed to create account:', err)
      setError(err?.message || 'Failed to create account')
    } finally {
      setCreating(false)
    }
  }, [selectedUserType, alias, navigate, activeProvider, providers])

  if (!isLocalNet()) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Sign Up</h2>
          <p className="text-sm text-base-content/70">
            Account creation is only available on LocalNet. Please set{' '}
            <code className="bg-base-200 px-2 py-1 rounded text-xs">
              VITE_NETWORK=LOCALNET
            </code>{' '}
            in your .env file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Sign Up</h2>
        <p className="text-sm text-base-content/70">
          Create a new account for this experiment. Your account will be funded with 10 Algos from the
          LocalNet test wallet.
        </p>

        {!createdAddress && (
          <>
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-medium">Alias (Display Name)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., Alice, Bob, Lab123, etc."
                disabled={creating}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Optional: A friendly name to identify this account
                </span>
              </label>
            </div>

            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-medium">Account Type</span>
              </label>
              <div className="flex flex-row gap-6">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="userType"
                    className="radio radio-primary"
                    value="subject"
                    checked={selectedUserType === 'subject'}
                    onChange={(e) => setSelectedUserType(e.target.value as UserType)}
                    disabled={creating}
                  />
                  <span className="label-text">Subject</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="userType"
                    className="radio radio-primary"
                    value="experimenter"
                    checked={selectedUserType === 'experimenter'}
                    onChange={(e) => setSelectedUserType(e.target.value as UserType)}
                    disabled={creating}
                  />
                  <span className="label-text">Experimenter</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="userType"
                    className="radio radio-primary"
                    value="admin"
                    checked={selectedUserType === 'admin'}
                    onChange={(e) => setSelectedUserType(e.target.value as UserType)}
                    disabled={creating}
                  />
                  <span className="label-text">Admin</span>
                </label>
              </div>
            </div>

            <div className="card-actions justify-start mt-4">
              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={creating}
                className={`btn btn-primary ${creating ? 'btn-disabled' : ''}`}
              >
                {creating && <span className="loading loading-spinner loading-sm"></span>}
                {creating ? 'Creating Account...' : 'Create New Account'}
              </button>
            </div>
          </>
        )}

        {error && (
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
            <span>
              <strong>Error:</strong> {error}
            </span>
          </div>
        )}

        {createdAddress && (
          <>
            <div className="alert alert-success mt-4">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="font-semibold">Account created successfully!</div>
                <div className="text-xs font-mono mt-1">
                  <strong>Address:</strong> {shortAddress(createdAddress)}
                </div>
                <div className="text-xs mt-1">
                  <strong>Role:</strong> {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)}
                </div>
                <div className="text-xs mt-1">
                  Your account has been funded with 10 Algos and saved to your browser.
                </div>
              </div>
            </div>

            <p className="text-sm text-base-content/70 mt-4">
              Ready to continue? Visit the{' '}
              <NavLink
                to="/subject/register"
                className="link link-primary"
              >
                subject registration
              </NavLink>{' '}
              page.
            </p>
          </>
        )}
      </div>
    </div>
  )
}