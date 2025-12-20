const bcrypt = require("bcrypt");
const ApplicationUser = require("../models/UserModel");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const WalletMission = require("../models/WalletMission");
async function addBalance(userId, amount) {
  const user = await ApplicationUser.findById(userId);
  if (!user) return { success: false, message: "Không tìm thấy user" };
  if (amount <= 0) return { success: false, message: "Số tiền không hợp lệ" };

  const before = user.walletBalance;
  const after = before + amount;
  user.walletBalance = after;
  await user.save();

  await Transaction.create({
    userId,
    type: "NAP",
    amount,
    status: "SUCCESS",
    balanceBefore: before,
    balanceAfter: after,
    note: "Nạp tiền vào ví",
  });

  return {
    success: true,
    message: "Nạp tiền thành công",
    balance: after,
  };
}

async function deductBalance(userId, amount, password) {
  if (!password) return { success: false, message: "Vui lòng nhập mật khẩu" };

  // Lấy password
  const user = await ApplicationUser.findById(userId).select("+password");

  if (!user) return { success: false, message: "Không tìm thấy user" };

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return { success: false, message: "Mật khẩu không đúng" };

  if (amount <= 0) return { success: false, message: "Số tiền không hợp lệ" };
  if (user.walletBalance < amount)
    return { success: false, message: "Số dư không đủ" };

  const before = user.walletBalance;
  const after = before - amount;
  user.walletBalance = after;
  await user.save();

  await Transaction.create({
    userId,
    type: "RUT",
    amount,
    status: "SUCCESS",
    balanceBefore: before,
    balanceAfter: after,
    note: "Trừ tiền từ ví",
  });

  return { success: true, newBalance: after, message: "Rút tiền thành công" };
}
async function updateWalletStatus(userId) {
  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await seedWalletAndMissions(userId);

    const user = await ApplicationUser.findById(userId);
    if (!user) return { wallet, missions: [] };

    const transactions = await Transaction.find({ userId });

    const missions = [
      {
        missionCode: "EMAIL_VERIFY",
        name: "Xác nhận Email",
        description: "Nhận OTP qua email",
        isCompleted: !!user.emailConfirmed,
      },
      {
        missionCode: "PROFILE_COMPLETE",
        name: "Hoàn thành Profile",
        description: "Điền đầy đủ thông tin cá nhân",
        isCompleted:
          !!user.fullName &&
          !!user.phone &&
          !!user.email &&
          !!user.gender &&
          !!user.dateOfBirth &&
          !!user.avatarUrl &&
          !!user.address,
      },
      {
        missionCode: "KYC",
        name: "Hoàn tất KYC",
        description: "Xác thực danh tính",
        isCompleted: user.verificationStatus === "Approved",
      },
      {
        missionCode: "FIRST_TRANSACTION",
        name: "Giao dịch đầu tiên",
        description: "Thực hiện nạp/rút/đặt vé",
        isCompleted: transactions.some((t) => t.status === "SUCCESS"),
      },
      {
        missionCode: "GOOD_HISTORY",
        name: "Lịch sử tốt",
        description: "Không vi phạm trong 6 tháng",
        isCompleted: false,
      },
    ];
    for (const m of missions) {
      if (!m.isCompleted) continue;

      await WalletMission.findOneAndUpdate(
        { walletId: wallet._id, missionCode: m.missionCode },
        {
          walletId: wallet._id,
          missionCode: m.missionCode,
          name: m.name,
          description: m.description,
          isCompleted: true,
          completedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    // Cập nhật status wallet theo missions
    let newStatus = "Locked";
    if (missions[0].isCompleted && missions[1].isCompleted) newStatus = "Basic";
    if (newStatus === "Basic" && missions[3].isCompleted) newStatus = "Active";
    if (newStatus === "Active" && missions[2].isCompleted)
      newStatus = "Verified";
    if (newStatus === "Verified" && missions[4].isCompleted)
      newStatus = "Trusted";

    if (wallet.status !== newStatus) {
      wallet.status = newStatus;
      await wallet.save();
    }
    const savedMissions = await WalletMission.find({ walletId: wallet._id });
    return { wallet, missions: savedMissions };
  } catch (err) {
    console.error("Failed to update wallet status:", err);
    return { wallet: null, missions: [] };
  }
}

async function seedWalletAndMissions(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = new Wallet({ userId, balance: 0, status: "Locked" });
    await wallet.save();

    const missionsData = [
      {
        walletId: wallet._id,
        missionCode: "EMAIL_VERIFY",
        name: "Xác nhận Email",
        isCompleted: false,
      },
      {
        walletId: wallet._id,
        missionCode: "PROFILE_COMPLETE",
        name: "Hoàn thành Profile",
        isCompleted: false,
      },
      {
        walletId: wallet._id,
        missionCode: "KYC",
        name: "Hoàn tất KYC",
        isCompleted: false,
      },
    ];

    await WalletMission.insertMany(missionsData);
  }
  return wallet;
}

module.exports = {
  addBalance,
  deductBalance,
  updateWalletStatus,
};
