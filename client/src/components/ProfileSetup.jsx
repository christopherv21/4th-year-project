import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function ProfileSetup({ token, onSaved, mode = "create", existingProfile = null }) {
  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [goal, setGoal] = useState("strength");
  const [equipment, setEquipment] = useState("gym");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [muscleGroup, setMuscleGroup] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ✅ Prefill from existingProfile (when editing)
  useEffect(() => {
    if (!existingProfile) return;
    if (existingProfile.fitnessLevel) setFitnessLevel(existingProfile.fitnessLevel);
    if (existingProfile.goal) setGoal(existingProfile.goal);
    if (existingProfile.equipment) setEquipment(existingProfile.equipment);
    if (typeof existingProfile.daysPerWeek === "number") setDaysPerWeek(existingProfile.daysPerWeek);
    if (existingProfile.muscleGroup) setMuscleGroup(existingProfile.muscleGroup);
  }, [existingProfile]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const payload = {
        fitnessLevel,
        goal,
        equipment,
        daysPerWeek,
        ...(muscleGroup ? { muscleGroup } : {}),
      };

      const res = await fetch(`${API_BASE}/api/profile`, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Failed to save profile");
        setLoading(false);
        return;
      }

      setMsg(mode === "edit" ? "✅ Profile updated!" : "✅ Profile saved!");
      setLoading(false);
      onSaved?.();
    } catch (err) {
      setMsg("Server error saving profile");
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 16 }}>
      <h2>🧍 {mode === "edit" ? "Edit Profile" : "Profile Setup"}</h2>
      <p style={{ marginTop: 0 }}>
        Set your preferences so the system can generate personalised workouts.
      </p>

      <form onSubmit={saveProfile} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Fitness level
          <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label>
          Goal
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="endurance">Endurance</option>
          </select>
        </label>

        <label>
          Equipment
          <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            <option value="gym">Gym</option>
            <option value="home">Home</option>
            <option value="bodyweight">Bodyweight</option>
          </select>
        </label>

        <label>
          Days per week
          <select value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label>
          Muscle group (later)
          <input
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            placeholder="e.g., legs, push, pull"
            disabled
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update Profile" : "Save Profile"}
        </button>

        {msg && <div style={{ color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</div>}
      </form>
    </div>
  );
}
