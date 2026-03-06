const { Product, Category } = require('../../../../models');
const slugify = require('../../../utils/Slugify');
const { uploadFile } = require('../../../utils/FileHelper');
const { ApiError } = require('../../../utils/ApiError');


exports.create = async (data, files) => {
  const slug = slugify(data.name);
  let imageList = [];
  
  if (files && files.images) {
    // !! IMPORTANT: Force into array even if it's just one file
    const filesArray = Array.isArray(files.images) ? files.images : [files.images];
    
    for (const file of filesArray) {
      const fileName = await uploadFile(file);
      imageList.push(fileName);
    }
  }
  return await Product.create({
    ...data,
    slug,
    images: JSON.stringify(imageList) // Important: Must be a string for the DB
  });
};

exports.findAll = async (isAdmin = false) => {
  const where = isAdmin ? {} : { status: 'active' };
  return await Product.findAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
    order: [['createdAt', 'DESC']]
  });
};

exports.update = async (id, data, files) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, 'Product not found');

  if (data.name) data.slug = slugify(data.name);

  if (files && files.images) {
    const filesArray = Array.isArray(files.images) ? files.images : [files.images];
    let currentImages = JSON.parse(product.images || "[]");
    for (const file of filesArray) {
      const name = await uploadFile(file);
      currentImages.push(name);
    }
    data.images = JSON.stringify(currentImages);
  }

  return await product.update(data);
};

exports.delete = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return await product.destroy();
};