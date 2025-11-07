import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './src/db/connect.js';
import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import contributionRoutes from './src/routes/contribution.routes.js';
import faucetRoutes from './src/routes/faucet.routes.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/faucet', faucetRoutes);

app.get('/', (req, res) => {
    res.send('DMCGP API is running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});