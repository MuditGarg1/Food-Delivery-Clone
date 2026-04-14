import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: "Not Authorized. Please login again." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.json({ success: false, message: "Invalid or expired token." });
    }
};

export default authMiddleware;
