const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // liên kết đến collection User
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Locked", "Basic", "Active", "Verified", "Trusted"],
      default: "Locked",
    },
  },
  { timestamps: true } // tự tạo createdAt và updatedAt
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
