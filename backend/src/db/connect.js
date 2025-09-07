import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${connectioninstance.connection.host}`)
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
};

export default connectDB;