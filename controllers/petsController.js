import { Pet } from "../models/petModel.js";

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
        const { type, name, age, image, gender, weight, breed } = req.body;
        if (!type || !name || !age || !gender) {
            return res.status(400).json({ message: "Pet type, name, age and gender is required!" })
        }
        const petProfile = await Pet.create({
            user, type, name, age, image, gender, weight, breed
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
        if(!updatePet) {
            return res.status(400).json({ success: false, message: "Updating vet failed!" })
        }
        res.status(200).json({ success: true, message: "Vet was updated successfully!" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}