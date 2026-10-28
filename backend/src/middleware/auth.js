const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email");
    if (!user) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "This account no longer exists." } });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Your session has expired. Please sign in again." } });
    }
    next(error);
  }
}

module.exports = { protect };
