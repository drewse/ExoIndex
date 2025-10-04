// 🧠 Line-by-Line Hardhat Console Script for ExoIndex Staking
// Copy and paste each line individually into the Hardhat console

// 1️⃣ Set your contract addresses (update if you redeploy later)
const tokenAddr = "0xdb2B82CAAB3feE2b9AdEE34Fe4038D8737844196";
const stakingAddr = "0x5f3e1Fc07783e8B517Ad49F8185B6A22Aab0abdA";

// 2️⃣ Load your signer (the deployer from .env)
const [deployer] = await ethers.getSigners();

// 3️⃣ Load your token contract
const token = await ethers.getContractAt("ExoToken", tokenAddr);

// 4️⃣ Load your staking contract
const staking = await ethers.getContractAt("ExoStaking", stakingAddr);

// 5️⃣ Confirm the signer address
deployer.address

// 6️⃣ Check current EXO balance
ethers.formatUnits(await token.balanceOf(deployer.address), 18)

// 7️⃣ Approve staking contract to spend 1000 EXO
let tx = await token.approve(stakingAddr, ethers.parseUnits("1000", 18));
await tx.wait();

// 8️⃣ Stake 100 EXO
tx = await staking.stake(ethers.parseUnits("100", 18));
await tx.wait();

// 9️⃣ Check your staked amount
const s = await staking.stakes(deployer.address);
ethers.formatUnits(s.amount, 18)

// 🔟 Wait 20–60 seconds, then claim rewards
tx = await staking.claim();
await tx.wait();

// 1️⃣1️⃣ Check updated EXO balance after claiming
ethers.formatUnits(await token.balanceOf(deployer.address), 18)
