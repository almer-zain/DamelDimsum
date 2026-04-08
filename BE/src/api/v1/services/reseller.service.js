const { Reseller } = require('../../../../models');
const { Op } = require('sequelize');
const { ApiError } = require('../../../utils/ApiError');

exports.apply = async (data) => {
  // --- THE FIX: SANITIZATION ---
  // Remove all non-digit characters (removes +, spaces, dashes)
  data.whatsapp = data.whatsapp.replace(/\D/g, '');
  
  // Optional: Convert 08... to 628...
  if (data.whatsapp.startsWith('0')) {
    data.whatsapp = '62' + data.whatsapp.slice(1);
  }

  // Check for duplicate after cleaning
  const existing = await Reseller.findOne({ where: { whatsapp: data.whatsapp } });
  if (existing) throw new ApiError(400, 'Nomor WA ini sudah terdaftar.');

  return await Reseller.create({ ...data, status: data.status || 'pending' });
};

exports.search = async (city) => {
  return await Reseller.findAll({
    where: {
      status: 'approved',
      city: { [Op.like]: `%${city}%` }
    }
  });
};

exports.adminList = async (status) => {
  const where = status ? { status } : {};
  return await Reseller.findAll({ where, order: [['createdAt', 'DESC']] });
};

exports.verify = async (id, status) => {
  const reseller = await Reseller.findByPk(id);
  if (!reseller) throw new ApiError(404, 'Reseller not found');
  return await reseller.update({ status });
};

exports.delete = async (id) => {
  const reseller = await Reseller.findByPk(id);
  if (!reseller) throw new ApiError(404, 'Reseller not found');
  return await reseller.destroy();
};






//  Get single reseller
exports.getById = async (id) => {
  const reseller = await Reseller.findByPk(id);
  if (!reseller) throw new ApiError(404, 'Reseller not found');
  return reseller;
};

// Update reseller (name, whatsapp, city, etc)
exports.update = async (id, data) => {
  const reseller = await Reseller.findByPk(id);
  if (!reseller) throw new ApiError(404, 'Reseller not found');

  // If the admin is updating the WhatsApp number, sanitize and check duplicate
  if (data.whatsapp) {
    data.whatsapp = data.whatsapp.replace(/\D/g, '');
    if (data.whatsapp.startsWith('0')) {
      data.whatsapp = '62' + data.whatsapp.slice(1);
    }
    
    // Check if the NEW number belongs to someone else
    if (data.whatsapp !== reseller.whatsapp) {
      const existing = await Reseller.findOne({ where: { whatsapp: data.whatsapp } });
      if (existing) throw new ApiError(400, 'Nomor WA ini sudah terdaftar.');
    }
  }

  // Update with whatever data was passed in
  return await reseller.update(data);
};
