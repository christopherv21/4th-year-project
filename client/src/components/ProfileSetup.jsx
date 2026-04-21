import React, { useEffect, useState } from "react";
import axios from "axios";

const defaultProfile = {
  fitnessLevel: "beginner",
  goal: "hypertrophy",
  equipment: "gym",
  age: 18,
  injury: "none",
};

function ProfileSetup({
  token: tokenProp,
  mode = "create",
  existingProfile = null,
  onSaved,
}) {
  const [formData, setFormData] = useState(defaultProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = tokenProp || localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("No token found. Please log in again.");
      return;
    }

    if (existingProfile) {
      setFormData({
        fitnessLevel: existingProfile.fitnessLevel || "beginner",
        goal: existingProfile.goal || "hypertrophy",
        equipment: existingProfile.equipment || "gym",
        age: existingProfile.age ?? 18,
        injury: existingProfile.injury || "none",
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
            age: res.data.age ?? 18,
            injury: res.data.injury || "none",
          });
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
        }
      }
    };

    fetchProfile();
  }, [token, existingProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
      };

      const res = await axios.post(
        "http://localhost:5000/api/profile",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedProfile = {
        fitnessLevel: res.data.fitnessLevel,
        goal: res.data.goal,
        equipment: res.data.equipment,
        age: res.data.age,
        injury: res.data.injury,
      };

      setFormData(savedProfile);
      setMessage("Profile saved successfully.");

      if (onSaved) {
        onSaved(savedProfile);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid or expired token. Please log in again.");
        localStorage.removeItem("token");
      } else {
        setError(err.response?.data?.message || "Failed to save profile.");
      }
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

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            min="16"
            max="100"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="injury">Injury</label>
          <select
            id="injury"
            name="injury"
            value={formData.injury}
            onChange={handleChange}
          >
            <option value="none">None</option>
            <option value="knee">Knee</option>
            <option value="back">Back</option>
          </select>
        </div>

        <div style={{ display: "none" }}>
          <input type="hidden" name="goal" value={formData.goal} readOnly />
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