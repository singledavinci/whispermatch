// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test, console} from "forge-std/Test.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";

contract MatchRegistryTest is Test {
    MatchRegistry public matchRegistry;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    
    event LikeSent(address indexed from, address indexed to, uint256 timestamp);
    event MatchCreated(address indexed user1, address indexed user2, uint256 timestamp);
    event MatchRemoved(address indexed user1, address indexed user2);

    function setUp() public {
        matchRegistry = new MatchRegistry();
    }

    function test_SendLike() public {
        vm.startPrank(alice);
        
        vm.expectEmit(true, true, false, true);
        emit LikeSent(alice, bob, block.timestamp);
        
        matchRegistry.sendLike(bob);
        
        // Verify like was recorded
        assertTrue(matchRegistry.hasLiked(bob));
        assertEq(matchRegistry.getLikeTimestamp(alice, bob), block.timestamp);
        
        // Bob should see he was liked
        vm.stopPrank();
        vm.startPrank(bob);
        assertTrue(matchRegistry.hasBeenLikedBy(alice));
        
        vm.stopPrank();
    }

    function test_RevertIf_LikeYourself() public {
        vm.startPrank(alice);
        
        vm.expectRevert("MatchRegistry: cannot like yourself");
        matchRegistry.sendLike(alice);
        
        vm.stopPrank();
    }

    function test_RevertIf_LikeZeroAddress() public {
        vm.startPrank(alice);
        
        vm.expectRevert("MatchRegistry: invalid recipient");
        matchRegistry.sendLike(address(0));
        
        vm.stopPrank();
    }

    function test_RevertIf_DuplicateLike() public {
        vm.startPrank(alice);
        
        matchRegistry.sendLike(bob);
        
        vm.expectRevert("MatchRegistry: already liked");
        matchRegistry.sendLike(bob);
        
        vm.stopPrank();
    }

    function test_MutualMatch() public {
        // Alice likes Bob
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        // No match yet
        assertFalse(matchRegistry.isMatch(alice, bob));
        assertFalse(matchRegistry.isMatch(bob, alice));
        assertEq(matchRegistry.getMatchCount(alice), 0);
        assertEq(matchRegistry.getMatchCount(bob), 0);
        
        // Bob likes Alice - should create match
        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit MatchCreated(bob, alice, block.timestamp);
        matchRegistry.sendLike(alice);
        
        // Verify mutual match
        assertTrue(matchRegistry.isMatch(alice, bob));
        assertTrue(matchRegistry.isMatch(bob, alice));
        assertEq(matchRegistry.getMatchCount(alice), 1);
        assertEq(matchRegistry.getMatchCount(bob), 1);
    }

    function test_RemoveLike() public {
        vm.startPrank(alice);
        
        matchRegistry.sendLike(bob);
        assertTrue(matchRegistry.hasLiked(bob));
        
        matchRegistry.removeLike(bob);
        assertFalse(matchRegistry.hasLiked(bob));
        
        vm.stopPrank();
    }

    function test_RevertIf_RemoveNonexistentLike() public {
        vm.startPrank(alice);
        
        vm.expectRevert("MatchRegistry: like does not exist");
        matchRegistry.removeLike(bob);
        
        vm.stopPrank();
    }

    function test_RemoveLikeAlsoRemovesMatch() public {
        // Create mutual match
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        vm.prank(bob);
        matchRegistry.sendLike(alice);
        
        assertTrue(matchRegistry.isMatch(alice, bob));
        
        // Alice removes her like
        vm.prank(alice);
        matchRegistry.removeLike(bob);
        
        // Match should be removed
        assertFalse(matchRegistry.isMatch(alice, bob));
        assertFalse(matchRegistry.isMatch(bob, alice));
        assertEq(matchRegistry.getMatchCount(alice), 0);
        assertEq(matchRegistry.getMatchCount(bob), 0);
    }

    function test_Unmatch() public {
        // Create mutual match
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        vm.prank(bob);
        matchRegistry.sendLike(alice);
        
        assertTrue(matchRegistry.isMatch(alice, bob));
        
        // Alice unmatches
        vm.prank(alice);
        vm.expectEmit(true, true, false, false);
        emit MatchRemoved(alice, bob);
        matchRegistry.unmatch(bob);
        
        // Verify match is removed
        assertFalse(matchRegistry.isMatch(alice, bob));
        assertFalse(matchRegistry.isMatch(bob, alice));
        
        // Verify likes are also removed
        vm.startPrank(alice);
        assertFalse(matchRegistry.hasLiked(bob));
        vm.stopPrank();
        
        vm.startPrank(bob);
        assertFalse(matchRegistry.hasLiked(alice));
        vm.stopPrank();
    }

    function test_RevertIf_UnmatchWithoutMatch() public {
        vm.startPrank(alice);
        
        vm.expectRevert("MatchRegistry: not matched");
        matchRegistry.unmatch(bob);
        
        vm.stopPrank();
    }

    function test_MultipleLikes() public {
        // Alice likes multiple people
        vm.startPrank(alice);
        matchRegistry.sendLike(bob);
        matchRegistry.sendLike(charlie);
        vm.stopPrank();
        
        // Verify both likes
        vm.startPrank(alice);
        assertTrue(matchRegistry.hasLiked(bob));
        assertTrue(matchRegistry.hasLiked(charlie));
        vm.stopPrank();
        
        // Bob likes Alice back
        vm.prank(bob);
        matchRegistry.sendLike(alice);
        
        // Alice should have 1 match
        assertEq(matchRegistry.getMatchCount(alice), 1);
        
        // Charlie also likes Alice
        vm.prank(charlie);
        matchRegistry.sendLike(alice);
        
        // Alice should now have 2 matches
        assertEq(matchRegistry.getMatchCount(alice), 2);
    }

    function test_GetLikeTimestamp() public {
        uint256 timestamp = block.timestamp;
        
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        assertEq(matchRegistry.getLikeTimestamp(alice, bob), timestamp);
        assertEq(matchRegistry.getLikeTimestamp(bob, alice), 0); // Bob hasn't liked Alice
    }

    function test_ComplexScenario() public {
        // Alice likes Bob and Charlie
        vm.startPrank(alice);
        matchRegistry.sendLike(bob);
        matchRegistry.sendLike(charlie);
        vm.stopPrank();
        
        // Bob likes Alice (creates match)
        vm.prank(bob);
        matchRegistry.sendLike(alice);
        
        // Bob also likes Charlie
        vm.prank(bob);
        matchRegistry.sendLike(charlie);
        
        // Charlie likes Bob (creates match)
        vm.prank(charlie);
        matchRegistry.sendLike(bob);
        
        // Verify match counts
        assertEq(matchRegistry.getMatchCount(alice), 1); // Matched with Bob
        assertEq(matchRegistry.getMatchCount(bob), 2); // Matched with Alice and Charlie
        assertEq(matchRegistry.getMatchCount(charlie), 1); // Matched with Bob
        
        // Verify specific matches
        assertTrue(matchRegistry.isMatch(alice, bob));
        assertFalse(matchRegistry.isMatch(alice, charlie)); // Alice liked Charlie but not vice versa
        assertTrue(matchRegistry.isMatch(bob, charlie));
    }
}
