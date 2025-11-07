#!/bin/bash

# DMCGP Quick Start Script
# This script helps you get started quickly with the DMCGP platform

set -e

echo "🚀 DMCGP Quick Start"
echo "==================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ] || [ ! -d "blockchain" ]; then
    echo -e "${RED}❌ Error: Please run this script from the Ember-Grants root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v16 or higher from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not found in PATH${NC}"
    echo "Please ensure MongoDB is installed and running"
    echo "Visit: https://www.mongodb.com/docs/manual/installation/"
fi

echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
echo ""

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

# Install blockchain dependencies
if [ ! -d "blockchain/node_modules" ]; then
    echo "Installing blockchain dependencies..."
    cd blockchain
    npm install
    cd ..
    echo -e "${GREEN}✅ Blockchain dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Blockchain dependencies already installed${NC}"
fi

echo ""
echo -e "${YELLOW}⚙️  Setting up environment files...${NC}"
echo ""

# Setup backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# Setup frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✅ frontend/.env already exists${NC}"
fi

# Setup blockchain .env
if [ ! -f "blockchain/.env" ]; then
    cp blockchain/.env.example blockchain/.env
    echo -e "${GREEN}✅ Created blockchain/.env${NC}"
else
    echo -e "${GREEN}✅ blockchain/.env already exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo ""
echo "1. Start MongoDB:"
echo "   ${GREEN}mongod${NC}"
echo ""
echo "2. Start Hardhat node (in a new terminal):"
echo "   ${GREEN}cd blockchain && npm run node${NC}"
echo ""
echo "3. Deploy contracts (in another terminal):"
echo "   ${GREEN}cd blockchain && npm run deploy:local${NC}"
echo ""
echo "4. Update environment files with contract addresses:"
echo "   ${GREEN}./scripts/setup-env.sh${NC}"
echo ""
echo "5. Start backend (in a new terminal):"
echo "   ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo "6. Start frontend (in a new terminal):"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "7. Open your browser:"
echo "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo "8. Configure MetaMask:"
echo "   - Network: Hardhat Local"
echo "   - RPC URL: http://127.0.0.1:8545"
echo "   - Chain ID: 1337"
echo "   - Currency: ETH"
echo ""
echo -e "${YELLOW}📚 For detailed instructions, see SETUP.md${NC}"
echo ""
