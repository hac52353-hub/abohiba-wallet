# Security review — NEXORA

## History finding: `pullBalance`

Earlier commits (`66d3a25` … `329bed1`, October 2026) contained a page that:

* loaded `ethers` from `cdn.jsdelivr.net` at runtime (third-party script),
* embedded the contract `0xC8e465EDb4C9e63be7C7D9F28467F544256ce1F1` on Ethereum Mainnet,
* offered an owner-gated `pullBalance(token, source)` flow that calls `transferFrom` to move a wallet's **entire approved
  token balance**.

The contract has no verified source (Sourcify has no match), so where `pullBalance` sends the funds could not be verified.
A function that moves another wallet's tokens through a prior approval is a drain primitive, and a page combining
"connect wallet" with such a function matches the pattern that safe-browsing systems flag. It is **removed from the current
tree** (commit `bb68574`) and this version contains no code that moves funds, no contract write calls and no approvals.
The old commits are still visible in git history; rewriting history was deliberately not done without the owner's decision.

Anyone who ever approved that contract should revoke the approval (revoke.cash, or the wallet's own approvals screen).

## Current guarantees (verified in code)

* No `signMessage`, `signTypedData`, `sendTransaction`, `writeContract`, `approve` anywhere in `src/`.
* No `innerHTML`, `eval`, `new Function`, inline scripts. All wallet/RPC data is rendered with `textContent`.
* Content-Security-Policy (meta): scripts only from the site itself; connections only to WalletConnect/Reown and the listed
  public RPC/indexer hosts; no `object`, no `base`, no form posts. Fonts are self-hosted.
* Explorer links use `rel="noopener noreferrer"`; addresses are validated per network before use in any URL.
* Reown project id is public by design. Restrict it to the site's domain in the Reown dashboard.
* Third-party code that ships inside AppKit's wagmi connectors (Coinbase Wallet SDK) tries to inject an inline telemetry
  script; the CSP blocks it. It only appears as a console message.

## Google Safe Browsing / Search Console

Do not change host or domain to hide the warning. Steps:

1. Make sure the deployed site is this version (Actions run green, page source has no `cdn.jsdelivr.net`).
2. Check the status: https://transparencyreport.google.com/safe-browsing/search?url=hac52353-hub.github.io
3. Verify ownership of `https://hac52353-hub.github.io/abohiba-wallet/` in Google Search Console and open
   *Security & Manual Actions → Security issues*, then **Request review** describing the removal of the
   `pullBalance`/approval flow and the CDN script.
4. Re-check after Google responds (usually a few days). Until then the warning may still appear.
