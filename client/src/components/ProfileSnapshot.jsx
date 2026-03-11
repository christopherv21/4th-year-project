import React from "react";

export default function ProfileSnapshot({ profile }) {
  return (
    <div className="page-card">
      <div className="section-header">
        <h2>👤 Profile Snapshot</h2>
      </div>

      {!profile ? (
        <div className="empty-state">
          <p>No profile data available yet.</p>
        </div>
      ) : (
        <div className="snapshot-grid">
          <div className="snapshot-item">
            <span className="snapshot-label">Fitness Level</span>
            <span className="badge badge-dark">{profile.fitnessLevel || "-"}</span>
          </div>

          <div className="snapshot-item">
            <span className="snapshot-label">Goal</span>
            <span className="badge badge-light">{profile.goal || "-"}</span>
          </div>

          <div className="snapshot-item">
            <span className="snapshot-label">Equipment</span>
            <span className="badge badge-outline">{profile.equipment || "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
}