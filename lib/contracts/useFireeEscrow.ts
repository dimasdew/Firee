"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
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

  const { writeContractAsync } = useWriteContract();

  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, ESCROW_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Check USDC balance
  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const purchase = useCallback(
    async (sellerAddress: `0x${string}`, amountUsdc: number, productId: string) => {
      if (!address) {
        setError("Connect wallet first");
        return null;
      }

      setError(null);
      const amountRaw = parseUnits(amountUsdc.toString(), USDC_DECIMALS);

      // Check balance
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
          setTxHash(approveTx);
          // Wait a bit for approval to propagate
          await new Promise((r) => setTimeout(r, 2000));
          await refetchAllowance();
        }

        // Step 2: Call purchase on escrow
        setStep("purchasing");
        const purchaseTx = await writeContractAsync({
          address: ESCROW_ADDRESS,
          abi: FireeEscrowABI,
          functionName: "purchase",
          args: [sellerAddress, amountRaw, productId],
        });
        setTxHash(purchaseTx);
        setStep("success");
        return purchaseTx;
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
  };

  return {
    step,
    error,
    txHash,
    purchase,
    reset,
    usdcBalance: balance !== undefined ? Number(balance) / 10 ** USDC_DECIMALS : null,
  };
}

export function useSellerWithdraw() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Seller balance in escrow
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
