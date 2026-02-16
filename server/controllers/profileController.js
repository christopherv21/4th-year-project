const Profile = require("../models/Profile");

/**
 * GET /api/profile
 * Return the current user's profile
 */
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("GET profile error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


/**
 * POST /api/profile
 * Create OR update profile (UPSERT)
 * Used for both Profile Setup and Edit Profile
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
      muscleGroup
    } = req.body;

    // ✅ Required fields validation
    if (!fitnessLevel || !goal || !daysPerWeek) {
      return res.status(400).json({
        message: "fitnessLevel, goal, and daysPerWeek are required",
      });
    }

    // ✅ Only include fields that exist (prevents overwriting with undefined)
    const updateData = {
      userId: req.userId,
      fitnessLevel,
      goal,
      daysPerWeek,
    };

    if (equipment !== undefined) updateData.equipment = equipment;
    if (heightCm !== undefined) updateData.heightCm = heightCm;
    if (weightKg !== undefined) updateData.weightKg = weightKg;
    if (injuriesNotes !== undefined) updateData.injuriesNotes = injuriesNotes;
    if (muscleGroup !== undefined) updateData.muscleGroup = muscleGroup;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      {
        new: true,          // return updated doc
        upsert: true,       // create if not exists
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });

  } catch (err) {
    console.error("UPSERT profile error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  getMyProfile,
  upsertMyProfile,
};
