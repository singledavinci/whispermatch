// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test, console} from "forge-std/Test.sol";
import {LoveToken} from "../src/LoveToken.sol";
import {BurnMint} from "../src/BurnMint.sol";

contract BurnMintTest is Test {
    LoveToken public loveToken;
    BurnMint public burnMint;
    
    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public newWallet = address(0x3); // Fresh wallet for privacy
    
    // Test constants
    uint256 constant BURN_AMOUNT = 1 ether;
    uint256 constant MIN_BURN = 0.001 ether;
    bytes32 constant TEST_SECRET = keccak256("my_secret_123");
    
    event EthBurned(bytes32 indexed commitmentHash, uint256 amount, uint256 blockNumber);
    event LuvMinted(address indexed recipient, uint256 ethAmount, uint256 luvAmount, bytes32 nullifier);

    function setUp() public {
        // Deploy contracts
        loveToken = new LoveToken();
        burnMint = new BurnMint(address(loveToken));
        
        // Grant MINTER_ROLE to BurnMint contract
        loveToken.grantRole(loveToken.MINTER_ROLE(), address(burnMint));
        
        // Fund test accounts with ETH
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function test_Deployment() public {
        assertEq(address(burnMint.loveToken()), address(loveToken));
        assertEq(burnMint.COMMITMENT_DELAY(), 10);
        assertEq(burnMint.ETH_TO_LUV_RATE(), 1000);
        assertEq(burnMint.MIN_BURN_AMOUNT(), MIN_BURN);
    }

    function test_BurnAndCommit() public {
        vm.startPrank(alice);
        
        // Create commitment hash
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        
        // Expect event emission
        vm.expectEmit(true, false, false, true);
        emit EthBurned(commitmentHash, BURN_AMOUNT, block.number);
        
        // Burn ETH and create commitment
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        // Verify commitment was stored
        (uint256 amount, uint256 blockNumber, bool exists) = burnMint.getCommitment(commitmentHash);
        assertEq(amount, BURN_AMOUNT);
        assertEq(blockNumber, block.number);
        assertTrue(exists);
        
        // Verify ETH is locked in contract
        assertEq(address(burnMint).balance, BURN_AMOUNT);
        
        vm.stopPrank();
    }

    function test_RevertIf_BurnAmountTooLow() public {
        vm.startPrank(alice);
        
        uint256 lowAmount = 0.0001 ether;
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, lowAmount));
        
        vm.expectRevert("BurnMint: amount below minimum");
        burnMint.burnAndCommit{value: lowAmount}(commitmentHash);
        
        vm.stopPrank();
    }

    function test_RevertIf_InvalidCommitmentHash() public {
        vm.startPrank(alice);
        
        vm.expectRevert("BurnMint: invalid commitment hash");
        burnMint.burnAndCommit{value: BURN_AMOUNT}(bytes32(0));
        
        vm.stopPrank();
    }

    function test_RevertIf_DuplicateCommitment() public {
        vm.startPrank(alice);
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        
        // First burn should succeed
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        // Second burn with same commitment should fail
        vm.expectRevert("BurnMint: commitment already exists");
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        vm.stopPrank();
    }

    function test_MintWithProof() public {
        vm.startPrank(alice);
        
        // Step 1: Burn and commit
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        vm.stopPrank();
        
        // Step 2: Mine blocks to pass delay
        vm.roll(block.number + 11); // COMMITMENT_DELAY is 10 blocks
        
        // Step 3: Mint (anyone can call, privacy preserved)
        vm.startPrank(bob); // Different address calling mint
        
        // Calculate expected LUV amount
        // 1 ETH = 1000 LUV (rate is 1000, result has same decimals as ETH)
        uint256 expectedLuv = BURN_AMOUNT * 1000 / 1 ether; // 1000 LUV (no decimals)
        
        // Expect event emission
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, TEST_SECRET));
        vm.expectEmit(true, false, false, true);
        emit LuvMinted(newWallet, BURN_AMOUNT, expectedLuv, nullifier);
        
        // Mint LUV to new wallet
        burnMint.mintWithProof(TEST_SECRET, newWallet, BURN_AMOUNT);
        
        // Verify LUV was minted to new wallet
        assertEq(loveToken.balanceOf(newWallet), expectedLuv);
        
        // Verify nullifier is marked as used
        assertTrue(burnMint.isNullifierUsed(nullifier));
        
        vm.stopPrank();
    }

    function test_RevertIf_MintBeforeDelay() public {
        vm.startPrank(alice);
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        // Try to mint immediately (delay not passed)
        vm.expectRevert("BurnMint: commitment delay not met");
        burnMint.mintWithProof(TEST_SECRET, newWallet, BURN_AMOUNT);
        
        vm.stopPrank();
    }

    function test_RevertIf_InvalidSecret() public {
        vm.startPrank(alice);
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        vm.stopPrank();
        
        vm.roll(block.number + 11);
        
        // Try to mint with wrong secret
        bytes32 wrongSecret = keccak256("wrong_secret");
        vm.expectRevert("BurnMint: commitment does not exist");
        burnMint.mintWithProof(wrongSecret, newWallet, BURN_AMOUNT);
    }

    function test_RevertIf_AmountMismatch() public {
        vm.startPrank(alice);
        
        // Create commitment with 1 ETH
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        vm.stopPrank();
        
        vm.roll(block.number + 11);
        
        // Try to mint claiming different amount (2 ETH instead of 1 ETH)
        // This will fail because the reconstructed commitment hash won't match
        vm.expectRevert("BurnMint: commitment does not exist");
        burnMint.mintWithProof(TEST_SECRET, newWallet, 2 ether);
    }

    function test_RevertIf_DoubleSpend() public {
        vm.startPrank(alice);
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        vm.stopPrank();
        
        vm.roll(block.number + 11);
        
        // First mint should succeed
        burnMint.mintWithProof(TEST_SECRET, newWallet, BURN_AMOUNT);
        
        // Second mint with same secret should fail (nullifier already used)
        vm.expectRevert("BurnMint: nullifier already used");
        burnMint.mintWithProof(TEST_SECRET, newWallet, BURN_AMOUNT);
    }

    function test_VerifyCommitment() public {
        vm.startPrank(alice);
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        
        vm.stopPrank();
        
        // Before delay
        (bool valid, bool ready) = burnMint.verifyCommitment(TEST_SECRET, newWallet, BURN_AMOUNT);
        assertTrue(valid);
        assertFalse(ready);
        
        // After delay
        vm.roll(block.number + 11);
        (valid, ready) = burnMint.verifyCommitment(TEST_SECRET, newWallet, BURN_AMOUNT);
        assertTrue(valid);
        assertTrue(ready);
    }

    function test_CalculateLuvAmount() public view {
        // 1 ETH = 1000 LUV (both with 18 decimals)
        assertEq(burnMint.calculateLuvAmount(1 ether), 1000);
        assertEq(burnMint.calculateLuvAmount(0.5 ether), 500);
        assertEq(burnMint.calculateLuvAmount(10 ether), 10000);
    }

    function testFuzz_BurnAndMint(uint256 amount) public {
        // Bound amount to reasonable range
        amount = bound(amount, MIN_BURN, 100 ether);
        
        vm.deal(alice, amount);
        vm.startPrank(alice);
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, amount));
        burnMint.burnAndCommit{value: amount}(commitmentHash);
        
        vm.stopPrank();
        
        vm.roll(block.number + 11);
        
        burnMint.mintWithProof(TEST_SECRET, newWallet, amount);
        
        uint256 expectedLuv = (amount * 1000) / 1 ether;
        assertEq(loveToken.balanceOf(newWallet), expectedLuv);
    }

    function test_PrivacyPreservation() public {
        // Alice burns from her public wallet
        vm.startPrank(alice);
        bytes32 commitmentHash = keccak256(abi.encodePacked(TEST_SECRET, newWallet, BURN_AMOUNT));
        burnMint.burnAndCommit{value: BURN_AMOUNT}(commitmentHash);
        vm.stopPrank();
        
        vm.roll(block.number + 11);
        
        // Bob (unrelated) can call mint, preserving Alice's privacy
        vm.startPrank(bob);
        burnMint.mintWithProof(TEST_SECRET, newWallet, BURN_AMOUNT);
        vm.stopPrank();
        
        // Verify: No direct link between alice and newWallet on-chain
        // LUV is in newWallet, not alice's address
        // 1 ETH burned = 1000 LUV minted (no decimals added)
        assertEq(loveToken.balanceOf(newWallet), 1000);
        assertEq(loveToken.balanceOf(alice), 0);
    }
}
