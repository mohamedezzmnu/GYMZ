import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta charSet="utf-8" />

        {/* PWA: installable app manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C8F135" />
        <meta name="background-color" content="#0A0A0A" />

        {/* iOS "Add to Home Screen" support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GYMX" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Android / general */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
