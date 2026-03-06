const { Reseller } = require('../../../../models');
const { Op } = require('sequelize');
const { ApiError } = require('../../../utils/ApiError');

exports.apply = async (data) => {
  // 1. Check for duplicate WhatsApp
  const existingWA = await Reseller.findOne({ where: { whatsapp: data.whatsapp } });
  if (existingWA) {
    throw new ApiError(400, 'Nomor WhatsApp ini sudah terdaftar sebagai mitra.');
  }

  // 2. Check for duplicate Shop Name
  const existingShop = await Reseller.findOne({ where: { nameShop: data.nameShop } });
  if (existingShop && data.nameShop !== '') {
    throw new ApiError(400, 'Nama toko ini sudah digunakan mitra lain.');
  }

  return await Reseller.create({ ...data, status: 'pending' });
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


