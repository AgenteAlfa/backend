const { getPool } = require("../db/pool");

async function getEstadoIdByStr(str) {
  const [rows] = await getPool().query(
    "SELECT id_estado_cita FROM estados_cita WHERE str_estado_cita = ? LIMIT 1",
    [str]
  );
  return rows[0]?.id_estado_cita ?? null;
}

module.exports = { getEstadoIdByStr };
