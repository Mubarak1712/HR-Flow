const { getSettings } = require("../utils/hrmsHelpers");

const getCompanySettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCompanySettings = async (req, res) => {
  try {
    const settings = await getSettings();
    settings.set(req.body);
    await settings.save();
    res.status(200).json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCompanySettings, updateCompanySettings };
