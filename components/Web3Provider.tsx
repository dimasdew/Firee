"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { wagmiConfig } from "../lib/wagmi";

const SHARED = { borderRadius: "medium" as const, overlayBlur: "small" as const };

const rkDark = darkTheme({
  accentColor: "#6EACDA",
  accentColorForeground: "#021526",
  ...SHARED,
});

const rkLight = lightTheme({
  accentColor: "#03346E",
  accentColorForeground: "#F5F5F5",
  ...SHARED,
});

function useThemeMode() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setMode((html.getAttribute("data-theme") as "dark" | "light") || "dark");
    update();

    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return mode;
}

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const mode = useThemeMode();
  const rkTheme = useMemo(() => (mode === "light" ? rkLight : rkDark), [mode]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rkTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
