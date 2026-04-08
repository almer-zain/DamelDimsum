const { Product, Category } = require('../../../../models');
const slugify = require('../../../utils/Slugify');
const { uploadFile } = require('../../../utils/FileHelper');
const { ApiError } = require('../../../utils/ApiError');

const path = require('path');

const fs = require('fs');

// Helper to save files to the public/uploads folder
const saveUploadedFiles = async (files) => {
  if (!files || !files.images) return [];

  // express-fileupload quirk: 1 file = Object, 2+ files = Array.
  // We force it into an array so the code works for both.
  const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
  const savedFilenames = [];

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const file of imageFiles) {
    const ext = path.extname(file.name);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // .mv() physically moves the file from RAM to your folder
    await file.mv(filePath);
    savedFilenames.push(uniqueName);
  }

  return savedFilenames;
};

exports.create = async (body, files) => {
  const imageNames = await saveUploadedFiles(files);

  const product = await Product.create({
    name: body.name,
    categoryId: parseInt(body.categoryId),
    price: parseInt(body.price),
    resellerPrice: parseInt(body.resellerPrice),
    description: body.description,
    status: body.status,
    // CRITICAL: We save the array of filenames as a JSON string
    images: JSON.stringify(imageNames) 
  });

  return product;
};

exports.update = async (id, body, files) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error('Product not found');

  // 1. Keep the images the frontend wants to keep
  let finalImages = [];
  if (body.existingImages) {
    finalImages = JSON.parse(body.existingImages);
  }

  // 2. Save new uploads and add them to the list
  const newImages = await saveUploadedFiles(files);
  finalImages = [...finalImages, ...newImages];

  await product.update({
    name: body.name,
    categoryId: parseInt(body.categoryId),
    price: parseInt(body.price),
    resellerPrice: parseInt(body.resellerPrice),
    description: body.description,
    status: body.status,
    images: JSON.stringify(finalImages)
  });

  return product;
};

exports.findAll = async (isAdmin = false) => {
  const where = isAdmin ? {} : { status: 'active' };
  return await Product.findAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
    order: [['createdAt', 'DESC']]
  });
};

exports.delete = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return await product.destroy();
};