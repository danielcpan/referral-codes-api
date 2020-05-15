const express = require("express");
const expressJwt = require("express-jwt");
const validate = require("express-validation");
const promotionController = require("../controllers/promotion.controller");
const paramValidation = require("../utils/param-validation.utils");
const { checkCache } = require("../utils/redis.utils");

const router = express.Router();

router
  .route("/")
  .get(checkCache, promotionController.list)
  .post(promotionController.create);

router
  .route("/:promotionId")
  .get(checkCache, promotionController.get)
  .put(promotionController.update);

module.exports = router;
