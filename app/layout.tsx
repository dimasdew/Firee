import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "Firee — Decentralized Marketplace",
  description: "Trade freely. Own truly. Peer-to-peer marketplace on blockchain.",
  keywords: ["marketplace", "decentralized", "web3", "usdc", "firee"],
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
