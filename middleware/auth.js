const jwt = require("jsonwebtoken");
const User = require("../models/Users.model");

module.exports = (req, res, next) => {
  try {
    const token = req.header("authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(user.userId).then((user) => {
      if (!user) {
        return res.status(401).json({ success: false });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false });
  }
};
