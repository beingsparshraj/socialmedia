
import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access",
                success: false,
            });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }

        req.id = decode.userId;
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });

    }
}
export default isAuthenticated;