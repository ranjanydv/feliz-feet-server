const jwt = require('jsonwebtoken');

const authJwt = require('./authJWT');
const { errorResponse } = require('../utils');
const authConfig = require('../config/auth.config');



const authenticateUser = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    jwt.verify(bearerToken, authConfig.secret, (err, authData) => {
      if (err) {
        console.log("🚀 ~ file: authentication.js:16 ~ jwt.verify ~ err:", err)
        res.status(401).json({ message: "Invalid Token" }); // Unauthenticated
      } else {
        req.authData = authData;
        console.log();
        next();
      }
    });
  } else {
    errorResponse({
      res,
      statusCode: 403,
      message: 'Not Authorized',
    });
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Error('Not Authorized to this route');
    }
    next();
  };
};


module.exports = { authenticateUser, authorizePermissions };
