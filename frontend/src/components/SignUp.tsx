import React, { useState, useCallback } from 'react'
import { createNewAccount, isLocalNet } from '../chain/account-manager'
import { NavLink } from 'react-router-dom'

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '1.5rem',
  background: '#ffffff',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

const primaryActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.6rem 1rem',
  border: '1px solid #111827',
  borderRadius: 8,
  background: '#111827',
  color: '#ffffff',
  fontWeight: 600,
  textDecoration: 'none',
  cursor: 'pointer',
}

const successBoxStyle: React.CSSProperties = {
  padding: '1rem',
  borderRadius: 8,
  background: '#ecfdf5',
  border: '1px solid #10b981',
  marginTop: '0.5rem',
}

function shortAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

export default function SignUp(): JSX.Element {
  const [creating, setCreating] = useState(false)
  const [createdAddress, setCreatedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateAccount = useCallback(async () => {
    if (!isLocalNet()) {
      setError('Account creation is only available on LocalNet')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newAddress = await createNewAccount()
      setCreatedAddress(newAddress)
      console.log('Account created successfully:', newAddress)
    } catch (err: any) {
      console.error('Failed to create account:', err)
      setError(err?.message || 'Failed to create account')
    } finally {
      setCreating(false)
    }
  }, [])

  if (!isLocalNet()) {
    return (
      <article style={cardStyle}>
        <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Sign Up</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
          Account creation is only available on LocalNet. Please set{' '}
          <code style={{ background: '#f3f4f6', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
            VITE_NETWORK=LOCALNET
          </code>{' '}
          in your .env file.
        </p>
      </article>
    )
  }

  return (
    <article style={cardStyle}>
      <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Sign Up</h2>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
        Create a new account for this experiment. Your account will be funded with 10 Algos from the
        LocalNet test wallet.
      </p>

      {!createdAddress && (
        <button
          type="button"
          onClick={handleCreateAccount}
          disabled={creating}
          style={{
            ...primaryActionStyle,
            opacity: creating ? 0.6 : 1,
            cursor: creating ? 'wait' : 'pointer',
          }}
        >
          {creating ? 'Creating Account...' : 'Create New Account'}
        </button>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #ef4444',
            marginTop: '0.5rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#dc2626' }}>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {createdAddress && (
        <>
          <div style={successBoxStyle}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>
              ✓ Account created successfully!
            </p>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.85rem',
                color: '#065f46',
                fontFamily: 'monospace',
              }}
            >
              <strong>Address:</strong> {shortAddress(createdAddress)}
            </p>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#065f46',
              }}
            >
              Your account has been funded with 10 Algos and saved to your browser.
            </p>
          </div>

          <p
            style={{
              margin: '0.75rem 0 0 0',
              fontSize: '0.85rem',
              color: '#4b5563',
            }}
          >
            Ready to continue? Visit the{' '}
            <NavLink
              to="/subject/register"
              style={{ color: '#1d4ed8', textDecoration: 'underline' }}
            >
              subject registration
            </NavLink>{' '}
            page.
          </p>
        </>
      )}
    </article>
  )
}