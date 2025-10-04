const hre = require("hardhat");

async function main() {
  try {
    console.log("🚀 Starting ExoIndex Staking Flow Test...\n");

    // Contract addresses
    const tokenAddr = "0xdb2B82CAAB3feE2b9AdEE34Fe4038D8737844196";
    const stakingAddr = "0x5f3e1Fc07783e8B517Ad49F8185B6A22Aab0abdA";

    // Load deployer signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deployer address:", deployer.address);

    // Create contract instances
    const token = await hre.ethers.getContractAt("ExoToken", tokenAddr);
    const staking = await hre.ethers.getContractAt("ExoStaking", stakingAddr);
    console.log("📋 Contracts loaded successfully\n");

    // Check initial EXO token balance
    const initialBalance = await token.balanceOf(deployer.address);
    console.log("💰 Initial EXO balance:", hre.ethers.formatEther(initialBalance));

    // Approve staking contract to spend 1000 EXO
    console.log("🔐 Approving staking contract to spend 1000 EXO...");
    const approveTx = await token.approve(stakingAddr, hre.ethers.parseEther("1000"));
    await approveTx.wait();
    console.log("✅ Approval successful\n");

    // Stake 100 EXO tokens
    console.log("🎯 Staking 100 EXO tokens...");
    const stakeTx = await staking.stake(hre.ethers.parseEther("100"));
    await stakeTx.wait();
    console.log("✅ Staking successful\n");

    // Check staked amount and remaining balance
    const stakeInfo = await staking.stakes(deployer.address);
    const remainingBalance = await token.balanceOf(deployer.address);
    console.log("📊 Staked amount:", hre.ethers.formatEther(stakeInfo.amount));
    console.log("💰 Remaining balance:", hre.ethers.formatEther(remainingBalance));

    // Wait 20 seconds for rewards to accumulate
    console.log("\n⏳ Waiting 20 seconds for rewards to accumulate...");
    await new Promise(resolve => setTimeout(resolve, 20000));
    console.log("✅ Wait complete\n");

    // Claim rewards
    console.log("🎁 Claiming rewards...");
    const claimTx = await staking.claim();
    await claimTx.wait();
    console.log("✅ Rewards claimed successfully\n");

    // Check final token balance after claiming
    const finalBalance = await token.balanceOf(deployer.address);
    console.log("💰 Final EXO balance:", hre.ethers.formatEther(finalBalance));

    // Calculate rewards earned
    const rewardsEarned = finalBalance - remainingBalance;
    console.log("🎉 Rewards earned:", hre.ethers.formatEther(rewardsEarned));

    console.log("\n🎯 Staking flow test completed successfully!");

  } catch (error) {
    console.error("❌ Error during staking flow:", error);
    process.exit(1);
  }
}

main();
