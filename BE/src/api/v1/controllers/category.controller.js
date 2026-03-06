const categoryService = require('../services/category.service');
const { ApiResponse } = require('../../../utils/ApiResponse');

exports.create = async (req, res, next) => {
  try {
    const data = await categoryService.create(req.body.name);
    res.status(201).json(new ApiResponse(201, data, 'Category created'));
  } catch (e) { next(e); }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await categoryService.findAll();
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await categoryService.update(req.params.id, req.body.name);
    res.status(200).json(new ApiResponse(200, data, 'Category updated'));
  } catch (e) { next(e); }
};

exports.delete = async (req, res, next) => {
  try {
    await categoryService.delete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
  } catch (e) { next(e); }
};