// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LoveToken
 * @notice ERC20 token for the WhisperMatch dating DApp
 * @dev LUV tokens are minted through the BurnMint contract's privacy-preserving mechanism
 */
contract LoveToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /**
     * @notice Emitted when tokens are minted to a recipient
     * @param to Address receiving the minted tokens
     * @param amount Amount of tokens minted
     */
    event TokensMinted(address indexed to, uint256 amount);
    
    /**
     * @notice Emitted when tokens are burned
     * @param from Address burning the tokens
     * @param amount Amount of tokens burned
     */
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @notice Contract constructor
     * @dev Grants DEFAULT_ADMIN_ROLE to the deployer
     */
    constructor() ERC20("LoveToken", "LUV") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Mint new LUV tokens
     * @dev Only addresses with MINTER_ROLE can mint tokens
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "LoveToken: cannot mint to zero address");
        require(amount > 0, "LoveToken: amount must be greater than zero");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @notice Burn LUV tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "LoveToken: amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "LoveToken: insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @notice Check if an address has the minter role
     * @param account Address to check
     * @return bool True if address has minter role
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }
}
