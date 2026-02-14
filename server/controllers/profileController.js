const Profile = require("../models/Profile");

/**
 * GET /api/profile
 * Return the current user's profile
 */
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * POST /api/profile
 * Create or update the current user's profile (upsert)
 */
const upsertMyProfile = async (req, res) => {
  try {
    const {
      fitnessLevel,
      goal,
      daysPerWeek,
      equipment,
      heightCm,
      weightKg,
      injuriesNotes,
    } = req.body;

    // Basic validation (keep it simple but strict)
    if (!fitnessLevel || !goal || !daysPerWeek) {
      return res.status(400).json({
        message: "fitnessLevel, goal, and daysPerWeek are required",
      });
    }

    const updated = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        fitnessLevel,
        goal,
        daysPerWeek,
        equipment,
        heightCm,
        weightKg,
        injuriesNotes,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMyProfile, upsertMyProfile };
