# NEXORA — Multi-Chain Portfolio

Read-only multi-chain wallet view. The user picks a network, presses **إظهار العنوان / Show address**, connects a wallet
(Trust Wallet, MetaMask, OKX, Phantom, TronLink and any WalletConnect wallet) and sees their **public address** and
**real on-chain balances**. Arabic (RTL) and English.

Live site: https://hac52353-hub.github.io/abohiba-wallet/

## What it does and does not do

| Does | Does not |
| --- | --- |
| Connect a wallet through Reown AppKit / WalletConnect | Ask for a recovery phrase, private key or password |
| Show the public address for the selected network, with copy button | Request signatures, transactions or token approvals |
| Read balances from public RPC / TronGrid endpoints | Call any smart contract that moves funds |
| Ask the wallet (official `wallet_switchEthereumChain`) to change EVM network, then verify it | Show demo balances, invented prices or fake addresses |

Swap and Send are **not enabled**. They are shown as disabled and execute nothing. They are planned as separate phases that
must display network, recipient and fees and require explicit user approval.

## Networks and how each is really supported

| Network | Standard | Connector | Balance source |
| --- | --- | --- | --- |
| Ethereum, BNB Smart Chain, Polygon, Arbitrum, Optimism, Base | ERC20 / BEP20 | Reown Wagmi adapter (`eip155`) | publicnode RPC with fallback |
| Solana | SPL | Reown Solana adapter (`solana`) | publicnode / mainnet-beta RPC |
| TRON | TRC20 | Reown TRON adapter (`tron`) + TronLink, Trust, OKX, MetaMask-TRON adapters | TronGrid |

Address formats are different and are validated before display (EIP-55 for EVM, base58 32 bytes for Solana,
base58check `0x41` for TRON). An address from one namespace is never displayed for another.

Root cause of the earlier Ethereum-only behaviour: AppKit was created with `networks = [mainnet]` and only the Wagmi (EVM)
adapter. Without the Solana and TRON adapters and their networks, no non-EVM connection could ever be offered.

## Develop

```bash
npm ci --legacy-peer-deps      # AppKit pins exact peer versions for the TRON wallet adapters
npm run dev
npm run build
npm run verify:tokens          # checks every token in src/networks.js on-chain
```

Configuration lives in `src/networks.js` (networks, tokens) and `src/wallet.js` (AppKit). See `.env.example`.

## Deploy

GitHub Actions (`.github/workflows/pages.yml`) builds with Vite and publishes `dist/` to GitHub Pages on every push to `main`.
In *Settings → Pages* the source must be **GitHub Actions**.

See [SECURITY.md](SECURITY.md) for the security review and the Google Safe Browsing procedure.
