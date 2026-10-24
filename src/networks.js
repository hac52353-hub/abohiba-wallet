// Single source of truth for supported networks and the tokens shown in the balance view.
// Every entry here is backed by a real connector (wagmi for EVM, Solana adapter, TRON adapter)
// and a real public data source. Nothing here is a placeholder.

export const NAMESPACE = { EVM: 'eip155', SOLANA: 'solana', TRON: 'tron' }

/**
 * id            internal key used by the UI
 * namespace     CAIP namespace, decides which wallet connector family is used
 * chainId       numeric for EVM, CAIP reference string for Solana / TRON
 * standard      token standard label shown to the user (a label, not an address format)
 * addressKind   how the address is validated before it is displayed
 * rpc           ordered list of public endpoints for read-only balance calls
 * explorer      base URL for the address page (always opened with rel=noopener)
 */
export const NETWORKS = [
  {
    id: 'tron', namespace: NAMESPACE.TRON, chainId: '0x2b6653dc', caip: 'tron:0x2b6653dc',
    name: 'TRON', standard: 'TRC20', native: { symbol: 'TRX', name: 'TRON', decimals: 6 },
    addressKind: 'tron', explorer: 'https://tronscan.org/#/address/',
    api: 'https://api.trongrid.io', glyph: 'T'
  },
  {
    id: 'ethereum', namespace: NAMESPACE.EVM, chainId: 1, caip: 'eip155:1',
    name: 'Ethereum', standard: 'ERC20', native: { symbol: 'ETH', name: 'Ether', decimals: 18 },
    addressKind: 'evm', explorer: 'https://etherscan.io/address/', glyph: 'Ξ',
    rpc: ['https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com']
  },
  {
    id: 'bsc', namespace: NAMESPACE.EVM, chainId: 56, caip: 'eip155:56',
    name: 'BNB Smart Chain', standard: 'BEP20', native: { symbol: 'BNB', name: 'BNB', decimals: 18 },
    addressKind: 'evm', explorer: 'https://bscscan.com/address/', glyph: 'B',
    rpc: ['https://bsc-rpc.publicnode.com', 'https://bsc-dataseed.binance.org']
  },
  {
    id: 'polygon', namespace: NAMESPACE.EVM, chainId: 137, caip: 'eip155:137',
    name: 'Polygon', standard: 'ERC20', native: { symbol: 'POL', name: 'POL', decimals: 18 },
    addressKind: 'evm', explorer: 'https://polygonscan.com/address/', glyph: 'P',
    rpc: ['https://polygon-bor-rpc.publicnode.com', 'https://polygon-rpc.com']
  },
  {
    id: 'arbitrum', namespace: NAMESPACE.EVM, chainId: 42161, caip: 'eip155:42161',
    name: 'Arbitrum', standard: 'ERC20', native: { symbol: 'ETH', name: 'Ether', decimals: 18 },
    addressKind: 'evm', explorer: 'https://arbiscan.io/address/', glyph: 'A',
    rpc: ['https://arbitrum-one-rpc.publicnode.com', 'https://arb1.arbitrum.io/rpc']
  },
  {
    id: 'optimism', namespace: NAMESPACE.EVM, chainId: 10, caip: 'eip155:10',
    name: 'Optimism', standard: 'ERC20', native: { symbol: 'ETH', name: 'Ether', decimals: 18 },
    addressKind: 'evm', explorer: 'https://optimistic.etherscan.io/address/', glyph: 'O',
    rpc: ['https://optimism-rpc.publicnode.com', 'https://mainnet.optimism.io']
  },
  {
    id: 'base', namespace: NAMESPACE.EVM, chainId: 8453, caip: 'eip155:8453',
    name: 'Base', standard: 'ERC20', native: { symbol: 'ETH', name: 'Ether', decimals: 18 },
    addressKind: 'evm', explorer: 'https://basescan.org/address/', glyph: 'B',
    rpc: ['https://base-rpc.publicnode.com', 'https://mainnet.base.org']
  },
  {
    id: 'solana', namespace: NAMESPACE.SOLANA, chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', caip: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana', standard: 'SPL', native: { symbol: 'SOL', name: 'Solana', decimals: 9 },
    addressKind: 'solana', explorer: 'https://solscan.io/account/', glyph: 'S',
    rpc: ['https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com']
  }
]

// Tokens read from public chain data. address = contract (EVM/TRON) or mint (Solana).
// Decimals and symbols were checked against the chains themselves (see scripts/verify-tokens.mjs).
export const TOKENS = {
  tron: [
    { symbol: 'USDT', name: 'Tether USD', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', decimals: 6 }
  ],
  ethereum: [
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 }
  ],
  bsc: [
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 }
  ],
  polygon: [
    { symbol: 'USDT0', name: 'Tether USD (USDT0)', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 }
  ],
  arbitrum: [
    { symbol: 'USDT0', name: 'Tether USD (USDT0)', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, onchainSymbol: 'USD₮0' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 }
  ],
  optimism: [
    { symbol: 'USDT', name: 'Tether USD', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6 }
  ],
  base: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 }
  ],
  solana: [
    { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 }
  ]
}

export const byId = (id) => NETWORKS.find((n) => n.id === id)
export const evmByChainId = (chainId) => NETWORKS.find((n) => n.namespace === NAMESPACE.EVM && n.chainId === Number(chainId))
export const isEvm = (network) => network.namespace === NAMESPACE.EVM
