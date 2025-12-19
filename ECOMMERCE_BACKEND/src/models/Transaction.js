const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplicationUser",
      required: true,
    },
    type: { type: String, enum: ["NAP", "RUT"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "SUCCESS",
    },
    balanceBefore: Number,
    balanceAfter: Number,
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
