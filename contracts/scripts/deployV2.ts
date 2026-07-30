import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Circle USDC on Base Sepolia
  const PLATFORM_FEE_BPS = 300; // 3%

  const FireeEscrowV2 = await ethers.getContractFactory("FireeEscrowV2");
  const escrow = await FireeEscrowV2.deploy(USDC_BASE_SEPOLIA, PLATFORM_FEE_BPS);
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("FireeEscrowV2 deployed to:", address);
  console.log("USDC:", USDC_BASE_SEPOLIA);
  console.log("Platform fee:", PLATFORM_FEE_BPS, "bps (3%)");
  console.log("\nUpdate .env.local:");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
