import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
    contributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    contributionType: {
        type: String,
        enum: ['code', 'design', 'documentation', 'testing', 'marketing', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    proofUrl: {
        type: String, // Link to GitHub PR, design files, etc.
    },
    weight: {
        type: Number,
        default: 0, // Contribution weight for voting power
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    credentialIssued: {
        type: Boolean,
        default: false
    },
    credentialCid: {
        type: String // IPFS CID of the verifiable credential
    }
}, { timestamps: true });

export default mongoose.model('Contribution', contributionSchema);
