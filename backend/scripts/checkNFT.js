import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const checkNFT = async () => {
    try {
        console.log('🔍 Checking NFT State...\n');

        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        const proposalNFTAddress = process.env.PROPOSAL_NFT_ADDRESS;
        const grantManagerAddress = process.env.GRANT_MANAGER_ADDRESS;
        
        console.log(`📜 ProposalNFT: ${proposalNFTAddress}`);
        console.log(`📜 GrantManager: ${grantManagerAddress}\n`);

        const NFT_ABI = [
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function owner() view returns (address)",
        ];

        const GRANT_MANAGER_ABI = [
            "function owner() view returns (address)",
        ];

        const nftContract = new ethers.Contract(proposalNFTAddress, NFT_ABI, provider);
        const grantManager = new ethers.Contract(grantManagerAddress, GRANT_MANAGER_ABI, provider);

        // Check who owns the NFT contract
        console.log('🔍 Checking ProposalNFT contract owner...');
        try {
            const nftOwner = await nftContract.owner();
            console.log(`👤 ProposalNFT owner: ${nftOwner}`);
            console.log(`${nftOwner === grantManagerAddress ? '✅' : '❌'} ${nftOwner === grantManagerAddress ? 'GrantManager IS the owner (correct!)' : 'GrantManager is NOT the owner (PROBLEM!)'}\n`);
        } catch (error) {
            console.log('❌ Could not get owner\n');
        }

        // Check who owns the GrantManager
        console.log('🔍 Checking GrantManager contract owner...');
        try {
            const gmOwner = await grantManager.owner();
            console.log(`👤 GrantManager owner: ${gmOwner}`);
            console.log(`👤 Admin wallet: ${new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY).address}`);
            console.log(`${gmOwner === new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY).address ? '✅' : '❌'} ${gmOwner === new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY).address ? 'Admin IS the owner (correct!)' : 'Admin is NOT the owner (PROBLEM!)'}\n`);
        } catch (error) {
            console.log('❌ Could not get owner\n');
        }

        // Check if NFT 0 exists
        console.log('🔍 Checking if NFT Token ID 0 exists...');
        try {
            const owner = await nftContract.ownerOf(0);
            console.log(`✅ NFT Token 0 EXISTS!`);
            console.log(`👤 Owner: ${owner}\n`);
        } catch (error) {
            console.log(`❌ NFT Token 0 DOES NOT EXIST!`);
            console.log(`   Error: ${error.reason || error.message}\n`);
            console.log('❗ This is the problem! The NFT was never actually minted on the blockchain.');
            console.log('   Even though the backend logs say it was minted, the blockchain has no record of it.');
            console.log('\n💡 SOLUTION: The blockchain state was likely reset. You need to:');
            console.log('   1. Make sure Hardhat node is running persistently');
            console.log('   2. Redeploy contracts if node was restarted');
            console.log('   3. Create a new project (which will mint a new NFT)\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkNFT();
