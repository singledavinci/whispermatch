# WhisperMatch - Foundry Installation & Setup Guide

## 🎯 Goal

Install Foundry (Forge, Anvil, Cast) on Windows and set up the WhisperMatch development environment.

---

## Step 1: Install WSL (Windows Subsystem for Linux)

WSL allows you to run a Linux environment directly on Windows, which is required for Foundry.

### 1.1 Open PowerShell as Administrator

- Press `Windows + X`
- Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

### 1.2 Install WSL

```powershell
wsl --install
```

This will:
- Enable WSL feature
- Install Ubuntu (default distro)
- Download Linux kernel

### 1.3 Restart Your Computer

After installation completes, restart Windows.

### 1.4 Set Up Ubuntu

After restart, Ubuntu will automatically launch and ask you to:
- Create a username (e.g., `abdul`)
- Create a password

**Important:** Remember this password - you'll need it for `sudo` commands!

---

## Step 2: Install Rust

Foundry is built in Rust, so we need the Rust toolchain.

### 2.1 Open WSL Terminal

- Press `Windows + S` and search for "Ubuntu"
- Or open Windows Terminal and select Ubuntu

### 2.2 Install Rust via rustup

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When prompted:
- Select option `1` (default installation)

### 2.3 Configure Your Current Shell

```bash
source $HOME/.cargo/env
```

### 2.4 Verify Installation

```bash
rustc --version
cargo --version
```

You should see version numbers!

---

## Step 3: Install Foundry

Now for the main event!

### 3.1 Run Foundryup Installer

```bash
curl -L https://foundry.paradigm.xyz | bash
```

This downloads and installs the `foundryup` tool.

### 3.2 Install Foundry Toolchain

```bash
source ~/.bashrc
foundryup
```

This installs:
- **forge** - Smart contract compiler and testing
- **cast** - Blockchain interaction CLI
- **anvil** - Local Ethereum node
- **chisel** - Solidity REPL

The installation may take 5-10 minutes.

### 3.3 Verify Installation

```bash
forge --version
cast --version
anvil --version
```

You should see version info for each!

---

## Step 4: Set Up Git (if not installed)

```bash
sudo apt update
sudo apt install git -y
git --version
```

---

## Step 5: Access Your Windows Files from WSL

Your Windows files are accessible at `/mnt/c/`

Example:
```bash
cd /mnt/c/Users/abdul/.gemini/antigravity/scratch/whispermatch
```

---

## Step 6: Initialize Foundry Project

Now let's create the WhisperMatch smart contract project!

### 6.1 Navigate to Project Directory

```bash
cd /mnt/c/Users/abdul/.gemini/antigravity/scratch/whispermatch
```

### 6.2 Initialize Foundry

```bash
forge init contracts
cd contracts
```

This creates:
```
contracts/
├── src/           # Smart contracts
├── test/          # Tests
├── script/        # Deployment scripts
├── lib/           # Dependencies
└── foundry.toml   # Config
```

### 6.3 Test the Setup

```bash
forge build
forge test
```

If you see "Compiling... Tests passed!" - you're ready! 🎉

---

## Step 7: Install Node.js in WSL (for frontend)

### 7.1 Install NVM (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
```

### 7.2 Install Node.js 24

```bash
nvm install 24
nvm use 24
node --version
npm --version
```

---

## Step 8: Initialize Next.js Frontend

### 8.1 Navigate to Project Root

```bash
cd /mnt/c/Users/abdul/.gemini/antigravity/scratch/whispermatch
```

### 8.2 Create Next.js App

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --use-npm
```

Answer the prompts:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory: No
- ✅ App Router
- ❌ Customize import alias: No

---

## Step 9: Install Frontend Dependencies

```bash
cd frontend
npm install wagmi viem@2.x @rainbow-me/rainbowkit@2.x
npm install @tanstack/react-query@5.x zustand
npm install ethers@6.x
npm install axios ipfs-http-client
```

---

## Step 10: Start Anvil Local Blockchain

Open a new WSL terminal and run:

```bash
anvil
```

This starts a local Ethereum node at `http://localhost:8545` with 10 pre-funded accounts.

**Keep this running!**

---

## Step 11: Deploy Contracts to Anvil

In your contract terminal:

```bash
cd /mnt/c/Users/abdul/.gemini/antigravity/scratch/whispermatch/contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

---

## Step 12: Run Frontend

In another terminal:

```bash
cd /mnt/c/Users/abdul/.gemini/antigravity/scratch/whispermatch/frontend
npm run dev
```

Open http://localhost:3000 in your browser!

---

## 🎯 Quick Reference Commands

### Compile Contracts
```bash
forge build
```

### Run Tests
```bash
forge test
```

### Run Specific Test
```bash
forge test --match-test testBurnAndMint -vvv
```

### Start Local Blockchain
```bash
anvil
```

### Deploy Contracts
```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Check Contract Size
```bash
forge build --sizes
```

### Format Code
```bash
forge fmt
```

---

## 🚨 Troubleshooting

### "Permission denied" errors
```bash
sudo chmod -R 755 /mnt/c/Users/abdul/.gemini/antigravity/scratch/whispermatch
```

### Forge not found
```bash
source ~/.bashrc
```

### WSL slow file access
Work directly in WSL home:
```bash
mkdir ~/whispermatch
cd ~/whispermatch
```

Then access from Windows at `\\wsl$\Ubuntu\home\abdul\whispermatch`

---

## ✅ You're Ready!

You now have:
- ✅ WSL with Ubuntu
- ✅ Rust toolchain
- ✅ Foundry (Forge, Anvil, Cast)
- ✅ Node.js & npm
- ✅ Next.js frontend
- ✅ Local blockchain running

**Next:** Let's build the smart contracts! 🚀
