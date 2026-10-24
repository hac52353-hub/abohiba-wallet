// Read-only balance readers. They only call public RPC / indexer endpoints with the user's PUBLIC address.
// No wallet permission, signature or approval is involved, and no value is ever invented:
// every row is either a value returned by the data source or an explicit failure.
import { createPublicClient, fallback, http, formatUnits, parseAbi } from 'viem'
import { TOKENS, NAMESPACE } from './networks.js'

const erc20 = parseAbi(['function balanceOf(address) view returns (uint256)'])
const REQUEST_TIMEOUT = 12000

const clients = new Map()
function evmClient(network) {
  if (!clients.has(network.id)) {
    clients.set(network.id, createPublicClient({
      transport: fallback(network.rpc.map((url) => http(url, { timeout: REQUEST_TIMEOUT, retryCount: 1 })), { rank: false })
    }))
  }
  return clients.get(network.id)
}

async function jsonPost(urls, body) {
  let lastError
  for (const url of urls) {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), REQUEST_TIMEOUT)
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error.message || 'RPC error')
      return json.result
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError ?? new Error('RPC unavailable')
}

const row = (symbol, name, raw, decimals, extra = {}) => ({
  symbol, name, raw, decimals, status: 'ok', amount: formatUnits(raw, decimals), ...extra
})
const failed = (symbol, name, error, extra = {}) => ({
  symbol, name, status: 'error', error: String(error?.shortMessage || error?.message || error), ...extra
})

async function readEvm(network, address) {
  const client = evmClient(network)
  const native = client.getBalance({ address })
  const tokens = (TOKENS[network.id] || []).map((t) =>
    client.readContract({ address: t.address, abi: erc20, functionName: 'balanceOf', args: [address] }))
  const results = await Promise.allSettled([native, ...tokens])
  const [nativeRes, ...tokenRes] = results
  const rows = [
    nativeRes.status === 'fulfilled'
      ? row(network.native.symbol, network.native.name, nativeRes.value, network.native.decimals, { native: true })
      : failed(network.native.symbol, network.native.name, nativeRes.reason, { native: true })
  ]
  ;(TOKENS[network.id] || []).forEach((t, i) => {
    const r = tokenRes[i]
    rows.push(r.status === 'fulfilled' ? row(t.symbol, t.name, r.value, t.decimals, { contract: t.address })
      : failed(t.symbol, t.name, r.reason, { contract: t.address }))
  })
  return rows
}

async function readSolana(network, address) {
  const nativeP = jsonPost(network.rpc, { jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address, { commitment: 'confirmed' }] })
  const tokenPs = TOKENS.solana.map((t) => jsonPost(network.rpc, {
    jsonrpc: '2.0', id: 1, method: 'getTokenAccountsByOwner',
    params: [address, { mint: t.address }, { encoding: 'jsonParsed', commitment: 'confirmed' }]
  }))
  const [nativeRes, ...tokenRes] = await Promise.allSettled([nativeP, ...tokenPs])
  const rows = [
    nativeRes.status === 'fulfilled'
      ? row(network.native.symbol, network.native.name, BigInt(nativeRes.value.value), network.native.decimals, { native: true })
      : failed(network.native.symbol, network.native.name, nativeRes.reason, { native: true })
  ]
  TOKENS.solana.forEach((t, i) => {
    const r = tokenRes[i]
    if (r.status !== 'fulfilled') return rows.push(failed(t.symbol, t.name, r.reason, { contract: t.address }))
    const total = (r.value.value || []).reduce((sum, acc) => sum + BigInt(acc.account.data.parsed.info.tokenAmount.amount), 0n)
    rows.push(row(t.symbol, t.name, total, t.decimals, { contract: t.address }))
  })
  return rows
}

async function readTron(network, address) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), REQUEST_TIMEOUT)
  try {
    const res = await fetch(`${network.api}/v1/accounts/${encodeURIComponent(address)}`, { signal: ctl.signal })
    if (res.status === 429) throw new Error('TronGrid rate limit (HTTP 429)')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.success === false) throw new Error(json.error || 'TronGrid error')
    // An account that was never activated on-chain is simply absent: that is a real balance of zero.
    const account = json.data?.[0]
    const trc20 = Object.assign({}, ...(account?.trc20 || []))
    const rows = [row(network.native.symbol, network.native.name, BigInt(account?.balance ?? 0), network.native.decimals, { native: true })]
    for (const t of TOKENS.tron) rows.push(row(t.symbol, t.name, BigInt(trc20[t.address] ?? 0), t.decimals, { contract: t.address }))
    return { rows, inactive: !account }
  } finally {
    clearTimeout(timer)
  }
}

/** Returns { rows, inactive? }. Throws only when the whole data source is unreachable. */
export async function loadBalances(network, address) {
  if (network.namespace === NAMESPACE.EVM) return { rows: await readEvm(network, address) }
  if (network.namespace === NAMESPACE.SOLANA) return { rows: await readSolana(network, address) }
  if (network.namespace === NAMESPACE.TRON) return readTron(network, address)
  throw new Error('Unsupported network')
}

export function formatAmount(amount, locale = 'en-US') {
  const value = Number(amount)
  if (!Number.isFinite(value)) return amount
  if (value === 0) return '0'
  if (value < 0.000001) return '< 0.000001'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: value >= 1000 ? 2 : 6 }).format(value)
}
