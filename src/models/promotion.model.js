const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 6,
      max: 255,
    },
    offer: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Promotion", PromotionSchema);
