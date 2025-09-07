import express from 'express'
import {getAllProjects, getProjectById, createProject} from '../controllers/project.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

router.get('/',getAllProjects);
router.get('/:id',getProjectById);
router.post('/',authMiddleware,createProject);

export default router;