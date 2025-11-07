import { ethers, Contract } from 'ethers';
import { GOVERNANCE_TOKEN_ABI, PROPOSAL_NFT_ABI, GRANT_MANAGER_ABI } from './abis';

const GOVERNANCE_TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS_GOVERNANCE || '';
const PROPOSAL_NFT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS_PROPOSAL_NFT || '';
const GRANT_MANAGER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS_GRANT_MANAGER || '';

export const getGovernanceTokenContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new Contract(GOVERNANCE_TOKEN_ADDRESS, GOVERNANCE_TOKEN_ABI, signerOrProvider);
};

export const getProposalNFTContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new Contract(PROPOSAL_NFT_ADDRESS, PROPOSAL_NFT_ABI, signerOrProvider);
};

export const getGrantManagerContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new Contract(GRANT_MANAGER_ADDRESS, GRANT_MANAGER_ABI, signerOrProvider);
};

// Helper functions for contract interactions
export const getTokenBalance = async (address: string, provider: ethers.Provider): Promise<string> => {
  try {
    const contract = getGovernanceTokenContract(provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

export const getProposalDetails = async (nftId: number, provider: ethers.Provider) => {
  try {
    const contract = getGrantManagerContract(provider);
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

export const hasUserVoted = async (nftId: number, userAddress: string, provider: ethers.Provider): Promise<boolean> => {
  try {
    const contract = getGrantManagerContract(provider);
    return await contract.hasVoted(nftId, userAddress);
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
};

export const donateToProject = async (nftId: number, amount: string, signer: ethers.Signer) => {
  try {
    const contract = getGrantManagerContract(signer);
    const tx = await contract.donateToProposal(nftId, {
      value: ethers.parseEther(amount),
    });
    await tx.wait();
    return { success: true, tx };
  } catch (error: any) {
    console.error('Error donating to project:', error);
    return { success: false, error: error.message };
  }
};

export const castVote = async (
  nftId: number,
  baseVoteAmount: string,
  contributionWeight: string,
  signature: string,
  signer: ethers.Signer
) => {
  try {
    const governanceContract = getGovernanceTokenContract(signer);
    const grantManagerContract = getGrantManagerContract(signer);
    
    // Approve tokens if baseVoteAmount > 0
    if (parseFloat(baseVoteAmount) > 0) {
      const approveTx = await governanceContract.approve(
        GRANT_MANAGER_ADDRESS,
        ethers.parseEther(baseVoteAmount)
      );
      await approveTx.wait();
    }

    // Cast vote
    const voteTx = await grantManagerContract.castVote(
      nftId,
      ethers.parseEther(baseVoteAmount),
      ethers.parseEther(contributionWeight),
      signature
    );
    await voteTx.wait();
    
    return { success: true, tx: voteTx };
  } catch (error: any) {
    console.error('Error casting vote:', error);
    return { success: false, error: error.message };
  }
};

export const executeGrant = async (nftId: number, signer: ethers.Signer) => {
  try {
    const contract = getGrantManagerContract(signer);
    const tx = await contract.executeGrant(nftId);
    await tx.wait();
    return { success: true, tx };
  } catch (error: any) {
    console.error('Error executing grant:', error);
    return { success: false, error: error.message };
  }
};

export const getVotingPeriod = async (provider: ethers.Provider): Promise<number> => {
  try {
    const contract = getGrantManagerContract(provider);
    const period = await contract.VOTING_PERIOD();
    return Number(period);
  } catch (error) {
    console.error('Error getting voting period:', error);
    return 604800; // 7 days default
  }
};

export const getVotingThreshold = async (provider: ethers.Provider): Promise<string> => {
  try {
    const contract = getGrantManagerContract(provider);
    const threshold = await contract.VOTING_THRESHOLD();
    return ethers.formatEther(threshold);
  } catch (error) {
    console.error('Error getting voting threshold:', error);
    return '1000';
  }
};
