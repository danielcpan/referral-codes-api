const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    offer: {
      type: String,
      required: true,
    },
    offerCashValue: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    // tags
    // categories
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Promotion", PromotionSchema);
