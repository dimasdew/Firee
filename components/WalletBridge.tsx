"use client";

import { useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useApp } from "../context/AppContext";
export default function WalletBridge() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { syncWalletFromRainbow, registerWalletDisconnect, showToast } = useApp();
  const wasConnected = useRef(false);

  useEffect(() => {
    registerWalletDisconnect(() => disconnect());
  }, [disconnect, registerWalletDisconnect]);

  useEffect(() => {
    const connected = isConnected && !!address;

    if (connected && address) {
      syncWalletFromRainbow(address);
      if (!wasConnected.current) showToast("Wallet connected");
    } else {
      syncWalletFromRainbow(null);
    }

    wasConnected.current = connected;
  }, [isConnected, address, syncWalletFromRainbow, showToast]);

  return null;
}
