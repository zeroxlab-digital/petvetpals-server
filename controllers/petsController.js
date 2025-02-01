import { Pet } from "../models/petModel.js";

export const getPetProfiles = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.status(200).json({ success: true, pets });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const addPetProfile = async (req, res) => {
    try {
        const { type, name, age, image, gender, weight, breed } = req.body;
        if (!type || !name || !age || !gender) {
            return res.status(400).json({ message: "Pet type, name, age and gender is required!" })
        }
        const petProfile = await Pet.create({
            type, name, age, image, gender, weight, breed
        })
        res.status(200).json({ success: true, message: "New pet profile added!", petProfile })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const updatePetProfile = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}