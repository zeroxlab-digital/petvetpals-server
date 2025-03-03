import { Pet } from "../models/petModel.js";
import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "../config/cloudinary.js"; // Import the config function to upload file

connectCloudinary(); // Calls the function to configure Cloudinary as uploading from this file


export const getPetProfiles = async (req, res) => {
    try {
        const userId = req.id;
        const pets = await Pet.find({ user: userId }).select("-__v");
        res.status(200).json({ success: true, pets });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const addPetProfile = async (req, res) => {
    try {
        const user = req.id;
        const { type, name, age, gender, weight, breed } = req.body;
        if (!type || !name || !age || !gender) {
            return res.status(400).json({ message: "Pet type, name, age and gender is required!" })
        }

        let imageUrl = "";
        // Checks if an image was uploaded
        if (req.file) {
            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "pet_profiles", format: "jpg" },
                    (error, uploadedFile) => {
                        if (error) reject(error);
                        else resolve(uploadedFile.secure_url);
                    }
                ).end(req.file.buffer);
            });

            imageUrl = result;
        }

        const petProfile = await Pet.create({
            user, type, name, age, image: imageUrl, gender, weight, breed
        })
        res.status(200).json({ success: true, message: "New pet profile added!", petProfile })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const updatePetProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, name, age, image, gender, weight, breed } = req.body;
        const updatePet = await Pet.findByIdAndUpdate(id, {
            type, name, age, image, gender, weight, breed
        }, {
            new: true,
            runValidator: true
        })
        if (!updatePet) {
            return res.status(400).json({ success: false, message: "Updating vet failed!" })
        }
        res.status(200).json({ success: true, message: "Vet was updated successfully!" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}