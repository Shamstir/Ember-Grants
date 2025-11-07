# DMCGP Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Browser + MetaMask)                         │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             │ HTTP/REST                          │ Web3/RPC
             │                                    │
┌────────────▼────────────────┐      ┌───────────▼────────────────┐
│                             │      │                            │
│      BACKEND API            │      │    BLOCKCHAIN LAYER        │
│   (Node.js + Express)       │◄────►│  (Ethereum/Hardhat)        │
│                             │      │                            │
│  ┌──────────────────────┐   │      │  ┌──────────────────────┐  │
│  │  Auth Controller     │   │      │  │  GovernanceToken     │  │
│  │  - Nonce generation  │   │      │  │  (ERC20)             │  │
│  │  - Signature verify  │   │      │  └──────────────────────┘  │
│  └──────────────────────┘   │      │                            │
│                             │      │  ┌──────────────────────┐  │
│  ┌──────────────────────┐   │      │  │  ProposalNFT         │  │
│  │  Project Controller  │   │      │  │  (ERC721)            │  │
│  │  - CRUD operations   │   │      │  └──────────────────────┘  │
│  │  - NFT minting       │   │      │                            │
│  │  - Voting initiation │   │      │  ┌──────────────────────┐  │
│  └──────────────────────┘   │      │  │  GrantManager        │  │
│                             │      │  │  - Voting logic      │  │
│  ┌──────────────────────┐   │      │  │  - Fund distribution │  │
│  │ Contribution Control │   │      │  │  - PoC verification  │  │
│  │  - Submit/Verify     │   │      │  └──────────────────────┘  │
│  │  - Issue credentials │   │      │                            │
│  └──────────────────────┘   │      └────────────────────────────┘
│                             │
│  ┌──────────────────────┐   │
│  │  Blockchain Utils    │   │      ┌────────────────────────────┐
│  │  - Contract calls    │───┼─────►│      IPFS/Pinata           │
│  │  - Signature gen     │   │      │                            │
│  └──────────────────────┘   │      │  - Project metadata        │
│                             │      │  - Verifiable credentials  │
│  ┌──────────────────────┐   │      │  - NFT metadata            │
│  │   IPFS Utils         │───┼─────►│                            │
│  │  - Upload JSON       │   │      └────────────────────────────┘
│  │  - Upload files      │   │
│  └──────────────────────┘   │
│                             │
└────────────┬────────────────┘
             │
             │ MongoDB
             │
┌────────────▼────────────────┐
│                             │
│      DATABASE LAYER         │
│       (MongoDB)             │
│                             │
│  ┌──────────────────────┐   │
│  │  Users Collection    │   │
│  │  - walletAddress     │   │
│  │  - nonce             │   │
│  │  - username          │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │ Projects Collection  │   │
│  │  - title/description │   │
│  │  - creator           │   │
│  │  - status            │   │
│  │  - nftTokenId        │   │
│  │  - ipfsCid           │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │Contributions Collect │   │
│  │  - contributor       │   │
│  │  - project           │   │
│  │  - type/description  │   │
│  │  - weight            │   │
│  │  - status            │   │
│  │  - credentialCid     │   │
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

## Component Interaction Flow

### 1. User Authentication Flow

```
User                Frontend              Backend              Blockchain
 │                     │                     │                     │
 │──Connect Wallet────►│                     │                     │
 │                     │                     │                     │
 │◄──Request Sign─────│                     │                     │
 │                     │                     │                     │
 │──Sign Message──────►│                     │                     │
 │                     │                     │                     │
 │                     │──Get Nonce─────────►│                     │
 │                     │                     │                     │
 │                     │◄──Return Nonce─────│                     │
 │                     │                     │                     │
 │                     │──Verify Signature──►│                     │
 │                     │   + Signature       │                     │
 │                     │                     │                     │
 │                     │                     │──Verify on-chain───►│
 │                     │                     │   (optional)        │
 │                     │                     │                     │
 │                     │◄──JWT Token────────│                     │
 │                     │                     │                     │
 │◄──Authenticated────│                     │                     │
```

### 2. Project Creation & NFT Minting Flow

```
User            Frontend         Backend          IPFS         Blockchain
 │                 │                │               │               │
 │──Create────────►│                │               │               │
 │  Project        │                │               │               │
 │                 │                │               │               │
 │                 │──POST /api────►│               │               │
 │                 │   /projects    │               │               │
 │                 │   + JWT        │               │               │
 │                 │                │               │               │
 │                 │                │──Save to DB──►│               │
 │                 │                │               │               │
 │                 │◄──Project─────│               │               │
 │                 │   Created      │               │               │
 │                 │                │               │               │
 │──Mint NFT──────►│                │               │               │
 │                 │                │               │               │
 │                 │──POST /mint───►│               │               │
 │                 │   + projectId  │               │               │
 │                 │                │               │               │
 │                 │                │──Upload──────►│               │
 │                 │                │   Metadata    │               │
 │                 │                │               │               │
 │                 │                │◄──IPFS CID───│               │
 │                 │                │               │               │
 │                 │                │──Mint NFT────────────────────►│
 │                 │                │   (creator,                   │
 │                 │                │    ipfs://CID)                │
 │                 │                │                               │
 │                 │                │◄──Token ID───────────────────│
 │                 │                │   + Tx Hash                   │
 │                 │                │                               │
 │                 │                │──Update DB───►│               │
 │                 │                │   (tokenId,   │               │
 │                 │                │    ipfsCid)   │               │
 │                 │                │               │               │
 │                 │◄──NFT Minted──│               │               │
 │◄──Success──────│                │               │               │
```

### 3. Voting Flow with Proof-of-Contribution

```
User         Frontend      Backend      Blockchain
 │              │             │              │
 │──View───────►│             │              │
 │  Project     │             │              │
 │              │             │              │
 │              │──Get────────────────────►  │
 │              │  Proposal                  │
 │              │  Details                   │
 │              │                            │
 │              │◄──Proposal─────────────────│
 │              │   Data                     │
 │              │                            │
 │──Cast Vote──►│             │              │
 │              │             │              │
 │              │──Request────►│              │
 │              │  Signature  │              │
 │              │             │              │
 │              │             │──Calculate───│
 │              │             │  Total       │
 │              │             │  Contrib     │
 │              │             │  Weight      │
 │              │             │              │
 │              │             │──Sign────────│
 │              │             │  Message     │
 │              │             │              │
 │              │◄──Signature─│              │
 │              │   + Weight  │              │
 │              │             │              │
 │              │──Approve────────────────►  │
 │              │  Tokens                    │
 │              │  (if needed)               │
 │              │                            │
 │              │──Cast Vote──────────────►  │
 │              │  (nftId,                   │
 │              │   tokens,                  │
 │              │   weight,                  │
 │              │   signature)               │
 │              │                            │
 │              │             │◄──Verify─────│
 │              │             │  Signature   │
 │              │             │              │
 │              │             │──Record──────│
 │              │             │  Vote        │
 │              │             │              │
 │              │◄──Vote──────────────────── │
 │              │   Recorded                 │
 │◄──Success───│             │              │
```

### 4. Contribution & Credential Issuance Flow

```
User         Frontend      Backend       IPFS      Blockchain
 │              │             │            │            │
 │──Submit─────►│             │            │            │
 │  Contrib     │             │            │            │
 │              │             │            │            │
 │              │──POST──────►│            │            │
 │              │  /contrib   │            │            │
 │              │             │            │            │
 │              │             │──Save─────►│            │
 │              │             │  (pending) │            │
 │              │             │            │            │
 │              │◄──Created──│            │            │
 │              │             │            │            │
 │◄──Success───│             │            │            │
 │              │             │            │            │
 │                                                      │
 │ (Project Creator verifies)                          │
 │                                                      │
 │──Verify─────►│             │            │            │
 │  Contrib     │             │            │            │
 │              │             │            │            │
 │              │──POST──────►│            │            │
 │              │  /verify    │            │            │
 │              │  + weight   │            │            │
 │              │             │            │            │
 │              │             │──Update───►│            │
 │              │             │  (verified,│            │
 │              │             │   weight)  │            │
 │              │             │            │            │
 │              │◄──Verified─│            │            │
 │              │             │            │            │
 │──Issue──────►│             │            │            │
 │  Credential  │             │            │            │
 │              │             │            │            │
 │              │──POST──────►│            │            │
 │              │  /issue-    │            │            │
 │              │  credential │            │            │
 │              │             │            │            │
 │              │             │──Create───►│            │
 │              │             │  W3C VC    │            │
 │              │             │            │            │
 │              │             │──Upload───►│            │
 │              │             │  to IPFS   │            │
 │              │             │            │            │
 │              │             │◄──CID─────│            │
 │              │             │            │            │
 │              │             │──Update───►│            │
 │              │             │  (credCid) │            │
 │              │             │            │            │
 │              │◄──Credential│            │            │
 │              │   Issued    │            │            │
 │◄──Success───│             │            │            │
```

## Data Flow Diagram

```
┌──────────────┐
│   User       │
│   Wallet     │
└──────┬───────┘
       │
       │ Signs transactions
       │ & messages
       │
┌──────▼────────────────────────────────────────────┐
│              Frontend Application                 │
│                                                    │
│  ┌──────────────┐         ┌──────────────┐       │
│  │ Web3Context  │◄───────►│ AuthContext  │       │
│  │ - Provider   │         │ - User       │       │
│  │ - Signer     │         │ - Token      │       │
│  │ - Account    │         │ - Login      │       │
│  └──────────────┘         └──────────────┘       │
│         │                        │                │
│         │                        │                │
│  ┌──────▼────────────────────────▼──────┐        │
│  │      Contract Helpers                │        │
│  │  - getTokenBalance()                 │        │
│  │  - castVote()                        │        │
│  │  - donateToProject()                 │        │
│  └──────────────────────────────────────┘        │
└────────┬──────────────────────┬──────────────────┘
         │                      │
         │ REST API             │ Web3 RPC
         │                      │
┌────────▼──────────┐  ┌────────▼──────────────────┐
│   Backend API     │  │   Smart Contracts         │
│                   │  │                           │
│  Controllers      │  │  ┌─────────────────────┐  │
│  ├─ Auth          │  │  │ GovernanceToken     │  │
│  ├─ Projects      │  │  │ - balanceOf()       │  │
│  └─ Contributions │  │  │ - transfer()        │  │
│                   │  │  └─────────────────────┘  │
│  Utils            │  │                           │
│  ├─ Blockchain◄───┼──┤  ┌─────────────────────┐  │
│  └─ IPFS          │  │  │ ProposalNFT         │  │
│                   │  │  │ - safeMint()        │  │
│  Models           │  │  │ - tokenURI()        │  │
│  ├─ User          │  │  └─────────────────────┘  │
│  ├─ Project       │  │                           │
│  └─ Contribution  │  │  ┌─────────────────────┐  │
│                   │  │  │ GrantManager        │  │
└────────┬──────────┘  │  │ - startVote()       │  │
         │             │  │ - castVote()        │  │
         │             │  │ - executeGrant()    │  │
┌────────▼──────────┐  │  └─────────────────────┘  │
│   MongoDB         │  └───────────────────────────┘
│                   │
│  Collections:     │  ┌───────────────────────────┐
│  - users          │  │   IPFS (Pinata)           │
│  - projects       │◄─┤                           │
│  - contributions  │  │  - Project metadata       │
│                   │  │  - NFT metadata           │
└───────────────────┘  │  - Verifiable credentials │
                       └───────────────────────────┘
```

## Technology Stack Details

### Frontend Layer
```
React 18.3.1
├── TypeScript 5.5.3
├── Vite 5.4.2 (Build tool)
├── TailwindCSS 3.4.1 (Styling)
├── React Router 7.8.2 (Navigation)
├── ethers.js 6.15.0 (Blockchain)
├── axios 1.12.0 (HTTP client)
├── react-hot-toast 2.6.0 (Notifications)
└── lucide-react 0.344.0 (Icons)
```

### Backend Layer
```
Node.js + Express 5.1.0
├── MongoDB 8.18.0 (Database)
├── Mongoose (ODM)
├── ethers.js 6.15.0 (Blockchain)
├── jsonwebtoken 9.0.2 (Auth)
├── axios 1.11.0 (HTTP client)
├── form-data 4.0.4 (File uploads)
└── dotenv 17.2.2 (Config)
```

### Blockchain Layer
```
Hardhat 2.26.3
├── Solidity 0.8.20
├── OpenZeppelin Contracts 5.4.0
│   ├── ERC20
│   ├── ERC721
│   ├── Ownable
│   └── ERC721URIStorage
├── ethers.js 6.15.0
└── Hardhat Toolbox 6.1.0
```

## Security Architecture

### Authentication Flow
```
1. User connects wallet (MetaMask)
2. Backend generates unique nonce
3. User signs nonce with private key
4. Backend verifies signature
5. Backend issues JWT token
6. Token used for subsequent API calls
```

### Authorization Layers
```
Smart Contracts:
├── Ownable (Admin functions)
├── Signature verification (PoC)
└── Balance checks (Token voting)

Backend:
├── JWT middleware
├── User ownership checks
└── Admin role checks

Frontend:
├── Wallet connection required
└── UI based on auth state
```

## Deployment Architecture

### Development
```
Localhost:
├── Frontend: http://localhost:5173
├── Backend: http://localhost:3000
├── Blockchain: http://localhost:8545 (Hardhat)
└── MongoDB: mongodb://localhost:27017
```

### Production (Recommended)
```
Frontend:
├── Vercel/Netlify
└── CDN for static assets

Backend:
├── AWS/Heroku/DigitalOcean
├── MongoDB Atlas
└── Redis for caching

Blockchain:
├── Ethereum Mainnet/L2
├── Infura/Alchemy RPC
└── Contract verification on Etherscan

IPFS:
├── Pinata (primary)
└── Own IPFS node (backup)
```

## Scalability Considerations

### Current Limitations
- Single backend server
- No caching layer
- Direct blockchain queries
- No event indexing

### Recommended Improvements
```
┌─────────────────────────────────────────┐
│          Load Balancer                  │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Backend│ │Backend│  (Multiple instances)
│   1   │ │   2   │
└───┬───┘ └──┬────┘
    │        │
    └────┬───┘
         │
    ┌────▼────┐
    │  Redis  │  (Caching)
    └────┬────┘
         │
    ┌────▼────┐
    │ MongoDB │  (Replica Set)
    └─────────┘

┌─────────────────────────────────────────┐
│         The Graph                       │
│    (Blockchain Event Indexing)          │
└─────────────────────────────────────────┘
```

## Conclusion

The DMCGP architecture is designed for:
- **Modularity**: Clear separation of concerns
- **Scalability**: Can be scaled horizontally
- **Security**: Multiple layers of protection
- **Maintainability**: Well-documented and organized
- **Extensibility**: Easy to add new features

All components work together seamlessly to provide a complete decentralized funding platform.
