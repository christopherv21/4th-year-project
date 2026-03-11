import React, { useState } from "react";

const WorkoutGenerator = () => {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const generateWorkout = async (type) => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/recommendations/${type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setWorkout(data);
    } catch (err) {
      console.error("Workout generation failed", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Generate Workout</h2>

      <button onClick={() => generateWorkout("baseline")}>
        Generate Baseline Workout
      </button>

      <button
        style={{ marginLeft: "10px" }}
        onClick={() => generateWorkout("personalised")}
      >
        Generate Personalised Workout
      </button>

      {loading && <p>Generating workout...</p>}

      {workout && (
        <div style={{ marginTop: "20px" }}>
          <h3>{workout.workoutType.toUpperCase()} WORKOUT</h3>

          <ul>
            {workout.exercises.map((ex) => (
              <li key={ex.exerciseId}>
                {ex.name} — {ex.sets} sets × {ex.reps} reps
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkoutGenerator;