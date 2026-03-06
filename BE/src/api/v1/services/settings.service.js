
const { Setting } = require('../../../../models'); 


exports.getSettings = async () => {
  const settings = await Setting.findAll();
  // Converts rows to a clean object: { site_name: 'Damel', site_logo: 'file.png' }
  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
};

exports.updateSettings = async (settingsObject) => {
  // 1. Create an array of all the promises
  const updatePromises = Object.entries(settingsObject).map(([key, value]) => {
    // 2. For each key-value pair, run an upsert
    // This will create a promise for each setting to be updated
    return Setting.upsert({ key, value: String(value) });
  });

  // 3. Wait for all promises to finish before returning
  return await Promise.all(updatePromises);
};