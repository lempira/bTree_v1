import { AlgorandClient } from '@algorandfoundation/algokit-utils'

/**
 * Get an AlgorandClient instance based on the current environment.
 *
 * - LOCALNET: Pre-configured for localhost:4001 with KMD support
 * - TESTNET: Pre-configured for AlgoNode TestNet
 * - MAINNET: Pre-configured for AlgoNode MainNet
 *
 * The client instance includes:
 * - Automatic suggested params caching (3 second default)
 * - Account, Asset, App, and Client managers
 * - Transaction creation and sending utilities
 */
export function getAlgorandClient(): AlgorandClient {
  const network = (import.meta.env.VITE_NETWORK as string | undefined)?.toUpperCase() ?? 'TESTNET'

  switch (network) {
    case 'LOCALNET':
      // Pre-configured for AlgoKit LocalNet
      // Defaults: http://localhost:4001, token: 'a'.repeat(64)
      return AlgorandClient.defaultLocalNet()

    case 'TESTNET':
      // Pre-configured for AlgoNode TestNet
      // Uses: https://testnet-api.algonode.cloud
      return AlgorandClient.testNet()

    case 'MAINNET':
      // Pre-configured for AlgoNode MainNet
      // Uses: https://mainnet-api.algonode.cloud
      return AlgorandClient.mainNet()

    default:
      // Fallback to custom configuration from environment variables
      return AlgorandClient.fromConfig({
        algodConfig: {
          server: import.meta.env.VITE_TESTNET_ALGOD_URL || 'https://testnet-api.algonode.cloud',
          port: 443,
          token: (import.meta.env.VITE_TESTNET_ALGOD_TOKEN as string) || ''
        },
        indexerConfig: {
          server: import.meta.env.VITE_TESTNET_INDEXER_URL || 'https://testnet-idx.algonode.cloud',
          port: 443,
          token: ''
        }
      })
  }
}

/**
 * Singleton AlgorandClient instance.
 * Use this throughout the application for all Algorand interactions.
 *
 * Example usage:
 * ```typescript
 * import { algorand } from '@/chain/algorand-client'
 *
 * // Get account info
 * const info = await algorand.account.getInformation(address)
 *
 * // Send a payment
 * const result = await algorand.send.payment({
 *   sender,
 *   receiver,
 *   amount: microAlgo(1000000)
 * })
 *
 * // Create transaction group
 * const group = await algorand.newGroup()
 *   .addPayment({ sender, receiver, amount })
 *   .addAppCall({ sender, appId, method: 'someMethod' })
 *   .send()
 * ```
 */
export const algorand = getAlgorandClient()