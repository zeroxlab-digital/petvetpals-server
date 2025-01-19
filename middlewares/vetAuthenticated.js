import jwt from "jsonwebtoken";

const vetAuthenticated = async (req, res, next) => {
    try {
        const { vet_token } = req.headers;
        if(!vet_token) {
            return res.status(401).json({ message: "User not authenticated!" })
        }
        const decode_token = await jwt.verify(vet_token, process.env.JWT_SECRET_KEY);
        if(!vet_token) {
            return res.status(401).json({ message: "Invalid token!" })
        }
        req.id = decode_token._id;
        next();
    } catch (error) {
        res.status(401).json({ message: "User not authenticated!" })
    }
}

export default vetAuthenticated;