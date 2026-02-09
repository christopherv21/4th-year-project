/**
 * Very basic "login" endpoint for MVP
 * Any username is accepted, no password check.
 */
const loginMvp = (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ message: "Username is required" });
  }

  res.json({ message: "Login successful", username });
};

module.exports = { loginMvp };
