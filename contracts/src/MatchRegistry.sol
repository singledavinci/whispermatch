// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

/**
 * @title MatchRegistry
 * @notice Manages likes and matches between users in WhisperMatch
 * @dev Privacy-preserving: only emits match events, minimal on-chain storage
 */
contract MatchRegistry {
    
    struct Like {
        bool exists;
        uint256 timestamp;
    }
    
    // Mapping: from => to => Like
    mapping(address => mapping(address => Like)) public likes;
    
    // Mapping to track mutual matches
    mapping(address => mapping(address => bool)) public matches;
    
    // Mapping to count matches per user
    mapping(address => uint256) public matchCount;
    
    /**
     * @notice Emitted when user sends a like
     * @param from User sending the like
     * @param to User receiving the like
     * @param timestamp When the like was sent
     */
    event LikeSent(
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when mutual match is created
     * @param user1 First user in the match
     * @param user2 Second user in the match
     * @param timestamp When the match was created
     */
    event MatchCreated(
        address indexed user1,
        address indexed user2,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a match is removed
     * @param user1 First user
     * @param user2 Second user
     */
    event MatchRemoved(
        address indexed user1,
        address indexed user2
    );

    /**
     * @notice Send a like to another user
     * @dev If recipient has already liked sender, creates a match
     * @param recipient Address of user to like
     */
    function sendLike(address recipient) external {
        require(recipient != address(0), "MatchRegistry: invalid recipient");
        require(recipient != msg.sender, "MatchRegistry: cannot like yourself");
        require(!likes[msg.sender][recipient].exists, "MatchRegistry: already liked");
        
        // Record the like
        likes[msg.sender][recipient] = Like({
            exists: true,
            timestamp: block.timestamp
        });
        
        emit LikeSent(msg.sender, recipient, block.timestamp);
        
        // Check if recipient has also liked sender (mutual match)
        if (likes[recipient][msg.sender].exists) {
            _createMatch(msg.sender, recipient);
        }
    }

    /**
     * @notice Remove a like
     * @param recipient Address that was liked
     */
    function removeLike(address recipient) external {
        require(likes[msg.sender][recipient].exists, "MatchRegistry: like does not exist");
        
        // If there was a match, remove it
        if (matches[msg.sender][recipient]) {
            _removeMatch(msg.sender, recipient);
        }
        
        delete likes[msg.sender][recipient];
    }

    /**
     * @notice Internal function to create a mutual match
     * @param user1 First user
     * @param user2 Second user
     */
    function _createMatch(address user1, address user2) internal {
        require(!matches[user1][user2], "MatchRegistry: match already exists");
        
        matches[user1][user2] = true;
        matches[user2][user1] = true;
        
        matchCount[user1]++;
        matchCount[user2]++;
        
        emit MatchCreated(user1, user2, block.timestamp);
    }

    /**
     * @notice Internal function to remove a match
     * @param user1 First user
     * @param user2 Second user
     */
    function _removeMatch(address user1, address user2) internal {
        matches[user1][user2] = false;
        matches[user2][user1] = false;
        
        if (matchCount[user1] > 0) matchCount[user1]--;
        if (matchCount[user2] > 0) matchCount[user2]--;
        
        emit MatchRemoved(user1, user2);
    }

    /**
     * @notice Unmatch with a user
     * @param otherUser Address to unmatch with
     */
    function unmatch(address otherUser) external {
        require(matches[msg.sender][otherUser], "MatchRegistry: not matched");
        
        _removeMatch(msg.sender, otherUser);
        
        // Also remove the likes
        delete likes[msg.sender][otherUser];
        delete likes[otherUser][msg.sender];
    }

    /**
     * @notice Check if two users have matched
     * @param user1 First user address
     * @param user2 Second user address
     * @return isMatched True if users have matched
     */
    function isMatch(address user1, address user2) external view returns (bool isMatched) {
        return matches[user1][user2];
    }

    /**
     * @notice Check if sender has liked a specific user
     * @param user Address to check
     * @return liked True if sender has liked the user
     */
    function hasLiked(address user) external view returns (bool liked) {
        return likes[msg.sender][user].exists;
    }

    /**
     * @notice Check if a specific user has liked sender
     * @param user Address to check
     * @return liked True if user has liked sender
     */
    function hasBeenLikedBy(address user) external view returns (bool liked) {
        return likes[user][msg.sender].exists;
    }

    /**
     * @notice Get match count for a user
     * @param user Address to query
     * @return count Number of matches
     */
    function getMatchCount(address user) external view returns (uint256 count) {
        return matchCount[user];
    }

    /**
     * @notice Get like timestamp
     * @param from User who sent the like
     * @param to User who received the like
     * @return timestamp When the like was sent (0 if no like exists)
     */
    function getLikeTimestamp(address from, address to) 
        external 
        view 
        returns (uint256 timestamp) 
    {
        return likes[from][to].exists ? likes[from][to].timestamp : 0;
    }
}
