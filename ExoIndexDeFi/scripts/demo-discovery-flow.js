const hre = require("hardhat");

async function main() {
  try {
    console.log("🚀 Starting ExoIndex Demo - Exoplanet Discovery Staking Flow");
    console.log("=" .repeat(60));
    console.log("");

    // Contract addresses (existing deployed contracts)
    const tokenAddr = "0xf8Fc610a1869c2D216E8c66835E7D2415F7A2482";
    const stakingAddr = "0x403e568c5A6a890e7F1D8723B849964Eff127D56";

    // Load deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deployer Address:", deployer.address);
    console.log("");

    // Create contract instances
    const token = await hre.ethers.getContractAt("ExoToken", tokenAddr);
    const staking = await hre.ethers.getContractAt("ExoStaking", stakingAddr);
    console.log("📋 Contracts Loaded Successfully");
    console.log("   ExoToken:", tokenAddr);
    console.log("   ExoStaking:", stakingAddr);
    console.log("");

    // Check initial state
    const initialBalance = await token.balanceOf(deployer.address);
    const initialExoplanetCount = await staking.globalExoplanetCount();
    console.log("💰 Initial EXO Balance:", hre.ethers.formatEther(initialBalance));
    console.log("🌍 Initial Exoplanet Count:", initialExoplanetCount.toString());
    console.log("");

    // Step 1: Approve staking contract
    console.log("🔐 Step 1: Approving Staking Contract");
    console.log("   Approving 1000 EXO for staking...");
    const approveTx = await token.approve(stakingAddr, hre.ethers.parseEther("1000"));
    await approveTx.wait();
    console.log("   ✅ Approval Successful");
    console.log("");

    // Step 2: Stake tokens
    console.log("🎯 Step 2: Staking EXO Tokens");
    console.log("   Staking 100 EXO tokens...");
    const stakeTx = await staking.stake(hre.ethers.parseEther("100"));
    await stakeTx.wait();
    console.log("   ✅ Staking Successful");
    
    const balanceAfterStake = await token.balanceOf(deployer.address);
    const stakedAmount = await staking.stakes(deployer.address);
    console.log("   💰 Balance After Staking:", hre.ethers.formatEther(balanceAfterStake));
    console.log("   📊 Staked Amount:", hre.ethers.formatEther(stakedAmount.amount));
    console.log("");

    // Step 3: Simulate exoplanet discoveries
    console.log("🌍 Step 3: Simulating Exoplanet Discoveries");
    console.log("   Each discovery earns 2.2 basis points (0.022%) rewards");
    console.log("   Expected: 5 discoveries = 11 basis points (0.11%) total");
    console.log("");

    for (let i = 1; i <= 5; i++) {
      console.log(`🔭 Simulating Exoplanet Discovery #${i}`);
      
      // Register exoplanet discovery
      const registerTx = await staking.registerExoplanet();
      await registerTx.wait();
      
      // Get updated state
      const exoplanetCount = await staking.globalExoplanetCount();
      const pendingRewards = await staking.getPendingRewards(deployer.address);
      
      console.log(`   🌍 Global Exoplanet Count: ${exoplanetCount}`);
      console.log(`   💰 Pending Rewards: ${hre.ethers.formatEther(pendingRewards)} EXO`);
      
      // Calculate expected rewards
      const expectedRewards = (100 * 2.2 * i) / 10000; // 100 EXO * 2.2 bps * i discoveries / 10000
      console.log(`   📈 Expected Rewards: ${expectedRewards.toFixed(6)} EXO`);
      console.log(`   🎯 APY Progress: ${(expectedRewards * 100).toFixed(4)}%`);
      console.log("");
      
      // Wait 1 second between discoveries for demo clarity
      if (i < 5) {
        console.log("   ⏳ Waiting 1 second before next discovery...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("");
      }
    }

    // Step 4: Claim rewards
    console.log("🎁 Step 4: Claiming Rewards");
    console.log("   Claiming all accumulated rewards...");
    const claimTx = await staking.claim();
    await claimTx.wait();
    console.log("   ✅ Rewards Claimed Successfully");
    
    const balanceAfterClaim = await token.balanceOf(deployer.address);
    const rewardsEarned = balanceAfterClaim - balanceAfterStake;
    console.log("   💰 Balance After Claiming:", hre.ethers.formatEther(balanceAfterClaim));
    console.log("   🎉 Rewards Earned:", hre.ethers.formatEther(rewardsEarned));
    console.log("");

    // Step 5: Unstake everything
    console.log("🎯 Step 5: Unstaking All Tokens");
    console.log("   Unstaking entire staked amount...");
    const unstakeTx = await staking.unstake(stakedAmount.amount);
    await unstakeTx.wait();
    console.log("   ✅ Unstaking Successful");
    
    const finalBalance = await token.balanceOf(deployer.address);
    const finalStakedAmount = await staking.stakes(deployer.address);
    console.log("   💰 Final Balance:", hre.ethers.formatEther(finalBalance));
    console.log("   📊 Final Staked Amount:", hre.ethers.formatEther(finalStakedAmount.amount));
    console.log("");

    // Summary
    console.log("📊 Demo Summary");
    console.log("=" .repeat(30));
    const totalRewardsEarned = finalBalance - initialBalance;
    const apyAchieved = (parseFloat(hre.ethers.formatEther(totalRewardsEarned)) / 100) * 100;
    
    console.log("🌍 Exoplanets Discovered:", "5");
    console.log("💰 Total Rewards Earned:", hre.ethers.formatEther(totalRewardsEarned), "EXO");
    console.log("📈 APY Achieved:", apyAchieved.toFixed(4) + "%");
    console.log("🎯 Expected APY:", "11% (capped at 500 discoveries/year)");
    console.log("");

    console.log("🎉 ExoIndex Demo Completed Successfully!");
    console.log("   Staking rewards are now tied to real exoplanet discoveries!");
    console.log("   The more exoplanets we discover, the more rewards stakers earn!");
    console.log("");

  } catch (error) {
    console.error("❌ Error during ExoIndex demo:", error);
    process.exit(1);
  }
}

main();
