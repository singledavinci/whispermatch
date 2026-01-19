// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "./LoveToken.sol";

/**
 * @title ProfileRegistry
 * @notice Manages user profiles for WhisperMatch dating DApp
 * @dev Stores IPFS hashes on-chain, actual profile data stored on IPFS
 */
contract ProfileRegistry {
    LoveToken public immutable loveToken;
    
    // Minimum LUV balance required to create a profile (anti-spam)
    uint256 public constant MIN_LUV_FOR_PROFILE = 1 ether; // 1 LUV
    
    struct Profile {
        string ipfsHash;        // IPFS CID for profile data (images, bio, interests)
        uint256 createdAt;      // Timestamp when profile was created
        uint256 updatedAt;      // Timestamp of last update
        bool isActive;          // Whether profile is active/visible
        uint256 minLuvToView;   // Minimum LUV balance required to view this profile
    }
    
    // Mapping of address => Profile
    mapping(address => Profile) public profiles;
    
    // Array of all profile addresses (for browsing)
    address[] public profileAddresses;
    
    // Mapping to track if address is in profileAddresses array
    mapping(address => bool) public hasProfile;
    
    /**
     * @notice Emitted when a new profile is created
     * @param user Address of profile owner
     * @param ipfsHash IPFS hash of profile data
     * @param minLuvToView Minimum LUV required to view profile
     */
    event ProfileCreated(
        address indexed user,
        string ipfsHash,
        uint256 minLuvToView,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a profile is updated
     * @param user Address of profile owner
     * @param ipfsHash New IPFS hash
     */
    event ProfileUpdated(
        address indexed user,
        string ipfsHash,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a profile is activated or deactivated
     * @param user Address of profile owner
     * @param isActive New active status
     */
    event ProfileStatusChanged(
        address indexed user,
        bool isActive
    );

    /**
     * @notice Contract constructor
     * @param _loveToken Address of the LoveToken contract
     */
    constructor(address _loveToken) {
        require(_loveToken != address(0), "ProfileRegistry: invalid token address");
        loveToken = LoveToken(_loveToken);
    }

    /**
     * @notice Create a new profile
     * @dev Requires minimum LUV balance to prevent spam
     * @param ipfsHash IPFS CID containing profile data
     * @param minLuvToView Minimum LUV balance required for others to view this profile
     */
    function createProfile(string memory ipfsHash, uint256 minLuvToView) external {
        require(bytes(ipfsHash).length > 0, "ProfileRegistry: empty IPFS hash");
        require(!hasProfile[msg.sender], "ProfileRegistry: profile already exists");
        require(
            loveToken.balanceOf(msg.sender) >= MIN_LUV_FOR_PROFILE,
            "ProfileRegistry: insufficient LUV balance"
        );
        
        profiles[msg.sender] = Profile({
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            minLuvToView: minLuvToView
        });
        
        profileAddresses.push(msg.sender);
        hasProfile[msg.sender] = true;
        
        emit ProfileCreated(msg.sender, ipfsHash, minLuvToView, block.timestamp);
    }

    /**
     * @notice Update existing profile
     * @param newIpfsHash New IPFS CID with updated profile data
     */
    function updateProfile(string memory newIpfsHash) external {
        require(hasProfile[msg.sender], "ProfileRegistry: profile does not exist");
        require(bytes(newIpfsHash).length > 0, "ProfileRegistry: empty IPFS hash");
        
        profiles[msg.sender].ipfsHash = newIpfsHash;
        profiles[msg.sender].updatedAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, newIpfsHash, block.timestamp);
    }

    /**
     * @notice Update minimum LUV requirement to view profile
     * @param newMinLuv New minimum LUV balance required
     */
    function updateMinLuvToView(uint256 newMinLuv) external {
        require(hasProfile[msg.sender], "ProfileRegistry: profile does not exist");
        profiles[msg.sender].minLuvToView = newMinLuv;
    }

    /**
     * @notice Activate or deactivate profile
     * @param active New active status
     */
    function setProfileActive(bool active) external {
        require(hasProfile[msg.sender], "ProfileRegistry: profile does not exist");
        profiles[msg.sender].isActive = active;
        
        emit ProfileStatusChanged(msg.sender, active);
    }

    /**
     * @notice Get profile details
     * @param user Address of profile owner
     * @return ipfsHash IPFS CID
     * @return createdAt Creation timestamp
     * @return updatedAt Last update timestamp
     * @return isActive Active status
     * @return minLuvToView Minimum LUV to view
     */
    function getProfile(address user) 
        external 
        view 
        returns (
            string memory ipfsHash,
            uint256 createdAt,
            uint256 updatedAt,
            bool isActive,
            uint256 minLuvToView
        ) 
    {
        require(hasProfile[user], "ProfileRegistry: profile does not exist");
        Profile memory profile = profiles[user];
        return (
            profile.ipfsHash,
            profile.createdAt,
            profile.updatedAt,
            profile.isActive,
            profile.minLuvToView
        );
    }

    /**
     * @notice Check if viewer can view a specific profile
     * @param viewer Address attempting to view
     * @param profileOwner Address of profile owner
     * @return canView True if viewer meets requirements
     */
    function canViewProfile(address viewer, address profileOwner) 
        external 
        view 
        returns (bool canView) 
    {
        if (!hasProfile[profileOwner]) {
            return false;
        }
        
        Profile memory profile = profiles[profileOwner];
        
        // Profile must be active
        if (!profile.isActive) {
            return false;
        }
        
        // Viewer must have minimum LUV balance
        if (loveToken.balanceOf(viewer) < profile.minLuvToView) {
            return false;
        }
        
        return true;
    }

    /**
     * @notice Get active profiles for browsing
     * @dev Returns profiles that meet the viewer's LUV balance requirements
     * @param viewer Address of the user viewing profiles
     * @return Array of profile addresses
     */
    function getActiveProfiles(address viewer) external view returns (address[] memory) {
        return getActiveProfilesPaginated(viewer, 0, 50); // Default to first 50
    }

    /**
     * @notice Get active profiles with pagination
     * @dev Returns profiles that meet the viewer's LUV balance requirements
     * @param viewer Address of the user viewing profiles
     * @param offset Starting index for pagination
     * @param limit Maximum number of profiles to return
     * @return Array of profile addresses
     */
    function getActiveProfilesPaginated(
        address viewer,
        uint256 offset,
        uint256 limit
    ) public view returns (address[] memory) {
        require(limit > 0 && limit <= 100, "ProfileRegistry: invalid limit");
        
        uint256 viewerBalance = loveToken.balanceOf(viewer);
        
        // First, count how many profiles match
        uint256 matchCount = 0;
        uint256 profileCount = profileAddresses.length;
        
        // Ensure offset is within bounds
        if (offset >= profileCount) {
            return new address[](0);
        }

        for (uint256 i = offset; i < profileCount; i++) {
            address profileAddr = profileAddresses[i];
            
            if (profileAddr != viewer && 
                profiles[profileAddr].isActive &&
                viewerBalance >= profiles[profileAddr].minLuvToView) {
                matchCount++;
            }
        }
        
        // Adjust matchCount if it exceeds the limit
        if (matchCount > limit) {
            matchCount = limit;
        }

        // Create result array with exact size
        address[] memory result = new address[](matchCount);
        uint256 resultIndex = 0;
        
        // Fill result array
        for (uint256 i = offset; i < profileCount && resultIndex < matchCount; i++) {
            address profileAddr = profileAddresses[i];
            
            if (profileAddr != viewer && 
                profiles[profileAddr].isActive &&
                viewerBalance >= profiles[profileAddr].minLuvToView) {
                result[resultIndex] = profileAddr;
                resultIndex++;
            }
        }
        
        return result;
    }

    /**
     * @notice Get total number of profiles
     * @return count Total profile count
     */
    function getProfileCount() external view returns (uint256 count) {
        return profileAddresses.length;
    }

    /**
     * @notice Check if an address has a profile
     * @param user Address to check
     * @return exists True if profile exists
     */
    function profileExists(address user) external view returns (bool exists) {
        return hasProfile[user];
    }
}
