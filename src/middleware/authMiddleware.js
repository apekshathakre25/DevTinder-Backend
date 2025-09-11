const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1]; 
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    const decoded = jwt.verify(token, "$|KKLFc%5"); 
    const user = await User.findById(decoded.id);  

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
