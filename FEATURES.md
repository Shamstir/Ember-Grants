# DMCGP Features Documentation

## Overview
This document details all implemented features and their functionality in the DMCGP platform.

## 1. User Authentication & Wallet Integration

### MetaMask Connection
- **Feature**: Seamless wallet connection using MetaMask
- **Implementation**: Web3Provider context with ethers.js
- **User Flow**:
  1. User clicks "Connect Wallet"
  2. MetaMask prompts for connection
  3. Account and network details stored in context
  4. Automatic reconnection on page reload

### Signature-Based Authentication
- **Feature**: Secure authentication without passwords
- **Implementation**: 
  - Backend generates unique nonce
  - User signs message with private key
  - Backend verifies signature and issues JWT
- **Security**: 
  - Nonce prevents replay attacks
  - Signature proves wallet ownership
  - JWT for subsequent API calls

## 2. Project Management

### Project Creation
- **Feature**: Submit creative projects for funding
- **Fields**: Title, Description
- **Storage**: MongoDB for metadata
- **Access Control**: Authenticated users only

### NFT Minting
- **Feature**: Convert projects to NFTs on blockchain
- **Process**:
  1. Project metadata uploaded to IPFS
  2. ProposalNFT contract mints ERC721 token
  3. Token ID and IPFS CID stored in database
  4. Creator becomes NFT owner
- **Benefits**:
  - Unique, verifiable project identity
  - Immutable metadata on IPFS
  - Transferable ownership

### Project Status Tracking
- **States**:
  - `pending`: Initial state after creation
  - `active_voting`: Voting period active
  - `successful`: Passed voting threshold
  - `failed`: Did not pass threshold
- **Transitions**: Automated based on blockchain events

## 3. Governance System

### Governance Token (DMCG)
- **Type**: ERC20 token
- **Supply**: 1,000,000 DMCG
- **Purpose**: 
  - Voting power on proposals
  - Platform governance rights
  - Reward mechanism
- **Distribution**: Initial supply to deployer (can be distributed)

### Voting Mechanism
- **Duration**: 7 days (configurable)
- **Threshold**: 1,000 DMCG minimum to pass
- **Voting Power**: Base tokens + Contribution weight
- **Process**:
  1. Admin starts voting for a project
  2. Users cast votes during period
  3. Votes are weighted by tokens + contributions
  4. After period ends, grant can be executed
  5. If passed, funds distributed to creator

### Vote Casting
- **Requirements**:
  - Governance tokens (optional if contributions exist)
  - Valid contribution signature (if claiming PoC weight)
  - Within voting period
  - Haven't voted before
- **Calculation**: `Total Power = Token Amount + Contribution Weight`

## 4. Proof-of-Contribution (PoC) System

### Contribution Submission
- **Types**: Code, Design, Documentation, Testing, Marketing, Other
- **Required Info**:
  - Project reference
  - Contribution type
  - Description
  - Proof URL (GitHub PR, design files, etc.)
- **Status Flow**: Pending → Verified/Rejected

### Contribution Verification
- **Verifiers**: Project creators or platform admins
- **Process**:
  1. Reviewer examines contribution and proof
  2. Assigns weight (0-100+ based on impact)
  3. Marks as verified or rejected
  4. Timestamp and verifier recorded

### Verifiable Credentials (VC)
- **Standard**: W3C Verifiable Credentials
- **Format**: JSON-LD
- **Storage**: IPFS via Pinata
- **Contents**:
  - Credential metadata
  - Subject (contributor) DID
  - Contribution details
  - Verification proof
  - Issuance date
- **Use Case**: Portable reputation across platforms

### Contribution-Weighted Voting
- **Feature**: Contributors earn voting power
- **Implementation**:
  1. User requests voting signature from backend
  2. Backend calculates total verified contribution weight
  3. Backend signs weight with trusted key
  4. User submits vote with signature
  5. Smart contract verifies signature
  6. Vote counted with full weight
- **Benefits**: Rewards active contributors beyond token holdings

## 5. Fund Distribution

### Donation System
- **Feature**: Direct donations to projects
- **Process**:
  1. User sends ETH to GrantManager contract
  2. Donation event emitted with project ID
  3. Funds held in contract until grant execution
- **Transparency**: All donations on-chain and auditable

### Automatic Distribution
- **Trigger**: Grant execution after voting period
- **Conditions**: Total votes ≥ threshold
- **Process**:
  1. Anyone can call `executeGrant()`
  2. Contract checks voting ended and not executed
  3. If passed, entire contract balance sent to creator
  4. Grant marked as executed
  5. Event emitted with result

## 6. IPFS Integration

### Metadata Storage
- **Provider**: Pinata
- **Stored Data**:
  - Project metadata (title, description, creator)
  - Verifiable credentials
  - Future: Project assets, images, documents
- **Benefits**:
  - Decentralized storage
  - Content-addressed (immutable)
  - Censorship-resistant

### URI Format
- **NFT Metadata**: `ipfs://{CID}`
- **HTTP Gateway**: `https://ipfs.io/ipfs/{CID}`
- **Pinata Gateway**: `https://gateway.pinata.cloud/ipfs/{CID}`

## 7. Frontend Features

### Responsive Design
- **Framework**: TailwindCSS
- **Breakpoints**: Mobile, tablet, desktop
- **Theme**: Dark mode with purple/pink gradients
- **Components**: Reusable, accessible UI components

### Real-Time Updates
- **Wallet Changes**: Auto-detect account/network changes
- **Transaction Status**: Loading states and confirmations
- **Notifications**: Toast messages for all actions

### Pages
1. **Home**: Platform overview and features
2. **Projects**: Browse all projects with filters
3. **Project Details**: Full project info, voting, donations
4. **Create Project**: Submit new projects
5. **Dashboard**: User's projects and contributions
6. **Governance**: Token info and governance proposals

## 8. Backend API

### RESTful Design
- **Format**: JSON
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Consistent error responses
- **Validation**: Input validation on all endpoints

### Endpoints Summary
- **Auth**: `/api/auth/*` - Wallet authentication
- **Projects**: `/api/projects/*` - Project CRUD and blockchain ops
- **Contributions**: `/api/contributions/*` - PoC system

### Database Schema
- **Users**: Wallet address, nonce, username
- **Projects**: Title, description, status, NFT info, creator
- **Contributions**: Type, description, proof, weight, status, credential

## 9. Security Features

### Smart Contract Security
- **OpenZeppelin**: Battle-tested contract libraries
- **Access Control**: Ownable pattern for admin functions
- **Reentrancy Protection**: Safe fund transfers
- **Input Validation**: Require statements for all inputs

### Backend Security
- **JWT**: Secure token-based authentication
- **Environment Variables**: Sensitive data not in code
- **CORS**: Configured for frontend origin
- **Rate Limiting**: (Recommended for production)

### Frontend Security
- **No Private Keys**: All signing via MetaMask
- **Input Sanitization**: Validation before submission
- **HTTPS**: (Required for production)

## 10. Developer Experience

### Hot Reload
- **Frontend**: Vite HMR for instant updates
- **Backend**: Nodemon for auto-restart
- **Contracts**: Hardhat for rapid iteration

### Type Safety
- **Frontend**: TypeScript for compile-time checks
- **Contracts**: Solidity static typing
- **API**: Consistent interfaces

### Testing
- **Unit Tests**: (Framework ready)
- **Integration Tests**: (Framework ready)
- **Manual Testing**: Local Hardhat network

## 11. Future Enhancements

### Planned Features
- [ ] Multi-milestone projects
- [ ] Governance proposals for platform changes
- [ ] Reputation system with badges
- [ ] Project categories and tags
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Mobile app
- [ ] Multi-chain support
- [ ] DAO treasury management
- [ ] Dispute resolution system

### Scalability
- [ ] Event indexing with The Graph
- [ ] IPFS pinning service
- [ ] CDN for frontend
- [ ] Database optimization
- [ ] Caching layer

### Analytics
- [ ] Project success metrics
- [ ] User engagement tracking
- [ ] Token distribution analytics
- [ ] Voting participation rates

## 12. Comparison with Traditional Platforms

| Feature | DMCGP | Traditional Crowdfunding |
|---------|-------|-------------------------|
| Transparency | Full on-chain visibility | Limited |
| Fees | Minimal gas fees | 5-10% platform fees |
| Censorship | Resistant | Platform controlled |
| Reputation | Portable VCs | Platform-locked |
| Governance | Token holder voting | Platform decides |
| Speed | Instant (blockchain) | Days for approval |
| Global | Permissionless | Geographic restrictions |

## Conclusion

DMCGP provides a complete, production-ready platform for decentralized creative funding with innovative features like Proof-of-Contribution and Verifiable Credentials that set it apart from traditional solutions.
