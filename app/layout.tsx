import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: { default: "Firee — Escrow-Protected Marketplace", template: "%s | Firee" },
  description: "Buy and sell physical goods with USDC on Base. Payments held in smart contract escrow until delivery. Only 3% fee.",
  keywords: ["marketplace", "web3", "escrow", "physical goods", "usdc", "firee", "base", "blockchain", "crypto payments"],
  manifest: "/manifest.json",
  metadataBase: new URL("https://mp-firee.vercel.app"),
  openGraph: {
    title: "Firee — Buy Real Things with Crypto, Safely",
    description: "Buy and sell physical goods with USDC on Base. Payments held in smart contract escrow until delivery.",
    siteName: "Firee",
    type: "website",
    url: "https://mp-firee.vercel.app",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Firee Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Firee — Escrow-Protected Marketplace",
    description: "Buy and sell physical goods with USDC on Base. Payments held in smart contract escrow until delivery.",
    images: ["/og-image.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#021526",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('firee-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
