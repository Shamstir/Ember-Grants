import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cors from 'cors'
import connectDB from './src/db/connect.js'
import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/project.routes.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/projects',projectRoutes);

app.get('/', (req,res) => {
    res.send('API is running');
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})