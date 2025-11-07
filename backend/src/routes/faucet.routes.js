import express from 'express';
import { requestTokens, getTokenBalance } from '../controllers/faucet.controller.js';

const router = express.Router();

router.post('/request', requestTokens);
router.get('/balance/:walletAddress', getTokenBalance);

export default router;
