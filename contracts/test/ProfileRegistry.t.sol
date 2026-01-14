// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test, console} from "forge-std/Test.sol";
import {LoveToken} from "../src/LoveToken.sol";
import {ProfileRegistry} from "../src/ProfileRegistry.sol";

contract ProfileRegistryTest is Test {
    LoveToken public loveToken;
    ProfileRegistry public profileRegistry;
    
    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    
    string constant IPFS_HASH_ALICE = "QmAliceProfile123";
    string constant IPFS_HASH_BOB = "QmBobProfile456";
    string constant IPFS_HASH_UPDATED = "QmAliceProfileUpdated789";
    
    event ProfileCreated(address indexed user, string ipfsHash, uint256 minLuvToView, uint256 timestamp);
    event ProfileUpdated(address indexed user, string ipfsHash, uint256 timestamp);
    event ProfileStatusChanged(address indexed user, bool isActive);

    function setUp() public {
        loveToken = new LoveToken();
        profileRegistry = new ProfileRegistry(address(loveToken));
        
        // Grant minter role to owner for testing
        loveToken.grantRole(loveToken.MINTER_ROLE(), owner);
        
        // Mint LUV to test accounts
        loveToken.mint(alice, 10 ether);
        loveToken.mint(bob, 5 ether);
        // Charlie has no LUV
    }

    function test_Deployment() public {
        assertEq(address(profileRegistry.loveToken()), address(loveToken));
        assertEq(profileRegistry.MIN_LUV_FOR_PROFILE(), 1 ether);
    }

    function test_CreateProfile() public {
        vm.startPrank(alice);
        
        vm.expectEmit(true, false, false, true);
        emit ProfileCreated(alice, IPFS_HASH_ALICE, 0, block.timestamp);
        
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        
        // Verify profile was created
        assertTrue(profileRegistry.profileExists(alice));
        assertTrue(profileRegistry.hasProfile(alice));
        
        (
            string memory ipfsHash,
            uint256 createdAt,
            uint256 updatedAt,
            bool isActive,
            uint256 minLuvToView
        ) = profileRegistry.getProfile(alice);
        
        assertEq(ipfsHash, IPFS_HASH_ALICE);
        assertEq(createdAt, block.timestamp);
        assertEq(updatedAt, block.timestamp);
        assertTrue(isActive);
        assertEq(minLuvToView, 0);
        
        vm.stopPrank();
    }

    function test_CreateProfileWithMinLuv() public {
        vm.startPrank(alice);
        
        profileRegistry.createProfile(IPFS_HASH_ALICE, 2 ether);
        
        (,,,, uint256 minLuvToView) = profileRegistry.getProfile(alice);
        assertEq(minLuvToView, 2 ether);
        
        vm.stopPrank();
    }

    function test_RevertIf_InsufficientLuvForProfile() public {
        vm.startPrank(charlie); // Charlie has 0 LUV
        
        vm.expectRevert("ProfileRegistry: insufficient LUV balance");
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        
        vm.stopPrank();
    }

    function test_RevertIf_EmptyIpfsHash() public {
        vm.startPrank(alice);
        
        vm.expectRevert("ProfileRegistry: empty IPFS hash");
        profileRegistry.createProfile("", 0);
        
        vm.stopPrank();
    }

    function test_RevertIf_ProfileAlreadyExists() public {
        vm.startPrank(alice);
        
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        
        vm.expectRevert("ProfileRegistry: profile already exists");
        profileRegistry.createProfile(IPFS_HASH_UPDATED, 0);
        
        vm.stopPrank();
    }

    function test_UpdateProfile() public {
        vm.startPrank(alice);
        
        // Create profile
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        
        // Fast forward time
        vm.warp(block.timestamp + 1 days);
        
        // Update profile
        vm.expectEmit(true, false, false, true);
        emit ProfileUpdated(alice, IPFS_HASH_UPDATED, block.timestamp);
        
        profileRegistry.updateProfile(IPFS_HASH_UPDATED);
        
        (string memory ipfsHash,, uint256 updatedAt,,) = profileRegistry.getProfile(alice);
        assertEq(ipfsHash, IPFS_HASH_UPDATED);
        assertEq(updatedAt, block.timestamp);
        
        vm.stopPrank();
    }

    function test_RevertIf_UpdateNonexistentProfile() public {
        vm.startPrank(alice);
        
        vm.expectRevert("ProfileRegistry: profile does not exist");
        profileRegistry.updateProfile(IPFS_HASH_UPDATED);
        
        vm.stopPrank();
    }

    function test_UpdateMinLuvToView() public {
        vm.startPrank(alice);
        
        profileRegistry.createProfile(IPFS_HASH_ALICE, 1 ether);
        profileRegistry.updateMinLuvToView(5 ether);
        
        (,,,, uint256 minLuvToView) = profileRegistry.getProfile(alice);
        assertEq(minLuvToView, 5 ether);
        
        vm.stopPrank();
    }

    function test_SetProfileActive() public {
        vm.startPrank(alice);
        
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        
        // Deactivate
        vm.expectEmit(true, false, false, true);
        emit ProfileStatusChanged(alice, false);
        profileRegistry.setProfileActive(false);
        
        (,,, bool isActive,) = profileRegistry.getProfile(alice);
        assertFalse(isActive);
        
        // Reactivate
        vm.expectEmit(true, false, false, true);
        emit ProfileStatusChanged(alice, true);
        profileRegistry.setProfileActive(true);
        
        (,,, isActive,) = profileRegistry.getProfile(alice);
        assertTrue(isActive);
        
        vm.stopPrank();
    }

    function test_CanViewProfile() public {
        // Alice creates profile with min 2 LUV to view
        vm.prank(alice);
        profileRegistry.createProfile(IPFS_HASH_ALICE, 2 ether);
        
        // Bob has 5 LUV, should be able to view
        assertTrue(profileRegistry.canViewProfile(bob, alice));
        
        // Charlie has 0 LUV, should not be able to view
        assertFalse(profileRegistry.canViewProfile(charlie, alice));
    }

    function test_CannotViewInactiveProfile() public {
        vm.startPrank(alice);
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        profileRegistry.setProfileActive(false);
        vm.stopPrank();
        
        assertFalse(profileRegistry.canViewProfile(bob, alice));
    }

    function test_GetActiveProfiles() public {
        // Create profiles
        vm.prank(alice);
        profileRegistry.createProfile(IPFS_HASH_ALICE, 1 ether);
        
        vm.prank(bob);
        profileRegistry.createProfile(IPFS_HASH_BOB, 0);
        
        // Alice views (she has 10 LUV)
        vm.startPrank(alice);
        address[] memory profiles = profileRegistry.getActiveProfiles(alice);
        
        // Should see Bob's profile (min 0 LUV) but not her own
        assertEq(profiles.length, 1);
        assertEq(profiles[0], bob);
        vm.stopPrank();
        
        // Bob views (he has 5 LUV)
        vm.startPrank(bob);
        profiles = profileRegistry.getActiveProfiles(bob);
        
        // Should see Alice's profile (min 1 LUV) but not his own
        assertEq(profiles.length, 1);
        assertEq(profiles[0], alice);
        vm.stopPrank();
        
        // Charlie views (he has 0 LUV)
        vm.startPrank(charlie);
        profiles = profileRegistry.getActiveProfiles(charlie);
        
        // Should only see Bob's profile (min 0 LUV)
        assertEq(profiles.length, 1);
        assertEq(profiles[0], bob);
        vm.stopPrank();
    }

    function test_GetActiveProfilesExcludesInactive() public {
        vm.prank(alice);
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        
        vm.prank(bob);
        profileRegistry.createProfile(IPFS_HASH_BOB, 0);
        
        // Bob deactivates his profile
        vm.prank(bob);
        profileRegistry.setProfileActive(false);
        
        // Alice should only see active profiles (not Bob's)
        vm.startPrank(alice);
        address[] memory profiles = profileRegistry.getActiveProfiles(alice);
        assertEq(profiles.length, 0); // Bob is inactive
        vm.stopPrank();
    }

    function test_GetProfileCount() public {
        assertEq(profileRegistry.getProfileCount(), 0);
        
        vm.prank(alice);
        profileRegistry.createProfile(IPFS_HASH_ALICE, 0);
        assertEq(profileRegistry.getProfileCount(), 1);
        
        vm.prank(bob);
        profileRegistry.createProfile(IPFS_HASH_BOB, 0);
        assertEq(profileRegistry.getProfileCount(), 2);
    }
}
