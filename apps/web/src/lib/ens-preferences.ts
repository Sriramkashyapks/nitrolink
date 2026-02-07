/**
 * ENS Text Records for DeFi Preferences
 * 
 * This file demonstrates how to read and write DeFi preferences to ENS text records.
 * This is the CREATIVE DeFi use case for ENS!
 * 
 * Example text record keys:
 * - 'defi.slippage' → '0.5' (0.5% slippage tolerance)
 * - 'defi.favorite_tokens' → 'ETH,USDC,DAI'  
 * - 'defi.default_chain' → '1' (Ethereum mainnet)
 * - 'defi.default_recipient' → '0x...' or 'recipient.eth'
 */

import { createPublicClient, http, createWalletClient } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// Create a public client for reading ENS data
const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

/**
 * Read a DeFi preference from ENS text records
 * 
 * @example
 * const slippage = await readDeFiPreference('vitalik.eth', 'defi.slippage');
 * // Returns: '0.5' or null if not set
 */
export async function readDeFiPreference(
    ensName: string,
    key: string
): Promise<string | null> {
    try {
        const result = await publicClient.getEnsText({
            name: normalize(ensName),
            key: key,
        });
        return result;
    } catch (error) {
        console.error(`Failed to read ${key} from ${ensName}:`, error);
        return null;
    }
}

/**
 * Read all DeFi preferences for an ENS name
 */
export async function readAllDeFiPreferences(ensName: string) {
    const [slippage, favoriteTokens, defaultChain, defaultRecipient] = await Promise.all([
        readDeFiPreference(ensName, 'defi.slippage'),
        readDeFiPreference(ensName, 'defi.favorite_tokens'),
        readDeFiPreference(ensName, 'defi.default_chain'),
        readDeFiPreference(ensName, 'defi.default_recipient'),
    ]);

    return {
        slippage: slippage ? parseFloat(slippage) : 0.5, // Default 0.5%
        favoriteTokens: favoriteTokens ? favoriteTokens.split(',') : [],
        defaultChain: defaultChain ? parseInt(defaultChain) : 1,
        defaultRecipient: defaultRecipient ?? undefined,
    };
}

/**
 * Example: Use ENS preferences in a swap
 * 
 * This function demonstrates how to use stored preferences
 * in actual DeFi operations
 */
export async function getSwapSettingsFromENS(userENS: string) {
    const prefs = await readAllDeFiPreferences(userENS);

    return {
        // Use user's preferred slippage from their ENS
        slippageTolerance: prefs.slippage,

        // Only show their favorite tokens in the UI
        tokenWhitelist: prefs.favoriteTokens,

        // Default to their preferred chain
        defaultChainId: prefs.defaultChain,

        // Pre-fill recipient if they have a default
        defaultRecipient: prefs.defaultRecipient,
    };
}

/**
 * Example usage in React component:
 * 
 * ```tsx
 * const { data: ensName } = useEnsName({ address });
 * const [preferences, setPreferences] = useState(null);
 * 
 * useEffect(() => {
 *   if (ensName) {
 *     readAllDeFiPreferences(ensName).then(setPreferences);
 *   }
 * }, [ensName]);
 * 
 * // Use preferences in your swap
 * const slippageTolerance = preferences?.slippage || 0.5;
 * ```
 */

// Example preferences object
export const EXAMPLE_DEFI_PREFERENCES = {
    slippage: 0.5,
    favoriteTokens: ['ETH', 'USDC', 'DAI', 'WBTC'],
    defaultChain: 1,
    defaultRecipient: 'donations.eth',
};

/**
 * Write DeFi preferences to ENS (requires ownership)
 * 
 * Note: This requires the user to own the ENS name and sign transactions.
 * This would be implemented in a settings page where users can configure their preferences.
 * 
 * @example
 * await writeDeFiPreference('myname.eth', 'defi.slippage', '0.3', walletClient);
 */
export async function writeDeFiPreference(
    ensName: string,
    key: string,
    value: string,
    walletClient: any // WalletClient from wagmi
): Promise<string> {
    // This would use the ENS Public Resolver contract to set text records
    // Implementation requires:
    // 1. Get the resolver for the ENS name
    // 2. Call setText on the resolver
    // 3. Sign and send the transaction

    // Pseudocode (actual implementation would use ENS contracts):
    /*
    const resolverAddress = await publicClient.getEnsResolver({ name: normalize(ensName) });
    const hash = await walletClient.writeContract({
      address: resolverAddress,
      abi: RESOLVER_ABI,
      functionName: 'setText',
      args: [namehash(ensName), key, value],
    });
    return hash;
    */

    throw new Error('Write implementation requires ENS resolver contract integration');
}

/**
 * Benefits of storing DeFi preferences in ENS:
 * 
 * 1. **Portable**: Preferences follow you across all DeFi apps
 * 2. **Decentralized**: No centralized database needed
 * 3. **Transparent**: Anyone can see your default settings
 * 4. **Immutable**: Can't be changed without your signature
 * 5. **Composable**: Other apps can use your preferences too!
 */
