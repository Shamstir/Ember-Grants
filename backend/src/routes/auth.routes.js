import express from 'express'
import {getAuthMessage, verifySignature} from '../controllers/auth.controller.js'

const router = express.Router();

router.post('/message',getAuthMessage);
router.post('/verify',verifySignature);

export default router;