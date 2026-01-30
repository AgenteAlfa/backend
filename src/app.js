const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const clientesRoutes = require("./routes/clientes.routes");
const citasRoutes = require("./routes/citas.routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/citas", citasRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// Error handler
app.use((err, req, res, next) => {
  // errores esperados (Joi)
  if (err && err.isJoi) {
    return res.status(400).json({
      message: "Validation error",
      details: err.details.map(d => d.message)
    });
  }

  // solo errores reales
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error"
  });
});


module.exports = { app };
