import {ethers} from 'ethers'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const getAuthMessage = async (req, res) => {
    const {walletAddress} = req.body;
    if (!walletAddress) {
        return res.status(400).json({message: 'Wallet Address is required'});
    }
    try {
        let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user) {
            user = new User({ walletAddress: walletAddress.toLowerCase() });
        }
        const nonce = `Welcome to DMCGP!\nClick to sign in and accept the DMCGP Terms of Service.\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nNonce: ${Math.floor(Math.random() * 1000000)}`;
        user.nonce = nonce;
        await user.save();
        res.status(200).json({message: nonce });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error generating nonce.'});
    }
};

export const verifySignature = async (req, res) => {
    const { walletAddress, signature } = req.body;
    if (!walletAddress || !signature) return res.status(400).json({ message: 'Wallet address and signature are required.' });
    try {
        const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user || !user.nonce) return res.status(404).json({ message: 'User not found or nonce not generated.' });
        const recoveredAddress = ethers.verifyMessage(user.nonce, signature);
        if (recoveredAddress.toLowerCase() === user.walletAddress.toLowerCase()) {
            user.nonce = null;
            await user.save();
            const token = jwt.sign({ id: user._id, address: user.walletAddress }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.status(200).json({ token, userId: user._id, walletAddress: user.walletAddress });
        } else {
            res.status(401).json({ message: 'Invalid signature.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};