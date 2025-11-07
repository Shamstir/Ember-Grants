import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const GOVERNANCE_TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
];

const PROPOSAL_NFT_ABI = [
    "function safeMint(address creator, string uri) public",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
];

const GRANT_MANAGER_ABI = [
    "function mintProposal(address creator, string uri) public",
    "function startVote(uint256 _nftId) public",
    "function castVote(uint256 _nftId, uint256 _baseVoteAmount, uint256 _contributionWeight, bytes _signature) public",
    "function donateToProposal(uint256 _nftId) public payable",
    "function grantProposals(uint256) view returns (uint256 nftId, uint256 endTime, uint256 totalVotes, bool executed, address creator)",
    "event Donated(uint256 indexed nftId, address indexed donor, uint256 amount)",
    "event VoteCast(uint256 indexed nftId, address indexed voter, uint256 totalPower)",
];

// Initialize provider
const getProvider = () => {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    return new ethers.JsonRpcProvider(rpcUrl);
};

// Initialize wallet (for admin operations)
const getWallet = () => {
    const provider = getProvider();
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('ADMIN_PRIVATE_KEY not set in environment');
    }
    return new ethers.Wallet(privateKey, provider);
};

// Contract instances
export const getGovernanceTokenContract = () => {
    const wallet = getWallet();
    const address = process.env.GOVERNANCE_TOKEN_ADDRESS;
    if (!address) throw new Error('GOVERNANCE_TOKEN_ADDRESS not set');
    return new ethers.Contract(address, GOVERNANCE_TOKEN_ABI, wallet);
};

export const getProposalNFTContract = () => {
    const wallet = getWallet();
    const address = process.env.PROPOSAL_NFT_ADDRESS;
    if (!address) throw new Error('PROPOSAL_NFT_ADDRESS not set');
    return new ethers.Contract(address, PROPOSAL_NFT_ABI, wallet);
};

export const getGrantManagerContract = () => {
    const wallet = getWallet();
    const address = process.env.GRANT_MANAGER_ADDRESS;
    if (!address) throw new Error('GRANT_MANAGER_ADDRESS not set');
    return new ethers.Contract(address, GRANT_MANAGER_ABI, wallet);
};

// Mint NFT for project proposal - MUST go through GrantManager (it owns ProposalNFT)
export const mintProposalNFT = async (creatorAddress, ipfsUri) => {
    try {
        const grantManager = getGrantManagerContract();
        const proposalNFT = getProposalNFTContract();
        
        // Track the token count to know which ID will be minted
        // ProposalNFT contract starts at 0 and increments
        // We can infer the token ID by counting existing tokens
        let nextTokenId = 0;
        try {
            // Try to get owner of token 0, 1, 2... until we find one that doesn't exist
            while (true) {
                try {
                    await proposalNFT.ownerOf(nextTokenId);
                    nextTokenId++;
                } catch {
                    // Token doesn't exist, this will be the next ID
                    break;
                }
            }
        } catch (error) {
            console.log('Using tokenId 0 as starting point');
        }
        
        console.log(`Minting NFT... Expected Token ID: ${nextTokenId}`);
        const tx = await grantManager.mintProposal(creatorAddress, ipfsUri);
        const receipt = await tx.wait();
        
        console.log('✅ NFT Minted successfully! Token ID:', nextTokenId, 'TxHash:', receipt.hash);
        
        return {
            success: true,
            tokenId: nextTokenId,
            txHash: receipt.hash,
        };
    } catch (error) {
        console.error('Error minting NFT:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Start voting for a proposal
export const startVoting = async (nftId) => {
    try {
        if (nftId === undefined || nftId === null) {
            throw new Error('NFT ID is required');
        }
        
        const contract = getGrantManagerContract();
        // Ensure nftId is a number/BigInt
        const tokenId = typeof nftId === 'string' ? parseInt(nftId) : nftId;
        const tx = await contract.startVote(tokenId);
        const receipt = await tx.wait();
        
        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error) {
        console.error('Error starting vote:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Get user's governance token balance
export const getUserTokenBalance = async (userAddress) => {
    try {
        const contract = getGovernanceTokenContract();
        const balance = await contract.balanceOf(userAddress);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error('Error getting token balance:', error);
        return '0';
    }
};

// Get proposal details from blockchain
export const getProposalDetails = async (nftId) => {
    try {
        const contract = getGrantManagerContract();
        const proposal = await contract.grantProposals(nftId);
        
        return {
            nftId: proposal.nftId.toString(),
            endTime: proposal.endTime.toString(),
            totalVotes: ethers.formatEther(proposal.totalVotes),
            executed: proposal.executed,
            creator: proposal.creator,
        };
    } catch (error) {
        console.error('Error getting proposal details:', error);
        return null;
    }
};

// Generate signature for contribution weight (Proof of Contribution)
export const generateContributionSignature = async (nftId, voterAddress, contributionWeight) => {
    try {
        const wallet = getWallet();
        const messageHash = ethers.solidityPackedKeccak256(
            ['uint256', 'address', 'uint256'],
            [nftId, voterAddress, contributionWeight]
        );
        
        const signature = await wallet.signMessage(ethers.getBytes(messageHash));
        return signature;
    } catch (error) {
        console.error('Error generating signature:', error);
        throw error;
    }
};

// Get proposal statistics (votes and donations)
export const getProposalStats = async (nftId) => {
    try {
        const provider = getProvider();
        const grantManagerAddress = process.env.GRANT_MANAGER_ADDRESS;
        
        if (!grantManagerAddress) {
            throw new Error('GRANT_MANAGER_ADDRESS not set');
        }

        const contract = getGrantManagerContract();
        
        // Get proposal details to get total votes
        let proposal;
        try {
            proposal = await contract.grantProposals(nftId);
            console.log(`✅ Fetched proposal ${nftId}:`, {
                nftId: proposal.nftId.toString(),
                endTime: proposal.endTime.toString(),
                totalVotes: proposal.totalVotes.toString(),
                executed: proposal.executed,
                creator: proposal.creator
            });
        } catch (error) {
            // If we can't decode the result, it means voting hasn't been started yet
            console.log(`❌ Proposal ${nftId} not found or voting not started - Error: ${error.code}`);
            
            // Still check for donations even if voting hasn't started
            try {
                const filter = contract.filters.Donated(nftId);
                const events = await contract.queryFilter(filter);
                
                let totalDonations = ethers.getBigInt(0);
                for (const event of events) {
                    totalDonations += event.args.amount;
                }
                
                console.log(`📊 Found ${events.length} donations totaling ${ethers.formatEther(totalDonations)} ETH`);
                
                return {
                    success: true,
                    votingStarted: false,
                    totalVotes: '0',
                    totalDonations: ethers.formatEther(totalDonations),
                    donorCount: events.length,
                    endTime: '0',
                    executed: false,
                };
            } catch (donationError) {
                console.log(`⚠️ Could not fetch donations: ${donationError.message}`);
                return {
                    success: true,
                    votingStarted: false,
                    totalVotes: '0',
                    totalDonations: '0',
                    donorCount: 0,
                    endTime: '0',
                    executed: false,
                };
            }
        }
        
        // Check if proposal exists (endTime will be 0 if voting hasn't started)
        if (proposal.endTime.toString() === '0') {
            console.log(`⚠️ Proposal ${nftId} exists but endTime is 0 (voting not started)`);
            
            // Still get donations
            const filter = contract.filters.Donated(nftId);
            const events = await contract.queryFilter(filter);
            
            let totalDonations = ethers.getBigInt(0);
            for (const event of events) {
                totalDonations += event.args.amount;
            }
            
            console.log(`📊 Found ${events.length} donations totaling ${ethers.formatEther(totalDonations)} ETH`);
            
            return {
                success: true,
                votingStarted: false,
                totalVotes: '0',
                totalDonations: ethers.formatEther(totalDonations),
                donorCount: events.length,
                endTime: '0',
                executed: false,
            };
        }

        const totalVotes = ethers.formatEther(proposal.totalVotes);

        // Get total donations by querying Donated events for this NFT
        const filter = contract.filters.Donated(nftId);
        const events = await contract.queryFilter(filter);
        
        let totalDonations = ethers.getBigInt(0);
        for (const event of events) {
            totalDonations += event.args.amount;
        }

        return {
            success: true,
            votingStarted: true,
            totalVotes: totalVotes,
            totalDonations: ethers.formatEther(totalDonations),
            donorCount: events.length,
            endTime: proposal.endTime.toString(),
            executed: proposal.executed,
        };
    } catch (error) {
        console.error('Error getting proposal stats:', error);
        return {
            success: false,
            votingStarted: false,
            error: error.message,
            totalVotes: '0',
            totalDonations: '0',
            donorCount: 0,
        };
    }
};
