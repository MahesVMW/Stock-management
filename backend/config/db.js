import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in the environment variables.');
        }

        await mongoose.connect(mongoURI); // Remove deprecated options

        console.log('DB Connected');
    } catch (error) {
        console.error('Error connecting to DB:', error.message);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
