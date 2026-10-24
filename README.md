# ABOHIBA Wallet

واجهة عربية متجاوبة لربط محافظ Ethereum عبر Reown AppKit وWalletConnect وقراءة عنوان الحساب والأرصدة فقط.

## الوظائف

- اختيار محفظة من AppKit، مع دعم WalletConnect للمحافظ على الهاتف مثل Trust Wallet وMetaMask، ومحافظ المتصفح المتوافقة.
- إظهار عنوان الحساب والشبكة الحالية وأزرار الربط والفصل.
- قراءة رصيد ETH وUSDC وUSDT وDAI على Ethereum Mainnet.
- لا توجد وظائف إرسال أو تحويل أو سحب، ولا موافقات توكن، ولا توقيع رسائل أو معاملات.
- لا يطلب الموقع عبارة استرداد أو مفتاحًا خاصًا.

## إعداد Reown

يستخدم التطبيق Project ID المخصص الذي زوّده مالك المشروع في `src/main.js`. Project ID معرّف عمومي مطلوب لتشغيل WalletConnect، وليس مفتاح محفظة أو سرًا. من لوحة Reown، أضف إلى قائمة النطاقات المسموحة:

`https://hac52353-hub.github.io`

ويجب أن يتطابق عنوان `url` في بيانات AppKit مع أصل الموقع المنشور.

## التطوير والبناء

```sh
npm install
npm run dev
npm run build
```

ينتج البناء الموقع داخل `dist/`. سير عمل GitHub Actions يرفع هذا المجلد إلى GitHub Pages. إعداد Vite يستخدم مسارات نسبية صالحة للمشروع المنشور تحت `/abohiba-wallet/`.

## الأرصدة المدعومة

- ETH (الرصيد الأصلي على Ethereum Mainnet).
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`

تُستخدم هذه العناوين لاستدعاءات `balanceOf` للقراءة فقط. يلزم اتصال بالإنترنت ومزود Ethereum عام لقراءة الأرصدة.

