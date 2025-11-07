import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import { uploadJSONToIPFS } from '../utils/ipfs.js';
import { mintProposalNFT, startVoting, getProposalStats } from '../utils/blockchain.js';

export const getAllProjects = async (req, res) => {
    try {
        const Projects = await Project.find().populate('creator', 'walletAddress username').sort({createdAt: -1});
        res.status(200).json(Projects);
    } catch(error) {
        res.status(500).json({message: 'Error fetching projects'});
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('creator', 'walletAddress username');
        if (!project) {
            return res.status(404).json({message: 'No project found'});
        }
        res.status(200).json(project);
    } catch(error) {
        res.status(500).json({message: 'Error fetching the project'});
    }
};

export const createProject = async (req, res) => {
    const {title, description, imageUrl, autoMint = true} = req.body;
    if (!title || !description) {
        return res.status(400).json({message: 'Title or description are required'});
    }
    try {
        // Get user with wallet address
        const user = await User.findById(req.user.id);
        if (!user || !user.walletAddress) {
            return res.status(400).json({message: 'User wallet address not found'});
        }

        const newProject = new Project({
            title,
            description,
            imageUrl: imageUrl || null,
            creator: req.user.id
        });
        await newProject.save();

        // Automatically mint NFT if autoMint is true (default)
        if (autoMint) {
            try {
                // Upload metadata to IPFS
                const metadata = {
                    name: title,
                    description: description,
                    image: imageUrl || '',
                    creator: user.walletAddress,
                    createdAt: newProject.createdAt,
                };

                const ipfsCid = await uploadJSONToIPFS(metadata);
                const ipfsUri = `ipfs://${ipfsCid}`;

                // Mint NFT
                const mintResult = await mintProposalNFT(user.walletAddress, ipfsUri);
                
                if (mintResult.success) {
                    // Update project with NFT info
                    newProject.nftTokenId = mintResult.tokenId;
                    newProject.ipfsCid = ipfsCid;
                    newProject.contractAddress = process.env.PROPOSAL_NFT_ADDRESS;
                    await newProject.save();
                    console.log(`✅ Project saved with NFT Token ID: ${newProject.nftTokenId} (type: ${typeof newProject.nftTokenId})`);

                    // Automatically start voting
                    console.log(`🗳️ Starting voting for NFT Token ID: ${newProject.nftTokenId}`);
                    const voteResult = await startVoting(newProject.nftTokenId);
                    if (voteResult.success) {
                        newProject.status = 'active_voting';
                        await newProject.save();
                        console.log(`✅ Voting started successfully for project: ${newProject.title}`);
                    } else {
                        console.error(`❌ Failed to start voting: ${voteResult.error}`);
                    }
                }
            } catch (mintError) {
                console.error('Auto-mint failed:', mintError);
                // Project is still created, just not minted
            }
        }

        // Populate creator info before sending response
        await newProject.populate('creator', 'walletAddress username');

        res.status(201).json({
            message: 'Project created successfully',
            project: newProject
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Error creating Project'});
    }
};

export const mintProjectNFT = async (req, res) => {
    const { projectId } = req.body;
    
    try {
        const project = await Project.findById(projectId).populate('creator', 'walletAddress');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.creator._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (project.nftTokenId) {
            return res.status(400).json({ message: 'NFT already minted for this project' });
        }

        // Upload metadata to IPFS
        const metadata = {
            name: project.title,
            description: project.description,
            creator: project.creator.walletAddress,
            createdAt: project.createdAt,
        };

        const ipfsCid = await uploadJSONToIPFS(metadata);
        const ipfsUri = `ipfs://${ipfsCid}`;

        // Mint NFT
        const mintResult = await mintProposalNFT(project.creator.walletAddress, ipfsUri);
        
        if (!mintResult.success) {
            return res.status(500).json({ message: 'Failed to mint NFT', error: mintResult.error });
        }

        // Update project with NFT info
        project.nftTokenId = mintResult.tokenId;
        project.ipfsCid = ipfsCid;
        project.contractAddress = process.env.PROPOSAL_NFT_ADDRESS;
        await project.save();

        res.status(200).json({
            message: 'NFT minted successfully',
            project,
            txHash: mintResult.txHash,
        });
    } catch (error) {
        console.error('Error minting NFT:', error);
        res.status(500).json({ message: 'Error minting NFT', error: error.message });
    }
};

export const initiateVoting = async (req, res) => {
    const { projectId } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.nftTokenId === undefined || project.nftTokenId === null) {
            return res.status(400).json({ message: 'Project NFT not minted yet' });
        }

        // Check if voting actually exists on blockchain
        const stats = await getProposalStats(project.nftTokenId);
        if (stats.success && stats.votingStarted) {
            return res.status(400).json({ message: 'Voting already active for this project on blockchain' });
        }

        // Start voting on blockchain
        console.log(`🗳️ Manually starting voting for NFT Token ID: ${project.nftTokenId}`);
        const voteResult = await startVoting(project.nftTokenId);
        
        if (!voteResult.success) {
            return res.status(500).json({ message: 'Failed to start voting', error: voteResult.error });
        }

        // Update project status
        project.status = 'active_voting';
        await project.save();
        console.log(`✅ Voting started successfully for project: ${project.title}`);

        res.status(200).json({
            message: 'Voting started successfully',
            project,
            txHash: voteResult.txHash,
        });
    } catch (error) {
        console.error('Error starting voting:', error);
        res.status(500).json({ message: 'Error starting voting', error: error.message });
    }
};

// Delete a project (only owner can delete, and only if status is pending)
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    
    try {
        const project = await Project.findById(id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Check if user is the project creator
        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own projects' });
        }
        
        // Only allow deleting pending projects (not minted yet)
        if (project.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot delete a project that has been minted as NFT' });
        }
        
        await Project.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project' });
    }
};

// Get project statistics from blockchain
export const getProjectStats = async (req, res) => {
    const { id } = req.params;
    
    try {
        const project = await Project.findById(id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.nftTokenId === undefined || project.nftTokenId === null) {
            return res.status(400).json({ message: 'Project NFT not yet minted' });
        }

        const stats = await getProposalStats(project.nftTokenId);
        
        res.status(200).json({
            projectId: id,
            nftTokenId: project.nftTokenId,
            ...stats,
        });
    } catch (error) {
        console.error('Error fetching project stats:', error);
        res.status(500).json({ message: 'Error fetching project statistics' });
    }
};