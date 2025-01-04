import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']; // Make sure you use correct header

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default authMiddleware;
