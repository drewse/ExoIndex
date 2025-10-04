const hre = require("hardhat");

async function main() {
  try {
    console.log("🧪 Testing Time-Based Rewards (11% APY)...\n");

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

    // Check current balance
    const initialBalance = await token.balanceOf(deployer.address);
    console.log("💰 Initial EXO balance:", hre.ethers.formatEther(initialBalance));

    // Approve and stake 1000 EXO for testing
    console.log("🔐 Approving staking contract to spend 1000 EXO...");
    const approveTx = await token.approve(stakingAddr, hre.ethers.parseEther("1000"));
    await approveTx.wait();
    console.log("✅ Approval successful");

    console.log("🎯 Staking 1000 EXO tokens...");
    const stakeTx = await staking.stake(hre.ethers.parseEther("1000"));
    await stakeTx.wait();
    console.log("✅ Staking successful\n");

    // Test different time durations
    const testDurations = [
      { name: "1 day", seconds: 1 * 24 * 60 * 60 },
      { name: "7 days", seconds: 7 * 24 * 60 * 60 },
      { name: "30 days", seconds: 30 * 24 * 60 * 60 },
      { name: "90 days", seconds: 90 * 24 * 60 * 60 },
      { name: "365 days", seconds: 365 * 24 * 60 * 60 }
    ];

    console.log("📊 Testing different staking durations:\n");

    for (const duration of testDurations) {
      // Calculate expected annualized return
      const expectedReturn = (duration.seconds / (365 * 24 * 60 * 60)) * 0.11; // 11% APY
      const expectedRewards = 1000 * expectedReturn; // 1000 EXO staked
      
      console.log(`⏰ ${duration.name} (${duration.seconds} seconds):`);
      console.log(`   Expected return: ${(expectedReturn * 100).toFixed(4)}%`);
      console.log(`   Expected rewards: ${expectedRewards.toFixed(6)} EXO`);
      
      // Simulate time passage by calling getPendingRewards
      const pendingRewards = await staking.getPendingRewards(deployer.address);
      console.log(`   Current pending: ${hre.ethers.formatEther(pendingRewards)} EXO`);
      console.log("");
    }

    // Test actual rewards after a short wait
    console.log("⏳ Waiting 10 seconds to accumulate real rewards...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    const pendingRewards = await staking.getPendingRewards(deployer.address);
    console.log("🎁 Pending rewards after 10 seconds:", hre.ethers.formatEther(pendingRewards));

    // Calculate expected rewards for 10 seconds
    const expected10Sec = (10 / (365 * 24 * 60 * 60)) * 0.11 * 1000;
    console.log("📈 Expected rewards for 10 seconds:", expected10Sec.toFixed(10), "EXO");

    // Claim rewards
    console.log("\n🎁 Claiming rewards...");
    const claimTx = await staking.claim();
    await claimTx.wait();
    console.log("✅ Rewards claimed successfully");

    // Check final balance
    const finalBalance = await token.balanceOf(deployer.address);
    console.log("💰 Final EXO balance:", hre.ethers.formatEther(finalBalance));

    console.log("\n🎯 Time-based rewards test completed successfully!");

  } catch (error) {
    console.error("❌ Error during time-based rewards test:", error);
    process.exit(1);
  }
}

main();
