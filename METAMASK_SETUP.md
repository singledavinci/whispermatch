# MetaMask Connection Guide for WhisperMatch

## The Problem
MetaMask doesn't connect to localhost automatically. You need to manually add the Anvil network first.

## Step-by-Step Fix

### Step 1: Add Localhost Network to MetaMask

**Before clicking "Connect Wallet" on WhisperMatch**, do this:

1. **Open MetaMask** (click the extension icon)
2. **Click the network dropdown** at the top (probably says "Ethereum Mainnet" or similar)
3. **Click "Add network"** at the bottom
4. **Click "Add a network manually"** (don't use the popular networks list)
5. **Fill in these EXACT values:**
   - **Network name:** `Localhost 8545`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency symbol:** `ETH`
6. **Click "Save"**
7. **Click the network dropdown again** and **select "Localhost 8545"**

✅ **You should now see "Localhost 8545" at the top of MetaMask**

### Step 2: Import Test Account

1. **In MetaMask**, click your account icon (top right)
2. **Click "Add account or hardware wallet"**
3. **Click "Import account"**
4. **Paste this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. **Click "Import"**

✅ **You should see "Account 2" with 10000 ETH**

### Step 3: Connect to WhisperMatch

Now the connection should work:

1. **Make sure** MetaMask is on "Localhost 8545" network
2. **Go to** http://localhost:3000
3. **Click "Connect Wallet"**
4. **Click "MetaMask"** in the RainbowKit modal
5. **MetaMask popup should appear** - click "Next" then "Connect"

✅ **You should now be connected!**

---

## Troubleshooting

### MetaMask popup doesn't appear
- **Check:** Is MetaMask on "Localhost 8545" network? Switch to it first
- **Try:** Refresh the page and try again
- **Check:** Look for the MetaMask icon in your browser toolbar - it might be asking for permission

### "Chain ID mismatch" error
- **Fix:** Make sure you used exactly `31337` as the Chain ID (not 31337.0 or anything else)
- **Delete** the network and add it again with the exact values above

### Still doesn't work
- **Check Anvil is running:** You should see "Listening on 127.0.0.1:8545" in the terminal
- **Try:** Use `http://localhost:8545` instead of `http://127.0.0.1:8545` when adding the network
- **Last resort:** Try disconnecting all sites from MetaMask (Settings → Connected sites → Disconnect all), then try again

---

## Quick Test

Once connected, test that it works:

1. **Check your address** is showing in the top right of WhisperMatch
2. **Try navigating to** `/fund` - you should see the funding page
3. **Your ETH balance** should show as 10000 ETH

---

## Why This Happens

MetaMask doesn't automatically recognize localhost networks for security reasons. You have to manually add them. Once added, the connection works perfectly!
