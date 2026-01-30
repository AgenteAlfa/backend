/**
 * Crea la base de datos citap, tablas y seeds mínimos.
 * Ejecutar: npm run db:init
 */
require("dotenv").config({
  path: process.env.DOTENV_CONFIG_PATH || ".env",
  quiet: true
});

const { createDatabase, getPool, closePool } = require("./pool");

async function init() {
  await createDatabase(process.env.DB_NAME);

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente INT AUTO_INCREMENT PRIMARY KEY,
      nombre_cliente VARCHAR(120) NOT NULL,
      telefono_cliente VARCHAR(9) NOT NULL,
      email_cliente VARCHAR(120) NOT NULL,
      activo_cliente TINYINT DEFAULT 1
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS estados_cita (
      id_estado_cita INT AUTO_INCREMENT PRIMARY KEY,
      str_estado_cita VARCHAR(30) NOT NULL,
      UNIQUE KEY uq_estado (str_estado_cita)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS citas (
      id_cita INT PRIMARY KEY AUTO_INCREMENT,
      fecha_cita DATETIME NOT NULL,
      cliente_cita INT NOT NULL,
      id_estado_cita INT NOT NULL,
      CONSTRAINT fk_cita_cliente FOREIGN KEY (cliente_cita) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
      CONSTRAINT fk_cita_estado FOREIGN KEY (id_estado_cita) REFERENCES estados_cita(id_estado_cita)
    );
  `);

  // Creando data de estados
  const estados = ["pendiente", "confirmada", "rechazado"]; //1, 2 y 3
  for (const e of estados) {
    await pool.query(
      "INSERT IGNORE INTO estados_cita (str_estado_cita) VALUES (?)",
      [e]
    );
  }

  // Creando data si no existe
  const fs = require("fs");
  const path = require("path");

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickEstado() {
    const r = Math.random();
    // 40% pendiente, 55% confirmada, 5% eliminado
    if (r < 0.40) return 1;
    if (r < 0.95) return 2;
    return 3;
  }

  function citaCountForCliente() {
    const r = Math.random();
    // 50% 0 citas, 25% 1, 12.5% 2, 12.5% 3
    if (r < 0.50) return 0;
    if (r < 0.75) return 1;
    if (r < 0.875) return 2;
    return 3;
  }

  function randomDateBetween(start, end) {
    return new Date(randInt(start.getTime(), end.getTime()));
  }

  function sanitizeEmailPart(s) {
    return String(s)
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  async function seedIfEmpty() {
    // 5.1) Seed clientes (400 combinaciones) si tabla vacía
    const [[{ cntClientes }]] = await pool.query("SELECT COUNT(*) AS cntClientes FROM clientes");
    if (cntClientes === 0) {
      const datasetPath = path.join(__dirname, "random_data.json");
      const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
      const nombres = dataset.nombres || [];
      const apellidos = dataset.apellidos || [];

      const values = [];
      for (const n of nombres) {
        for (const a of apellidos) {
          const nombre_cliente = `${n} ${a}`;
          const telefono_cliente = `9${randInt(10000000, 99999999)}`; // 9 + 8 dígitos
          const email_cliente = `${sanitizeEmailPart(n)}_${sanitizeEmailPart(a)}@correo.com`;
          values.push([nombre_cliente, telefono_cliente, email_cliente, 1]);
        }
      }

      const batchSize = 200;
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        await pool.query(
          "INSERT INTO clientes (nombre_cliente, telefono_cliente, email_cliente, activo_cliente) VALUES ?",
          [batch]
        );
      }

      console.log(`Seed clientes: ${values.length} registros.`);
    } else {
      console.log(`Seed clientes omitido (ya existen ${cntClientes}).`);
    }

    // 5.2) Seed citas si tabla vacía
    const [[{ cntCitas }]] = await pool.query("SELECT COUNT(*) AS cntCitas FROM citas");
    if (cntCitas === 0) {
      const [clientes] = await pool.query("SELECT id_cliente FROM clientes WHERE activo_cliente = 1 ORDER BY id_cliente");
      const [estadosRows] = await pool.query("SELECT id_estado_cita, str_estado_cita FROM estados_cita");
      const estadoMap = new Map(estadosRows.map(r => [r.str_estado_cita, r.id_estado_cita]));

      const now = new Date();
      const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 2 semanas antes
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);   // 1 semana después

      const citasValues = [];
      for (const c of clientes) {
        const n = citaCountForCliente();
        for (let i = 0; i < n; i++) {
          const fecha = randomDateBetween(start, end);
          const estadoId = pickEstado();
          citasValues.push([fecha, c.id_cliente, estadoId]);
        }
      }

      if (citasValues.length > 0) {
        const batchSize = 300;
        for (let i = 0; i < citasValues.length; i += batchSize) {
          const batch = citasValues.slice(i, i + batchSize);
          await pool.query(
            "INSERT INTO citas (fecha_cita, cliente_cita, id_estado_cita) VALUES ?",
            [batch]
          );
        }
      }

      console.log(`✅ Seed citas: ${citasValues.length} registros (0-3 por cliente con distribución).`);
    } else {
      console.log(`ℹ️ Seed citas omitido (ya existen ${cntCitas}).`);
    }
  }

  await seedIfEmpty();
  await pool.end();

}

init().catch((e) => {
  console.error("Error init DB:", e);
  process.exit(1);
});
