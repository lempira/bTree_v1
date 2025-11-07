import { algorand } from './algorand-client'
import { algos } from '@algorandfoundation/algokit-utils'

const STORAGE_KEY = 'btree_localnet_account'

/**
 * Get the current network environment
 */
export function getNetwork(): 'LOCALNET' | 'TESTNET' | 'MAINNET' {
  const network = (import.meta.env.VITE_NETWORK as string | undefined)?.toUpperCase() ?? 'TESTNET'
  if (network === 'LOCALNET') return 'LOCALNET'
  if (network === 'MAINNET') return 'MAINNET'
  return 'TESTNET'
}

/**
 * Check if we're on LocalNet
 */
export function isLocalNet(): boolean {
  return getNetwork() === 'LOCALNET'
}

/**
 * Create a new random account and fund it from KMD (LocalNet only)
 * Imports the account into KMD wallet so it can be used with @txnlab/use-wallet
 * Returns the new account address
 */
export async function createNewAccount(): Promise<string> {
  if (!isLocalNet()) {
    throw new Error('Account creation is only available on LocalNet')
  }

  // Generate random account
  const newAccount = algorand.account.random()
  const newAddress = String(newAccount.addr)

  console.log('Generated new account:', newAddress)

  // Get a KMD account to use as funder (any funded account)
  const funder = await algorand.account.fromKmd(
    'unencrypted-default-wallet',
    (account) => account.amount > 1_000_000 // Has at least 1 Algo
  )

  console.log('Funding new account from:', funder.addr)

  // Fund the new account with 10 Algos
  await algorand.account.ensureFunded(
    newAccount.addr,
    funder.addr,
    algos(10)
  )

  console.log('Successfully funded new account with 10 Algos')

  // Import the new account into KMD wallet
  console.log('Importing account into KMD wallet...')
  const kmdClient = algorand.client.kmd

  // Get wallet ID
  const wallets = await kmdClient.listWallets()
  const wallet = wallets.wallets.find((w: any) => w.name === 'unencrypted-default-wallet')

  if (!wallet) {
    throw new Error('KMD wallet "unencrypted-default-wallet" not found')
  }

  // Get wallet handle (like opening the wallet)
  const handleResp = await kmdClient.initWalletHandle(wallet.id, '')

  try {
    // Import the private key into KMD
    await kmdClient.importKey(handleResp.wallet_handle_token, newAccount.account.sk)
    console.log('Successfully imported account into KMD wallet')
  } finally {
    // Always release the wallet handle (close the wallet)
    await kmdClient.releaseWalletHandle(handleResp.wallet_handle_token)
  }

  // Store in localStorage
  storeLocalAccount(newAddress)

  return newAddress
}

/**
 * Store account address in localStorage (LocalNet only)
 */
export function storeLocalAccount(address: string): void {
  if (!isLocalNet()) return
  localStorage.setItem(STORAGE_KEY, address)
}

/**
 * Get stored account address from localStorage (LocalNet only)
 */
export function getStoredLocalAccount(): string | null {
  if (!isLocalNet()) return null
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Clear stored account from localStorage
 */
export function clearStoredLocalAccount(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Check if an account exists in localStorage
 */
export function hasStoredAccount(): boolean {
  return getStoredLocalAccount() !== null
}