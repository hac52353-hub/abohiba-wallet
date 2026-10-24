// Dev-only check: confirms every token in src/networks.js exists on its chain with the expected symbol/decimals.
// Run: node scripts/verify-tokens.mjs   (read-only public RPC calls, no keys needed)
import { createPublicClient, http, fallback, parseAbi } from 'viem'
import { NETWORKS, TOKENS } from '../src/networks.js'

const abi = parseAbi(['function symbol() view returns (string)', 'function decimals() view returns (uint8)'])
let failed = 0
const report = (ok, msg) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${msg}`); if (!ok) failed++ }

for (const net of NETWORKS) {
  const tokens = TOKENS[net.id] || []
  if (net.namespace === 'eip155') {
    const client = createPublicClient({ transport: fallback(net.rpc.map((u) => http(u))) })
    const cid = await client.getChainId()
    report(cid === net.chainId, `${net.id}: chainId ${cid} (expected ${net.chainId})`)
    for (const t of tokens) {
      try {
        const [symbol, decimals] = await Promise.all([
          client.readContract({ address: t.address, abi, functionName: 'symbol' }),
          client.readContract({ address: t.address, abi, functionName: 'decimals' })
        ])
        report((symbol === t.symbol || symbol === t.onchainSymbol) && decimals === t.decimals, `${net.id}/${t.symbol}: on-chain ${symbol}/${decimals}`)
      } catch (e) { report(false, `${net.id}/${t.symbol}: ${e.shortMessage || e.message}`) }
    }
  } else if (net.namespace === 'solana') {
    for (const t of tokens) {
      const r = await fetch(net.rpc[0], { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAccountInfo', params: [t.address, { encoding: 'jsonParsed' }] }) }).then((x) => x.json())
      const info = r.result?.value?.data?.parsed?.info
      report(info?.decimals === t.decimals, `solana/${t.symbol}: mint decimals ${info?.decimals}`)
    }
  } else if (net.namespace === 'tron') {
    const call = async (addr, fn) => {
      const r = await fetch(`${net.api}/wallet/triggerconstantcontract`, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ owner_address: addr, contract_address: addr, function_selector: fn, visible: true }) }).then((x) => x.json())
      await new Promise((res) => setTimeout(res, 1500))
      return r.constant_result?.[0]
    }
    for (const t of tokens) {
      const symHex = await call(t.address, 'symbol()')
      const decHex = await call(t.address, 'decimals()')
      const symbol = symHex ? Buffer.from(symHex.slice(128 + 0).replace(/(00)+$/, ''), 'hex').toString() : undefined
      const decimals = decHex ? parseInt(decHex, 16) : undefined
      report(symbol === t.symbol && decimals === t.decimals, `tron/${t.symbol}: on-chain ${symbol}/${decimals}`)
    }
  }
}
process.exit(failed ? 1 : 0)
