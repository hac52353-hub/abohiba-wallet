# ABOHIBA Web3

A single-page Arabic RTL interface for connecting MetaMask to the deployed Ethereum contract and reading its `owner()` value.

## Contract
- Network: Ethereum Mainnet (chain ID 1)
- Address: `0xC8e465edb4c9e63be7c7d9f28467f544256ce1f1`

## Current scope
- Connects to an injected wallet (MetaMask).
- Checks Ethereum Mainnet before enabling read interactions.
- Reads `owner()` only.
- Links to the contract on Etherscan.
- Does not request token approvals or send transactions.
- `pullBalance(address,address)` is intentionally not exposed until the verified contract logic and authorization model are reviewed.

## Publish with GitHub Pages
1. Open repository Settings → Pages.
2. Under Build and deployment, choose Deploy from a branch.
3. Select `main` and `/(root)`, then Save.
4. Wait for GitHub Pages to publish the site. The URL will appear in Settings → Pages.

The page loads ethers.js from jsDelivr, so an internet connection is required. This interface is not a security audit of the deployed contract. Never enter a seed phrase or private key into the site.
