export const registerVet = async (req, res) => {
    const { fullName, email, password, gender, image, speciality, about, fees, degree, experience, date, slots_book } = req.body;
    console.log("all data:", req.body);
}