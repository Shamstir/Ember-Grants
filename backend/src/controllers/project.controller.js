import Project from '../models/project.model.js'

export const getAllProjects = async (req, res) => {
    try {
        const Projects = await Project.find().populate('creator', 'walletAddress username').sort({createdAt: -1});
        res.status(200).json(Projects);
    } catch(error) {
        res.status(500).json({message: 'Error fetching projects'});
    }
}

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('creator', 'walletAddress username');
        if (!project) {
            return res.status(404).json({message: 'No project found'});
        }
        res.status(200).json(project);
    } catch(error) {
        res.status(500).json({message: 'Error fetching the project'});
    }
};

export const createProject = async (req, res) => {
    const {title, description} = req.body;
    if (!title || !description) {
        return res.status(400).json({message: 'Title or desription are required'});
    }
    try {
        const newProject = new Project({
            title,
            description,
            creator: req.user.id
        });
        await newProject.save();
        res.status(201).json({
            message: 'Project created successfully',
            project: newProject
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Error creating Project'});
    }
};