import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Firee",
  projectId: projectId || "00000000000000000000000000000000",
  chains: [base, mainnet],
  ssr: true,
});

export const walletConnectConfigured = Boolean(projectId);
