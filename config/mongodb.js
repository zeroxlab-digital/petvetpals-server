import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/PetVetPals`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Wait max 5s for DB response
            maxPoolSize: 10, // Increase the connection pool size
        });
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Stop the server if DB fails
    }
};

export default connectDB;
