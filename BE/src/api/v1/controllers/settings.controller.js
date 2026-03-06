const settingsService = require('../services/settings.service');
const { ApiResponse } = require('../../../utils/ApiResponse');
const { uploadFile } = require('../../../utils/FileHelper');

exports.getSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getSettings();
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) { next(e); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const data = await settingsService.updateSettings(req.body);
    res.status(200).json(new ApiResponse(200, data, 'Pengaturan disimpan'));
  } catch (e) { next(e); }
};


exports.uploadIcon = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images) return res.status(400).json({ message: "Pilih file terlebih dahulu" });

    // 1. Upload the physical file
    const file = Array.isArray(req.files.images) ? req.files.images[0] : req.files.images;
    const fileName = await uploadFile(file);

    // 2. SAVE TO SETTINGS TABLE (Not product table)
    // The key is passed from frontend (e.g., 'site_logo' or 'favicon')
    const settingKey = req.body.key || 'site_logo';
    await settingsService.updateSetting(settingKey, fileName);

    res.status(200).json(new ApiResponse(200, fileName, "Ikon berhasil diperbarui"));
  } catch (e) { next(e); }
};