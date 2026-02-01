import React, { useState, useEffect } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await res.json();
      setLoggedInUser(data.username);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchExercises = async () => {
      if (!loggedInUser) return;

      setLoadingExercises(true);
      setError('');

      try {
        const res = await fetch('/api/exercises');
        if (!res.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await res.json();
        setExercises(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, [loggedInUser]);

  const handleLogout = () => {
    setLoggedInUser(null);
    setExercises([]);
    setUsername('');
  };

  // LOGIN SCREEN
  if (!loggedInUser) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h1>Personalised Gym Workout System</h1>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </label>
          </div>
          <button type="submit" style={{ padding: '8px 16px' }}>
            Login
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          (For MVP: any username will log in.)
        </p>
      </div>
    );
  }

  // MAIN SCREEN – list exercises
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Personalised Gym Workout System</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>👤 {loggedInUser}</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px' }}>
            Logout
          </button>
        </div>
      </header>

      <h2 style={{ marginTop: '2rem' }}>Exercises (from MongoDB)</h2>

      {loadingExercises && <p>Loading exercises...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loadingExercises && exercises.length === 0 && (
        <p>No exercises found in the database. Did you run the seed endpoint?</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {exercises.map((ex) => (
          <li
            key={ex._id}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '8px',
              borderRadius: '4px',
            }}
          >
            <strong>{ex.name}</strong>
            <div>🔥 {ex.kcalPerMinute} kcal / min</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {ex._id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
