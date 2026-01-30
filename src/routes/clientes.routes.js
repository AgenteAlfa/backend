const router = require("express").Router();
const { authRequired } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createClienteSchema, updateClienteSchema } = require("../validators/clientes.validator");
const ctrl = require("../controllers/clientes.controller");

// all protected
router.use(authRequired);

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", validate(createClienteSchema), ctrl.create);
router.put("/:id", validate(updateClienteSchema), ctrl.update);
router.delete("/:id", ctrl.removeLogical);

module.exports = router;
