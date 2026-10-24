// Wallet layer. One Reown AppKit instance with three adapters:
//   - Wagmi adapter   -> every EVM network (Ethereum, BNB Smart Chain, Polygon, Arbitrum, Optimism, Base)
//   - Solana adapter  -> Solana
//   - TRON adapter    -> TRON (TronLink, Trust Wallet, OKX, MetaMask-TRON + WalletConnect)
// Connecting only exposes the PUBLIC address. This module never requests a signature, a transaction,
// or a token approval.
import { getAccount as wagmiGetAccount, watchChainId, switchChain as wagmiSwitchChain } from '@wagmi/core'
import { NETWORKS, NAMESPACE, byId, evmByChainId } from './networks.js'

// Public WalletConnect / Reown project identifier. It is not a secret (it ships in every dApp bundle).
// It can be overridden at build time with VITE_REOWN_PROJECT_ID without editing source.
const PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID || '8afb2c1ca4d2aa9fb5f92b49880291b6'

// WalletConnect Explorer ids, shown first in the wallet list.
const FEATURED_WALLETS = [
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393'  // Phantom
]

let kit = null
let wagmiConfig = null
let initPromise = null
const listeners = new Set()
const pending = { namespace: null }

export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const emit = (event) => listeners.forEach((fn) => { try { fn(event) } catch (e) { console.error(e) } })

export const isReady = () => Boolean(kit)

export function init() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const [
      { createAppKit }, { WagmiAdapter }, { SolanaAdapter }, { TronAdapter }, nets,
      { TronLinkAdapter }, { TrustAdapter }, { OkxWalletAdapter }, { MetaMaskAdapter }
    ] = await Promise.all([
      import('@reown/appkit'),
      import('@reown/appkit-adapter-wagmi'),
      import('@reown/appkit-adapter-solana'),
      import('@reown/appkit-adapter-tron'),
      import('@reown/appkit/networks'),
      import('@tronweb3/tronwallet-adapter-tronlink'),
      import('@tronweb3/tronwallet-adapter-trust'),
      import('@tronweb3/tronwallet-adapter-okxwallet'),
      import('@tronweb3/tronwallet-adapter-metamask-tron')
    ])

    const evmNetworks = [nets.mainnet, nets.bsc, nets.polygon, nets.arbitrum, nets.optimism, nets.base]
    const networks = [...evmNetworks, nets.solana, nets.tronMainnet]

    const wagmi = new WagmiAdapter({ projectId: PROJECT_ID, networks: evmNetworks })
    wagmiConfig = wagmi.wagmiConfig

    const metadata = {
      name: 'NEXORA — Multi-Chain Portfolio',
      description: 'Connect a wallet to view your public address and balances. Read-only: no transactions, no approvals.',
      url: window.location.origin,
      icons: [new URL('favicon.svg', window.location.href).href]
    }

    kit = createAppKit({
      adapters: [
        wagmi,
        new SolanaAdapter(),
        new TronAdapter({
          walletAdapters: [
            new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
            new TrustAdapter(),
            new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
            new MetaMaskAdapter()
          ]
        })
      ],
      networks,
      defaultNetwork: nets.mainnet,
      projectId: PROJECT_ID,
      metadata,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#8b7cf6',
        '--w3m-color-mix': '#0b1020',
        '--w3m-color-mix-strength': 24,
        '--w3m-border-radius-master': '2px',
        '--w3m-z-index': 1000
      },
      featuredWalletIds: FEATURED_WALLETS,
      allowUnsupportedChain: true, // our own card explains unsupported networks instead of a surprise modal
      enableWalletGuide: false,
      enableMobileFullScreen: true,
      features: { analytics: false, email: false, socials: [], swaps: false, onramp: false, buy: false, send: false, receive: false, history: false }
    })

    const ns = [NAMESPACE.EVM, NAMESPACE.SOLANA, NAMESPACE.TRON]
    ns.forEach((n) => kit.subscribeAccount(() => emit({ type: 'account', namespace: n }), n))
    watchChainId(wagmiConfig, { onChange: () => emit({ type: 'chain', namespace: NAMESPACE.EVM }) })
    kit.subscribeNetwork(() => emit({ type: 'chain' }))

    kit.subscribeEvents(({ data }) => {
      if (!data) return
      if (data.event === 'USER_REJECTED') emit({ type: 'error', kind: 'rejected', message: data.properties?.message })
      else if (data.event === 'CONNECT_ERROR') emit({ type: 'error', kind: classifyError(data.properties?.message), message: data.properties?.message })
    })
    kit.subscribeState((state) => {
      if (state.open === false && pending.namespace) {
        const ns = pending.namespace
        pending.namespace = null
        // Give the account subscription a moment to deliver a fresh connection before reporting a cancel.
        setTimeout(() => emit({ type: 'modal-closed', namespace: ns, connected: accountFor(ns).connected }), 400)
      }
    })
    emit({ type: 'ready' })
    return kit
  })().catch((error) => {
    initPromise = null
    throw error
  })
  return initPromise
}

export function classifyError(message = '') {
  const m = String(message).toLowerCase()
  if (/reject|denied|declin|cancel|4001|5000/.test(m)) return 'rejected'
  if (/timeout|timed out|expired/.test(m)) return 'timeout'
  if (/unsupported|not support|namespace|chain/.test(m)) return 'unsupported'
  return 'unknown'
}

/** Returns what the wallet reports for one namespace, without trusting any cached UI value. */
export function accountFor(namespace) {
  if (!kit) return { connected: false }
  const acc = kit.getAccount(namespace)
  const connected = Boolean(acc?.isConnected && acc?.address)
  if (!connected) return { connected: false }
  const caip = acc.caipAddress || kit.getCaipAddress(namespace)
  const parts = caip ? caip.split(':') : []
  let chainRef = parts.length >= 3 ? parts[1] : undefined
  let network = null
  if (namespace === NAMESPACE.EVM) {
    // wagmi is the source of truth for the EVM chain the wallet is on right now
    const w = wagmiConfig ? wagmiGetAccount(wagmiConfig) : null
    const id = w?.chainId ?? (chainRef ? Number(chainRef) : undefined)
    chainRef = id
    network = id ? evmByChainId(id) ?? null : null
  } else {
    network = NETWORKS.find((n) => n.namespace === namespace && n.chainId === chainRef) ?? null
  }
  const info = kit.getWalletInfo?.(namespace)
  return { connected: true, address: acc.address, chainRef, network, walletName: info?.name, walletIcon: info?.icon }
}

/** Opens the wallet picker restricted to the namespace of the selected network. */
export async function connect(networkId) {
  const network = byId(networkId)
  const k = await init()
  pending.namespace = network.namespace
  try {
    const target = k.getCaipNetworks(network.namespace).find((n) => String(n.id) === String(network.chainId))
    if (target && network.namespace === NAMESPACE.EVM && !accountFor(network.namespace).connected) {
      k.setCaipNetwork(target)
    }
    await k.open({ view: 'Connect', namespace: network.namespace })
  } catch (error) {
    pending.namespace = null
    throw error
  }
}

export async function disconnect(namespace) {
  if (!kit) return
  await kit.disconnect(namespace)
  emit({ type: 'account', namespace })
}

/**
 * Asks the connected EVM wallet to move to the chosen network, then verifies the wallet really is on it.
 * Never reports success before the wallet confirms.
 */
export async function switchEvmNetwork(networkId) {
  const network = byId(networkId)
  if (network.namespace !== NAMESPACE.EVM) throw new Error('not-evm')
  await init()
  await wagmiSwitchChain(wagmiConfig, { chainId: network.chainId })
  const now = wagmiGetAccount(wagmiConfig).chainId
  if (now !== network.chainId) throw new Error('switch-not-confirmed')
  emit({ type: 'chain', namespace: NAMESPACE.EVM })
  return true
}
