const svc = require("../services/citas.service");

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

async function list(req, res, next) {
  try {
    const rows = await svc.list();
    res.json(rows);
  } catch (e) { next(e); }
}

async function listByEstado(req, res, next) {
  try {
    const estado = String(req.params.estado || "").toLowerCase();
    const rows = await svc.listByEstado(estado);
    res.json(rows);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const row = await svc.getById(id);
    if (!row) return res.status(404).json({ message: "Cita not found" });

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
    if (!updated) return res.status(404).json({ message: "Cita not found" });

    res.json(updated);
  } catch (e) { next(e); }
}

async function removeToEliminado(req, res, next) {
  try {
    const id = parseId(req);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const ok = await svc.markEliminado(id);
    if (!ok) return res.status(404).json({ message: "Cita not found" });

    res.status(204).send();
  } catch (e) { next(e); }
}

module.exports = { list, listByEstado, getById, create, update, removeToEliminado };
