import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET_KEY = process.env.PINATA_API_SECRET_KEY;

// Debug: Check if keys are loaded
console.log('Pinata Keys Check:', {
    hasApiKey: !!PINATA_API_KEY,
    hasSecretKey: !!PINATA_API_SECRET_KEY,
    apiKeyLength: PINATA_API_KEY?.length || 0
});

export const uploadJSONToIPFS = async (jsonData) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    try {
        const response = await axios.post(url, jsonData, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_API_SECRET_KEY
            }
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error.response ? error.response.data : error.message);
        throw new Error('Failed to upload JSON to IPFS');
    }
};

export const uploadFileToIPFS = async (filePath) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const fileStream = fs.createReadStream(filePath);
    const data = new FormData();
    data.append('file', fileStream);
    try {
        const response = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_API_SECRET_KEY
            }
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error.response ? error.response.data : error.message);
        throw new Error('Failed to upload file to IPFS');
    }
};