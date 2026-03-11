import React, { useEffect, useState } from "react";
import axios from "axios";

const defaultProfile = {
  fitnessLevel: "beginner",
  goal: "hypertrophy",
  equipment: "gym",
};

function ProfileSetup({ token: tokenProp, mode = "create", existingProfile = null, onSaved }) {
  const [formData, setFormData] = useState(defaultProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = tokenProp || localStorage.getItem("token");

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        fitnessLevel: existingProfile.fitnessLevel || "beginner",
        goal: existingProfile.goal || "hypertrophy",
        equipment: existingProfile.equipment || "gym",
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data) {
          setFormData({
            fitnessLevel: res.data.fitnessLevel || "beginner",
            goal: res.data.goal || "hypertrophy",
            equipment: res.data.equipment || "gym",
          });
        }
      } catch (err) {
        // No profile yet is fine
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, existingProfile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const savedProfile = {
        fitnessLevel: res.data.fitnessLevel,
        goal: res.data.goal,
        equipment: res.data.equipment,
      };

      setFormData(savedProfile);
      setMessage("Profile saved successfully.");

      if (onSaved) {
        onSaved(savedProfile);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup-shell">
      <h2 className="section-title" style={{ marginBottom: 8 }}>
        {mode === "edit" ? "Edit Profile" : "Profile Setup"}
      </h2>

      <p className="subtle-text" style={{ marginTop: 0, marginBottom: 20 }}>
        Set your preferences for personalised lower-body workouts.
      </p>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="fitnessLevel">Fitness Level</label>
          <select
            id="fitnessLevel"
            name="fitnessLevel"
            value={formData.fitnessLevel}
            onChange={handleChange}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="goal">Goal</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
          >
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="equipment">Equipment</label>
          <select
            id="equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
          >
            <option value="gym">Gym</option>
            <option value="dumbbells">Dumbbells</option>
            <option value="bodyweight">Bodyweight</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {message && (
        <p className="status-success" style={{ marginTop: 14 }}>
          {message}
        </p>
      )}

      {error && (
        <p className="status-error" style={{ marginTop: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default ProfileSetup;