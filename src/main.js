import { disconnect, getBalance, readContract } from '@wagmi/core'
import { formatUnits } from 'viem'
import { getAccount, watchAccount, watchChainId } from '@wagmi/core'

const projectId = '8afb2c1ca4d2aa9fb5f92b49880291b6'
const metadata = {
  name: 'ABOHIBA Wallet',
  description: 'ربط محفظة وقراءة الأرصدة فقط',
  url: 'https://hac52353-hub.github.io',
  icons: ['https://hac52353-hub.github.io/abohiba-wallet/favicon.svg']
}

let appKit = null
let config = null
let initialization = null
const tokens = [
  { id: 'usdcBalance', symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { id: 'usdtBalance', symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { id: 'daiBalance', symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 }
]
const erc20BalanceAbi = [{
  type: 'function',
  name: 'balanceOf',
  stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }]
}]
const $ = (id) => document.getElementById(id)
let refreshSequence = 0
let previouslyConnected = false

async function initializeWalletKit() {
  if (appKit) return appKit
  if (!initialization) {
    initialization = (async () => {
      const [{ createAppKit }, { WagmiAdapter }, { mainnet }] = await Promise.all([
        import('@reown/appkit'),
        import('@reown/appkit-adapter-wagmi'),
        import('@reown/appkit/networks')
      ])
      const networks = [mainnet]
      const adapter = new WagmiAdapter({ projectId, networks })
      config = adapter.wagmiConfig
      appKit = createAppKit({
        adapters: [adapter],
        networks,
        projectId,
        metadata,
        defaultNetwork: mainnet,
        enableWalletGuide: false,
        enableMobileFullScreen: true,
        features: {
          analytics: false,
          email: false,
          socials: [],
          swaps: false,
          onramp: false,
          buy: false,
          send: false,
          receive: false
        }
      })

      watchAccount(config, {
        onChange(account) {
          renderConnection()
          if (account.isConnected) {
            setStatus('تم ربط المحفظة. الموقع يقرأ العنوان والأرصدة فقط.', 'ok')
            refreshBalances()
          }
        }
      })

      watchChainId(config, {
        onChange(chainId) {
          const account = renderConnection()
          if (account.isConnected && chainId === 1) refreshBalances()
          else if (account.isConnected) setBalanceStatus('هذه الواجهة تعرض أرصدة Ethereum Mainnet فقط. غيّر الشبكة أو ارجع إلى Ethereum Mainnet.', 'error')
        }
      })

      const initialAccount = renderConnection()
      if (initialAccount.isConnected) refreshBalances()
      return appKit
    })().catch((error) => {
      initialization = null
      throw error
    })
  }
  return initialization
}

function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function setStatus(message, kind = '') {
  const node = $('status')
  node.textContent = message
  node.className = `status${kind ? ` ${kind}` : ''}`
}

function setBalanceStatus(message, kind = '') {
  const node = $('balanceStatus')
  node.textContent = message
  node.className = `status${kind ? ` ${kind}` : ''}`
}

function renderConnection() {
  const account = config ? getAccount(config) : { isConnected: false, address: undefined, chainId: undefined }
  const connected = account.isConnected && Boolean(account.address)
  $('walletState').innerHTML = connected ? '<span class="ok">متصل</span>' : 'غير متصل'
  $('account').textContent = connected ? account.address : '—'
  $('networkState').textContent = connected
    ? (account.chainId === 1 ? 'Ethereum Mainnet · Chain ID 1' : `شبكة أخرى · Chain ID ${account.chainId ?? '—'}`)
    : '—'
  $('connectBtn').hidden = connected
  $('disconnectBtn').hidden = !connected
  $('refreshBtn').disabled = !connected

  if (!connected) {
    clearBalances()
    setBalanceStatus('اربط محفظتك لعرض الأرصدة المدعومة.')
    if (previouslyConnected) setStatus('تم فصل المحفظة. يمكنك الربط مجددًا في أي وقت.')
  }
  previouslyConnected = connected
  return account
}

function clearBalances() {
  $('ethBalance').textContent = '— ETH'
  for (const token of tokens) $(token.id).textContent = `— ${token.symbol}`
}

function displayAmount(raw, decimals, suffix) {
  const value = Number(formatUnits(raw, decimals))
  if (!Number.isFinite(value)) return `0 ${suffix}`
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(value)} ${suffix}`
}

async function refreshBalances() {
  const account = renderConnection()
  if (!account.isConnected || !account.address) return
  if (account.chainId !== 1) {
    clearBalances()
    setBalanceStatus('الأرصدة المعروضة حاليًا مخصصة لـEthereum Mainnet. غيّر الشبكة من محفظتك ثم حدّث الصفحة.', 'error')
    return
  }

  const sequence = ++refreshSequence
  $('refreshBtn').disabled = true
  setBalanceStatus('جارٍ قراءة أرصدة ETH وUSDC وUSDT وDAI…')
  try {
    const ethPromise = getBalance(config, { address: account.address, chainId: 1 })
    const tokenPromises = tokens.map((token) => readContract(config, {
      address: token.address,
      abi: erc20BalanceAbi,
      functionName: 'balanceOf',
      args: [account.address],
      chainId: 1
    }))
    const [eth, ...balances] = await Promise.all([ethPromise, ...tokenPromises])
    if (sequence !== refreshSequence) return
    $('ethBalance').textContent = displayAmount(eth.value, 18, 'ETH')
    tokens.forEach((token, index) => {
      $(token.id).textContent = displayAmount(balances[index], token.decimals, token.symbol)
    })
    setBalanceStatus('تم تحديث الأرصدة من Ethereum Mainnet. هذه قراءات عامة فقط ولا تطلب توقيعًا.', 'ok')
  } catch (error) {
    if (sequence !== refreshSequence) return
    setBalanceStatus(`تعذرت قراءة الأرصدة: ${error?.shortMessage || error?.message || 'خطأ اتصال غير معروف'}`, 'error')
  } finally {
    if (sequence === refreshSequence) $('refreshBtn').disabled = false
  }
}

$('connectBtn').addEventListener('click', async () => {
  try {
    setStatus('اختر محفظتك من نافذة Reown. الاتصال لا يرسل معاملة ولا يطلب توقيعًا.')
    const walletKit = await initializeWalletKit()
    await walletKit.open({ view: 'Connect' })
    if (!getAccount(config).isConnected) setStatus('لم يتم ربط محفظة. يمكنك المحاولة مجددًا في أي وقت.')
  } catch (error) {
    setStatus(`تعذر فتح قائمة المحافظ: ${error?.message || 'خطأ غير معروف'}`, 'error')
  }
})

$('disconnectBtn').addEventListener('click', async () => {
  try {
    await disconnect(config)
    refreshSequence += 1
    renderConnection()
    setStatus('تم فصل المحفظة من الموقع.')
  } catch (error) {
    setStatus(`تعذر فصل المحفظة: ${error?.message || 'خطأ غير معروف'}`, 'error')
  }
})

$('refreshBtn').addEventListener('click', refreshBalances)

renderConnection()

