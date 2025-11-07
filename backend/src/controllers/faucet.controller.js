import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const getProvider = () => {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    return new ethers.JsonRpcProvider(rpcUrl);
};

const getWallet = () => {
    const provider = getProvider();
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('ADMIN_PRIVATE_KEY not set in environment');
    }
    return new ethers.Wallet(privateKey, provider);
};

export const requestTokens = async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: 'Valid wallet address is required' });
    }

    try {
        const tokenAddress = process.env.GOVERNANCE_TOKEN_ADDRESS;
        if (!tokenAddress) {
            return res.status(500).json({ message: 'Governance token address not configured' });
        }

        const TOKEN_ABI = [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function balanceOf(address account) view returns (uint256)",
        ];

        const wallet = getWallet();
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);

        // Check if user already has enough tokens
        const currentBalance = await token.balanceOf(walletAddress);
        const minBalance = ethers.parseEther('100'); // 100 tokens minimum
        
        if (currentBalance >= minBalance) {
            return res.status(400).json({ 
                message: 'You already have enough tokens',
                balance: ethers.formatEther(currentBalance)
            });
        }

        // Send 1000 tokens
        const amount = ethers.parseEther('1000');
        const tx = await token.transfer(walletAddress, amount);
        const receipt = await tx.wait();

        const newBalance = await token.balanceOf(walletAddress);

        res.status(200).json({
            message: 'Tokens sent successfully!',
            amount: '1000',
            txHash: receipt.hash,
            newBalance: ethers.formatEther(newBalance),
        });
    } catch (error) {
        console.error('Error sending tokens:', error);
        res.status(500).json({ 
            message: 'Error sending tokens', 
            error: error.message 
        });
    }
};

export const getTokenBalance = async (req, res) => {
    const { walletAddress } = req.params;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: 'Valid wallet address is required' });
    }

    try {
        const tokenAddress = process.env.GOVERNANCE_TOKEN_ADDRESS;
        if (!tokenAddress) {
            return res.status(500).json({ message: 'Governance token address not configured' });
        }

        const TOKEN_ABI = [
            "function balanceOf(address account) view returns (uint256)",
            "function symbol() view returns (string)",
        ];

        const provider = getProvider();
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);

        const balance = await token.balanceOf(walletAddress);
        const symbol = await token.symbol();

        res.status(200).json({
            balance: ethers.formatEther(balance),
            symbol: symbol,
            address: walletAddress,
        });
    } catch (error) {
        console.error('Error getting balance:', error);
        res.status(500).json({ 
            message: 'Error getting token balance', 
            error: error.message 
        });
    }
};
