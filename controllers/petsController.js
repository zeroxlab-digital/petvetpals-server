import { Pet } from "../models/petModel.js";
import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "../config/cloudinary.js"; // Import the config function to upload file
import { Medication } from "../models/medicationsModel.js";

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
        const { type, name, age, gender, weight, breed } = req.body;

        let imageUrl = "";
        if (req.file) {
            // If a file was included while requesting api then upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "pet_profiles", format: "jpg" },
                    (error, uploadedFile) => {
                        if (error) reject(error)
                        else resolve(uploadedFile.secure_url);
                    }
                ).end(req.file.buffer)
            });

            imageUrl = result;
        }

        const updatePet = await Pet.findByIdAndUpdate(id, {
            type, name, age, image: imageUrl, gender, weight, breed
        }, {
            new: true,
            runValidators: true
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

export const addMedication = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const { medication, dosage, frequency, prescribed_by } = req.body;

        if (!medication || !dosage || !frequency ) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const newMedication = await Medication.create({
            pet: petId,
            medication,
            dosage,
            frequency,
            next_due: new Date(),
            start_date: new Date(),
            prescribed_by
        })
        res.status(201).json({ success: true, message: "Medication added successfully!", newMedication });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const getMedications = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const medications = await Medication.find({ pet: petId }).populate("prescribed_by", "fullName").populate("pet", "name type age").select("-__v");
        res.status(200).json({ success: true, medications });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const deleteMedication = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const deleted_medication = await Medication.findOneAndDelete({ _id: id });
        if(!deleted_medication) {
            return res.status(400).json({ success: false, message: "Medication could not be deleted!" });
        }
        res.status(200).json({ success: true, message: "Medication deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }   
}

export const updateMedication = async (req, res) => {
    try {
        const { id } = req.query;
        const { medication, dosage, frequency, is_ongoing, prescribed_by } = req.body;

        const updatedMedication = await Medication.findByIdAndUpdate(id, {
            medication,
            dosage,
            frequency,
            is_ongoing,
            end_date: is_ongoing ? null : new Date(),
            prescribed_by
        }, {
            new: true,
            runValidators: true
        });
        if (!updatedMedication) {
            return res.status(400).json({ success: false, message: "Updating medication failed!" });
        }
        res.status(200).json({ success: true, message: "Medication updated successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}