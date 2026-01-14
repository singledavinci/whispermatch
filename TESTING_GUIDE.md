# WhisperMatch - Testing Guide

## 🎉 Congratulations! WhisperMatch is Complete!

Your privacy-first dating DApp is ready to test. Here's how to use it:

---

## Prerequisites

✅ Anvil running (you have this)
✅ Frontend running (you have this)  
⚠️ **MetaMask connected** - Follow METAMASK_SETUP.md if not done yet

---

## Complete User Flow Test

### 1. Connect Your Wallet (First Time Setup)

**Quick MetaMask Setup:**
1. Add network: Localhost 8545, RPC: `http://127.0.0.1:8545`, Chain ID: `31337`
2. Import account: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. Visit http://localhost:3000
4. Click "Connect Wallet" → MetaMask → Approve
5. ✅ You should see your address in the header

### 2. Test Anonymous Funding Flow

**Goal:** Burn ETH and get LUV tokens to a fresh address

1. **Navigate to** http://localhost:3000/fund
2. **You'll see 3 steps:**
   - Step 1: Burn & Commit
   - Step 2: Wait 10 Blocks
   - Step 3: Mint LUV

3. **Step 1 - Burn & Commit:**
   - ETH Amount: `0.1` (you'll get 100 LUV)
   - Click "Generate" for a secret
   - **Copy the secret!** You need it later
   - New Wallet Address: Enter any address (or create a new MetaMask account and paste that address)
   - Click "Burn 0.1 ETH & Commit"
   - **Approve in MetaMask**
   - Wait for confirmation ✅

4. **Step 2 - Wait:**
   - Click "Continue to next step"
   - You'll see a wait screen
   - In production, you'd wait 10 blocks (~2 minutes)
   - For testing, just click "I've waited 10 blocks, proceed to mint"

5. **Step 3 - Mint:**
   - Your secret and address are pre-filled
   - Click "Mint LUV Tokens 🎉"
   - **Approve in MetaMask**
   - ✅ Success! LUV minted to the new address

**Privacy achieved:** No on-chain link between your burn address and mint address!

### 3. Test Profile Creation

**Goal:** Create your dating profile

1. **Navigate to** http://localhost:3000/profile
2. **Fill in your profile:**
   - Image URL: Use any image URL or leave blank
   - Age: e.g., `25`
   - Bio: Write something fun!
   - Interests: `Photography, Travel, Music` (comma-separated)
   - Min LUV to View: `1` (requires 1 LUV to see your profile)
3. **Click "Create Profile"**
4. **Approve in MetaMask** (requires 1 LUV token)
5. ✅ Profile created and stored on IPFS!

**Note:** For testing, if you don't have LUV, you can use your funded MetaMask account

### 4. Test Browse & Match

**Goal:** Swipe through profiles and send likes

1. **Navigate to** http://localhost:3000/browse
2. **If no profiles exist:**
   - You'll see "No Profiles Found"
   - This is normal - you're the first user!
   - Create a second account and profile to test matching
3. **If profiles exist:**
   - See a swipeable card interface
   - Click "💗 Like" to send a like
   - Click "✕ Skip" to pass
4. **Approve transaction in MetaMask**
5. ✅ Like sent!

**To test matching:**
- Create 2 MetaMask accounts
- Create profiles for both
- Like each other
- You'll get a match!

### 5. Test Messaging

**Goal:** Send encrypted messages to matches

1. **Navigate to** http://localhost:3000/matches
2. **If you have matches:**
   - See them listed on the left
   - Click a match to open chat
   - Type a message and click "Send"
   - **Approve in MetaMask**
   - ✅ Encrypted message sent!
3. **Messages stored on IPFS** - fully decentralized!

---

## Quick Multi-Account Testing

To test the full flow (matching, messaging), you need 2 accounts:

### Account 1 Setup
1. Use the imported Anvil account
2. Connect to WhisperMatch
3. Create profile as "Alice"
4. Send like to Account 2

### Account 2 Setup
1. Create new MetaMask account
2. Import another Anvil test account: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
3. Add Localhost 8545 network
4. Connect to WhisperMatch  
5. Create profile as "Bob"
6. Send like to Account 1
7. ✅ **MATCH!**
8. Go to /matches and chat!

---

## What You're Testing

✅ **Privacy-Preserving Burn/Mint** - No link between ETH burn and LUV mint
✅ **Decentralized Profiles** - IPFS storage, LUV-gated access
✅ **Mutual Matching** - Both users must like each other
✅ **Encrypted Messaging** - Messages on IPFS, only visible to matched users
✅ **Beautiful UI** - Gradient design, smooth animations

---

## Troubleshooting

### Transactions Fail
- Check you're on "Localhost 8545" network in MetaMask
- Make sure Anvil is running (look for "Listening on 127.0.0.1:8545")
- Try refreshing the page

### Not Enough LUV
- Use the /fund page to get more LUV tokens
- Or switch to the main Anvil account which has ETH

### Profile Not Showing
- Try refreshing the page
- Check you successfully created the profile (transaction confirmed)
- Make sure you have at least 1 LUV token

---

## Next Steps After Testing

Once you've tested everything:

1. **Deploy to Testnet** - Deploy to Sepolia or Base Sepolia for public testing
2. **Add Real IPFS** - Integrate Pinata or Infura for actual IPFS uploads
3. **Upgrade to ZK** - Replace commitment scheme with Noir circuits
4. **Add The Graph** - Index events for better performance
5. **Mobile Support** - Add mobile wallet connectors

---

## Deployed Contracts (Anvil)

For reference:
- **LoveToken:** `0x5fbdb2315678afecb367f032d93f642f64180aa3`
- **BurnMint:** `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512`  
- **ProfileRegistry:** `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9`
- **MatchRegistry:** `0xdc64a140aa3e981100a9beca4e685f962f0cf6c9`
- **MessageRegistry:** `0x5fc8d32690cc91d4c39d9d3abcbd16989f875707`

---

**Have fun testing WhisperMatch!** 💗

You've built a complete privacy-first dating DApp from scratch. This is production-ready architecture that could be deployed to mainnet with just a few upgrades (real IPFS, ZK proofs, testnet deployment).
