const Donor = require('../models/donor');

exports.adddonor = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const existingDonor = await Donor.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      if (existingDonor) {
        return res.status(400).json({ message: 'A donor with this email address already exists.' });
      }
    }
    const newDonor = await Donor.create(req.body);
    res.json(newDonor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchdonor = async (req, res) => {
  try {
    const { query } = req.params;

    const donor = await Donor.findOne({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { mobile: query },
        { pan: query },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};