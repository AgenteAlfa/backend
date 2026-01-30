const { signToken } = require("../auth/jwt");

/**
 * Auth demo mínimo para prueba técnica.
 * En un caso real: usuarios en DB + hash de password.
 */
async function login(req, res) {
  const { username, password } = req.body;

  // Demo user
  if (username !== "admin" || password !== "admin123") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({ sub: "admin", role: "admin" });
  res.json({ token });
}

module.exports = { login };
