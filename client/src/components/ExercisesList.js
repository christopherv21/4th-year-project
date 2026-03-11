import React from "react";

export default function ExercisesList({ exercises = [] }) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return (
      <div className="empty-state">
        <p>No exercises to show.</p>
      </div>
    );
  }

  return (
    <div className="exercise-list">
      {exercises.map((ex, idx) => {
        const id = ex.exerciseId || ex._id || idx;

        const name = ex.name || ex.exerciseName || "Exercise";
        const sets = ex.sets ?? ex.prescribedSets;
        const reps = ex.reps ?? ex.prescribedReps;
        const restSeconds = ex.restSeconds ?? ex.rest ?? null;

        return (
          <div key={id} className="exercise-item">
            <div className="exercise-item-top">
              <h3>{name}</h3>

              <div className="exercise-badges">
                {sets != null && <span className="badge badge-dark">{sets} sets</span>}
                {reps != null && <span className="badge badge-light">{reps} reps</span>}
                {restSeconds != null && (
                  <span className="badge badge-light">{restSeconds}s rest</span>
                )}
              </div>
            </div>

            {(ex.muscleGroup || ex.equipment) && (
              <div className="exercise-meta">
                {ex.muscleGroup && (
                  <span>
                    <strong>Muscle:</strong> {ex.muscleGroup}
                  </span>
                )}
                {ex.equipment && (
                  <span>
                    <strong>Equipment:</strong> {ex.equipment}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}