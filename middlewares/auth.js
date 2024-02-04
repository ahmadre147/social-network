// auth.js middleware
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

module.exports.auth = (req, res, next) => {
    const token = req.header('Authorization');
    
    if(!token) {
      return res.status(401).json({msg: 'No token, authorization denied'});
    }
  
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded.user; // Assuming the user info is stored in the 'user' property of the decoded token
      console.log(req.user);
      next();
    } catch(err) {
      res.status(401).json({msg: 'Token is not valid'});
    }
};
