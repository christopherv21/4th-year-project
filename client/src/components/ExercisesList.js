import React from "react";

export default function ExercisesList({ exercises = [] }) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return (
      <div className="empty-state">
        <p>No exercises to show.</p>
      </div>
    );
  }

  const formatLabel = (value) => {
    if (!value) return "";
    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="exercise-list">
      {exercises.map((ex, idx) => {
        const id = ex.exerciseId || ex._id || idx;

        const name = ex.name || ex.exerciseName || "Exercise";
        const sets = ex.sets ?? ex.prescribedSets;
        const reps = ex.reps ?? ex.prescribedReps;
        const restSeconds = ex.restSeconds ?? ex.rest ?? null;

        const muscleGroup = ex.muscleGroup || "";
        const category = ex.category || "";
        const equipment = ex.equipment || "";
        const instructions = ex.instructions || "";

        return (
          <div key={id} className="exercise-item">
            <div className="exercise-item-top">
              <h3>{name}</h3>

              <div className="exercise-badges">
                {sets != null && (
                  <span className="badge badge-dark">{sets} sets</span>
                )}
                {reps != null && (
                  <span className="badge badge-light">{reps} reps</span>
                )}
                {restSeconds != null && (
                  <span className="badge badge-light">{restSeconds}s rest</span>
                )}
              </div>
            </div>

            {(muscleGroup || category || equipment) && (
              <div className="exercise-meta">
                {muscleGroup && (
                  <span>
                    <strong>Muscle:</strong> {formatLabel(muscleGroup)}
                  </span>
                )}
                {category && (
                  <span>
                    <strong>Category:</strong> {formatLabel(category)}
                  </span>
                )}
                {equipment && (
                  <span>
                    <strong>Equipment:</strong> {formatLabel(equipment)}
                  </span>
                )}
              </div>
            )}

            {instructions && (
              <div className="exercise-details">
                <p>{instructions}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}