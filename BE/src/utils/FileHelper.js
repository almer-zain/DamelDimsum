// src/utils/FileHelper.js
const path = require('path');
const fs = require('fs');

exports.uploadFile = (file) => {
  // Use path.resolve to get the root of your project
  // This goes: src/utils -> src -> root -> public/uploads
  const uploadDir = path.resolve(__dirname, '../../public/uploads');

  // FORCE create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const uploadPath = path.join(uploadDir, fileName);

  return new Promise((resolve, reject) => {
    // Standard express-fileupload move function
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error("!! UPLOAD FAILED !!", err);
        return reject(err);
      }
      console.log("!! UPLOAD SUCCESS !! File saved to:", uploadPath);
      resolve(fileName);
    });
  });
};