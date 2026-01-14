// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test, console} from "forge-std/Test.sol";
import {MessageRegistry} from "../src/MessageRegistry.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";

contract MessageRegistryTest is Test {
    MessageRegistry public messageRegistry;
    MatchRegistry public matchRegistry;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    
    string constant MSG_HASH_1 = "QmEncryptedMessage1";
    string constant MSG_HASH_2 = "QmEncryptedMessage2";
    string constant MSG_HASH_3 = "QmEncryptedMessage3";
    
    event MessageSent(
        uint256 indexed messageId,
        address indexed from,
        address indexed to,
        string encryptedIpfsHash,
        uint256 timestamp
    );

    function setUp() public {
        matchRegistry = new MatchRegistry();
        messageRegistry = new MessageRegistry(address(matchRegistry));
        
        // Create a match between Alice and Bob
        vm.prank(alice);
        matchRegistry.sendLike(bob);
        
        vm.prank(bob);
        matchRegistry.sendLike(alice); // This creates the match
    }

    function test_Deployment() public {
        assertEq(address(messageRegistry.matchRegistry()), address(matchRegistry));
        assertEq(messageRegistry.getMessageCount(), 0);
    }

    function test_SendMessage() public {
        vm.startPrank(alice);
        
        vm.expectEmit(true, true, true, true);
        emit MessageSent(0, alice, bob, MSG_HASH_1, block.timestamp);
        
        messageRegistry.sendMessage(bob, MSG_HASH_1);
        
        assertEq(messageRegistry.getMessageCount(), 1);
        
        MessageRegistry.Message memory msg = messageRegistry.getMessage(0);
        assertEq(msg.from, alice);
        assertEq(msg.to, bob);
        assertEq(msg.encryptedIpfsHash, MSG_HASH_1);
        assertEq(msg.timestamp, block.timestamp);
        
        vm.stopPrank();
    }

    function test_RevertIf_NotMatched() public {
        vm.startPrank(charlie);
        
        vm.expectRevert("MessageRegistry: not matched with recipient");
        messageRegistry.sendMessage(alice, MSG_HASH_1);
        
        vm.stopPrank();
    }

    function test_RevertIf_EmptyMessage() public {
        vm.startPrank(alice);
        
        vm.expectRevert("MessageRegistry: empty message");
        messageRegistry.sendMessage(bob, "");
        
        vm.stopPrank();
    }

    function test_RevertIf_InvalidRecipient() public {
        vm.startPrank(alice);
        
        vm.expectRevert("MessageRegistry: invalid recipient");
        messageRegistry.sendMessage(address(0), MSG_HASH_1);
        
        vm.stopPrank();
    }

    function test_GetMessageIds() public {
        // Alice sends 2 messages to Bob
        vm.startPrank(alice);
        messageRegistry.sendMessage(bob, MSG_HASH_1);
        messageRegistry.sendMessage(bob, MSG_HASH_2);
        vm.stopPrank();
        
        // Bob sends 1 message to Alice
        vm.prank(bob);
        messageRegistry.sendMessage(alice, MSG_HASH_3);
        
        // Check Bob's received messages
        uint256[] memory bobMessages = messageRegistry.getMessageIds(bob);
        assertEq(bobMessages.length, 2);
        assertEq(bobMessages[0], 0);
        assertEq(bobMessages[1], 1);
        
        // Check Alice's received messages
        uint256[] memory aliceMessages = messageRegistry.getMessageIds(alice);
        assertEq(aliceMessages.length, 1);
        assertEq(aliceMessages[0], 2);
    }

    function test_GetConversation() public {
        // Create conversation
        vm.prank(alice);
        messageRegistry.sendMessage(bob, MSG_HASH_1);
        
        vm.prank(bob);
        messageRegistry.sendMessage(alice, MSG_HASH_2);
        
        vm.prank(alice);
        messageRegistry.sendMessage(bob, MSG_HASH_3);
        
        // Get conversation
        MessageRegistry.Message[] memory conversation = messageRegistry.getConversation(alice, bob);
        
        assertEq(conversation.length, 3);
        assertEq(conversation[0].from, alice);
        assertEq(conversation[0].to, bob);
        assertEq(conversation[0].encryptedIpfsHash, MSG_HASH_1);
        
        assertEq(conversation[1].from, bob);
        assertEq(conversation[1].to, alice);
        assertEq(conversation[1].encryptedIpfsHash, MSG_HASH_2);
        
        assertEq(conversation[2].from, alice);
        assertEq(conversation[2].to, bob);
        assertEq(conversation[2].encryptedIpfsHash, MSG_HASH_3);
    }

    function test_RevertIf_GetConversation_NotMatched() public {
        vm.expectRevert("MessageRegistry: users not matched");
        messageRegistry.getConversation(alice, charlie);
    }

    function test_MultipleConversations() public {
        // Match Charlie with Alice
        vm.prank(charlie);
        matchRegistry.sendLike(alice);
        
        vm.prank(alice);
        matchRegistry.sendLike(charlie);
        
        // Alice-Bob conversation
        vm.prank(alice);
        messageRegistry.sendMessage(bob, "Alice to Bob");
        
        // Alice-Charlie conversation
        vm.prank(alice);
        messageRegistry.sendMessage(charlie, "Alice to Charlie");
        
        // Bob-Alice conversation
        vm.prank(bob);
        messageRegistry.sendMessage(alice, "Bob to Alice");
        
        // Verify conversations are separate
        MessageRegistry.Message[] memory aliceBobConvo = messageRegistry.getConversation(alice, bob);
        assertEq(aliceBobConvo.length, 2);
        
        MessageRegistry.Message[] memory aliceCharlieConvo = messageRegistry.getConversation(alice, charlie);
        assertEq(aliceCharlieConvo.length, 1);
    }
}
