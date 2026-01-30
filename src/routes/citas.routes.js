const router = require("express").Router();
const { authRequired } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createCitaSchema, updateCitaSchema } = require("../validators/citas.validator");
const ctrl = require("../controllers/citas.controller");

router.use(authRequired);

router.get("/", ctrl.list);
router.get("/estado/:estado", ctrl.listByEstado);
router.get("/:id", ctrl.getById);
router.post("/", validate(createCitaSchema), ctrl.create);
router.put("/:id", validate(updateCitaSchema), ctrl.update);
router.delete("/:id", ctrl.removeToEliminado);

module.exports = router;
