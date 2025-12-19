const mongoose = require("mongoose");

const walletMissionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true, // tạo index để query nhanh theo wallet
    },
    missionCode: {
      type: String,
      required: true,
      enum: ["EMAIL_VERIFY", "PROFILE_COMPLETE", "KYC", "LINK_PAYPAL"],
      index: true, // index để query theo missionCode nếu cần
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "", // thêm mô tả nhiệm vụ để hiển thị trên UI
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: đảm bảo 1 wallet chỉ có 1 missionCode duy nhất
walletMissionSchema.index({ walletId: 1, missionCode: 1 }, { unique: true });

const WalletMission = mongoose.model("WalletMission", walletMissionSchema);

module.exports = WalletMission;
