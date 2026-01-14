# WhisperMatch - Testnet Deployment Guide

## Deploying to Sepolia Testnet

This guide will help you deploy WhisperMatch to Sepolia testnet so anyone can access it publicly.

---

## Prerequisites

Before deploying, you'll need:

1. ✅ **Sepolia ETH** - Get free testnet ETH from:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - Minimum: ~0.1 ETH for deployment

2. ✅ **Alchemy or Infura Account** - For RPC access:
   - Sign up at https://www.alchemy.com/ (recommended)
   - Create a new app on Sepolia network
   - Copy your API key

3. ✅ **Deployment Wallet** - A wallet with Sepolia ETH:
   - Export private key from MetaMask
   - **Keep this secret!** Never commit it to git

---

## Step 1: Set Up Environment Variables

1. **Create `.env` file** in the `contracts/` directory:

```bash
cd contracts
touch .env
```

2. **Add these values** to `contracts/.env`:

```env
# Sepolia RPC URL (get from Alchemy)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Your deployment wallet private key (from MetaMask)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Etherscan API key for contract verification (optional but recommended)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**Get Etherscan API Key:**
- Sign up at https://etherscan.io/
- Go to API Keys → Create new key
- Copy the key

---

## Step 2: Update Foundry Configuration

The `foundry.toml` is already configured, but verify it has Sepolia settings:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.33"

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC_URL}"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
```

---

## Step 3: Deploy Contracts

1. **Test the deployment script** (dry run):

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url sepolia
```

2. **Deploy to Sepolia** (real deployment):

```bash
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

This will:
- Deploy all 5 contracts (LoveToken, BurnMint, ProfileRegistry, MatchRegistry, MessageRegistry)
- Verify contracts on Etherscan
- Show you the deployed addresses

3. **Save the addresses!** You'll see output like:

```
Deployment Summary
======================================
LoveToken:        0x1234...
BurnMint:         0x5678...
ProfileRegistry:  0x9abc...
MatchRegistry:    0xdef0...
MessageRegistry:  0x1234...
```

**Copy these addresses** - you'll need them for the frontend!

---

## Step 4: Update Frontend Configuration

1. **Open** `frontend/lib/contracts.ts`

2. **Replace the contract addresses** with your Sepolia addresses:

```typescript
export const CONTRACTS = {
  LoveToken: '0xYOUR_LOVETOKEN_ADDRESS' as `0x${string}`,
  BurnMint: '0xYOUR_BURNMINT_ADDRESS' as `0x${string}`,
  ProfileRegistry: '0xYOUR_PROFILEREGISTRY_ADDRESS' as `0x${string}`,
  MatchRegistry: '0xYOUR_MATCHREGISTRY_ADDRESS' as `0x${string}`,
  MessageRegistry: '0xYOUR_MESSAGEREGISTRY_ADDRESS' as `0x${string}`,
} as const;
```

3. **Update** `frontend/lib/wagmi.ts` to use Sepolia:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'WhisperMatch',
  projectId: '0f3937bfe2b9c74bdf919eb3794abb9b',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
```

---

## Step 5: Deploy Frontend

### Option A: Vercel (Recommended - Free)

1. **Push to GitHub:**
```bash
cd ..
git init
git add .
git commit -m "WhisperMatch deployment"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/
   - Click "Import Project"
   - Select your GitHub repo
   - Root Directory: `frontend`
   - Click "Deploy"
   - ✅ Your app is live!

### Option B: Netlify

1. Same git steps as above
2. Go to https://netlify.com/
3. Drag and drop the `frontend/.next` folder after running `npm run build`

---

## Step 6: Test on Testnet

1. **Visit your deployed URL** (e.g., `your-app.vercel.app`)
2. **Connect MetaMask** (it should auto-detect Sepolia)
3. **Get Sepolia ETH** from faucet if needed
4. **Test the full flow:**
   - Fund (burn ETH → get LUV)
   - Create profile
   - Browse & match
   - Send messages

---

## Verification

After deployment, verify your contracts are working:

1. **View on Etherscan:**
   - Go to https://sepolia.etherscan.io/
   - Search for your contract addresses
   - Click "Read Contract" and "Write Contract" tabs

2. **Check contract verification:**
   - Should see a green checkmark ✅ 
   - Source code visible on Etherscan

---

## Troubleshooting

### Deployment Fails

**Error: Insufficient funds**
- Get more Sepolia ETH from faucets
- Need ~0.1 ETH for full deployment

**Error: RPC error**
- Check your Alchemy API key is correct
- Make sure you created an app on Sepolia network (not mainnet)

**Error: Verification failed**
- Contracts still work! Verification is optional
- Check your Etherscan API key
- Try verifying manually: `forge verify-contract ADDRESS CONTRACT_NAME --chain sepolia`

### Frontend Issues

**MetaMask doesn't connect**
- Make sure you're on Sepolia network in MetaMask
- Check `wagmi.ts` is using `sepolia` chain, not `localhost`

**Transactions fail**
- Get Sepolia ETH from faucets
- Check contract addresses are correct in `contracts.ts`

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit your `.env` file to git!
- Add `.env` to `.gitignore`
- Private keys should be kept secret
- This is testnet - don't use real money!

---

## Cost Estimate

Deploying to Sepolia is **FREE** (testnet):
- Deployment: ~0.05 Sepolia ETH (free from faucets)
- Frontend hosting: FREE on Vercel/Netlify
- Total cost: $0 🎉

---

## Next Steps After Deployment

1. **Share your app** with friends to test
2. **Improve IPFS** - Add real Pinata integration
3. **Add ZK proofs** - Upgrade from commitment scheme
4. **Deploy to mainnet** - When ready for production
5. **Add analytics** - Track usage with Dune or The Graph

---

Your WhisperMatch dapp will be live and accessible to anyone on the internet! 🚀
