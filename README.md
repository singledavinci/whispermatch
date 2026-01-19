# WhisperMatch

Privacy-first Web3 dating DApp built with Foundry, Next.js 16, and RainbowKit.

## 🚀 Features

- **Anonymous Funding**: Burn ETH and mint LUV tokens to a fresh address
- **Decentralized Profiles**: IPFS storage with multi-photo galleries
- **Privacy-First Matching**: Zero-knowledge proof concepts for anonymous interactions
- **Real-Time Events**: Blockchain event listeners for instant match notifications
- **Modern UI**: Framer Motion animations, glassmorphism, and responsive design

## 🏗️ Architecture

### Smart Contracts (Foundry)
- `LoveToken.sol` - ERC20 token for app economy
- `BurnMint.sol` - Privacy-preserving burn/mint mechanism
- `ProfileRegistry.sol` - Decentralized profile management with pagination
- `MatchRegistry.sol` - Matching and like system
- `MessageRegistry.sol` - Encrypted messaging

### Frontend (Next.js 16)
- **Framework**: Next.js 16 with App Router
- **Blockchain**: RainbowKit + wagmi + viem
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Storage**: IPFS via Pinata
- **Validation**: Zod + react-hook-form

## 📦 Installation

### Prerequisites
- Node.js 20+
- Foundry
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/whispermatch.git
cd whispermatch

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps

# Install Foundry dependencies
cd ../contracts
forge install

# Configure environment
cp frontend/.env.example frontend/.env.local
cp contracts/.env.example contracts/.env
```

### Environment Variables

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_PINATA_API_KEY=your_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_secret
```

**Contracts** (`contracts/.env`):
```
SEPOLIA_RPC_URL=your_alchemy_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test -vvv
forge coverage
```

### Frontend
```bash
cd frontend
npm run lint
npm run build
```

## 🔧 Development

```bash
# Run frontend dev server
cd frontend
npm run dev

# Deploy contracts to Sepolia
cd contracts
./deploy.sh

# Verify contracts on Etherscan
./verify.sh
```

## 📊 Test Coverage

- **Smart Contracts**: 38+ tests across 3 core contracts
  - BurnMint: 18 tests
  - ProfileRegistry: 12 tests
  - MatchRegistry: 8 tests

## 🌐 Deployment

**Frontend**: Auto-deployed to Vercel on push to `main`  
**Contracts**: Deployed to Sepolia testnet

- **Live App**: https://whispermatch.vercel.app
- **Contract Addresses**: See `DEPLOYMENT_SUCCESS.md`

## 📝 Documentation

- [Setup Guide](SETUP_GUIDE.md)
- [Deployment Guide](PUBLIC_DEPLOYMENT.md)
- [Architecture Overview](docs/architecture.md)

## 🔒 Security

- Comprehensive test coverage
- TypeScript strict mode
- Form validation with Zod
- Reentrancy protection considerations
- Privacy-preserving mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Foundry, Next.js, RainbowKit
- Inspired by modern dating apps
- Privacy-first design principles
