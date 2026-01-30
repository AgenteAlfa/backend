const svc = require("../services/clientes.service");

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

async function list(req, res, next) {
  try {
    const includeInactive = String(req.query.include_inactive || "false") === "true";
    const rows = await svc.list({ includeInactive });
    res.json(rows);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const row = await svc.getById(id);
    if (!row) return res.status(404).json({ message: "Cliente not found" });

    res.json(row);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const created = await svc.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const id = parseId(req);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const updated = await svc.update(id, req.body);
    if (!updated) return res.status(404).json({ message: "Cliente not found" });

    res.json(updated);
  } catch (e) { next(e); }
}

async function removeLogical(req, res, next) {
  try {
    const id = parseId(req);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const ok = await svc.logicalDelete(id);
    if (!ok) return res.status(404).json({ message: "Cliente not found" });

    res.status(204).send();
  } catch (e) { next(e); }
}

module.exports = { list, getById, create, update, removeLogical };
