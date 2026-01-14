// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Script, console} from "forge-std/Script.sol";
import {LoveToken} from "../src/LoveToken.sol";
import {BurnMint} from "../src/BurnMint.sol";
import {ProfileRegistry} from "../src/ProfileRegistry.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";
import {MessageRegistry} from "../src/MessageRegistry.sol";

/**
 * @title Deploy
 * @notice Deployment script for WhisperMatch contracts
 * @dev Deploys all core contracts to Anvil local testnet
 * 
 * Usage:
 * forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
 */
contract Deploy is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        console.log("======================================");
        console.log("Deploying WhisperMatch Contracts");
        console.log("======================================");
        console.log("");

        // 1. Deploy LoveToken
        console.log("1. Deploying LoveToken...");
        LoveToken loveToken = new LoveToken();
        console.log("   LoveToken deployed at:", address(loveToken));
        console.log("");

        // 2. Deploy BurnMint
        console.log("2. Deploying BurnMint...");
        BurnMint burnMint = new BurnMint(address(loveToken));
        console.log("   BurnMint deployed at:", address(burnMint));
        console.log("   ETH to LUV rate:", burnMint.ETH_TO_LUV_RATE());
        console.log("   Commitment delay:", burnMint.COMMITMENT_DELAY(), "blocks");
        console.log("");

        // 3. Grant MINTER_ROLE to BurnMint
        console.log("3. Granting MINTER_ROLE to BurnMint...");
        loveToken.grantRole(loveToken.MINTER_ROLE(), address(burnMint));
        bool isMinter = loveToken.hasRole(loveToken.MINTER_ROLE(), address(burnMint));
        console.log("   BurnMint has MINTER_ROLE:", isMinter);
        console.log("");

        // 4. Deploy ProfileRegistry
        console.log("4. Deploying ProfileRegistry...");
        ProfileRegistry profileRegistry = new ProfileRegistry(address(loveToken));
        console.log("   ProfileRegistry deployed at:", address(profileRegistry));
        console.log("   Min LUV for profile:", profileRegistry.MIN_LUV_FOR_PROFILE());
        console.log("");

        // 5. Deploy MatchRegistry
        console.log("5. Deploying MatchRegistry...");
        MatchRegistry matchRegistry = new MatchRegistry();
        console.log("   MatchRegistry deployed at:", address(matchRegistry));
        console.log("");

        // 6. Deploy MessageRegistry
        console.log("6. Deploying MessageRegistry...");
        MessageRegistry messageRegistry = new MessageRegistry(address(matchRegistry));
        console.log("   MessageRegistry deployed at:", address(messageRegistry));
        console.log("");

        // Stop broadcasting
        vm.stopBroadcast();

        // Print deployment summary
        console.log("======================================");
        console.log("Deployment Summary");
        console.log("======================================");
        console.log("LoveToken:        ", address(loveToken));
        console.log("BurnMint:         ", address(burnMint));
        console.log("ProfileRegistry:  ", address(profileRegistry));
        console.log("MatchRegistry:    ", address(matchRegistry));
        console.log("MessageRegistry:  ", address(messageRegistry));
        console.log("");
        console.log("Deployment completed successfully!");
        console.log("======================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Start the frontend: cd frontend && npm run dev");
        console.log("2. Update frontend contract addresses in lib/contracts.ts");
        console.log("3. Connect MetaMask to Anvil (localhost:8545)");
        console.log("4. Import an Anvil test account into MetaMask");
        console.log("");
    }
}
