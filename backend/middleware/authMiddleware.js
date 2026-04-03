const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token)
    return res.status(401).json({ error: 'Not authorized, no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

module.exports = { protect };