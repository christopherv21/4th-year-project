const Profile = require("../models/Profile");

const upsertProfile = async (req, res) => {
  try {
    const { fitnessLevel, goal, equipment, age, injury } = req.body;

    if (!fitnessLevel || !goal || !equipment || age === undefined || age === null) {
      return res.status(400).json({
        message: "fitnessLevel, goal, equipment, and age are required",
      });
    }

    const parsedAge = Number(age);

    if (Number.isNaN(parsedAge)) {
      return res.status(400).json({
        message: "age must be a valid number",
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        fitnessLevel,
        goal,
        equipment,
        age: parsedAge,
        injury: injury || "none",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to save profile",
      error: error.message,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

module.exports = {
  upsertProfile,
  getMyProfile,
};