const { getPool } = require("../db/pool");
const { getEstadoIdByStr } = require("./estados.service");

async function list() {
  const [rows] = await getPool().query(`
    SELECT 
      c.id_cita,
      c.fecha_cita,
      c.cliente_cita,
      cli.nombre_cliente,
      cli.telefono_cliente,
      cli.email_cliente,
      ec.str_estado_cita AS estado
    FROM citas c
    JOIN clientes cli ON cli.id_cliente = c.cliente_cita
    JOIN estados_cita ec ON ec.id_estado_cita = c.id_estado_cita
    ORDER BY c.fecha_cita DESC, c.id_cita DESC
  `);
  return rows;
}

async function listByEstado(estadoStr) {
  const estadoId = await getEstadoIdByStr(estadoStr);
  if (!estadoId) return []; // estado no válido => lista vacía
  const [rows] = await getPool().query(`
    SELECT 
      c.id_cita,
      c.fecha_cita,
      c.cliente_cita,
      cli.nombre_cliente,
      cli.telefono_cliente,
      cli.email_cliente,
      ec.str_estado_cita AS estado
    FROM citas c
    JOIN clientes cli ON cli.id_cliente = c.cliente_cita
    JOIN estados_cita ec ON ec.id_estado_cita = c.id_estado_cita
    WHERE c.id_estado_cita = ?
    ORDER BY c.fecha_cita DESC, c.id_cita DESC
  `, [estadoId]);
  return rows;
}

async function getById(id) {
  const [rows] = await getPool().query(`
    SELECT 
      c.id_cita,
      c.fecha_cita,
      c.cliente_cita,
      cli.nombre_cliente,
      cli.telefono_cliente,
      cli.email_cliente,
      ec.str_estado_cita AS estado
    FROM citas c
    JOIN clientes cli ON cli.id_cliente = c.cliente_cita
    JOIN estados_cita ec ON ec.id_estado_cita = c.id_estado_cita
    WHERE c.id_cita = ?
    LIMIT 1
  `, [id]);
  return rows[0] ?? null;
}

async function create({ fecha_cita, cliente_cita, estado }) {

  // validar que cliente exista y esté activo
  const [cli] = await getPool().query(
    "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND activo_cliente = 1 LIMIT 1",
    [cliente_cita]
  );
  if (!cli[0]) {
    const err = new Error("Cliente inválido o inactivo");
    err.statusCode = 400;
    throw err;
  }

  const estadoStr = (estado || "pendiente").toLowerCase();
  const estadoId = await getEstadoIdByStr(estadoStr);
  if (!estadoId) {
    const err = new Error("Estado de cita inválido");
    err.statusCode = 400;
    throw err;
  }

  const [result] = await getPool().query(
    "INSERT INTO citas (fecha_cita, cliente_cita, id_estado_cita) VALUES (?, ?, ?)",
    [new Date(fecha_cita), cliente_cita, estadoId]
  );

  return await getById(result.insertId);
}

async function update(id, patch) {
  const current = await getById(id);
  if (!current) return null;

  const fields = [];
  const values = [];

  if (patch.fecha_cita !== undefined) {
    fields.push("fecha_cita = ?");
    values.push(new Date(patch.fecha_cita));
  }

  if (patch.cliente_cita !== undefined) {
    // validar cliente activo
    const [cli] = await getPool().query(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? AND activo_cliente = 1 LIMIT 1",
      [patch.cliente_cita]
    );
    if (!cli[0]) {
      const err = new Error("Cliente inválido o inactivo");
      err.statusCode = 400;
      throw err;
    }
    fields.push("cliente_cita = ?");
    values.push(patch.cliente_cita);
  }

  if (patch.estado !== undefined) {
    const estadoId = await getEstadoIdByStr(String(patch.estado).toLowerCase());
    if (!estadoId) {
      const err = new Error("Estado de cita inválido");
      err.statusCode = 400;
      throw err;
    }
    fields.push("id_estado_cita = ?");
    values.push(estadoId);
  }

  if (fields.length === 0) return current;

  values.push(id);
  await getPool().query(`UPDATE citas SET ${fields.join(", ")} WHERE id_cita = ?`, values);

  return await getById(id);
}

async function markEliminado(id) {
  const eliminadoId = await getEstadoIdByStr("rechazado");
  const [result] = await getPool().query(
    "UPDATE citas SET id_estado_cita = ? WHERE id_cita = ?",
    [eliminadoId, id]
  );
  return result.affectedRows > 0;
}

module.exports = { list, listByEstado, getById, create, update, markEliminado };
