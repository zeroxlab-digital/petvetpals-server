import jwt, { decode } from "jsonwebtoken";

const authenticatedUserOrVet = async (req, res, next) => {
    try {
        const { user_token, vet_token } = req.cookies;
        if (user_token) {
            const decoded_token = await jwt.verify(user_token, process.env.JWT_SECRET_KEY);
            if (!decoded_token) {
                return res.status(400).json({ message: "User token is invalid!" })
            }
            req.id = decoded_token.userId;
            req.role = "user";
            return next();
        }
        if (vet_token) {
            const decoded_token = jwt.verify(vet_token, process.env.JWT_SECRET_KEY);
            if (!decoded_token) {
                return res.status(400).json({ message: "User token is not valid!" })
            }
            req.id = decoded_token.vetId;
            req.role = "vet";
            return next();
        }
        return res.status(401).json({ message: "Authentication required!" });
    } catch (error) {
        console.log("Error while authentication", error)
        return res.status(401).json({ message: "Error while authentication", error: error.message })
    }
}

export default authenticatedUserOrVet;