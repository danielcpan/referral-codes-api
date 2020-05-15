const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    isInvalid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", ReferralSchema);
