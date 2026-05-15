"use client";

import { AppProvider } from "../context/AppContext";
import Web3Provider from "./Web3Provider";
import WalletBridge from "./WalletBridge";
import Toast from "./Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <AppProvider>
        <WalletBridge />
        {children}
        <Toast />
      </AppProvider>
    </Web3Provider>
  );
}
