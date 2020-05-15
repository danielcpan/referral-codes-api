const express = require("express");
const validate = require("express-validation");
const referralController = require("../controllers/referral.controller");
const paramValidation = require("../utils/param-validation.utils");
const { checkCache } = require("../utils/redis.utils");

const router = express.Router();

router
  .route("/")
  .get(checkCache, referralController.list)
  .post(referralController.create);

router
  .route("/:referralId")
  .get(checkCache, referralController.get)
  .put(referralController.update);

module.exports = router;
