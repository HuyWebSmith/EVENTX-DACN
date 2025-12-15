// models/RefundLog.js
const mongoose = require("mongoose");

const refundLogSchema = new mongoose.Schema({
  ticketCode: String,
  eventId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  approvedBy: mongoose.Schema.Types.ObjectId, // admin / host
  refundAmount: Number,
  status: {
    type: String,
    enum: ["APPROVED", "REJECTED"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RefundLog", refundLogSchema);
