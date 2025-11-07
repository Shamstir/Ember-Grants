import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const forceStartVoting = async () => {
    try {
        console.log('🚀 Force Starting Voting for Proposal 0...\n');

        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Check connection
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Connected to blockchain. Block: ${blockNumber}`);

        const grantManagerAddress = process.env.GRANT_MANAGER_ADDRESS;
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        
        console.log(`📜 GrantManager: ${grantManagerAddress}`);
        console.log(`👤 Admin: ${new ethers.Wallet(privateKey).address}\n`);

        const GRANT_MANAGER_ABI = [
            "function startVote(uint256 _nftId) public",
            "function grantProposals(uint256) view returns (uint256 nftId, uint256 endTime, uint256 totalVotes, bool executed, address creator)",
        ];

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(grantManagerAddress, GRANT_MANAGER_ABI, wallet);

        // First, check current state
        console.log('🔍 Checking current state of Proposal 0...');
        try {
            const proposal = await contract.grantProposals(0);
            if (proposal.endTime.toString() !== '0') {
                console.log('✅ Proposal 0 already exists!');
                console.log({
                    endTime: proposal.endTime.toString(),
                    totalVotes: ethers.formatEther(proposal.totalVotes),
                    creator: proposal.creator
                });
                console.log('\n✅ Voting already started. No action needed.');
                process.exit(0);
            } else {
                console.log('⚠️ Proposal found but endTime is 0');
            }
        } catch (error) {
            console.log('❌ Proposal 0 not found on blockchain\n');
        }

        // Start voting
        console.log('🗳️ Calling startVote(0)...');
        try {
            const tx = await contract.startVote(0);
            console.log(`📝 Transaction sent: ${tx.hash}`);
            console.log('⏳ Waiting for confirmation...');
            
            const receipt = await tx.wait();
            console.log(`✅ Transaction mined in block ${receipt.blockNumber}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            console.log(`✅ Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}\n`);

            if (receipt.status !== 1) {
                console.log('❌ Transaction was mined but FAILED (reverted)');
                process.exit(1);
            }

            // Verify it worked
            console.log('🔍 Verifying proposal was created...');
            const proposal = await contract.grantProposals(0);
            console.log('✅ Proposal 0 verified on blockchain!');
            console.log({
                nftId: proposal.nftId.toString(),
                endTime: proposal.endTime.toString(),
                totalVotes: ethers.formatEther(proposal.totalVotes),
                executed: proposal.executed,
                creator: proposal.creator
            });

            const endDate = new Date(Number(proposal.endTime) * 1000);
            console.log(`\n📅 Voting period ends: ${endDate.toLocaleString()}`);
            console.log('\n✅ SUCCESS! Voting has been started.');

        } catch (error) {
            console.error('❌ Failed to start voting:', error.message);
            if (error.reason) {
                console.error('Reason:', error.reason);
            }
            process.exit(1);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

forceStartVoting();
