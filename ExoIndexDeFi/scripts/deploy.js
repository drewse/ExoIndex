const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy EXO Token
  const Token = await hre.ethers.getContractFactory("ExoToken");
  const token = await Token.deploy();
  await token.waitForDeployment(); // ✅ Ethers v6 deployment
  console.log("✅ ExoToken deployed to:", await token.getAddress());

  // Deploy Staking Contract
  const Staking = await hre.ethers.getContractFactory("ExoStaking");
  const staking = await Staking.deploy(await token.getAddress());
  await staking.waitForDeployment(); // ✅ Ethers v6 deployment
  console.log("✅ ExoStaking deployed to:", await staking.getAddress());

  // Fund staking contract with 100,000 EXO for rewards
  const tx = await token.transfer(
    await staking.getAddress(),
    hre.ethers.parseUnits("100000", 18)
  );
  await tx.wait();
  console.log("💰 Funded staking contract with 100,000 EXO");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});