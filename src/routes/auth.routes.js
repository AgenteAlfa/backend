const router = require("express").Router();
const { validate } = require("../middlewares/validate.middleware");
const { loginSchema } = require("../validators/auth.validator");
const { login } = require("../controllers/auth.controller");

router.post("/login", validate(loginSchema), login);

module.exports = router;
