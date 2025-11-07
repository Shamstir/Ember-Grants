import dotenv from 'dotenv';
import { ethers } from 'ethers';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const sendTokens = async () => {
    try {
        console.log('💰 Governance Token Faucet\n');

        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        const tokenAddress = process.env.GOVERNANCE_TOKEN_ADDRESS;
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        
        console.log(`🪙 Token Address: ${tokenAddress}`);
        
        const TOKEN_ABI = [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function balanceOf(address account) view returns (uint256)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
        ];

        const wallet = new ethers.Wallet(privateKey, provider);
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);

        // Check admin balance
        const adminBalance = await token.balanceOf(wallet.address);
        const symbol = await token.symbol();
        console.log(`👤 Admin: ${wallet.address}`);
        console.log(`💰 Admin Balance: ${ethers.formatEther(adminBalance)} ${symbol}\n`);

        if (adminBalance === 0n) {
            console.log('❌ Admin has no tokens to send!');
            rl.close();
            process.exit(1);
        }

        // Get recipient address
        const recipient = await question('📬 Enter recipient wallet address: ');
        
        if (!ethers.isAddress(recipient)) {
            console.log('❌ Invalid address!');
            rl.close();
            process.exit(1);
        }

        // Default amount: 1000 tokens
        const amountInput = await question('💵 Enter amount to send (default: 1000): ');
        const amount = amountInput.trim() === '' ? '1000' : amountInput.trim();
        
        const amountWei = ethers.parseEther(amount);

        console.log(`\n📤 Sending ${amount} ${symbol} to ${recipient}...`);
        
        const tx = await token.transfer(recipient, amountWei);
        console.log(`📝 Transaction: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log(`✅ Confirmed in block ${receipt.blockNumber}`);

        // Check new balances
        const newBalance = await token.balanceOf(recipient);
        console.log(`\n💰 Recipient new balance: ${ethers.formatEther(newBalance)} ${symbol}`);
        console.log('✅ Tokens sent successfully!\n');

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
};

sendTokens();
