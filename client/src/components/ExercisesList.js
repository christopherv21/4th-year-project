import { useState } from "react";
import { apiFetch } from "../api";


function ExercisesList({ exercises, onFeedbackSaved }) {
  const [form, setForm] = useState({}); // keyed by exerciseId
  const [saving, setSaving] = useState({}); // keyed by exerciseId

  const update = (id, patch) => {
    setForm(prev => ({
      ...prev,
      [id]: {
        completed: false,
        rating: 5,
        notes: "",
        ...(prev[id] || {}),
        ...patch,
      },
    }));
  };

  const submit = async (ex) => {
    const id = ex._id;
    const payload = {
      exerciseId: id,
      exerciseName: ex.name,
      completed: !!form[id]?.completed,
      rating: Number(form[id]?.rating || 5),
      notes: form[id]?.notes || "",
    };

    try {
      setSaving(prev => ({ ...prev, [id]: true }));
      await apiFetch("/api/feedback", { method: "POST", body: JSON.stringify(payload) });
      onFeedbackSaved?.(); // refresh summary
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      {exercises.map(ex => {
        const id = ex._id;
        const state = form[id] || { completed: false, rating: 5, notes: "" };

        return (
          <div key={id} className="card">
            <h3>{ex.name}</h3>

            <label>
              <input
                type="checkbox"
                checked={state.completed}
                onChange={(e) => update(id, { completed: e.target.checked })}
              />
              {" "}Completed
            </label>

            <label style={{ marginLeft: 12 }}>
              Rating{" "}
              <select
                value={state.rating}
                onChange={(e) => update(id, { rating: e.target.value })}
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <div style={{ marginTop: 8 }}>
              <input
                placeholder="Notes (optional)"
                value={state.notes}
                onChange={(e) => update(id, { notes: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>

            <button
              onClick={() => submit(ex)}
              disabled={!!saving[id]}
              style={{ marginTop: 10 }}
            >
              {saving[id] ? "Saving..." : "Submit Feedback ✅"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ExercisesList;
