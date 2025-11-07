import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const checkBlockchain = async () => {
    try {
        console.log('🔍 Checking Blockchain State...\n');

        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        console.log(`📡 RPC URL: ${rpcUrl}`);
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Test connection
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Connected! Current block: ${blockNumber}\n`);

        const grantManagerAddress = process.env.GRANT_MANAGER_ADDRESS;
        console.log(`📜 GrantManager Address: ${grantManagerAddress}`);

        const GRANT_MANAGER_ABI = [
            "function grantProposals(uint256) view returns (uint256 nftId, uint256 endTime, uint256 totalVotes, bool executed, address creator)",
        ];

        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(grantManagerAddress, GRANT_MANAGER_ABI, wallet);

        console.log('\n🗳️ Checking Proposal 0...');
        try {
            const proposal = await contract.grantProposals(0);
            console.log('✅ Proposal 0 found!');
            console.log({
                nftId: proposal.nftId.toString(),
                endTime: proposal.endTime.toString(),
                totalVotes: ethers.formatEther(proposal.totalVotes),
                executed: proposal.executed,
                creator: proposal.creator
            });
            
            if (proposal.endTime.toString() === '0') {
                console.log('\n⚠️ WARNING: Proposal exists but endTime is 0 - voting not started!');
            } else {
                const endDate = new Date(Number(proposal.endTime) * 1000);
                console.log(`\n📅 Voting ends: ${endDate.toLocaleString()}`);
            }
        } catch (error) {
            console.log('❌ Proposal 0 not found!');
            console.log('Error:', error.message);
            console.log('\nThis means startVote() has NOT been called for token ID 0.');
        }

        console.log('\n✅ Diagnostic complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkBlockchain();
