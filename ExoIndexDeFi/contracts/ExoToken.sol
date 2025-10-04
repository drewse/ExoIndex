// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Exo Token ($EXO) for ExoIndex
/// @notice Simple ERC-20 with owner mint for future rewards/distribution
contract ExoToken is ERC20, Ownable {
    constructor() ERC20("Exo Token", "EXO") Ownable(msg.sender) {
        // Mint initial 1,000,000 EXO to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /// @notice Owner-only mint for future emissions (staking/mining rewards)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
