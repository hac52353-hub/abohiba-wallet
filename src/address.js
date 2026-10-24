import { getAddress, isAddress, sha256 } from 'viem'

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Decode(str) {
  if (!str || /[^1-9A-HJ-NP-Za-km-z]/.test(str)) return null
  let n = 0n
  for (const ch of str) n = n * 58n + BigInt(B58.indexOf(ch))
  const bytes = []
  while (n > 0n) { bytes.unshift(Number(n & 0xffn)); n >>= 8n }
  for (const ch of str) { if (ch === '1') bytes.unshift(0); else break }
  return Uint8Array.from(bytes)
}

/** EVM: returns the EIP-55 checksummed address, or null if the value is not a valid 20-byte address. */
export function normalizeEvm(value) {
  if (typeof value !== 'string' || !isAddress(value, { strict: false })) return null
  return getAddress(value)
}

/** Solana: a valid address is a base58 string that decodes to exactly 32 bytes. */
export function normalizeSolana(value) {
  const bytes = base58Decode(value)
  return bytes && bytes.length === 32 ? value : null
}

/** TRON: base58check, 25 bytes, 0x41 prefix, double-SHA256 checksum. */
export function normalizeTron(value) {
  const bytes = base58Decode(value)
  if (!bytes || bytes.length !== 25 || bytes[0] !== 0x41) return null
  const body = bytes.slice(0, 21)
  const check = sha256(sha256(body, 'bytes'), 'bytes')
  for (let i = 0; i < 4; i++) if (check[i] !== bytes[21 + i]) return null
  return value
}

const validators = { evm: normalizeEvm, solana: normalizeSolana, tron: normalizeTron }

/** Validates an address for a network's address kind. Returns the display value or null. */
export function validateForNetwork(network, value) {
  return validators[network.addressKind]?.(value) ?? null
}

export const shorten = (value, head = 6, tail = 6) =>
  value && value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value || ''
