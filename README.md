# Decentralized Micro-Grant Funding for Creative Projects (DMCGP)

## 1. Project Overview

DMCGP is a fully functional blockchain-based platform that revolutionizes how creative individuals and small-scale projects access funding. The platform leverages NFTs, governance tokens, and a novel "Proof-of-Contribution" (PoC) system to create a transparent, equitable, and community-driven funding ecosystem.

**Status: ✅ Fully Implemented and Ready for Testing**

## 2. Goals & Vision

*   **Democratize Funding:** Provide a more accessible and inclusive funding option for emerging artists and small creative projects.
*   **Foster Community Engagement:** Empower the creative community to actively participate in funding decisions and support each other.
*   **Promote Transparency & Accountability:** Leverage blockchain technology to ensure a transparent and auditable funding process.
*   **Reward Contribution & Collaboration:** Incentivize community members to contribute their skills and expertise.

## 3. Architecture Overview

The DMCGP platform consists of three integrated components:

### Frontend (React + TypeScript + Vite)
*   Modern, responsive UI with TailwindCSS
*   MetaMask wallet integration
*   Signature-based authentication
*   Project browsing, creation, and management
*   Real-time blockchain interaction
*   Governance token dashboard

### Backend (Node.js + Express + MongoDB)
*   RESTful API with JWT authentication
*   MongoDB for off-chain data storage
*   IPFS integration via Pinata
*   Blockchain interaction utilities
*   Proof-of-Contribution tracking
*   W3C Verifiable Credentials issuance

### Blockchain (Solidity + Hardhat)
*   **GovernanceToken (ERC20):** 1M supply governance token
*   **ProposalNFT (ERC721):** NFT representation of projects
*   **GrantManager:** Voting logic, fund distribution, PoC verification
*   Deployed on Hardhat local network (testnet/mainnet ready)

## 4. Quick Start

### Prerequisites
*   Node.js (v16+)
*   MongoDB (v4.4+)
*   MetaMask browser extension

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Ember-Grants

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../blockchain && npm install
```

### Setup & Run

**1. Start MongoDB**
```bash
mongod
```

**2. Deploy Smart Contracts**
```bash
cd blockchain
cp .env.example .env
npx hardhat node  # In one terminal
npx hardhat run scripts/deploy.js --network localhost  # In another
```

**3. Configure Environment**
- Copy contract addresses from deployment output
- Update `backend/.env` and `frontend/.env` with addresses

**4. Start Backend**
```bash
cd backend
cp .env.example .env  # Edit with your config
npm run dev
```

**5. Start Frontend**
```bash
cd frontend
cp .env.example .env  # Edit with contract addresses
npm run dev
```

**6. Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Connect MetaMask to Hardhat network (Chain ID: 1337)

See [SETUP.md](./SETUP.md) for detailed instructions.

## 5. Key Features

### ✅ Implemented Features

**User Authentication**
- MetaMask wallet connection
- Signature-based authentication
- JWT token management

**Project Management**
- Create and submit projects
- Automatic NFT minting
- IPFS metadata storage
- Project status tracking

**Governance & Voting**
- ERC20 governance token (DMCG)
- Token-weighted voting
- 7-day voting periods
- Automatic fund distribution

**Proof-of-Contribution System**
- Contribution submission and tracking
- Verification workflow
- W3C Verifiable Credentials
- Contribution-weighted voting power
- IPFS credential storage

**Blockchain Integration**
- Smart contract deployment scripts
- Contract interaction utilities
- Event listening and indexing
- Transaction management

## 6. Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite build tool
- TailwindCSS for styling
- ethers.js for blockchain
- React Router for navigation
- Lucide React for icons

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- ethers.js for contracts
- JWT authentication
- Pinata for IPFS

**Blockchain**
- Solidity 0.8.20
- Hardhat development
- OpenZeppelin contracts
- ERC20 & ERC721 standards

## 7. Smart Contracts

### GovernanceToken.sol
ERC20 token with 1,000,000 initial supply for governance voting.

### ProposalNFT.sol
ERC721 NFT representing project proposals with IPFS metadata.

### GrantManager.sol
Core contract managing:
- Voting lifecycle
- Contribution weight verification
- Fund distribution
- Grant execution

## 8. API Documentation

See [SETUP.md](./SETUP.md) for complete API endpoint documentation.

## 9. Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 10. License

MIT License - See LICENSE file for details

## 11. Contact

For questions or support, please open an issue on GitHub.


