# WhisperMatch - Public Deployment Guide

## Making WhisperMatch Accessible to Everyone

There are two parts to deploy:
1. **Smart Contracts** → Sepolia Testnet (blockchain)
2. **Frontend** → Vercel (website hosting)

---

## Option 1: Deploy Frontend Only (Quickest - 5 minutes)

This will make your app accessible at a public URL, but it will still use the contracts on your local Anvil.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy Frontend

```bash
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** whispermatch (or your choice)
- **Directory?** `./` (just press Enter)
- **Override settings?** No

✅ **Done!** You'll get a URL like `whispermatch.vercel.app`

**Note:** This uses localhost contracts, so only you can interact with it. For full public access, continue to Option 2.

---

## Option 2: Full Public Deployment (Recommended - 15 minutes)

This deploys everything so anyone can use WhisperMatch.

### Part A: Deploy Contracts to Sepolia

**Prerequisites:**
- Sepolia ETH (get free from https://sepoliafaucet.com/)
- Alchemy account (free at https://alchemy.com/)

**Steps:**

1. **Update `contracts/.env`** with your real values:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   PRIVATE_KEY=0xYOUR_METAMASK_PRIVATE_KEY
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
   ```

2. **Deploy contracts:**
   ```bash
   cd contracts
   forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
   ```

3. **Save the deployed addresses** from the output

### Part B: Update Frontend Configuration

1. **Update `frontend/lib/wagmi.ts`** to use Sepolia:
   ```typescript
   import { sepolia } from 'wagmi/chains';
   
   export const wagmiConfig = getDefaultConfig({
     appName: 'WhisperMatch',
     projectId: '0f3937bfe2b9c74bdf919eb3794abb9b',
     chains: [sepolia],  // Changed from localhost
     transports: {
       [sepolia.id]: http(),
     },
     ssr: true,
   });
   ```

2. **Update `frontend/lib/contracts.ts`** with Sepolia addresses:
   ```typescript
   export const CONTRACTS = {
     LoveToken: '0xYOUR_DEPLOYED_ADDRESS' as `0x${string}`,
     BurnMint: '0xYOUR_DEPLOYED_ADDRESS' as `0x${string}`,
     // ... etc
   };
   ```

### Part C: Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

✅ **Done!** Your app is now live and anyone can access it!

---

## Option 3: Deploy to Vercel via GitHub (Most Professional)

### Step 1: Push to GitHub

```bash
cd ..  # Go to project root
git init
git add .
git commit -m "WhisperMatch - Privacy-first dating DApp"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whispermatch.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com/
2. Click "Import Project"
3. Select your GitHub repo
4. **Root Directory:** `frontend`
5. Click "Deploy"

✅ **Automatic deployments!** Every git push updates your live site.

---

## Quick Deployment (Recommended for Now)

Since you want to get it live quickly, I recommend:

**1. Deploy frontend to Vercel** (5 minutes)
   - Uses your local Anvil contracts
   - Only you can test it
   - Good for showing the UI to others

**2. Later: Deploy contracts to Sepolia** (when ready)
   - Makes it fully public
   - Anyone can use it
   - Requires testnet ETH

**Which would you like to do first?**

---

## After Deployment

Once deployed, share your URL and users can:
- Connect their MetaMask
- Use the dating app
- All transactions on Sepolia testnet (free!)

**Your WhisperMatch will be live!** 🚀
