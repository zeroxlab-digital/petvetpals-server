import jwt from "jsonwebtoken";

const userAuthenticated = async (req, res, next) => {
    try {
        const { user_token } = req.cookies;
        if (!user_token) {
            return res.status(400).json({ message: "User not authenticated!" })
        }
        const decoded = await jwt.verify(user_token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(400).json({ message: "Token invalid!" })
        }
        req.id = decoded.userId;
        next()
    } catch (error) {
        console.log(error);
    }
}

export default userAuthenticated;