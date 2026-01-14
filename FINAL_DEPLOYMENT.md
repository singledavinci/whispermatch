# WhisperMatch - Final Deployment Steps

## ✅ What's Done:
- Frontend deployed to Vercel (building now)
- Code on GitHub: https://github.com/singledavinci/whispermatch

## 🚀 To Make It Fully Public:

### Step 1: Get Sepolia ETH (Free!)

1. Go to https://sepoliafaucet.com/
2. Enter your wallet address
3. Get 0.5 ETH (free testnet ETH)

### Step 2: Get Alchemy API Key

1. Go to https://dashboard.alchemy.com/
2. Sign in / Create account
3. Click "Create new app"
4. Select "Sepolia" network
5. Copy the **HTTPS** URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/ABC123...`)

### Step 3: Update .env File

Open `contracts/.env` and replace:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ACTUAL_API_KEY_HERE
PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY_FROM_METAMASK
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY  # Optional but recommended
```

**Get Private Key from MetaMask:**
- Click your account → Account Details → Export Private Key
- Enter password → Copy the key

**Get Etherscan Key (optional):**
- Go to https://etherscan.io/myapikey
- Create account → Create API key

### Step 4: Deploy Contracts

Once `.env` is updated, run:

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

This will deploy all 5 contracts to Sepolia and give you addresses like:
```
LoveToken: 0x1234...
BurnMint: 0x5678...
ProfileRegistry: 0x9abc...
MatchRegistry: 0xdef0...
MessageRegistry: 0x1234...
```

### Step 5: Update Frontend Config

1. Open `frontend/lib/contracts.ts`
2. Replace addresses with your deployed Sepolia addresses
3. Open `frontend/lib/wagmi.ts`
4. Change `localhost` to `sepolia`:

```typescript
import { sepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'WhisperMatch',
  projectId: '0f3937bfe2b9c74bdf919eb3794abb9b',
  chains: [sepolia],  // Changed!
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
```

### Step 6: Push to GitHub

```bash
git add .
git commit -m "Update to Sepolia testnet"
git push
```

Vercel will automatically redeploy with the new config!

### Step 7: Test It!

1. Visit your Vercel URL
2. Connect MetaMask (switch to Sepolia network)
3. Use the app - it's now fully public!

---

## Quick Alternative: Test Locally First

If you want to test before deploying to testnet:

1. Keep using Anvil (localhost)
2. Share your Vercel URL for UI demo
3. Deploy to Sepolia later when ready

---

## Need Help?

**If .env still has issues:**
- Make sure there are NO quotes around values
- No spaces before/after the `=`
- Use the full HTTPS URL from Alchemy

**Example correct .env:**
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/abc123xyz
PRIVATE_KEY=0x1234567890abcdef...
ETHERSCAN_API_KEY=ABC123XYZ
```

Once you update `.env` with real values, just reply "deploy" and I'll run it!
