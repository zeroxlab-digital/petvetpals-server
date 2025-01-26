import jwt from "jsonwebtoken";

const vetAuthenticated = async (req, res, next) => {
    try {
        const { vet_token } = req.cookies;
        if(!vet_token) {
            return res.status(401).json({ message: "Vet not authenticated!" })
        }
        const decode_token = await jwt.verify(vet_token, process.env.JWT_SECRET_KEY);
        if(!vet_token) {
            return res.status(401).json({ message: "Invalid token!" })
        }
        req.id = decode_token.vetId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Vet not authenticated!" })
    }
}

export default vetAuthenticated;