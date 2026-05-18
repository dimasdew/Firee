import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Base Sepolia USDC address (Circle's official testnet USDC)
  // If not available, we deploy a mock ERC20
  const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Circle USDC on Base Sepolia
  const PLATFORM_FEE_BPS = 300; // 3%

  const FireeEscrow = await ethers.getContractFactory("FireeEscrow");
  const escrow = await FireeEscrow.deploy(USDC_BASE_SEPOLIA, PLATFORM_FEE_BPS);
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("FireeEscrow deployed to:", address);
  console.log("USDC:", USDC_BASE_SEPOLIA);
  console.log("Platform fee:", PLATFORM_FEE_BPS, "bps (3%)");
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
