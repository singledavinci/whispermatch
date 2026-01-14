// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "./MatchRegistry.sol";

/**
 * @title MessageRegistry
 * @notice Simple on-chain messaging for matched users
 * @dev Messages are stored as encrypted IPFS hashes. Only matched users can message each other.
 */
contract MessageRegistry {
    MatchRegistry public immutable matchRegistry;
    
    struct Message {
        address from;
        address to;
        string encryptedIpfsHash; // IPFS hash of encrypted message content
        uint256 timestamp;
    }
    
    // Mapping: recipient => array of message IDs
    mapping(address => uint256[]) public messagesByRecipient;
    
    // All messages
    Message[] public messages;
    
    event MessageSent(
        uint256 indexed messageId,
        address indexed from,
        address indexed to,
        string encryptedIpfsHash,
        uint256 timestamp
    );
    
    constructor(address _matchRegistry) {
        require(_matchRegistry != address(0), "MessageRegistry: invalid match registry");
        matchRegistry = MatchRegistry(_matchRegistry);
    }
    
    /**
     * @notice Send encrypted message to matched user
     * @param recipient Address of the recipient (must be matched)
     * @param encryptedIpfsHash IPFS hash containing encrypted message
     */
    function sendMessage(address recipient, string memory encryptedIpfsHash) external {
        require(recipient != address(0), "MessageRegistry: invalid recipient");
        require(bytes(encryptedIpfsHash).length > 0, "MessageRegistry: empty message");
        
        // Check if users are matched
        require(
            matchRegistry.isMatch(msg.sender, recipient),
            "MessageRegistry: not matched with recipient"
        );
        
        // Create message
        uint256 messageId = messages.length;
        messages.push(Message({
            from: msg.sender,
            to: recipient,
            encryptedIpfsHash: encryptedIpfsHash,
            timestamp: block.timestamp
        }));
        
        // Add to recipient's message list
        messagesByRecipient[recipient].push(messageId);
        
        emit MessageSent(messageId, msg.sender, recipient, encryptedIpfsHash, block.timestamp);
    }
    
    /**
     * @notice Get all message IDs for a recipient
     * @param recipient Address to get messages for
     * @return Array of message IDs
     */
    function getMessageIds(address recipient) external view returns (uint256[] memory) {
        return messagesByRecipient[recipient];
    }
    
    /**
     * @notice Get message details
     * @param messageId ID of the message
     * @return Message struct
     */
    function getMessage(uint256 messageId) external view returns (Message memory) {
        require(messageId < messages.length, "MessageRegistry: invalid message ID");
        return messages[messageId];
    }
    
    /**
     * @notice Get total number of messages
     * @return Total message count
     */
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }
    
    /**
     * @notice Get conversation between two users
     * @param user1 First user address
     * @param user2 Second user address
     * @return Array of messages in the conversation
     */
    function getConversation(address user1, address user2) external view returns (Message[] memory) {
        require(
            matchRegistry.isMatch(user1, user2),
            "MessageRegistry: users not matched"
        );
        
        // Count messages in conversation
        uint256 count = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (
                (messages[i].from == user1 && messages[i].to == user2) ||
                (messages[i].from == user2 && messages[i].to == user1)
            ) {
                count++;
            }
        }
        
        // Collect conversation messages
        Message[] memory conversation = new Message[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (
                (messages[i].from == user1 && messages[i].to == user2) ||
                (messages[i].from == user2 && messages[i].to == user1)
            ) {
                conversation[index] = messages[i];
                index++;
            }
        }
        
        return conversation;
    }
}
