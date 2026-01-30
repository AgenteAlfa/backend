const router = require("express").Router();
const { getPool } = require("../db/pool");

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await getPool().query("SELECT 1 as ok");
    res.json({ status: "ok", db: rows[0].ok === 1 });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
