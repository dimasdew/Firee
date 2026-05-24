import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: { default: "Firee — Web3 Digital Marketplace", template: "%s | Firee" },
  description: "Buy and sell smart contracts, DApp templates, UI kits, and developer tools. Pay with USDC on Base. Only 3% fee.",
  keywords: ["marketplace", "web3", "smart contracts", "dapp templates", "usdc", "firee", "base", "blockchain", "digital products"],
  manifest: "/manifest.json",
  metadataBase: new URL("https://mp-firee.vercel.app"),
  openGraph: {
    title: "Firee — The Marketplace for Web3 Builders",
    description: "Buy and sell smart contracts, DApp templates, UI kits, and developer tools. Pay with USDC on Base.",
    siteName: "Firee",
    type: "website",
    url: "https://mp-firee.vercel.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Firee Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Firee — Web3 Digital Marketplace",
    description: "Buy and sell smart contracts, DApp templates, UI kits, and developer tools. Pay with USDC on Base.",
    images: ["/og-image.png"],
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
