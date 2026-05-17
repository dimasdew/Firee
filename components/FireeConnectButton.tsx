"use client";

import { useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import Image from "next/image";
import { shortenAddress, avatarUrl } from "../lib/utils";

type Variant = "sand" | "ghost" | "nav";

interface Props {
  variant?: Variant;
  fullWidth?: boolean;
  onConnected?: () => void;
  label?: string;
}

function ConnectCallback({ connected, onConnected }: { connected: boolean; onConnected?: () => void }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (connected && onConnected && !firedRef.current) {
      firedRef.current = true;
      onConnected();
    }
    if (!connected) firedRef.current = false;
  }, [connected, onConnected]);

  return null;
}

export default function FireeConnectButton({
  variant = "ghost",
  fullWidth = false,
  onConnected,
  label = "Connect Wallet",
}: Props) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted, openAccountModal }) => {
        const ready = mounted;
        const connected = Boolean(ready && account && chain);

        return (
          <>
            <ConnectCallback connected={connected} onConnected={onConnected} />
            {!ready ? (
              <button type="button" className={classFor(variant)} style={styleFor(fullWidth)} disabled>
                {label}
              </button>
            ) : connected && account ? (
              variant === "nav" ? (
                <button
                  type="button"
                  className="profile-trigger"
                  onClick={openAccountModal}
                  title={account.address}
                >
                  <Image src={avatarUrl(account.address)} alt="" width={28} height={28} className="avatar-sm" style={{ objectFit: "cover" }} unoptimized />
                  <span
                    className="nav-link-hide-mobile mono"
                    style={{ fontSize: 11, maxWidth: 88, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {shortenAddress(account.address)}
                  </span>
                </button>
              ) : (
                <button type="button" className={classFor(variant)} style={styleFor(fullWidth)} onClick={openAccountModal}>
                  <Wallet size={13} />
                  {account.displayName ?? shortenAddress(account.address)}
                </button>
              )
            ) : (
              <button type="button" className={classFor(variant)} style={styleFor(fullWidth)} onClick={openConnectModal}>
                <Wallet size={13} />
                {label}
              </button>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}

function classFor(variant: Variant) {
  if (variant === "sand") return "btn-sand";
  return "btn-ghost";
}

function styleFor(fullWidth: boolean): React.CSSProperties | undefined {
  return fullWidth ? { width: "100%", justifyContent: "center", gap: 6 } : { gap: 6 };
}
