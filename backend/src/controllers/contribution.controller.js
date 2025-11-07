import Contribution from '../models/contribution.model.js';
import { uploadJSONToIPFS } from '../utils/ipfs.js';
import { generateContributionSignature } from '../utils/blockchain.js';

// Submit a contribution
export const submitContribution = async (req, res) => {
    const { projectId, contributionType, description, proofUrl } = req.body;

    if (!projectId || !contributionType || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const contribution = new Contribution({
            contributor: req.user.id,
            project: projectId,
            contributionType,
            description,
            proofUrl,
        });

        await contribution.save();

        res.status(201).json({
            message: 'Contribution submitted successfully',
            contribution,
        });
    } catch (error) {
        console.error('Error submitting contribution:', error);
        res.status(500).json({ message: 'Error submitting contribution' });
    }
};

// Get all contributions for a project
export const getProjectContributions = async (req, res) => {
    const { projectId } = req.params;

    try {
        const contributions = await Contribution.find({ project: projectId })
            .populate('contributor', 'walletAddress username')
            .populate('verifiedBy', 'walletAddress username')
            .sort({ createdAt: -1 });

        res.status(200).json(contributions);
    } catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ message: 'Error fetching contributions' });
    }
};

// Get user's contributions
export const getUserContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find({ contributor: req.user.id })
            .populate('project', 'title description')
            .populate('verifiedBy', 'walletAddress username')
            .sort({ createdAt: -1 });

        res.status(200).json(contributions);
    } catch (error) {
        console.error('Error fetching user contributions:', error);
        res.status(500).json({ message: 'Error fetching contributions' });
    }
};

// Verify a contribution (admin/project creator)
export const verifyContribution = async (req, res) => {
    const { contributionId, weight, status } = req.body;

    if (!contributionId || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const contribution = await Contribution.findById(contributionId).populate('project');
        
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Check authorization (project creator or admin)
        if (contribution.project.creator.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to verify this contribution' });
        }

        contribution.status = status;
        contribution.verifiedBy = req.user.id;
        contribution.verifiedAt = new Date();

        if (status === 'verified' && weight) {
            contribution.weight = weight;
        }

        await contribution.save();

        res.status(200).json({
            message: 'Contribution verified successfully',
            contribution,
        });
    } catch (error) {
        console.error('Error verifying contribution:', error);
        res.status(500).json({ message: 'Error verifying contribution' });
    }
};

// Issue verifiable credential for a contribution
export const issueCredential = async (req, res) => {
    const { contributionId } = req.body;

    try {
        const contribution = await Contribution.findById(contributionId)
            .populate('contributor', 'walletAddress username')
            .populate('project', 'title description');

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        if (contribution.status !== 'verified') {
            return res.status(400).json({ message: 'Contribution must be verified first' });
        }

        if (contribution.credentialIssued) {
            return res.status(400).json({ message: 'Credential already issued' });
        }

        // Create W3C Verifiable Credential format
        const credential = {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://www.w3.org/2018/credentials/examples/v1'
            ],
            type: ['VerifiableCredential', 'ContributionCredential'],
            issuer: {
                id: 'did:dmcgp:platform',
                name: 'DMCGP Platform'
            },
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: `did:dmcgp:${contribution.contributor.walletAddress}`,
                walletAddress: contribution.contributor.walletAddress,
                username: contribution.contributor.username,
                contribution: {
                    type: contribution.contributionType,
                    description: contribution.description,
                    project: {
                        title: contribution.project.title,
                        id: contribution.project._id.toString()
                    },
                    weight: contribution.weight,
                    verifiedAt: contribution.verifiedAt,
                    proofUrl: contribution.proofUrl
                }
            }
        };

        // Upload credential to IPFS
        const credentialCid = await uploadJSONToIPFS(credential);

        // Update contribution
        contribution.credentialIssued = true;
        contribution.credentialCid = credentialCid;
        await contribution.save();

        res.status(200).json({
            message: 'Credential issued successfully',
            credential,
            ipfsCid: credentialCid,
            ipfsUrl: `https://ipfs.io/ipfs/${credentialCid}`
        });
    } catch (error) {
        console.error('Error issuing credential:', error);
        res.status(500).json({ message: 'Error issuing credential', error: error.message });
    }
};

// Get contribution weight signature for voting
export const getContributionSignature = async (req, res) => {
    const { nftId, contributorAddress } = req.body;

    try {
        // Calculate total contribution weight for user on this project
        const contributions = await Contribution.find({
            contributor: req.user.id,
            status: 'verified',
            credentialIssued: true
        });

        const totalWeight = contributions.reduce((sum, c) => sum + c.weight, 0);

        // Generate signature
        const signature = await generateContributionSignature(
            nftId,
            contributorAddress,
            totalWeight
        );

        res.status(200).json({
            contributionWeight: totalWeight,
            signature,
        });
    } catch (error) {
        console.error('Error generating contribution signature:', error);
        res.status(500).json({ message: 'Error generating signature', error: error.message });
    }
};
