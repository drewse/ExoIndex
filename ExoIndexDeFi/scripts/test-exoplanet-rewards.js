const hre = require("hardhat");

async function main() {
  try {
    console.log("🌍 Testing Exoplanet Discovery-Based Rewards...\n");

    // Contract addresses
    const tokenAddr = "0xf8Fc610a1869c2D216E8c66835E7D2415F7A2482";
    const stakingAddr = "0x403e568c5A6a890e7F1D8723B849964Eff127D56";

    // Load deployer signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deployer address:", deployer.address);

    // Create contract instances
    const token = await hre.ethers.getContractAt("ExoToken", tokenAddr);
    const staking = await hre.ethers.getContractAt("ExoStaking", stakingAddr);
    console.log("📋 Contracts loaded successfully\n");

    // Check initial balance
    const initialBalance = await token.balanceOf(deployer.address);
    console.log("💰 Initial EXO balance:", hre.ethers.formatEther(initialBalance));

    // Check initial exoplanet count
    const initialExoplanetCount = await staking.globalExoplanetCount();
    console.log("🌍 Initial exoplanet count:", initialExoplanetCount.toString());

    // Approve and stake 1000 EXO for testing
    console.log("🔐 Approving staking contract to spend 1000 EXO...");
    const approveTx = await token.approve(stakingAddr, hre.ethers.parseEther("1000"));
    await approveTx.wait();
    console.log("✅ Approval successful");

    console.log("🎯 Staking 1000 EXO tokens...");
    const stakeTx = await staking.stake(hre.ethers.parseEther("1000"));
    await stakeTx.wait();
    console.log("✅ Staking successful\n");

    // Test exoplanet discovery rewards
    console.log("🌍 Testing exoplanet discovery rewards:\n");

    // Register 5 exoplanets
    for (let i = 1; i <= 5; i++) {
      console.log(`🔭 Registering exoplanet #${i}...`);
      const registerTx = await staking.registerExoplanet();
      await registerTx.wait();
      
      const exoplanetCount = await staking.globalExoplanetCount();
      const pendingRewards = await staking.getPendingRewards(deployer.address);
      
      console.log(`   Global exoplanet count: ${exoplanetCount}`);
      console.log(`   Pending rewards: ${hre.ethers.formatEther(pendingRewards)} EXO`);
      
      // Calculate expected rewards
      const expectedRewards = (1000 * 2.2 * i) / 10000; // 1000 EXO * 2.2 bps * i exoplanets / 10000
      console.log(`   Expected rewards: ${expectedRewards.toFixed(6)} EXO`);
      console.log("");
    }

    // Test claiming rewards
    console.log("🎁 Claiming rewards...");
    const claimTx = await staking.claim();
    await claimTx.wait();
    console.log("✅ Rewards claimed successfully");

    // Check final balance
    const finalBalance = await token.balanceOf(deployer.address);
    console.log("💰 Final EXO balance:", hre.ethers.formatEther(finalBalance));

    // Calculate rewards earned
    const rewardsEarned = finalBalance - initialBalance;
    console.log("🎉 Total rewards earned:", hre.ethers.formatEther(rewardsEarned));

    // Test edge case: Register many exoplanets to test the cap
    console.log("\n🧪 Testing reward cap (registering 600 exoplanets)...");
    for (let i = 1; i <= 600; i++) {
      const registerTx = await staking.registerExoplanet();
      await registerTx.wait();
      
      if (i % 100 === 0) {
        const exoplanetCount = await staking.globalExoplanetCount();
        const pendingRewards = await staking.getPendingRewards(deployer.address);
        console.log(`   After ${exoplanetCount} exoplanets: ${hre.ethers.formatEther(pendingRewards)} EXO pending`);
      }
    }

    // Claim final rewards
    console.log("\n🎁 Claiming final rewards...");
    const finalClaimTx = await staking.claim();
    await finalClaimTx.wait();
    console.log("✅ Final rewards claimed");

    const ultimateBalance = await token.balanceOf(deployer.address);
    const totalRewardsEarned = ultimateBalance - initialBalance;
    console.log("💰 Ultimate EXO balance:", hre.ethers.formatEther(ultimateBalance));
    console.log("🎉 Total rewards earned:", hre.ethers.formatEther(totalRewardsEarned));

    // Calculate APY achieved
    const apyAchieved = (parseFloat(hre.ethers.formatEther(totalRewardsEarned)) / 1000) * 100;
    console.log(`📊 APY achieved: ${apyAchieved.toFixed(2)}%`);

    console.log("\n🎯 Exoplanet discovery rewards test completed successfully!");

  } catch (error) {
    console.error("❌ Error during exoplanet rewards test:", error);
    process.exit(1);
  }
}

main();
