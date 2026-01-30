const { getPool } = require("../db/pool");

async function list({ includeInactive = false } = {}) {
  const sql = includeInactive
    ? "SELECT id_cliente, nombre_cliente, telefono_cliente, email_cliente, activo_cliente FROM clientes ORDER BY id_cliente DESC"
    : "SELECT id_cliente, nombre_cliente, telefono_cliente, email_cliente, activo_cliente FROM clientes WHERE activo_cliente = 1 ORDER BY id_cliente DESC";
  const [rows] = await getPool().query(sql);
  return rows;
}

async function getById(id) {
  const [rows] = await getPool().query(
    "SELECT id_cliente, nombre_cliente, telefono_cliente, email_cliente, activo_cliente FROM clientes WHERE id_cliente = ? AND activo_cliente = 1 LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

async function create({ nombre_cliente, telefono_cliente, email_cliente }) {
  const [result] = await getPool().query(
    "INSERT INTO clientes (nombre_cliente, telefono_cliente, email_cliente, activo_cliente) VALUES (?, ?, ?, 1)",
    [nombre_cliente, telefono_cliente, email_cliente]
  );
  return {
    id_cliente: result.insertId,
    nombre_cliente,
    telefono_cliente,
    email_cliente,
    activo_cliente: 1
  };
}

async function update(id, patch) {
  // solo actualiza si existe (aunque esté activo)
  const [exist] = await getPool().query("SELECT id_cliente FROM clientes WHERE id_cliente = ? LIMIT 1", [id]);
  if (!exist[0]) return null;

  const fields = [];
  const values = [];

  for (const key of ["nombre_cliente", "telefono_cliente", "email_cliente", "activo_cliente"]) {
    if (patch[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(patch[key]);
    }
  }

  if (fields.length === 0) return await getById(id);

  values.push(id);
  await getPool().query(`UPDATE clientes SET ${fields.join(", ")} WHERE id_cliente = ?`, values);

  // devolver estado real (incluye inactivo)
  const [rows] = await getPool().query(
    "SELECT id_cliente, nombre_cliente, telefono_cliente, email_cliente, activo_cliente FROM clientes WHERE id_cliente = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

async function logicalDelete(id) {
  const [result] = await getPool().query(
    "UPDATE clientes SET activo_cliente = 0 WHERE id_cliente = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = { list, getById, create, update, logicalDelete };
