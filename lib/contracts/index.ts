import FireeEscrowABI from "./FireeEscrow.abi.json";

// Network config — set NEXT_PUBLIC_CHAIN=mainnet to switch to Base mainnet
const IS_MAINNET = process.env.NEXT_PUBLIC_CHAIN === "mainnet";

export const CHAIN_ID = IS_MAINNET ? 8453 : 84532;
export const CHAIN_NAME = IS_MAINNET ? "Base" : "Base Sepolia";

// Contract addresses - update after deployment
export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}` || "0x0000000000000000000000000000000000000000";

// USDC addresses (Circle official)
export const USDC_ADDRESS = (IS_MAINNET
  ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  // USDC on Base mainnet
  : "0x036CbD53842c5426634e7929541eC2318f3dCF7e"   // USDC on Base Sepolia
) as `0x${string}`;
export const USDC_DECIMALS = 6;

export { FireeEscrowABI };

// Standard ERC20 ABI (minimal for approve + allowance + balanceOf)
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
