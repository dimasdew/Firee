"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import {
  ESCROW_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  FireeEscrowABI,
  ERC20_ABI,
} from "./index";

export type PurchaseStep = "idle" | "approving" | "purchasing" | "success" | "error";

export function useFireePurchase() {
  const { address } = useAccount();
  const [step, setStep] = useState<PurchaseStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  // C5: capture on-chain orderId from Purchase event
  const [escrowOrderId, setEscrowOrderId] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, ESCROW_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // C6: wait-for-receipt hooks (approval + purchase)
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [purchaseTxHash, setPurchaseTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { waitForTransactionReceipt } = useWaitForTransactionReceipt as any;

  const purchase = useCallback(
    async (
      sellerAddress: `0x${string}`,
      amountUsdc: number,
      productId: string
    ): Promise<{ txHash: `0x${string}`; escrowOrderId: string } | null> => {
      if (!address) {
        setError("Connect wallet first");
        return null;
      }

      setError(null);
      const amountRaw = parseUnits(amountUsdc.toString(), USDC_DECIMALS);

      if (balance !== undefined && balance < amountRaw) {
        setError("Insufficient USDC balance");
        setStep("error");
        return null;
      }

      try {
        // Step 1: Approve USDC if needed
        const currentAllowance = allowance ?? BigInt(0);
        if (currentAllowance < amountRaw) {
          setStep("approving");
          const approveTx = await writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [ESCROW_ADDRESS, amountRaw],
          });
          setApproveTxHash(approveTx);
          setTxHash(approveTx);

          // C6: wait for approval to be mined, not just a fixed delay
          const { waitForTransactionReceipt: waitFn } = await import("wagmi/actions");
          // wagmi/actions requires config — use inline polling fallback via viem client
          await _waitForTx(approveTx);
          await refetchAllowance();
        }

        // Step 2: Purchase
        setStep("purchasing");
        const purchaseTx = await writeContractAsync({
          address: ESCROW_ADDRESS,
          abi: FireeEscrowABI,
          functionName: "purchase",
          args: [sellerAddress, amountRaw, productId],
        });
        setPurchaseTxHash(purchaseTx);
        setTxHash(purchaseTx);

        // C6: wait for purchase to be mined before marking success
        const receipt = await _waitForTx(purchaseTx);

        // C5: extract orderId from Purchase event logs
        let onchainOrderId = "0";
        try {
          for (const log of receipt.logs ?? []) {
            const decoded = decodeEventLog({
              abi: FireeEscrowABI,
              data: log.data,
              topics: log.topics,
            }) as any;
            if (decoded?.eventName === "Purchase") {
              onchainOrderId = String(decoded.args.orderId);
              break;
            }
          }
        } catch {}
        setEscrowOrderId(onchainOrderId);
        setStep("success");
        return { txHash: purchaseTx, escrowOrderId: onchainOrderId };
      } catch (err: any) {
        console.error("Purchase error:", err);
        setError(err?.shortMessage || err?.message || "Transaction failed");
        setStep("error");
        return null;
      }
    },
    [address, allowance, balance, writeContractAsync, refetchAllowance]
  );

  const reset = () => {
    setStep("idle");
    setError(null);
    setTxHash(null);
    setEscrowOrderId(null);
    setApproveTxHash(undefined);
    setPurchaseTxHash(undefined);
  };

  return {
    step,
    error,
    txHash,
    escrowOrderId,
    purchase,
    reset,
    usdcBalance: balance !== undefined ? Number(balance) / 10 ** USDC_DECIMALS : null,
  };
}

/**
 * C6: Poll for transaction receipt using raw RPC — avoids wagmi config threading issues.
 * Retries every 2s for up to 5 minutes.
 */
async function _waitForTx(hash: `0x${string}`, maxWaitMs = 300_000) {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [hash],
      }),
    });
    const json = await res.json();
    if (json.result && json.result.blockNumber) return json.result;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Transaction confirmation timeout");
}

export function useSellerWithdraw() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { data: sellerBalance, refetch } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: FireeEscrowABI,
    functionName: "sellerBalances",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const withdraw = useCallback(async () => {
    if (!address) return null;
    setLoading(true);
    setError(null);
    try {
      const tx = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: FireeEscrowABI,
        functionName: "withdrawSeller",
      });
      // Wait for confirmation before refreshing balance
      await _waitForTx(tx);
      await refetch();
      return tx;
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Withdrawal failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, writeContractAsync, refetch]);

  return {
    sellerBalance: sellerBalance !== undefined ? Number(sellerBalance) / 10 ** USDC_DECIMALS : 0,
    withdraw,
    loading,
    error,
  };
}
