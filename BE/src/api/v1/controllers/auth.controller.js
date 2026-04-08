const authService = require('../services/auth.service');
const { ApiResponse } = require('../../../utils/ApiResponse');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { admin, token } = await authService.login(username, password);

    // Set token as HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,      // allow HTTP for local dev
      sameSite: 'none',    
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, { admin }, 'Login Berhasil'));
  } catch (e) { next(e); }
};

exports.logout = async (req, res, next) => {
  // Clear the cookie
  res.clearCookie('token');
  res.status(200).json(new ApiResponse(200, null, 'Logout Berhasil'));
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // req.user.id comes from the auth middleware
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    
    res.status(200).json(new ApiResponse(200, null, 'Password berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const admin = await authService.getProfile(req.user.id);
    res.status(200).json(new ApiResponse(200, admin));
  } catch (e) { next(e); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const admin = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(new ApiResponse(200, admin, 'Profil diperbarui'));
  } catch (e) { next(e); }
};


exports.logout = async (req, res, next) => {
  try {
    await authService.logoutAdmin();

    // Clear the HttpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: 'none'
    });

    res.status(200).json(new ApiResponse(200, null, 'Berhasil keluar sistem'));
  } catch (e) {
    next(e);
  }
};