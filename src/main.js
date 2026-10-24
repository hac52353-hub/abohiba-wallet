import '@fontsource/ibm-plex-sans-arabic/arabic-400.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css'
import '@fontsource/ibm-plex-sans-arabic/latin-400.css'
import '@fontsource/ibm-plex-sans-arabic/latin-500.css'
import '@fontsource/ibm-plex-sans-arabic/latin-600.css'
import '@fontsource/ibm-plex-sans-arabic/latin-700.css'
import './styles.css'

import { NETWORKS, NAMESPACE, byId } from './networks.js'
import { validateForNetwork, shorten } from './address.js'
import { loadBalances, formatAmount } from './balances.js'
import { t, setLang, getLang, locale, applyStatic } from './i18n.js'
import * as wallet from './wallet.js'

// ---------- tiny DOM helper (text only: no innerHTML anywhere, so wallet/RPC data can never inject markup) ----------
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue
    if (k === 'class') el.className = v
    else if (k === 'text') el.textContent = v
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v)
    else el.setAttribute(k, v === true ? '' : v)
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)))
  return el
}
const svg = (path, size = 20) => {
  const wrap = document.createElement('span')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.style.display = 'inline-flex'
  const ns = 'http://www.w3.org/2000/svg'
  const s = document.createElementNS(ns, 'svg')
  for (const [k, v] of Object.entries({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) s.setAttribute(k, v)
  path.split('|').forEach((d) => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); s.append(p) })
  wrap.append(s)
  return wrap
}
const $ = (id) => document.getElementById(id)

// ---------- state ----------
const state = {
  selected: 'ethereum',
  phase: 'idle',              // idle | connecting | error
  error: null,                // { kind, message? }
  receive: false,             // show the receive warning inside the address card
  switchNote: null,           // { ok, text }
  copied: false,
  balances: { key: null, status: 'idle', rows: [], inactive: false, ts: null, error: null }
}
let balanceSeq = 0
let copyTimer = null

const selectedNetwork = () => byId(state.selected)
const netName = (n) => n.name
const fmtTime = (ts) => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(ts)

/** Everything shown about the connection is derived from what the wallet reports right now. */
function current() {
  const network = selectedNetwork()
  const acc = wallet.isReady() ? wallet.accountFor(network.namespace) : { connected: false }
  if (!acc.connected) return { network, connected: false }
  const valid = validateForNetwork(network, acc.address)
  return { network, connected: true, acc, address: valid, invalid: !valid }
}

// ---------- render: network picker ----------
function renderNetworks() {
  const grid = $('networkGrid')
  grid.replaceChildren(...NETWORKS.map((n) => {
    const checked = n.id === state.selected
    return h('button', {
      class: 'net', type: 'button', role: 'radio', 'aria-checked': String(checked), tabindex: checked ? '0' : '-1',
      'data-net': n.id, onclick: () => selectNetwork(n.id)
    },
      h('span', { class: 'net-glyph', 'aria-hidden': 'true', text: n.glyph }),
      h('span', { class: 'net-text' }, h('span', { class: 'net-name', text: n.name }), h('span', { class: 'net-std', text: `${n.standard} · ${n.native.symbol}` })))
  }))
  grid.setAttribute('aria-label', t('net.group'))
}

function selectNetwork(id) {
  if (state.selected === id) return
  state.selected = id
  state.phase = 'idle'
  state.error = null
  state.receive = false
  state.switchNote = null
  renderAll()
  ensureBalances()
}

// arrow-key navigation for the radio group
document.addEventListener('keydown', (e) => {
  if (!e.target.closest?.('#networkGrid')) return
  const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!dir) return
  e.preventDefault()
  const rtl = document.documentElement.dir === 'rtl'
  const step = (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && rtl ? -dir : dir
  const i = NETWORKS.findIndex((n) => n.id === state.selected)
  const next = NETWORKS[(i + step + NETWORKS.length) % NETWORKS.length]
  selectNetwork(next.id)
  document.querySelector(`[data-net="${next.id}"]`)?.focus()
})

// ---------- render: address view ----------
function stateCard(kind, titleKey, bodyKey, vars, actions = []) {
  return h('div', { class: `card ${kind}`, role: kind === 'err' ? 'alert' : null },
    h('p', { class: 'state-title' }, kind === 'busy' ? h('i', { class: 'spinner' }) : h('i', { class: 'dot' }), t(titleKey)),
    h('p', { class: 'state-body', text: t(bodyKey, vars) }),
    actions.length ? h('div', { class: 'state-actions' }, actions) : null)
}

function renderAddress() {
  const view = $('addressView')
  const network = selectedNetwork()
  const cur = current()
  const vars = { network: network.name, standard: network.standard }

  if (state.phase === 'connecting' && !cur.connected) {
    view.replaceChildren(stateCard('busy', 'state.connecting.title', 'state.connecting.body', vars))
    return
  }
  if (state.phase === 'error' && !cur.connected) {
    const kind = state.error?.kind || 'unknown'
    const retry = h('button', { class: 'btn ghost small', type: 'button', onclick: showAddress, text: t('btn.retry') })
    view.replaceChildren(stateCard('err', `state.${kind}.title`, `state.${kind}.body`, vars, [retry]))
    return
  }
  if (!cur.connected) {
    view.replaceChildren(h('div', { class: 'card' }, h('p', { class: 'empty' }, h('i', { class: 'dot' }), t('addr.empty'))))
    return
  }
  if (cur.invalid) {
    view.replaceChildren(stateCard('err', 'state.invalid.title', 'state.invalid.body', vars))
    return
  }

  const { acc, address } = cur
  const evm = network.namespace === NAMESPACE.EVM
  const walletNet = acc.network // the network the wallet is on right now (null if unsupported here)
  const mismatch = evm ? walletNet?.id !== network.id : !walletNet
  const shownNet = walletNet || network
  const copyLabel = state.copied ? t('btn.copied') : t('btn.copy')

  const nodes = []
  nodes.push(h('div', { class: `card ${mismatch ? 'warn' : 'ok'}` },
    h('div', { class: 'addr-label', text: t('addr.label') }),
    h('div', { class: 'addr-box' },
      h('code', { class: 'addr', id: 'addrText', 'data-testid': 'address', text: address }),
      h('button', { class: 'btn ghost small', type: 'button', id: 'copyBtn', onclick: copyAddress },
        svg('M9 9h10v10H9z|M5 15V5h10', 15), copyLabel)),
    h('dl', { class: 'meta' },
      h('div', {}, h('dt', { text: t('addr.network') }), h('dd', { text: walletNet ? netName(walletNet) : (evm ? `#${acc.chainRef}` : '—') })),
      h('div', {}, h('dt', { text: t('addr.standard') }), h('dd', { class: 'ltr', text: walletNet || !evm ? shownNet.standard : '—' })),
      h('div', {}, h('dt', { text: t('addr.chainId') }), h('dd', { class: 'ltr', text: String(acc.chainRef ?? shownNet.chainId) })),
      h('div', {}, h('dt', { text: t('addr.wallet') }), h('dd', { text: acc.walletName || '—' }))),
    evm ? h('p', { class: 'status info', text: t('addr.sameEvm') }) : null,
    mismatch && evm && walletNet ? h('p', { class: 'status warn', text: t('addr.onNetwork', { current: walletNet.name, selected: network.name }) }) : null,
    mismatch && evm && !walletNet ? h('p', { class: 'status warn', text: t('addr.onUnknown', { id: acc.chainRef }) }) : null,
    mismatch && !evm ? h('p', { class: 'status warn', text: t('addr.onUnknown', { id: acc.chainRef }) }) : null,
    state.receive ? h('p', { class: 'status warn', text: t('addr.receiveWarn', vars) }) : null,
    state.switchNote ? h('p', { class: `status ${state.switchNote.ok ? 'ok' : 'err'}`, role: 'status', text: state.switchNote.text }) : null,
    h('div', { class: 'state-actions' },
      mismatch && evm ? h('button', { class: 'btn ghost small', type: 'button', onclick: requestSwitch, text: t('btn.switch') }) : null,
      h('a', { class: 'btn ghost small', href: network.explorer + encodeURIComponent(address), target: '_blank', rel: 'noopener noreferrer' }, svg('M14 4h6v6|M20 4l-9 9|M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5', 15), t('btn.explorer'))),
    h('p', { class: 'note', text: t('addr.safe') })))
  view.replaceChildren(...nodes)
}

async function copyAddress() {
  const text = current().address
  if (!text) return
  let ok = false
  try {
    await navigator.clipboard.writeText(text)
    ok = true
  } catch {
    // Fallback for non-secure contexts / older browsers: select the visible text and use execCommand.
    try {
      const range = document.createRange()
      range.selectNodeContents($('addrText'))
      const sel = getSelection()
      sel.removeAllRanges(); sel.addRange(range)
      ok = document.execCommand('copy')
    } catch { ok = false }
  }
  state.copied = ok
  state.switchNote = ok ? state.switchNote : { ok: false, text: t('btn.copyFailed') }
  renderAddress()
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { state.copied = false; renderAddress() }, 2000)
}

async function requestSwitch() {
  const network = selectedNetwork()
  state.switchNote = null
  try {
    await wallet.switchEvmNetwork(network.id)
    state.switchNote = { ok: true, text: t('state.switch.ok', { network: network.name }) }
  } catch (error) {
    const rejected = wallet.classifyError(error?.message) === 'rejected'
    state.switchNote = { ok: false, text: rejected ? t('state.switch.rejected') : t('state.switch.failed', { network: network.name }) }
  }
  renderAll()
  ensureBalances()
}

// ---------- connect flow ----------
async function showAddress() {
  const network = selectedNetwork()
  if (wallet.isReady() && wallet.accountFor(network.namespace).connected) {
    // Already connected: reuse the existing session, never prompt again.
    state.phase = 'idle'; state.error = null
    renderAll(); ensureBalances()
    $('addressView').scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    return
  }
  state.phase = 'connecting'; state.error = null; state.switchNote = null
  renderAll()
  try {
    await wallet.connect(network.id)
  } catch (error) {
    console.error('wallet connect failed', error)
    state.phase = 'error'
    state.error = { kind: wallet.isReady() ? 'unknown' : 'init' }
    renderAll()
  }
}

wallet.onChange((event) => {
  const network = selectedNetwork()
  if (event.type === 'error') {
    if (state.phase === 'connecting' || state.phase === 'idle') {
      state.phase = 'error'
      state.error = { kind: event.kind, message: event.message }
    }
  } else if (event.type === 'modal-closed') {
    if (event.namespace === network.namespace && state.phase === 'connecting' && !event.connected) {
      state.phase = 'error'
      state.error = { kind: 'cancelled' }
    }
  }
  if (wallet.accountFor(network.namespace).connected && state.phase !== 'idle') { state.phase = 'idle'; state.error = null }
  renderAll()
  ensureBalances()
})

// ---------- balances ----------
function ensureBalances() {
  const cur = current()
  const ok = cur.connected && cur.address && (cur.network.namespace === NAMESPACE.EVM || cur.acc.network)
  if (!ok) {
    balanceSeq++
    state.balances = { key: null, status: 'idle', rows: [], inactive: false, ts: null, error: null }
    renderBalances()
    return
  }
  const key = `${cur.network.id}:${cur.address}`
  if (state.balances.key === key && state.balances.status !== 'error') return
  fetchBalances(cur.network, cur.address, key)
}

async function fetchBalances(network, address, key) {
  const seq = ++balanceSeq
  state.balances = { key, status: 'loading', rows: [], inactive: false, ts: null, error: null }
  renderBalances()
  try {
    const result = await loadBalances(network, address)
    if (seq !== balanceSeq) return
    state.balances = { key, status: 'ok', rows: result.rows, inactive: Boolean(result.inactive), ts: Date.now(), error: null }
  } catch (error) {
    if (seq !== balanceSeq) return
    console.warn('balance read failed', error)
    state.balances = { key, status: 'error', rows: [], inactive: false, ts: null, error: String(error?.message || error) }
  }
  renderBalances()
}

function renderBalances() {
  const network = selectedNetwork()
  const view = $('balanceView')
  const b = state.balances
  $('balSub').textContent = t('bal.sub', { network: network.name })
  $('refreshBtn').disabled = !(b.key && b.status !== 'loading')
  $('balNote').textContent = t('bal.noPrice') + (b.ts ? ` · ${t('bal.updated', { time: fmtTime(b.ts) })}` : '')

  if (b.status === 'idle') {
    view.replaceChildren(h('div', { class: 'card' }, h('p', { class: 'empty' }, h('i', { class: 'dot' }), t('bal.connect'))))
  } else if (b.status === 'loading') {
    const count = 1 + (network.id === 'base' ? 1 : 2)
    view.replaceChildren(h('div', { class: 'bal-grid', 'aria-busy': 'true', 'aria-label': t('bal.loading') }, Array.from({ length: count }, () => h('div', { class: 'skeleton' }))))
  } else if (b.status === 'error') {
    view.replaceChildren(stateCard('err', 'bal.failed', 'bal.failedBody', {}, [h('button', { class: 'btn ghost small', type: 'button', onclick: refreshBalances, text: t('btn.retry') })]))
  } else {
    const cards = b.rows.map((r) => {
      const failed = r.status === 'error'
      return h('article', { class: 'bal' },
        h('div', { class: 'bal-top' },
          h('span', { class: `coin${r.native ? ' native' : ''}`, 'aria-hidden': 'true', text: r.symbol.slice(0, 4) }),
          h('div', { class: 'bal-name' }, h('b', { text: r.name }), h('span', { text: r.native ? `${r.symbol} · ${t('bal.native')}` : `${r.symbol} · ${network.standard}` }))),
        failed ? h('div', { class: 'bal-amount fail', title: r.error, text: t('bal.rowFailed') })
          : h('div', { class: 'bal-amount', 'data-testid': `bal-${r.symbol}` }, formatAmount(r.amount, locale()), h('small', { text: r.symbol })),
        h('div', { class: 'bal-foot', text: r.contract ? `${t('bal.contract')} ${shorten(r.contract, 6, 4)}` : network.name }))
    })
    const nodes = [h('div', { class: 'bal-grid' }, cards)]
    if (b.inactive) nodes.push(h('p', { class: 'status info', text: t('bal.inactive') }))
    view.replaceChildren(...nodes)
  }
}

const refreshBalances = () => { const c = current(); if (c.connected && c.address) fetchBalances(c.network, c.address, `${c.network.id}:${c.address}`) }

// ---------- actions ----------
const ACTIONS = [
  { id: 'show', icon: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z|M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', run: () => { $('top').scrollIntoView({ behavior: 'smooth' }); $('showBtn').focus({ preventScroll: true }) } },
  { id: 'balances', icon: 'M3 7h18v12H3z|M3 7l2-3h14l2 3|M16 13h2', run: () => $('balancesPanel').scrollIntoView({ behavior: 'smooth' }) },
  { id: 'receive', icon: 'M12 4v12|M6 11l6 6 6-6|M5 20h14', run: () => { state.receive = true; if (current().connected) { renderAddress(); $('addressView').scrollIntoView({ behavior: 'smooth', block: 'center' }) } else { showAddress() } } },
  { id: 'history', icon: 'M12 7v5l3 2|M3 12a9 9 0 1 0 3-6.7L3 8|M3 3v5h5', run: openHistory },
  { id: 'swap', icon: 'M7 4l-3 3 3 3|M4 7h13|M17 20l3-3-3-3|M20 17H7', disabled: true },
  { id: 'send', icon: 'M5 12h14|M13 6l6 6-6 6', disabled: true }
]

function openHistory() {
  const cur = current()
  if (cur.connected && cur.address) {
    window.open(cur.network.explorer + encodeURIComponent(cur.address), '_blank', 'noopener,noreferrer')
    return
  }
  showActionNote(t('act.history.connect'))
}

function showActionNote(text) {
  const el = $('actionNote')
  el.textContent = text
  el.hidden = false
}

function renderActions() {
  $('actionsGrid').replaceChildren(...ACTIONS.map((a) => h('button', {
    class: 'act', type: 'button', 'data-action': a.id, 'aria-disabled': a.disabled ? 'true' : null,
    onclick: () => {
      $('actionNote').hidden = true
      if (a.disabled) return showActionNote(t(`act.${a.id}.note`))   // honest: nothing is executed
      a.run()
    }
  },
    h('span', { class: 'act-icon' }, svg(a.icon, 19)),
    h('span', { class: 'act-text' },
      h('span', { class: 'act-title' }, t(`act.${a.id}`), a.disabled ? h('span', { class: 'tag', text: t('act.later') }) : null),
      a.disabled ? null : h('span', { class: 'act-desc', text: t(`act.${a.id}.d`) })))))
}

// ---------- header / chrome ----------
function renderChrome() {
  const network = selectedNetwork()
  const cur = current()
  const pill = $('statusPill')
  let st = 'disconnected'
  if (state.phase === 'connecting' && !cur.connected) st = 'connecting'
  else if (state.phase === 'error' && !cur.connected) st = 'error'
  else if (cur.connected) st = 'connected'
  pill.dataset.state = st
  $('statusPillText').textContent = t(`pill.${st}`) + (st === 'connected' && cur.acc?.walletName ? ` · ${cur.acc.walletName}` : '')

  const connecting = st === 'connecting'
  $('showBtn').disabled = connecting
  $('showBtnText').textContent = connecting ? t('btn.connecting') : t('btn.show')
  $('disconnectBtn').hidden = !cur.connected
  $('langBtn').setAttribute('aria-label', t('lang.label'))
}

function renderAll() {
  renderChrome()
  renderNetworks()
  renderAddress()
  renderBalances()
}

// ---------- boot ----------
function applyLanguage() {
  setLang(getLang())
  applyStatic()
  renderActions()
  renderAll()
}

$('showBtn').addEventListener('click', showAddress)
$('refreshBtn').addEventListener('click', refreshBalances)
$('disconnectBtn').addEventListener('click', async () => {
  try { await wallet.disconnect(selectedNetwork().namespace) } catch (e) { console.warn(e) }
  state.phase = 'idle'; state.error = null; state.receive = false; state.switchNote = null
  renderAll(); ensureBalances()
})
$('langBtn').addEventListener('click', () => { setLang(getLang() === 'ar' ? 'en' : 'ar'); applyLanguage() })

setLang(getLang())
applyStatic()
renderActions()
renderAll()

// Load the wallet library after first paint so an existing session is restored without prompting again.
const warm = () => wallet.init().then(() => { renderAll(); ensureBalances() }).catch((e) => console.warn('wallet library not loaded yet', e))
if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 600)
