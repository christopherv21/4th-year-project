import React, { useState } from "react";
import { apiFetch } from "../api";

export default function ExercisesList({ exercises, recommendationId, onFeedbackSaved }) {
  const [feedback, setFeedback] = useState({}); // { [id]: { completed, rating, notes } }
  const [savingId, setSavingId] = useState(null);

  const setField = (id, field, value) => {
    setFeedback((prev) => ({
      ...prev,
      [id]: { completed: false, rating: 5, notes: "", ...(prev[id] || {}), [field]: value },
    }));
  };

  const submitFeedback = async (ex) => {
    // If we are on the recommendation screen, we need recommendationId
    if (recommendationId && !recommendationId.trim()) {
      alert("Missing recommendationId — generate a recommendation first.");
      return;
    }

    const id = ex.exerciseId || ex._id; // personalised uses exerciseId, full list uses _id
    const fb = feedback[id] || { completed: false, rating: 5, notes: "" };

    try {
      setSavingId(id);

      // ✅ If recommendationId exists, send recommendation-level feedback (new evaluation)
      if (recommendationId) {
        await apiFetch("/api/evaluation/feedback", {
          method: "POST",
          body: JSON.stringify({
            recommendationId,
            completed: fb.completed,
            rating: Number(fb.rating),
            notes: fb.notes,
            // optional: keep exercise context too
            exerciseId: id,
            exerciseName: ex.name,
          }),
        });
      } else {
        // If no recommendationId, you can either disable feedback, or send old-style (optional)
        alert("This list is the full DB list — generate a recommendation to submit evaluation feedback.");
        return;
      }

      onFeedbackSaved?.();
      alert("Feedback saved ✅");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit feedback");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      {exercises.map((ex) => {
        const id = ex.exerciseId || ex._id;
        const fb = feedback[id] || { completed: false, rating: 5, notes: "" };

        return (
          <div key={id} style={{ borderBottom: "1px solid #ddd", padding: "12px 0" }}>
            <h3 style={{ margin: 0 }}>{ex.name}</h3>

            <label style={{ marginRight: 12 }}>
              <input
                type="checkbox"
                checked={!!fb.completed}
                onChange={(e) => setField(id, "completed", e.target.checked)}
              />{" "}
              Completed
            </label>

            <label>
              Rating{" "}
              <select
                value={fb.rating}
                onChange={(e) => setField(id, "rating", e.target.value)}
                style={{ marginLeft: 6 }}
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: 8 }}>
              <input
                placeholder="Notes (optional)"
                value={fb.notes}
                onChange={(e) => setField(id, "notes", e.target.value)}
                style={{ width: "100%", padding: 6 }}
              />
            </div>

            <button
              onClick={() => submitFeedback(ex)}
              disabled={savingId === id || !recommendationId}
              style={{ marginTop: 8, padding: "6px 10px" }}
            >
              {savingId === id ? "Saving..." : "Submit Feedback ✅"}
            </button>

            {!recommendationId && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Generate a recommendation above to submit evaluation feedback.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
