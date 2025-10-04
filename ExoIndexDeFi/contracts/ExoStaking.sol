// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Exo Staking Contract
/// @notice Users can stake EXO tokens to earn EXO rewards based on exoplanet discoveries, capped at 11% APY
contract ExoStaking is Ownable {
    IERC20 public exo;
    
    // Exoplanet discovery reward constants
    uint256 public constant MAX_APY_BPS = 1100; // 11% in basis points
    uint256 public constant EXPECTED_EXOPLANETS_PER_YEAR = 500;
    uint256 public constant REWARD_PER_EXOPLANET_BPS = MAX_APY_BPS / EXPECTED_EXOPLANETS_PER_YEAR; // 2.2 basis points per exoplanet
    
    // Global exoplanet discovery counter
    uint256 public globalExoplanetCount;

    struct StakeInfo {
        uint256 amount;
        uint256 lastExoplanetCount;
        uint256 rewards;
    }

    mapping(address => StakeInfo) public stakes;

    constructor(address _exo) Ownable(msg.sender) {
        exo = IERC20(_exo);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Nothing to stake");
        _updateRewards(msg.sender);
        exo.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
    }

    function unstake(uint256 amount) external {
        require(amount > 0 && amount <= stakes[msg.sender].amount, "Invalid amount");
        _updateRewards(msg.sender);
        stakes[msg.sender].amount -= amount;
        exo.transfer(msg.sender, amount);
    }

    function claim() external {
        _updateRewards(msg.sender);
        uint256 reward = stakes[msg.sender].rewards;
        require(reward > 0, "No rewards");
        stakes[msg.sender].rewards = 0;
        exo.transfer(msg.sender, reward);
    }

    /// @notice Register a new exoplanet discovery (owner only)
    function registerExoplanet() external onlyOwner {
        globalExoplanetCount += 1;
    }

    function _updateRewards(address user) internal {
        StakeInfo storage stakeInfo = stakes[user];
        if (stakeInfo.amount > 0) {
            uint256 newExoplanets = globalExoplanetCount - stakeInfo.lastExoplanetCount;
            if (newExoplanets > 0) {
                // Calculate rewards based on new exoplanets discovered
                // Cap rewards to prevent exceeding 11% APY
                uint256 maxNewExoplanets = EXPECTED_EXOPLANETS_PER_YEAR;
                if (newExoplanets > maxNewExoplanets) {
                    newExoplanets = maxNewExoplanets;
                }
                
                uint256 pending = (stakeInfo.amount * REWARD_PER_EXOPLANET_BPS * newExoplanets) / 10000;
                stakeInfo.rewards += pending;
                stakeInfo.lastExoplanetCount = globalExoplanetCount;
            }
        }
    }

    /// @notice Calculate pending rewards for a user without updating state
    /// @param user The user address to check rewards for
    /// @return pending The amount of pending rewards
    function getPendingRewards(address user) external view returns (uint256 pending) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount > 0) {
            uint256 newExoplanets = globalExoplanetCount - stakeInfo.lastExoplanetCount;
            if (newExoplanets > 0) {
                // Cap rewards to prevent exceeding 11% APY
                uint256 maxNewExoplanets = EXPECTED_EXOPLANETS_PER_YEAR;
                if (newExoplanets > maxNewExoplanets) {
                    newExoplanets = maxNewExoplanets;
                }
                pending = (stakeInfo.amount * REWARD_PER_EXOPLANET_BPS * newExoplanets) / 10000;
            }
        }
        return pending;
    }
}
