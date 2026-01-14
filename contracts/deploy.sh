#!/bin/bash

# WhisperMatch Deployment Script for Sepolia
# Make sure you've updated contracts/.env with your real values!

echo "🚀 Deploying WhisperMatch to Sepolia Testnet..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create contracts/.env with your Alchemy RPC URL and private key"
    exit 1
fi

# Load environment variables
source .env

# Check if variables are set
if [[ "$SEPOLIA_RPC_URL" == *"YOUR_ALCHEMY_API_KEY"* ]]; then
    echo "❌ Error: SEPOLIA_RPC_URL not configured!"
    echo "Please update contracts/.env with your real Alchemy RPC URL"
    exit 1
fi

if [[ "$PRIVATE_KEY" == *"YOUR_PRIVATE_KEY_HERE"* ]]; then
    echo "❌ Error: PRIVATE_KEY not configured!"
    echo "Please update contracts/.env with your real private key"
    exit 1
fi

echo "✅ Configuration loaded"
echo "📡 RPC: ${SEPOLIA_RPC_URL:0:50}..."
echo ""

# Deploy contracts
echo "🔨 Deploying contracts..."
~/.foundry/bin/forge script script/Deploy.s.sol \
    --rpc-url "$SEPOLIA_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$ETHERSCAN_API_KEY" \
    -vvv

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "📝 Check contracts/broadcast/Deploy.s.sol/11155111/run-latest.json for addresses"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above"
    exit 1
fi
