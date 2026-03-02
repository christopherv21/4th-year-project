import React from "react";

/**
 * ExercisesList (display-only)
 * - Just lists exercises (name, sets, reps, etc.)
 * - NO logging, NO recommendationId, NO feedback submission
 */
export default function ExercisesList({ exercises = [] }) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return <p>No exercises to show.</p>;
  }

  return (
    <div>
      {exercises.map((ex, idx) => {
        const id = ex.exerciseId || ex._id || idx;

        // Support both shapes:
        // 1) plain exercise objects { name, sets, reps, ... }
        // 2) workout items { exerciseId, name, sets, reps, restSeconds, ... }
        const name = ex.name || ex.exerciseName || "Exercise";
        const sets = ex.sets ?? ex.prescribedSets;
        const reps = ex.reps ?? ex.prescribedReps;
        const restSeconds = ex.restSeconds ?? ex.rest ?? null;

        return (
          <div key={id} style={{ borderBottom: "1px solid #ddd", padding: "12px 0" }}>
            <h3 style={{ margin: 0 }}>{name}</h3>

            <div style={{ marginTop: 6, fontSize: 14 }}>
              {sets != null && (
                <span style={{ marginRight: 12 }}>
                  <b>Sets:</b> {sets}
                </span>
              )}
              {reps != null && (
                <span style={{ marginRight: 12 }}>
                  <b>Reps:</b> {reps}
                </span>
              )}
              {restSeconds != null && (
                <span style={{ marginRight: 12 }}>
                  <b>Rest:</b> {restSeconds}s
                </span>
              )}
            </div>

            {/* Optional extras if your exercise objects include them */}
            {ex.muscleGroup && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Muscle group: <b>{ex.muscleGroup}</b>
              </div>
            )}
            {ex.equipment && (
              <div style={{ fontSize: 12, color: "#666" }}>
                Equipment: <b>{ex.equipment}</b>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}