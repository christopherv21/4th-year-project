import React, { useState } from "react";

const API_BASE = "https://fourth-year-project-8fyo.onrender.com";

const sectionTitleStyle = {
  marginTop: "14px",
  marginBottom: "8px",
  fontSize: "15px",
  fontWeight: "600",
};

const listStyle = {
  margin: 0,
  paddingLeft: "20px",
};

const cardStyle = {
  marginBottom: "20px",
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#fff",
};

const warmupBoxStyle = {
  marginTop: "14px",
  marginBottom: "14px",
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  backgroundColor: "#f9fafb",
};

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
            <div key={index} style={cardStyle}>
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

              {option.reason && (
                <p style={{ fontSize: "13px", color: "#555", marginTop: "8px" }}>
                  <strong>Why this was recommended:</strong> {option.reason}
                </p>
              )}

              {option.warmup?.length > 0 && (
                <div style={warmupBoxStyle}>
                  <h5 style={{ margin: "0 0 10px 0" }}>Warm-Up</h5>
                  <ul style={listStyle}>
                    {option.warmup.map((item) => (
                      <li key={item.order} style={{ marginBottom: "8px" }}>
                        <strong>{item.name}</strong> — {item.sets} sets × {item.reps}
                        {item.note ? (
                          <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                            {item.note}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h5 style={sectionTitleStyle}>Main Exercises</h5>
              <ul style={listStyle}>
                {option.exercises.map((ex, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
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