"use client";

import { AppProvider } from "../context/AppContext";
import Web3Provider from "./Web3Provider";
import WalletBridge from "./WalletBridge";
import Toast from "./Toast";
import PageTransition from "./PageTransition";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <AppProvider>
        <WalletBridge />
        <PageTransition>{children}</PageTransition>
        <Toast />
      </AppProvider>
    </Web3Provider>
  );
}
