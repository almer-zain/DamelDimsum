const jwt = require('jsonwebtoken');
const { ApiError } = require('../../../utils/ApiError');

module.exports = (req, res, next) => {
  try {
    // Read token from cookies instead of Authorization header
    const token = req.cookies.token;
    
    if (!token) throw new ApiError(401, 'Silahkan login kembali');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, 'Sesi tidak valid'));
  }
};