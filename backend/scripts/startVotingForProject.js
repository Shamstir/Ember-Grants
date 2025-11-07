import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/project.model.js';
import { startVoting, getProposalStats } from '../src/utils/blockchain.js';

dotenv.config();

const startVotingManually = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all projects that have NFT but voting not started
        const projects = await Project.find({ 
            nftTokenId: { $exists: true, $ne: null },
            status: { $ne: 'active_voting' }
        });

        console.log(`\nFound ${projects.length} projects with NFT but no active voting\n`);

        for (const project of projects) {
            console.log(`\n📋 Project: "${project.title}"`);
            console.log(`   NFT Token ID: ${project.nftTokenId}`);
            console.log(`   Current Status: ${project.status}`);

            // Check if voting already exists on blockchain
            const stats = await getProposalStats(project.nftTokenId);
            
            if (stats.success && stats.votingStarted) {
                console.log(`   ✅ Voting already exists on blockchain, updating DB status...`);
                project.status = 'active_voting';
                await project.save();
                console.log(`   ✅ Status updated to active_voting`);
            } else {
                console.log(`   🗳️ Starting voting on blockchain...`);
                const voteResult = await startVoting(project.nftTokenId);
                
                if (voteResult.success) {
                    project.status = 'active_voting';
                    await project.save();
                    console.log(`   ✅ Voting started! TxHash: ${voteResult.txHash}`);
                } else {
                    console.log(`   ❌ Failed: ${voteResult.error}`);
                }
            }
        }

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

startVotingManually();
