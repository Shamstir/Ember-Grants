import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: [true, 'Wallet address is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    nonce: {
        type: String
    },
    username: {
        type: String,
        trim: true
    }
}, {timestamps: true});

export default mongoose.model('User',userSchema);