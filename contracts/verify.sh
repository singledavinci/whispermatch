#!/bin/bash

# Contract Verification Script for Sepolia Testnet
# Run this after deployment to verify contracts on Etherscan

set -e

# Load environment variables
source contracts/.env

echo "🔍 Verifying WhisperMatch contracts on Sepolia Etherscan..."

# Contract addresses (update these with your deployed addresses)
LOVE_TOKEN="0xB4e591f05057A7873AC7993BE12eB18a42B8c999"
BURN_MINT="0x8b016E6a69c789b1e1824E63d0165AEB9b7B809d"
PROFILE_REGISTRY="0x28818cd3F3cE01fe7DF8583239F363B112f07429"
MATCH_REGISTRY="0xAB9DEBd7bBb9C8aBC271469194e4b58c41f1c66E"
MESSAGE_REGISTRY="0x600943981BE410ddeAC300944006A34F5ba4A0E8"

cd contracts

echo "Verifying LoveToken..."
forge verify-contract \
    $LOVE_TOKEN \
    src/LoveToken.sol:LoveToken \
    --chain sepolia \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --watch

echo "Verifying BurnMint..."
forge verify-contract \
    $BURN_MINT \
    src/BurnMint.sol:BurnMint \
    --chain sepolia \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" $LOVE_TOKEN) \
    --watch

echo "Verifying ProfileRegistry..."
forge verify-contract \
    $PROFILE_REGISTRY \
    src/ProfileRegistry.sol:ProfileRegistry \
    --chain sepolia \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" $LOVE_TOKEN) \
    --watch

echo "Verifying MatchRegistry..."
forge verify-contract \
    $MATCH_REGISTRY \
    src/MatchRegistry.sol:MatchRegistry \
    --chain sepolia \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" $LOVE_TOKEN) \
    --watch

echo "Verifying MessageRegistry..."
forge verify-contract \
    $MESSAGE_REGISTRY \
    src/MessageRegistry.sol:MessageRegistry \
    --chain sepolia \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" $LOVE_TOKEN) \
    --watch

echo "✅ All contracts verified!"
echo "View on Etherscan:"
echo "  LoveToken: https://sepolia.etherscan.io/address/$LOVE_TOKEN#code"
echo "  BurnMint: https://sepolia.etherscan.io/address/$BURN_MINT#code"
echo "  ProfileRegistry: https://sepolia.etherscan.io/address/$PROFILE_REGISTRY#code"
echo "  MatchRegistry: https://sepolia.etherscan.io/address/$MATCH_REGISTRY#code"
echo "  MessageRegistry: https://sepolia.etherscan.io/address/$MESSAGE_REGISTRY#code"
