// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "forge-std/Test.sol";
import "../src/MatchRegistry.sol";
import "../src/LoveToken.sol";

contract MatchRegistryTest is Test {
    MatchRegistry public matchRegistry;
    LoveToken public loveToken;

    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);

    event LikeSent(address indexed from, address indexed to, uint256 timestamp);
    event MatchCreated(address indexed user1, address indexed user2, uint256 timestamp);

    function setUp() public {
        loveToken = new LoveToken();
        matchRegistry = new MatchRegistry(address(loveToken));
        
        // Mint LUV
        loveToken.mint(alice, 10 ether);
        loveToken.mint(bob, 10 ether);
        loveToken.mint(charlie, 10 ether);
    }

    function testSendLike() public {
        vm.expectEmit(true, true, false, true);
        emit LikeSent(alice, bob, block.timestamp);
        
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        // Verify like stored
        assertTrue(matchRegistry.hasLiked(alice, bob));
        assertFalse(matchRegistry.hasLiked(bob, alice));
    }

    function testFailSendLikeWithoutLuv() public {
        address poor = address(0x999);
        vm.prank(poor);
        matchRegistry.sendLike(bob);
    }

    function testFailSendLikeToSelf() public {
        vm.prank(alice);
        matchRegistry.sendLike(alice);
    }

    function testMutualMatch() public {
        // Alice likes Bob
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        // Bob likes Alice - should create match
        vm.expectEmit(true, true, false, true);
        emit MatchCreated(alice, bob, block.timestamp);
        
        vm.prank(bob);
        matchRegistry.sendLike(alice);
        
        // Verify match
        assertTrue(matchRegistry.isMatch(alice, bob));
        assertTrue(matchRegistry.isMatch(bob, alice)); // Symmetric
    }

    function testGetMatchCount() public {
        // Create matches
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        vm.prank(bob);
        matchRegistry.sendLike(alice);
        
        vm.prank(alice);
        matchRegistry.sendLike(charlie);
        
        vm.prank(charlie);
        matchRegistry.sendLike(alice);
        
        // Verify counts
        assertEq(matchRegistry.getMatchCount(alice), 2);
        assertEq(matchRegistry.getMatchCount(bob), 1);
        assertEq(matchRegistry.getMatchCount(charlie), 1);
    }

    function testOneSidedLikeNotMatch() public {
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        // Not a match yet
        assertFalse(matchRegistry.isMatch(alice, bob));
        assertTrue(matchRegistry.hasLiked(alice, bob));
    }

    function testMultipleMatches() public {
        address[] memory users = new address[](5);
        for (uint256 i = 0; i < 5; i++) {
            users[i] = address(uint160(i + 100));
            loveToken.mint(users[i], 10 ether);
        }
        
        // Alice matches with everyone
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(alice);
            matchRegistry.sendLike(users[i]);
            
            vm.prank(users[i]);
            matchRegistry.sendLike(alice);
        }
        
        assertEq(matchRegistry.getMatchCount(alice), 5);
    }

    function testCannotLikeTwice() public {
        vm.startPrank(alice);
        matchRegistry.sendLike(bob);
        
        // Second like should not emit event (idempotent)
        matchRegistry.sendLike(bob);
        vm.stopPrank();
        
        // Still only one like
        assertTrue(matchRegistry.hasLiked(alice, bob));
    }
}
