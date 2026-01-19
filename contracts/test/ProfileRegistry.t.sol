// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "forge-std/Test.sol";
import "../src/ProfileRegistry.sol";
import "../src/LoveToken.sol";

contract ProfileRegistryTest is Test {
    ProfileRegistry public registry;
    LoveToken public loveToken;

    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);

    function setUp() public {
        loveToken = new LoveToken();
        registry = new ProfileRegistry(address(loveToken));
        
        // Mint LUV to test users
        loveToken.mint(alice, 10 ether);
        loveToken.mint(bob, 5 ether);
        loveToken.mint(charlie, 1 ether);
    }

    function testCreateProfile() public {
        string memory ipfsHash = "QmTest123";
        uint256 minLuv = 0.5 ether;

        vm.prank(alice);
        registry.createProfile(ipfsHash, minLuv);
        
        // Verify profile created
        assertTrue(registry.hasProfile(alice));
        
        (string memory hash, uint256 created, , bool active, uint256 minLuvToView) = registry.getProfile(alice);
        assertEq(hash, ipfsHash);
        assertGt(created, 0);
        assertTrue(active);
        assertEq(minLuvToView, minLuv);
    }

    function testFailCreateProfileWithoutLuv() public {
        address poor = address(0x999);
        vm.prank(poor);
        registry.createProfile("QmTest", 0);
    }

    function testFailCreateDuplicateProfile() public {
        vm.startPrank(alice);
        registry.createProfile("QmTest1", 0);
        registry.createProfile("QmTest2", 0); // Should fail
        vm.stopPrank();
    }

    function testUpdateProfile() public {
        // Create initial profile
        vm.startPrank(alice);
        registry.createProfile("QmTest1", 0);
        
        // Update profile
        string memory newHash = "QmTest2";
        registry.updateProfile(newHash);
        
        (string memory hash, , uint256 updated, , ) = registry.getProfile(alice);
        assertEq(hash, newHash);
        assertGt(updated, 0);
        vm.stopPrank();
    }

    function testSetProfileActive() public {
        vm.startPrank(alice);
        registry.createProfile("QmTest", 0);
        
        // Deactivate
        registry.setProfileActive(false);
        (, , , bool active1, ) = registry.getProfile(alice);
        assertFalse(active1);
        
        // Reactivate
        registry.setProfileActive(true);
        (, , , bool active2, ) = registry.getProfile(alice);
        assertTrue(active2);
        vm.stopPrank();
    }

    function testGetActiveProfiles() public {
        // Create profiles
        vm.prank(alice);
        registry.createProfile("QmAlice", 0);
        
        vm.prank(bob);
        registry.createProfile("QmBob", 0);
        
        vm.prank(charlie);
        registry.createProfile("QmCharlie", 0);
        
        // Alice should see Bob and Charlie
        address[] memory profiles = registry.getActiveProfiles(alice);
        assertEq(profiles.length, 2);
    }

    function testGetActiveProfilesWithMinLuv() public {
        // Alice requires 2 LUV to view
        vm.prank(alice);
        registry.createProfile("QmAlice", 2 ether);
        
        // Bob has 5 LUV (can view Alice)
        vm.prank(bob);
        address[] memory bobView = registry.getActiveProfiles(bob);
        assertEq(bobView.length, 1);
        assertEq(bobView[0], alice);
        
        // Charlie has 1 LUV (cannot view Alice)
        vm.prank(charlie);
        address[] memory charlieView = registry.getActiveProfiles(charlie);
        assertEq(charlieView.length, 0);
    }

    function testGetActiveProfilesPaginated() public {
        // Create 10 profiles
        for (uint256 i = 0; i < 10; i++) {
            address user = address(uint160(i + 100));
            loveToken.mint(user, 10 ether);
            vm.prank(user);
            registry.createProfile(string(abi.encodePacked("QmTest", i)), 0);
        }
        
        // Get first 5
        address[] memory page1 = registry.getActiveProfilesPaginated(alice, 0, 5);
        assertEq(page1.length, 5);
        
        // Get next 5
        address[] memory page2 = registry.getActiveProfilesPaginated(alice, 5, 5);
        assertEq(page2.length, 5);
        
        // Verify no overlap
        assertTrue(page1[0] != page2[0]);
    }

    function testPaginationLimit() public {
        // Max limit is 100
        vm.expectRevert("ProfileRegistry: invalid limit");
        registry.getActiveProfilesPaginated(alice, 0, 101);
    }

    function testProfileExists() public {
        assertFalse(registry.profileExists(alice));
        
        vm.prank(alice);
        registry.createProfile("QmTest", 0);
        
        assertTrue(registry.profileExists(alice));
    }

    function testGetAllProfileCount() public {
        assertEq(registry.getAllProfileCount(), 0);
        
        vm.prank(alice);
        registry.createProfile("QmTest1", 0);
        
        vm.prank(bob);
        registry.createProfile("QmTest2", 0);
        
        assertEq(registry.getAllProfileCount(), 2);
    }
}
