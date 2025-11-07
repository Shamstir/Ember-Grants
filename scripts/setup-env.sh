#!/bin/bash

# DMCGP Environment Setup Script
# This script helps set up environment files after contract deployment

echo "🚀 DMCGP Environment Setup"
echo "=========================="
echo ""

# Check if deployment file exists
DEPLOYMENT_FILE="./blockchain/deployments/localhost.json"

if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "❌ Error: Deployment file not found at $DEPLOYMENT_FILE"
    echo "Please deploy contracts first:"
    echo "  cd blockchain"
    echo "  npx hardhat node"
    echo "  npx hardhat run scripts/deploy.js --network localhost"
    exit 1
fi

echo "✅ Found deployment file"
echo ""

# Extract contract addresses using node
GOVERNANCE_TOKEN=$(node -p "require('$DEPLOYMENT_FILE').contracts.GovernanceToken")
PROPOSAL_NFT=$(node -p "require('$DEPLOYMENT_FILE').contracts.ProposalNFT")
GRANT_MANAGER=$(node -p "require('$DEPLOYMENT_FILE').contracts.GrantManager")

echo "📝 Contract Addresses:"
echo "  GovernanceToken: $GOVERNANCE_TOKEN"
echo "  ProposalNFT: $PROPOSAL_NFT"
echo "  GrantManager: $GRANT_MANAGER"
echo ""

# Update backend .env
echo "📦 Updating backend/.env..."
if [ -f "./backend/.env" ]; then
    # Update existing file
    sed -i.bak "s|GOVERNANCE_TOKEN_ADDRESS=.*|GOVERNANCE_TOKEN_ADDRESS=$GOVERNANCE_TOKEN|g" ./backend/.env
    sed -i.bak "s|PROPOSAL_NFT_ADDRESS=.*|PROPOSAL_NFT_ADDRESS=$PROPOSAL_NFT|g" ./backend/.env
    sed -i.bak "s|GRANT_MANAGER_ADDRESS=.*|GRANT_MANAGER_ADDRESS=$GRANT_MANAGER|g" ./backend/.env
    rm ./backend/.env.bak
    echo "  ✅ Backend .env updated"
else
    echo "  ⚠️  Backend .env not found. Please create it from .env.example"
fi

# Update frontend .env
echo "📦 Updating frontend/.env..."
if [ -f "./frontend/.env" ]; then
    # Update existing file
    sed -i.bak "s|VITE_CONTRACT_ADDRESS_GOVERNANCE=.*|VITE_CONTRACT_ADDRESS_GOVERNANCE=$GOVERNANCE_TOKEN|g" ./frontend/.env
    sed -i.bak "s|VITE_CONTRACT_ADDRESS_PROPOSAL_NFT=.*|VITE_CONTRACT_ADDRESS_PROPOSAL_NFT=$PROPOSAL_NFT|g" ./frontend/.env
    sed -i.bak "s|VITE_CONTRACT_ADDRESS_GRANT_MANAGER=.*|VITE_CONTRACT_ADDRESS_GRANT_MANAGER=$GRANT_MANAGER|g" ./frontend/.env
    rm ./frontend/.env.bak
    echo "  ✅ Frontend .env updated"
else
    echo "  ⚠️  Frontend .env not found. Please create it from .env.example"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start backend: cd backend && npm run dev"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Connect MetaMask to localhost:8545 (Chain ID: 1337)"
echo ""
