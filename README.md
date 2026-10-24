# NEXORA — Multi-Chain Portfolio

واجهة عربية متجاوبة لربط المحافظ عبر Reown AppKit وWalletConnect وقراءة العناوين والأرصدة فقط. اسم المنتج هو Multi-Chain Portfolio؛ التنفيذ الحالي يقرأ Ethereum Mainnet فقط ولا يعرض شبكات أخرى كمدعومة.

## الوظائف الحالية

- اختيار محفظة من AppKit، مع دعم WalletConnect للمحافظ على الهاتف مثل Trust Wallet وMetaMask، ومحافظ المتصفح المتوافقة.
- إظهار حالة الاتصال وعنوان الحساب والشبكة الحالية، مع زري الربط والفصل.
- قراءة ETH وUSDC وUSDT وDAI على Ethereum Mainnet (Chain ID 1) فقط.
- لا توجد وظائف إرسال أو تحويل أو سحب، ولا موافقات توكن، ولا توقيع رسائل أو معاملات.
- لا يطلب الموقع عبارة استرداد أو مفتاحًا خاصًا.

## إعداد Reown

يستخدم التطبيق Project ID الذي زوّده مالك المشروع في `src/main.js`. هذا المعرّف عام ومطلوب لتشغيل WalletConnect، وليس مفتاح محفظة أو سرًا. إذا كانت قائمة النطاقات المسموحة مفعّلة في لوحة Reown، أضف أصل الموقع:

`https://hac52353-hub.github.io`

ويجب أن يتطابق `url` في بيانات AppKit مع أصل الموقع المنشور.

## التطوير والبناء

```sh
npm ci --legacy-peer-deps
npm run dev
npm run build
```

ينتج البناء الموقع داخل `dist/`. سير عمل GitHub Actions في `.github/workflows/pages.yml` يبني الموقع وينشره إلى GitHub Pages عند تحديث فرع `main`. إعداد Vite يستخدم مسارات نسبية صالحة للمشروع المنشور تحت `/abohiba-wallet/`.

## الأصول المقروءة

- ETH: الرصيد الأصلي على Ethereum Mainnet.
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`

تُستخدم عناوين ERC-20 لاستدعاءات `balanceOf` للقراءة فقط. يلزم اتصال بالإنترنت ومزود Ethereum عام لقراءة الأرصدة. لا تُعرض شبكات أخرى على أنها مدعومة حاليًا.
