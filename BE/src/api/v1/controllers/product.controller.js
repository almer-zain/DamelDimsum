const productService = require('../services/product.service');
const { ApiResponse } = require('../../../utils/ApiResponse');

exports.create = async (req, res, next) => {
  try {
    console.log("--- DEBUG CREATE ---");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files); // <--- ADD THIS LINE!
    
    const data = await productService.create(req.body, req.files);
    res.status(201).json(new ApiResponse(201, data, 'Produk berhasil dibuat'));
  } catch (e) {
    next(e);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const data = await productService.findAll(isAdmin);
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await productService.update(req.params.id, req.body, req.files);
    res.status(200).json(new ApiResponse(200, data, 'Product updated'));
  } catch (e) { next(e); }
};

exports.delete = async (req, res, next) => {
  try {
    await productService.delete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Product deleted'));
  } catch (e) { next(e); }
};


exports.uploadOnly = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images) return res.status(400).json({ message: "No file uploaded" });
    
    const file = Array.isArray(req.files.images) ? req.files.images[0] : req.files.images;
    const fileName = await uploadFile(file);
    
    // Return the filename so frontend can save it to settings
    res.status(200).json({ success: true, data: fileName });
  } catch (e) { next(e); }
};