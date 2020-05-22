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
    invalidCount: {
      type: Number,
      default: 0,
      required: true,
    },
    isInvalid: {
      type: Boolean,
      default: false,
    },
    analytics: {
      clicks: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", ReferralSchema);
