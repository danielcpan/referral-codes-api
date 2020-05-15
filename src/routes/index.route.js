const express = require("express");
const promotionRoutes = require("./promotion.route");
const referralRoutes = require("./referral.route");

const router = express.Router(); // eslint-disable-line new-cap

router.get("/health-check", (req, res) => res.send("OK"));

router.use("/promotions", promotionRoutes);
router.use("/referrals", referralRoutes);

module.exports = router;
