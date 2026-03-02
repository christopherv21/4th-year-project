import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function WorkoutHistory({ refreshKey, token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;

      setLoading(true);
      setErrMsg("");

      try {
        const data = await apiFetch("/api/workouts/logs", { token });
        setLogs(Array.isArray(data?.logs) ? data.logs : []);
      } catch (e) {
        setErrMsg(e?.message || "Failed to load history");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshKey, token]);

  return (
    <div className="card">
      <h2>🗓️ Workout History</h2>

      {loading && <p>Loading...</p>}
      {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}

      {!loading && !errMsg && logs.length === 0 && (
        <p>No logs yet — submit feedback to create your first entry.</p>
      )}

      {logs.map((log) => (
        <div
          key={log._id}
          style={{
            borderTop: "1px solid #ddd",
            paddingTop: 10,
            marginTop: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>{new Date(log.createdAt).toLocaleString()}</b>
            <span>
              condition: <b>{log.condition || "-"}</b>
            </span>
          </div>

          <p style={{ margin: "6px 0" }}>
            <b>Completed:</b> {log.completed ? "✅" : "❌"}{" "}
            <b style={{ marginLeft: 10 }}>Rating:</b> {log.rating ?? "-"}{" "}
            <b style={{ marginLeft: 10 }}>Difficulty:</b>{" "}
            {log.difficultyFeedback || "-"}{" "}
            <b style={{ marginLeft: 10 }}>Duration:</b>{" "}
            {log.durationMinutes != null ? `${log.durationMinutes} min` : "-"}
          </p>

          {log.notes && (
            <p style={{ margin: "6px 0", color: "#444" }}>
              <b>Notes:</b> {log.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}