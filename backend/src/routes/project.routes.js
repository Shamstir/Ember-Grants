import express from 'express'
import {getAllProjects, getProjectById, createProject, mintProjectNFT, initiateVoting, deleteProject, getProjectStats} from '../controllers/project.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

router.get('/',getAllProjects);
router.get('/:id',getProjectById);
router.get('/:id/stats',getProjectStats);
router.post('/',authMiddleware,createProject);
router.post('/mint',authMiddleware,mintProjectNFT);
router.post('/start-voting',authMiddleware,initiateVoting);
router.delete('/:id',authMiddleware,deleteProject);

export default router;