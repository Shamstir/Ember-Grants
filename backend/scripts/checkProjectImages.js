import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/project.model.js';

dotenv.config();

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const projects = await Project.find().sort({ createdAt: -1 }).limit(10);
        
        console.log(`Found ${projects.length} recent projects:\n`);
        
        projects.forEach((project, index) => {
            console.log(`${index + 1}. ${project.title}`);
            console.log(`   ID: ${project._id}`);
            console.log(`   imageUrl: ${project.imageUrl || '(not set)'}`);
            console.log(`   Status: ${project.status}`);
            console.log(`   NFT Token ID: ${project.nftTokenId !== undefined ? project.nftTokenId : '(not minted)'}`);
            console.log('');
        });

        // Count projects with images
        const withImages = projects.filter(p => p.imageUrl && p.imageUrl !== '').length;
        console.log(`\n📊 Summary:`);
        console.log(`   Total projects: ${projects.length}`);
        console.log(`   With images: ${withImages}`);
        console.log(`   Without images: ${projects.length - withImages}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkImages();
