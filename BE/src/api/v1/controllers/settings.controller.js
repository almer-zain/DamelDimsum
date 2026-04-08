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
    console.log("FILES ARRIVED:", req.files);
    console.log("BODY ARRIVED:", req.body);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "File tidak terbaca oleh server" });
    }

    const file = req.files.images || req.files.file;
    if (!file) return res.status(400).json({ message: "Field 'images' kosong" });

    const fileName = await uploadFile(Array.isArray(file) ? file[0] : file);

    const settingKey = req.body.key;
    if (!settingKey) return res.status(400).json({ message: "Setting key tidak ditemukan" });

    // Pass as object for upsert
    const dbResult = await settingsService.updateSettings({ [settingKey]: fileName });
    console.log("DB update result:", dbResult);

    res.status(200).json(new ApiResponse(200, fileName, "Ikon berhasil diperbarui"));
  } catch (e) {
    console.error("Upload Controller Error:", e);
    next(e);
  }
};