const hre = require("hardhat");

async function main() {
  try {
    console.log("🚀 Starting ExoIndex Unstaking Flow...\n");

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

    // Check current staked amount
    const stakeInfo = await staking.stakes(deployer.address);
    const stakedAmount = stakeInfo.amount;
    console.log("📊 Current staked amount:", hre.ethers.formatEther(stakedAmount));

    // Check if no tokens are staked
    if (stakedAmount === 0n) {
      console.log("❌ No tokens are currently staked. Exiting...");
      return;
    }

    // Check current token balance before claiming
    const balanceBeforeClaim = await token.balanceOf(deployer.address);
    console.log("💰 Token balance before claiming:", hre.ethers.formatEther(balanceBeforeClaim));

    // Check if getPendingRewards function exists and call it
    try {
      const pendingRewards = await staking.getPendingRewards(deployer.address);
      console.log("🎁 Pending rewards:", hre.ethers.formatEther(pendingRewards));
    } catch (error) {
      console.log("ℹ️  getPendingRewards function not available, proceeding with claim...");
    }

    // Claim rewards
    console.log("\n🎁 Claiming rewards...");
    const claimTx = await staking.claim();
    await claimTx.wait();
    console.log("✅ Rewards claimed successfully");

    // Check token balance after claiming
    const balanceAfterClaim = await token.balanceOf(deployer.address);
    console.log("💰 Token balance after claiming:", hre.ethers.formatEther(balanceAfterClaim));

    // Calculate rewards earned
    const rewardsEarned = balanceAfterClaim - balanceBeforeClaim;
    console.log("🎉 Rewards earned:", hre.ethers.formatEther(rewardsEarned));

    // Unstake the entire staked amount
    console.log("\n🎯 Unstaking entire staked amount...");
    const unstakeTx = await staking.unstake(stakedAmount);
    await unstakeTx.wait();
    console.log("✅ Unstaking successful");

    // Check final token balance after unstaking
    const finalBalance = await token.balanceOf(deployer.address);
    console.log("💰 Final EXO balance after unstaking:", hre.ethers.formatEther(finalBalance));

    // Verify no tokens are staked anymore
    const finalStakeInfo = await staking.stakes(deployer.address);
    console.log("📊 Final staked amount:", hre.ethers.formatEther(finalStakeInfo.amount));

    console.log("\n🎯 Unstaking flow completed successfully!");

  } catch (error) {
    console.error("❌ Error during unstaking flow:", error);
    process.exit(1);
  }
}

main();
