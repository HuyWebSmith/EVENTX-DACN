const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Mongoose sẽ xử lý việc xác thực qua một thư viện khác (ví dụ: Passport, JWT)

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, require: true },

    fullName: { type: String, required: true, maxLength: 100 },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"] },
    dateOfBirth: { type: Date },
    avatarUrl: { type: String, trim: true },
    rolePreference: { type: String },
    interestArea: { type: String },
    bio: { type: String },
    linkedInProfile: { type: String, trim: true },
    address: { type: String },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    createdAt: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    lastLogin: { type: Date },
    walletBalance: { type: Number, default: 0 },
    emailConfirmed: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpire: { type: Date },
    lastVerifyEmailSentAt: { type: Date },

    isHost: { type: Boolean, default: false }, // user có quyền tạo sự kiện không
    isVerifiedHost: { type: Boolean, default: false }, // đã verified bằng CMND/giấy phép
    verificationDocumentUrl: { type: String, trim: true }, // lưu đường dẫn file CMND/giấy phép
    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ApplicationUser", userSchema);
