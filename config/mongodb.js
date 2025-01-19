import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connect(`${process.env.MONGODB_URI}/PetVetPals`)
    .then(console.log("Database connected successfully!"))
    .catch((error) => console.log(error))
}

export default connectDB;