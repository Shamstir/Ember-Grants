import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/project.model.js';

dotenv.config();

const fixTokenIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all projects with nftTokenId
        const projects = await Project.find({ nftTokenId: { $exists: true } });
        console.log(`Found ${projects.length} projects with nftTokenId`);

        for (const project of projects) {
            console.log(`\nProject: ${project.title}`);
            console.log(`Current nftTokenId: ${project.nftTokenId} (type: ${typeof project.nftTokenId})`);

            // If it's a string, convert to number
            if (typeof project.nftTokenId === 'string') {
                const numericId = parseInt(project.nftTokenId);
                if (!isNaN(numericId)) {
                    project.nftTokenId = numericId;
                    await project.save();
                    console.log(`✅ Fixed: converted to ${numericId}`);
                } else {
                    console.log(`❌ Could not convert: ${project.nftTokenId}`);
                }
            } else if (typeof project.nftTokenId === 'number') {
                console.log(`✓ Already correct type`);
            }
        }

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixTokenIds();
