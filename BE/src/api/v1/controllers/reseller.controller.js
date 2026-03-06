const resellerService = require('../services/reseller.service');
const { ApiResponse } = require('../../../utils/ApiResponse');

exports.apply = async (req, res, next) => {
  try {
    const data = await resellerService.apply(req.body);
    res.status(201).json(new ApiResponse(201, data, 'Application submitted'));
  } catch (e) { next(e); }
};

exports.search = async (req, res, next) => {
  try {
    const data = await resellerService.search(req.query.city || '');
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) { next(e); }
};

exports.getAdminList = async (req, res, next) => {
  try {
    const data = await resellerService.adminList(req.query.status);
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) { next(e); }
};

exports.verify = async (req, res, next) => {
  try {
    const data = await resellerService.verify(req.params.id, req.body.status);
    res.status(200).json(new ApiResponse(200, data, `Reseller ${req.body.status}`));
  } catch (e) { next(e); }
};