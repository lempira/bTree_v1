import { saveUserAccount, deleteUserAccount, getAllAccounts } from '../utils/indexdb'
import type { UserAccount, UserType } from '../utils/indexdb'

/**
 * Create a new account with a generated UUID
 * Stores the account in IndexedDB
 * Returns the new account ID
 */
export async function createNewAccount(userType: UserType = 'subject', displayName?: string): Promise<string> {
  // Generate a UUID for the account ID
  const newAccountId = crypto.randomUUID()

  console.log('Generated new account:', newAccountId)

  // Store in IndexedDB
  await storeLocalAccount(newAccountId, userType, displayName)

  return newAccountId
}

/**
 * Store account in IndexedDB
 */
export async function storeLocalAccount(address: string, userType: UserType = 'subject', displayName?: string): Promise<void> {
  const account: UserAccount = {
    accountAddress: address,
    userType,
    createdAt: Date.now(),
    lastLogin: Date.now(),
    displayName,
  }

  await saveUserAccount(account)
}

/**
 * Get stored account address from IndexedDB
 */
export async function getStoredLocalAccount(): Promise<string | null> {
  const accounts = await getAllAccounts()
  return accounts.length > 0 ? accounts[0].accountAddress : null
}

/**
 * Clear stored account from IndexedDB
 */
export async function clearStoredLocalAccount(address: string): Promise<void> {
  await deleteUserAccount(address)
}

/**
 * Check if an account exists in IndexedDB
 */
export async function hasStoredAccount(): Promise<boolean> {
  const account = await getStoredLocalAccount()
  return account !== null
}