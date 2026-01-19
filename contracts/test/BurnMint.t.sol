// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "forge-std/Test.sol";
import "../src/BurnMint.sol";
import "../src/LoveToken.sol";

contract BurnMintTest is Test {
    BurnMint public burnMint;
    LoveToken public loveToken;

    address public alice = address(0x1);
    address public bob = address(0x2);

    event EthBurned(bytes32 indexed commitmentHash, uint256 amount, uint256 blockNumber);
    event LuvMinted(address indexed recipient, uint256 ethAmount, uint256 luvAmount, bytes32 nullifier);

    function setUp() public {
        // Deploy LoveToken
        loveToken = new LoveToken();
        
        // Deploy BurnMint with LoveToken address
        burnMint = new BurnMint(address(loveToken));
        
        // Transfer ownership of LoveToken to BurnMint
        loveToken.transferOwnership(address(burnMint));
        
        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function testBurnAndCommit() public {
        uint256 burnAmount = 0.01 ether;
        bytes32 secret = keccak256("my-secret");
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, alice, burnAmount));

        vm.startPrank(alice);
        
        // Expect EthBurned event
        vm.expectEmit(true, false, false, true);
        emit EthBurned(commitmentHash, burnAmount, block.number);
        
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        
        // Verify commitment stored
        (uint256 amount, uint256 blockNumber, bool exists) = burnMint.commitments(commitmentHash);
        assertEq(amount, burnAmount);
        assertEq(blockNumber, block.number);
        assertTrue(exists);
        
        vm.stopPrank();
    }

    function testBurnMinimumAmount() public {
        uint256 burnAmount = 0.001 ether; // Minimum
        bytes32 secret = keccak256("my-secret");
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, alice, burnAmount));

        vm.prank(alice);
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        
        (uint256 amount, , bool exists) = burnMint.commitments(commitmentHash);
        assertEq(amount, burnAmount);
        assertTrue(exists);
    }

    function testFailBurnBelowMinimum() public {
        uint256 burnAmount = 0.0001 ether; // Below minimum
        bytes32 commitmentHash = keccak256("test");

        vm.prank(alice);
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
    }

    function testMintWithProof() public {
        uint256 burnAmount = 0.01 ether;
        bytes32 secret = keccak256("my-secret");
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, bob, burnAmount));

        // Alice burns ETH
        vm.prank(alice);
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        
        // Wait for delay (10 blocks)
        vm.roll(block.number + 11);
        
        // Bob mints LUV (anyone can call, but LUV goes to bob)
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, block.timestamp));
        
        vm.expectEmit(true, false, false, true);
        emit LuvMinted(bob, burnAmount, burnAmount * 1000, nullifier);
        
        vm.prank(bob);
        burnMint.mintWithProof(secret, bob, burnAmount, nullifier);
        
        // Verify LUV minted
        uint256 expectedLuv = burnAmount * 1000; // ETH_TO_LUV_RATE = 1000
        assertEq(loveToken.balanceOf(bob), expectedLuv);
        
        // Verify nullifier used
        assertTrue(burnMint.nullifiers(nullifier));
    }

    function testFailMintBeforeDelay() public {
        uint256 burnAmount = 0.01 ether;
        bytes32 secret = keccak256("my-secret");
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, bob, burnAmount));

        vm.prank(alice);
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        
        // Try to mint immediately (should fail)
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, block.timestamp));
        
        vm.prank(bob);
        burnMint.mintWithProof(secret, bob, burnAmount, nullifier);
    }

    function testFailDoubleSpend() public {
        uint256 burnAmount = 0.01 ether;
        bytes32 secret = keccak256("my-secret");
        bytes32 commitmentHash = keccak256(abi.encodePacked(secret, bob, burnAmount));

        vm.prank(alice);
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        
        vm.roll(block.number + 11);
        
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, block.timestamp));
        
        // First mint succeeds
        vm.prank(bob);
        burnMint.mintWithProof(secret, bob, burnAmount, nullifier);
        
        // Second mint with same nullifier should fail
        vm.prank(bob);
        burnMint.mintWithProof(secret, bob, burnAmount, nullifier);
    }

    function testFailInvalidCommitment() public {
        uint256 burnAmount = 0.01 ether;
        bytes32 wrongSecret = keccak256("wrong-secret");
        bytes32 correctSecret = keccak256("correct-secret");
        bytes32 commitmentHash = keccak256(abi.encodePacked(correctSecret, bob, burnAmount));

        vm.prank(alice);
        burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        
        vm.roll(block.number + 11);
        
        bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, block.timestamp));
        
        // Try to mint with wrong secret (should fail)
        vm.prank(bob);
        burnMint.mintWithProof(wrongSecret, bob, burnAmount, nullifier);
    }

    function testGetLuvAmount() public {
        uint256 ethAmount = 1 ether;
        uint256 expectedLuv = ethAmount * 1000; // ETH_TO_LUV_RATE
        
        uint256 luvAmount = burnMint.getLuvAmount(ethAmount);
        assertEq(luvAmount, expectedLuv);
    }

    function testMultipleBurnsAndMints() public {
        // Alice burns multiple times
        for (uint256 i = 0; i < 3; i++) {
            uint256 burnAmount = 0.01 ether + (i * 0.001 ether);
            bytes32 secret = keccak256(abi.encodePacked("secret", i));
            bytes32 commitmentHash = keccak256(abi.encodePacked(secret, bob, burnAmount));

            vm.prank(alice);
            burnMint.burnAndCommit{value: burnAmount}(commitmentHash);
        }
        
        vm.roll(block.number + 11);
        
        // Bob mints all
        uint256 totalLuv = 0;
        for (uint256 i = 0; i < 3; i++) {
            uint256 burnAmount = 0.01 ether + (i * 0.001 ether);
            bytes32 secret = keccak256(abi.encodePacked("secret", i));
            bytes32 commitmentHash = keccak256(abi.encodePacked(secret, bob, burnAmount));
            bytes32 nullifier = keccak256(abi.encodePacked(commitmentHash, block.timestamp, i));
            
            vm.prank(bob);
            burnMint.mintWithProof(secret, bob, burnAmount, nullifier);
            
            totalLuv += burnAmount * 1000;
        }
        
        assertEq(loveToken.balanceOf(bob), totalLuv);
    }
}
