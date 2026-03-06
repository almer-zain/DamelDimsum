const { Admin } = require('../../../../models');
const { ApiError } = require('../../../utils/ApiError');
const Password = require('../../../utils/Password');
const jwt = require('jsonwebtoken');

const login = async (username, password) => {
  const admin = await Admin.findOne({ where: { username } });
  if (!admin || !(await Password.compare(password, admin.password))) {
    throw new ApiError(401, 'Username atau password salah');
  }
  
  const token = jwt.sign(
    { id: admin.id, username: admin.username }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );
  
  return { admin, token };
};

const changePassword = async (adminId, oldPassword, newPassword) => {
  const admin = await Admin.findByPk(adminId);
  const isMatch = await Password.compare(oldPassword, admin.password);
  if (!isMatch) throw new ApiError(401, 'Sandi lama tidak sesuai');

  const hashedPassword = await Password.hash(newPassword);
  return await admin.update({ password: hashedPassword });
};


const getProfile = async (id) => {
  return await Admin.findByPk(id, { attributes: ['id', 'username', 'name'] });
};

const updateProfile = async (id, data) => {
  const admin = await Admin.findByPk(id);
  // We only allow updating the name in this specific flow
  return await admin.update({ name: data.name });
}

// Logout doesn't usually require DB logic, 
// but we keep the method here for architectural consistency.
const logoutAdmin = async () => {
  return true;
};

// --- THE FIX: EXPORT BOTH FUNCTIONS ---
module.exports = {
  login,
  changePassword,
  updateProfile,
  getProfile,
  logoutAdmin
};
