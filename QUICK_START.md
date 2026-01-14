# WhisperMatch - Quick Start Testing

## ✅ Status: RUNNING!

WhisperMatch is now live at **http://localhost:3000**

---

## Quick Test (5 Minutes)

### Step 1: Connect MetaMask (One-Time Setup)

**Add Localhost Network:**
1. Open MetaMask extension
2. Network dropdown → "Add network" → "Add manually"
3. Fill in:
   - Network: `Localhost 8545`
   - RPC: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
4. Save and switch to this network

**Import Test Account:**
1. MetaMask → Account → "Import account"
2. Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. You now have 10,000 ETH!

### Step 2: Connect to WhisperMatch

1. Visit **http://localhost:3000**
2. Click **"Connect Wallet"**
3. Select **"MetaMask"**
4. Approve the connection
5. ✅ You're connected!

### Step 3: Test Anonymous Funding

1. Click **"Get Started"** or go to `/fund`
2. Fill in:
   - ETH Amount: `0.1`
   - Click "Generate" for secret
   - **SAVE THE SECRET!**
   - New Wallet: Enter any address (or create new MetaMask account)
3. Click **"Burn 0.1 ETH & Commit"**
4. Approve in MetaMask
5. Wait for confirmation
6. Click through to Step 3
7. Click **"Mint LUV Tokens"**
8. ✅ You got 100 LUV tokens!

### Step 4: Create Profile

1. Go to `/profile`
2. Fill in:
   - Age: `25`
   - Bio: `"Love photography and travel!"`
   - Interests: `Photography, Travel, Music`
3. Click **"Create Profile"**
4. Approve transaction
5. ✅ Profile created!

### Step 5: Browse & Match

1. Go to `/browse`
2. You'll see "No Profiles" (you're the first user!)
3. To test matching:
   - Create a 2nd MetaMask account
   - Import another Anvil key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Create profile for that account
   - Like each other
   - ✅ Match!

### Step 6: Send Messages

1. Go to `/matches`
2. Click your match
3. Type a message
4. Click "Send"
5. ✅ Encrypted message sent!

---

## What You're Testing

✅ **Privacy**: ETH burn → LUV mint (no on-chain link)
✅ **Decentralization**: Profiles on IPFS
✅ **Matching**: Mutual likes required
✅ **Messaging**: Encrypted on IPFS
✅ **Beautiful UI**: Gradient design, animations

---

## Troubleshooting

**MetaMask won't connect:**
- Make sure you're on "Localhost 8545" network
- Refresh the page

**Transaction fails:**
- Check you have ETH in your account
- Make sure Anvil is running

**Profile won't create:**
- You need at least 1 LUV token
- Use the /fund page first

---

## Deployed Contracts (Anvil)

- LoveToken: `0x5fbdb2315678afecb367f032d93f642f64180aa3`
- BurnMint: `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512`
- ProfileRegistry: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9`
- MatchRegistry: `0xdc64a140aa3e981100a9beca4e685f962f0cf6c9`
- MessageRegistry: `0x5fc8d32690cc91d4c39d9d3abcbd16989f875707`

---

**Have fun testing your privacy-first dating DApp!** 💗
