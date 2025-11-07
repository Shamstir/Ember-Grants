# DMCGP Setup Guide

This guide will help you set up and run the Decentralized Micro-Grant Funding for Creative Projects (DMCGP) platform.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)
- MetaMask browser extension
- Git

## Project Structure

```
Ember-Grants/
├── frontend/          # React + TypeScript frontend
├── backend/           # Express.js backend API
├── blockchain/        # Hardhat smart contracts
└── SETUP.md          # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ember-Grants
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# - Set MongoDB URI
# - Set JWT_SECRET
# - Set Pinata API keys for IPFS
# - Contract addresses will be added after deployment

# Start MongoDB (if not running)
mongod

# Run the backend
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Blockchain Setup

```bash
cd ../blockchain

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start local Hardhat node (in a new terminal)
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Copy the deployed contract addresses from the output
# Update backend/.env and frontend/.env with these addresses
```

The deployment script will create a `deployments/localhost.json` file with contract addresses.

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with:
# - Backend API URL (http://localhost:3000/api)
# - Contract addresses from blockchain deployment
# - Chain ID (1337 for local Hardhat)

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing the Application

### 1. Connect MetaMask

1. Open MetaMask
2. Add Hardhat Network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

3. Import a test account from Hardhat node output

### 2. Create a Project

1. Connect your wallet in the app
2. Sign the authentication message
3. Navigate to "Create Project"
4. Fill in project details and submit

### 3. Mint NFT and Start Voting

Use the backend API or create admin interface:

```bash
# Mint NFT for a project
curl -X POST http://localhost:3000/api/projects/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"projectId": "PROJECT_ID"}'

# Start voting
curl -X POST http://localhost:3000/api/projects/start-voting \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"projectId": "PROJECT_ID"}'
```

### 4. Submit Contributions

1. Navigate to a project
2. Submit your contribution with proof
3. Project creator verifies contributions
4. Verified contributions earn voting weight

### 5. Vote on Projects

1. Navigate to an active voting project
2. Cast your vote (voting power = tokens + contribution weight)
3. Wait for voting period to end
4. Execute grant to distribute funds

## Smart Contract Interactions

### GovernanceToken (DMCG)
- ERC20 token for governance
- Initial supply: 1,000,000 DMCG
- Used for voting on proposals

### ProposalNFT (DMCP)
- ERC721 NFT representing project proposals
- Each project is minted as a unique NFT
- Metadata stored on IPFS

### GrantManager
- Manages voting and grant distribution
- Voting period: 7 days
- Voting threshold: 1000 DMCG
- Supports Proof-of-Contribution weighted voting

## Key Features Implemented

### ✅ Frontend
- Wallet integration (MetaMask)
- Authentication with signature verification
- Project browsing and creation
- Dashboard for user projects
- Governance token information

### ✅ Backend
- RESTful API with Express.js
- MongoDB for data persistence
- JWT authentication
- IPFS integration via Pinata
- Blockchain interaction utilities
- Proof-of-Contribution system

### ✅ Blockchain
- GovernanceToken (ERC20)
- ProposalNFT (ERC721)
- GrantManager with voting logic
- Fund distribution mechanism
- Contribution weight verification

### ✅ Proof-of-Contribution
- Contribution submission and tracking
- Verification workflow
- W3C Verifiable Credentials
- IPFS credential storage
- Signature-based voting weight

## API Endpoints

### Authentication
- `POST /api/auth/message` - Get nonce for signing
- `POST /api/auth/verify` - Verify signature and get JWT

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (auth required)
- `POST /api/projects/mint` - Mint NFT for project (auth required)
- `POST /api/projects/start-voting` - Start voting (auth required)

### Contributions
- `POST /api/contributions` - Submit contribution (auth required)
- `GET /api/contributions/user` - Get user contributions (auth required)
- `GET /api/contributions/project/:projectId` - Get project contributions
- `POST /api/contributions/verify` - Verify contribution (auth required)
- `POST /api/contributions/issue-credential` - Issue VC (auth required)
- `POST /api/contributions/signature` - Get voting signature (auth required)

## Troubleshooting

### MetaMask Connection Issues
- Ensure you're on the correct network (Chain ID: 1337)
- Clear MetaMask activity data if needed
- Restart the Hardhat node and redeploy

### Backend Connection Issues
- Check MongoDB is running
- Verify .env configuration
- Check contract addresses are correct

### Contract Interaction Issues
- Ensure contracts are deployed
- Verify you have test ETH in your wallet
- Check gas limits and transaction parameters

## Development Workflow

1. Start MongoDB
2. Start Hardhat node
3. Deploy contracts
4. Update environment files with contract addresses
5. Start backend server
6. Start frontend dev server
7. Connect MetaMask and test

## Production Deployment

### Backend
- Use production MongoDB instance
- Set secure JWT_SECRET
- Configure CORS properly
- Use environment variables for sensitive data

### Frontend
- Build: `npm run build`
- Deploy to Vercel/Netlify
- Update API URL to production backend

### Blockchain
- Deploy to testnet (Sepolia) or mainnet
- Verify contracts on Etherscan
- Update all contract addresses

## Security Considerations

- Never commit private keys or secrets
- Use environment variables for sensitive data
- Implement rate limiting on API endpoints
- Validate all user inputs
- Use HTTPS in production
- Implement proper access control

## Next Steps

- Add more contribution types
- Implement governance proposals
- Add project milestones
- Create analytics dashboard
- Implement notification system
- Add multi-signature support for large grants

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
