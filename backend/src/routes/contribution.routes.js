import express from 'express';
import {
    submitContribution,
    getProjectContributions,
    getUserContributions,
    verifyContribution,
    issueCredential,
    getContributionSignature
} from '../controllers/contribution.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, submitContribution);
router.get('/user', authMiddleware, getUserContributions);
router.get('/project/:projectId', getProjectContributions);
router.post('/verify', authMiddleware, verifyContribution);
router.post('/issue-credential', authMiddleware, issueCredential);
router.post('/signature', authMiddleware, getContributionSignature);

export default router;
