import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    status: {
        type: String,
        enum: ['pending', 'active_voting', 'successful', 'failed'],
        default: 'pending'
    },
    ipfsCid: { type: String },
    nftTokenId: { type: Number },
    contractAddress: { type: String }
}, {timestamps: true});

export default mongoose.model('Project', projectSchema);