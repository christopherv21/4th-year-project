import React, { useState } from "react";

const API_BASE = "https://fourth-year-project-8fyo.onrender.com";

const WorkoutGenerator = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const generateWorkout = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/recommendations/personalised-options`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setOptions(data.options || []);
    } catch (err) {
      console.error("Workout generation failed", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Personalised Workout Generation</h2>

      <p style={{ marginBottom: "15px" }}>
        Generate personalised lower-body workout options tailored to your fitness
        level, goal, equipment, age, and injury status.
      </p>

      <button onClick={generateWorkout}>
        {loading ? "Generating..." : "Generate Personalised Workout Options"}
      </button>

      {options.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Workout Options</h3>

          {options.map((option, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <h4>{option.label}</h4>

              <p>{option.description}</p>

              <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
                Generated using rule-based logic: tailored for your {option.goal} goal,
                with {option.exercises.length} exercises selected based on your
                fitness level, equipment, and constraints.
              </p>

              <p>
                <strong>Prescription:</strong> {option.prescription.sets} sets ×{" "}
                {option.prescription.reps} reps
              </p>

              <ul>
                {option.exercises.map((ex, i) => (
                  <li key={i}>
                    {ex.name} — {ex.sets} sets × {ex.reps} reps
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutGenerator;