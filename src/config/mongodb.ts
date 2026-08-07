import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/PetVetPals`, {
            serverSelectionTimeoutMS: 5000, // Wait max 5s for DB response
            maxPoolSize: 10, // connection pool size
        });
        console.log("✅ Database connected successfully!");
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("❌ MongoDB Connection Error:", error.message);
            process.exit(1);
        }
    }
};

export default connectDB;