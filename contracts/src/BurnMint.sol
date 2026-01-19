// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "./LoveToken.sol";

/**
 * @title BurnMint
 * @notice Privacy-preserving burn/mint mechanism for WhisperMatch
 * @dev Users burn ETH from public wallet and mint LUV to a new private wallet using commitment scheme
 * 
 * Privacy Flow:
 * 1. User creates secret and commitment hash: keccak256(secret + recipientAddress + amount)
 * 2. User burns ETH and submits commitment hash (from public wallet)
 * 3. After delay period, user submits secret + recipient + amount to mint LUV (to private wallet)
 * 4. Contract verifies commitment matches and mints LUV to recipient
 * 5. Nullifier prevents double-spending
 */
contract BurnMint {
    LoveToken public immutable loveToken;
    
    // Privacy delay to prevent timing analysis
    uint256 public constant COMMITMENT_DELAY = 10; // blocks
    
    // Exchange rate: 1 ETH = 1000 LUV (adjustable)
    uint256 public constant ETH_TO_LUV_RATE = 1000;
    
    // Minimum burn amount (0.001 ETH)
    uint256 public constant MIN_BURN_AMOUNT = 0.001 ether;
    
    struct Commitment {
        uint256 amount;        // Amount of ETH burned
        uint256 blockNumber;   // Block when commitment was made
        bool exists;           // Whether commitment exists
    }
    
    // Mapping of commitment hash => Commitment details
    mapping(bytes32 => Commitment) public commitments;
    
    // Mapping of nullifiers to prevent double-spending
    mapping(bytes32 => bool) public nullifiers;
    
    /**
     * @notice Emitted when ETH is burned and commitment is created
     * @param commitmentHash The hash of the commitment (keccak256(secret + recipient + amount))
     * @param amount Amount of ETH burned
     * @param blockNumber Block number when commitment was made
     */
    event EthBurned(
        bytes32 indexed commitmentHash,
        uint256 amount,
        uint256 blockNumber
    );
    
    /**
     * @notice Emitted when LUV is minted to recipient
     * @param recipient Address receiving LUV tokens
     * @param ethAmount Amount of ETH that was burned
     * @param luvAmount Amount of LUV tokens minted
     * @param nullifier Nullifier to prevent double-spend
     */
    event LuvMinted(
        address indexed recipient,
        uint256 ethAmount,
        uint256 luvAmount,
        bytes32 nullifier
    );

    /**
     * @notice Contract constructor
     * @param _loveToken Address of the LoveToken ERC20 contract
     */
    constructor(address _loveToken) {
        require(_loveToken != address(0), "BurnMint: invalid token address");
        loveToken = LoveToken(_loveToken);
    }

    /**
     * @notice Burn ETH and create a commitment for later minting
     * @dev User sends ETH and submits commitment hash. ETH is locked in contract.
     * @param commitmentHash Hash created from: keccak256(abi.encodePacked(secret, recipient, msg.value))
     */
    function burnAndCommit(bytes32 commitmentHash) external payable {
        require(msg.value >= MIN_BURN_AMOUNT, "BurnMint: amount below minimum");
        require(commitmentHash != bytes32(0), "BurnMint: invalid commitment hash");
        require(!commitments[commitmentHash].exists, "BurnMint: commitment already exists");
        
        commitments[commitmentHash] = Commitment({
            amount: msg.value,
            blockNumber: block.number,
            exists: true
        });
        
        emit EthBurned(commitmentHash, msg.value, block.number);
    }

    /**
     * @notice Mint LUV tokens by revealing commitment secret
     * @dev Verifies secret matches commitment and mints LUV to recipient address
     * @param secret Random secret used in original commitment
     * @param recipient Address to receive LUV tokens (can be different from msg.sender for privacy)
     * @param amount Amount of ETH that was burned (must match commitment)
     */
    function mintWithProof(
        bytes32 secret,
        address recipient,
        uint256 amount
    ) external {
        require(recipient != address(0), "BurnMint: invalid recipient");
        require(amount > 0, "BurnMint: invalid amount");
        
        // Reconstruct commitment hash
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, recipient, amount));
        
        // Verify commitment exists
        Commitment memory commitment = commitments[commitmentHash];
        require(commitment.exists, "BurnMint: commitment does not exist");
        require(commitment.amount == amount, "BurnMint: amount mismatch");
        
        // Verify delay has passed (privacy protection)
        require(
            block.number >= commitment.blockNumber + COMMITMENT_DELAY,
            "BurnMint: commitment delay not met"
        );
        
        // Create nullifier to prevent double-spending
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, secret));
        require(!nullifiers[nullifier], "BurnMint: nullifier already used");
        
        // Mark as spent
        nullifiers[nullifier] = true;
        
        // Calculate LUV amount to mint (correct for 18 decimals)
        uint256 luvAmount = amount * ETH_TO_LUV_RATE;
        
        // Mint LUV tokens to recipient
        loveToken.mint(recipient, luvAmount);
        
        emit LuvMinted(recipient, amount, luvAmount, nullifier);
    }

    /**
     * @notice Verify if a commitment is valid and ready to be minted
     * @param secret Secret used in commitment
     * @param recipient Intended recipient address
     * @param amount ETH amount that was burned
     * @return valid Whether the commitment is valid
     * @return ready Whether the delay period has passed
     */
    function verifyCommitment(
        bytes32 secret,
        address recipient,
        uint256 amount
    ) external view returns (bool valid, bool ready) {
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, recipient, amount));
        Commitment memory commitment = commitments[commitmentHash];
        
        if (!commitment.exists || commitment.amount != amount) {
            return (false, false);
        }
        
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, secret));
        if (nullifiers[nullifier]) {
            return (false, false);
        }
        
        bool delayPassed = block.number >= commitment.blockNumber + COMMITMENT_DELAY;
        return (true, delayPassed);
    }

    /**
     * @notice Get commitment details
     * @param commitmentHash The commitment hash to query
     * @return amount ETH amount burned
     * @return blockNumber Block when commitment was made
     * @return exists Whether commitment exists
     */
    function getCommitment(bytes32 commitmentHash) 
        external 
        view 
        returns (uint256 amount, uint256 blockNumber, bool exists) 
    {
        Commitment memory commitment = commitments[commitmentHash];
        return (commitment.amount, commitment.blockNumber, commitment.exists);
    }

    /**
     * @notice Check if a nullifier has been used
     * @param nullifier The nullifier to check
     * @return bool True if nullifier has been used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }

    /**
     * @notice Calculate LUV amount for given ETH amount
     * @param ethAmount Amount of ETH
     * @return luvAmount Equivalent LUV amount
     */
    function calculateLuvAmount(uint256 ethAmount) external pure returns (uint256 luvAmount) {
        return ethAmount * ETH_TO_LUV_RATE;
    }
}
