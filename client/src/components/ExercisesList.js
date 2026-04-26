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

  const normaliseEquipment = (value) => {
    const equipment = String(value || "").toLowerCase();

    if (equipment.includes("gym")) return "gym";
    if (equipment.includes("dumbbell")) return "dumbbells";
    if (equipment.includes("bodyweight")) return "bodyweight";

    return "other";
  };

  const groupedExercises = {
    gym: exercises.filter((ex) => normaliseEquipment(ex.equipment) === "gym"),
    dumbbells: exercises.filter(
      (ex) => normaliseEquipment(ex.equipment) === "dumbbells"
    ),
    bodyweight: exercises.filter(
      (ex) => normaliseEquipment(ex.equipment) === "bodyweight"
    ),
    other: exercises.filter((ex) => normaliseEquipment(ex.equipment) === "other"),
  };

  const renderExerciseCard = (ex, idx) => {
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
            {sets != null && <span className="badge badge-dark">{sets} sets</span>}
            {reps != null && <span className="badge badge-light">{reps} reps</span>}
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
  };

  const renderSection = (title, subtitle, items) => {
    if (!items.length) return null;

    return (
      <section className="exercise-category-section">
        <div className="exercise-category-header">
          <div>
            <p className="section-eyebrow">Exercise Category</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <span className="exercise-count">{items.length} exercises</span>
        </div>

        <div className="exercise-list">
          {items.map((ex, idx) => renderExerciseCard(ex, idx))}
        </div>
      </section>
    );
  };

  return (
    <div className="exercise-library-grouped">
      {renderSection(
        "Gym Exercises",
        "Machine and barbell-based lower-body exercises.",
        groupedExercises.gym
      )}

      {renderSection(
        "Dumbbell Exercises",
        "Free-weight exercises suitable for dumbbell-based training.",
        groupedExercises.dumbbells
      )}

      {renderSection(
        "Bodyweight Exercises",
        "No-equipment movements for accessible lower-body training.",
        groupedExercises.bodyweight
      )}

      {renderSection(
        "Other Exercises",
        "Exercises that do not fit the main equipment groups.",
        groupedExercises.other
      )}
    </div>
  );
}