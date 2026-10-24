const dict = {
  ar: {
    'app.title': 'NEXORA — Multi-Chain Portfolio',
    'skip': 'تخطَّ إلى المحتوى',
    'lang.toggle': 'English',
    'lang.label': 'تغيير اللغة إلى الإنجليزية',
    'pill.disconnected': 'غير متصل',
    'pill.connecting': 'جارٍ الاتصال…',
    'pill.connected': 'متصل',
    'pill.error': 'خطأ في الاتصال',

    'hero.eyebrow': 'محفظة متعددة الشبكات',
    'hero.title': 'اختر الشبكة، ثم أظهر عنوانك',
    'hero.sub': 'اتصال للقراءة فقط: يعرض NEXORA عنوانك العام وأرصدتك دون أي توقيع أو معاملة أو موافقة إنفاق.',

    'step.network': '1 · اختر الشبكة',
    'step.show': '2 · اتصل بمحفظتك',
    'standards.note': 'TRC20 وERC20 وBEP20 أسماء لمعايير الرموز على شبكات مختلفة، وليست عناوين قابلة للتبادل. شبكات EVM تتشارك صيغة العنوان 0x، أما TRON وSolana فلهما صيغ مختلفة.',
    'net.standard': 'المعيار',
    'btn.show': 'إظهار العنوان',
    'btn.showFor': 'إظهار العنوان على {network}',
    'btn.connecting': 'بانتظار موافقتك في المحفظة…',
    'btn.disconnect': 'فصل المحفظة',
    'btn.copy': 'نسخ العنوان',
    'btn.copied': 'تم النسخ',
    'btn.copyFailed': 'تعذّر النسخ — حدّد العنوان وانسخه يدويًا',
    'btn.explorer': 'فتح في المستكشف',
    'btn.switch': 'طلب التبديل في المحفظة',
    'btn.retry': 'إعادة المحاولة',
    'btn.refresh': 'تحديث',

    'addr.title': 'عنوان المحفظة العام',
    'addr.empty': 'لم تتصل أي محفظة بعد. اختر الشبكة واضغط «إظهار العنوان».',
    'addr.label': 'العنوان العام',
    'addr.network': 'الشبكة',
    'addr.standard': 'معيار الرموز',
    'addr.chainId': 'معرّف السلسلة',
    'addr.wallet': 'المحفظة',
    'addr.safe': 'هذا عنوان عام. مشاركته آمنة، ولا يمنح أحدًا صلاحية على أصولك.',
    'addr.receiveWarn': 'للاستقبال على هذا العنوان أرسل أصول {standard} على شبكة {network} فقط. الإرسال عبر شبكة خاطئة قد يؤدي إلى فقدان الأصول.',
    'addr.onNetwork': 'المحفظة متصلة الآن بشبكة {current}، بينما الشبكة المختارة {selected}.',
    'addr.onUnknown': 'المحفظة متصلة بشبكة غير مدعومة في NEXORA (معرّف {id}).',
    'addr.sameEvm': 'عنوان EVM واحد يعمل على كل شبكات EVM، لكنه ليس عنوان TRON ولا Solana.',

    'state.connecting.title': 'جارٍ الاتصال',
    'state.connecting.body': 'اختر محفظتك من النافذة ثم وافق على الاتصال داخل المحفظة. لن يُطلب منك توقيع أو إنفاق.',
    'state.rejected.title': 'تم رفض الاتصال',
    'state.rejected.body': 'لم تتم الموافقة على الاتصال من المحفظة. لم يتغير شيء ولم يُطلب منك أي إجراء آخر. يمكنك المحاولة مرة أخرى متى شئت.',
    'state.cancelled.title': 'لم يكتمل الاتصال',
    'state.cancelled.body': 'أُغلقت نافذة المحفظة قبل إتمام الاتصال. يمكنك المحاولة مرة أخرى.',
    'state.timeout.title': 'انتهت مهلة الاتصال',
    'state.timeout.body': 'لم تصل موافقة من المحفظة في الوقت المناسب. افتح المحفظة وحاول مجددًا.',
    'state.unsupported.title': 'الشبكة غير مدعومة في هذه المحفظة',
    'state.unsupported.body': 'المحفظة التي اخترتها لا تدعم {network}. اختر محفظة تدعم هذه الشبكة أو اختر شبكة أخرى.',
    'state.unknown.title': 'تعذّر الاتصال',
    'state.unknown.body': 'حدث خطأ أثناء الاتصال بالمحفظة. تحقّق من اتصال الإنترنت وحاول مرة أخرى.',
    'state.invalid.title': 'عنوان غير صالح',
    'state.invalid.body': 'أعادت المحفظة قيمة لا تطابق صيغة عنوان {network}، لذلك لم يتم عرضها.',
    'state.init.title': 'تعذّر تحميل مكتبة الاتصال',
    'state.init.body': 'لم يتم تحميل واجهة اختيار المحفظة. تحقّق من الاتصال بالإنترنت ثم أعد المحاولة.',
    'state.switch.failed': 'لم تؤكد المحفظة التبديل إلى {network}. افتح المحفظة وبدّل الشبكة يدويًا ثم حدّث الصفحة.',
    'state.switch.ok': 'تأكّد التبديل: المحفظة الآن على {network}.',
    'state.switch.rejected': 'رُفض طلب تبديل الشبكة في المحفظة. لم يتغير شيء.',
    'state.switch.na': 'هذه المحفظة لا تدعم تبديل الشبكة من الموقع. بدّل الشبكة من داخل المحفظة.',

    'bal.title': 'الأرصدة والمحفظة',
    'bal.live': 'بيانات حقيقية من السلسلة',
    'bal.sub': 'قراءة عامة من {network} لعنوانك. لا توجد أرصدة تجريبية في هذه الصفحة.',
    'bal.connect': 'اربط محفظتك لعرض أرصدتك الحقيقية على الشبكة المختارة.',
    'bal.loading': 'جارٍ قراءة الأرصدة…',
    'bal.failed': 'تعذّر قراءة الأرصدة من مزود البيانات',
    'bal.failedBody': 'لم تُعرض أي قيمة لأن مصدر البيانات لم يرد. هذا لا يعني أن رصيدك صفر.',
    'bal.rowFailed': 'تعذّرت القراءة',
    'bal.native': 'العملة الأساسية',
    'bal.contract': 'عقد الرمز',
    'bal.inactive': 'هذا الحساب غير مفعّل على TRON بعد، لذلك أرصدته صفر.',
    'bal.noPrice': 'لا تُعرض قيم بالدولار: لا يوجد مصدر أسعار متصل. تظهر الكميات فقط.',
    'bal.updated': 'آخر تحديث {time}',

    'act.title': 'الإجراءات',
    'act.show': 'إظهار العنوان',
    'act.show.d': 'اعرض عنوانك العام',
    'act.balances': 'الأرصدة والمحفظة',
    'act.balances.d': 'أرصدة حقيقية للقراءة',
    'act.receive': 'استقبال عملة',
    'act.receive.d': 'العنوان مع تنبيه الشبكة',
    'act.history': 'سجل المعاملات',
    'act.history.d': 'يفتح مستكشف الشبكة',
    'act.swap': 'تبديل عملة',
    'act.send': 'إرسال عملة',
    'act.later': 'غير مفعّل بعد',
    'act.swap.note': 'تبديل العملات مرحلة منفصلة لم تُربط بعد بخدمة تسعير وتنفيذ. لا يُنفَّذ أي شيء من هذه الصفحة.',
    'act.send.note': 'إرسال العملات مرحلة منفصلة. عند تفعيلها ستعرض الشبكة والمستلم والرسوم وتطلب موافقتك الصريحة قبل أي معاملة.',
    'act.history.connect': 'اربط المحفظة أولًا لفتح سجل العنوان.',

    'sec.title': 'الأمان والخصوصية',
    'sec.1': 'لا نطلب العبارة السرية أو المفتاح الخاص أو كلمة المرور أبدًا.',
    'sec.2': 'الاتصال يكشف العنوان العام فقط. لا توقيع ولا معاملة ولا موافقة إنفاق (Token Approval).',
    'sec.3': 'لا توجد في الموقع وظيفة لسحب الأصول أو استدعاء عقود ذكية.',
    'sec.4': 'الأرصدة تُقرأ من عقد RPC عامة باستخدام عنوانك العام فقط.',
    'sec.5': 'يمكنك فصل المحفظة في أي وقت، ويمكنك أيضًا إزالة صلاحية الموقع من داخل المحفظة.',

    'footer.note': 'NEXORA — Multi-Chain Portfolio · للقراءة فقط',
    'net.group': 'الشبكات المدعومة'
  },
  en: {
    'app.title': 'NEXORA — Multi-Chain Portfolio',
    'skip': 'Skip to content',
    'lang.toggle': 'العربية',
    'lang.label': 'Switch language to Arabic',
    'pill.disconnected': 'Not connected',
    'pill.connecting': 'Connecting…',
    'pill.connected': 'Connected',
    'pill.error': 'Connection error',

    'hero.eyebrow': 'Multi-chain wallet',
    'hero.title': 'Pick a network, then show your address',
    'hero.sub': 'Read-only connection: NEXORA shows your public address and balances with no signature, transaction or spending approval.',

    'step.network': '1 · Choose a network',
    'step.show': '2 · Connect your wallet',
    'standards.note': 'TRC20, ERC20 and BEP20 are token standards on different networks, not interchangeable addresses. EVM networks share the 0x address format; TRON and Solana use different formats.',
    'net.standard': 'Standard',
    'btn.show': 'Show address',
    'btn.showFor': 'Show address on {network}',
    'btn.connecting': 'Waiting for approval in your wallet…',
    'btn.disconnect': 'Disconnect wallet',
    'btn.copy': 'Copy address',
    'btn.copied': 'Copied',
    'btn.copyFailed': 'Copy failed — select the address and copy it manually',
    'btn.explorer': 'Open in explorer',
    'btn.switch': 'Request switch in wallet',
    'btn.retry': 'Try again',
    'btn.refresh': 'Refresh',

    'addr.title': 'Public wallet address',
    'addr.empty': 'No wallet connected yet. Choose a network and press “Show address”.',
    'addr.label': 'Public address',
    'addr.network': 'Network',
    'addr.standard': 'Token standard',
    'addr.chainId': 'Chain ID',
    'addr.wallet': 'Wallet',
    'addr.safe': 'This is a public address. Sharing it is safe and gives nobody permission over your assets.',
    'addr.receiveWarn': 'To receive at this address, send only {standard} assets on the {network} network. Sending on the wrong network can result in lost funds.',
    'addr.onNetwork': 'Your wallet is currently on {current}, while the selected network is {selected}.',
    'addr.onUnknown': 'Your wallet is on a network NEXORA does not support (chain ID {id}).',
    'addr.sameEvm': 'One EVM address works on every EVM network, but it is not a TRON or Solana address.',

    'state.connecting.title': 'Connecting',
    'state.connecting.body': 'Pick your wallet in the dialog, then approve the connection inside the wallet. You will not be asked to sign or approve spending.',
    'state.rejected.title': 'Connection rejected',
    'state.rejected.body': 'The connection was not approved in the wallet. Nothing changed and nothing else was requested. You can try again whenever you like.',
    'state.cancelled.title': 'Connection not completed',
    'state.cancelled.body': 'The wallet dialog was closed before the connection finished. You can try again.',
    'state.timeout.title': 'Connection timed out',
    'state.timeout.body': 'No approval arrived from the wallet in time. Open your wallet and try again.',
    'state.unsupported.title': 'Network not supported by this wallet',
    'state.unsupported.body': 'The wallet you picked does not support {network}. Choose a wallet that supports it, or pick another network.',
    'state.unknown.title': 'Could not connect',
    'state.unknown.body': 'Something went wrong while connecting to the wallet. Check your internet connection and try again.',
    'state.invalid.title': 'Invalid address',
    'state.invalid.body': 'The wallet returned a value that does not match the {network} address format, so it was not displayed.',
    'state.init.title': 'Wallet library failed to load',
    'state.init.body': 'The wallet picker did not load. Check your internet connection and try again.',
    'state.switch.failed': 'Your wallet did not confirm the switch to {network}. Open the wallet and switch networks manually, then refresh.',
    'state.switch.ok': 'Switch confirmed: your wallet is now on {network}.',
    'state.switch.rejected': 'The network switch was rejected in the wallet. Nothing changed.',
    'state.switch.na': 'This wallet cannot switch networks from the site. Switch networks inside the wallet.',

    'bal.title': 'Balances & wallet',
    'bal.live': 'Real on-chain data',
    'bal.sub': 'Public read from {network} for your address. There are no demo balances on this page.',
    'bal.connect': 'Connect your wallet to see your real balances on the selected network.',
    'bal.loading': 'Reading balances…',
    'bal.failed': 'Could not read balances from the data provider',
    'bal.failedBody': 'No value is shown because the data source did not respond. This does not mean your balance is zero.',
    'bal.rowFailed': 'Read failed',
    'bal.native': 'Native asset',
    'bal.contract': 'Token contract',
    'bal.inactive': 'This account is not activated on TRON yet, so its balances are zero.',
    'bal.noPrice': 'No fiat values are shown: no price source is connected. Amounts only.',
    'bal.updated': 'Updated {time}',

    'act.title': 'Actions',
    'act.show': 'Show address',
    'act.show.d': 'Display your public address',
    'act.balances': 'Balances & wallet',
    'act.balances.d': 'Real read-only balances',
    'act.receive': 'Receive',
    'act.receive.d': 'Address with network warning',
    'act.history': 'Transaction history',
    'act.history.d': 'Opens the network explorer',
    'act.swap': 'Swap',
    'act.send': 'Send',
    'act.later': 'Not enabled yet',
    'act.swap.note': 'Swap is a separate phase that is not connected to a quoting and execution service yet. Nothing is executed from this page.',
    'act.send.note': 'Send is a separate phase. When enabled it will show the network, recipient and fees and ask for your explicit approval before any transaction.',
    'act.history.connect': 'Connect your wallet first to open the address history.',

    'sec.title': 'Security & privacy',
    'sec.1': 'We never ask for your recovery phrase, private key or password.',
    'sec.2': 'Connecting reveals your public address only. No signature, no transaction, no token approval.',
    'sec.3': 'This site has no function that withdraws assets or calls smart contracts.',
    'sec.4': 'Balances are read from public RPC endpoints using your public address only.',
    'sec.5': 'You can disconnect at any time, and you can also revoke the site from inside your wallet.',

    'footer.note': 'NEXORA — Multi-Chain Portfolio · Read-only',
    'net.group': 'Supported networks'
  }
}

let lang = 'ar'
try { lang = localStorage.getItem('nexora.lang') === 'en' ? 'en' : 'ar' } catch { /* storage unavailable */ }

export const getLang = () => lang
export const locale = () => (lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US')

export function t(key, vars = {}) {
  const raw = dict[lang][key] ?? dict.en[key] ?? key
  return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
}

export function setLang(next) {
  lang = next === 'en' ? 'en' : 'ar'
  try { localStorage.setItem('nexora.lang', lang) } catch { /* ignore */ }
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.title = t('app.title')
}

export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n) })
  root.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)) })
}
