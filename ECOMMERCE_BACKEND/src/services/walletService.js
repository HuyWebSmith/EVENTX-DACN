const ApplicationUser = require("../models/UserModel");

async function addBalance(userId, amount) {
  const user = await ApplicationUser.findById(userId);
  if (!user) return { success: false, message: "Không tìm thấy user" };

  if (amount <= 0) return { success: false, message: "Số tiền không hợp lệ" };

  user.walletBalance += amount;
  await user.save();

  return { success: true, balance: user.walletBalance };
}

async function deductBalance(userId, amount) {
  const user = await ApplicationUser.findById(userId);
  if (!user) return { success: false, message: "Không tìm thấy user" };

  if (user.walletBalance < amount)
    return { success: false, message: "Số dư không đủ" };

  user.walletBalance -= amount;
  await user.save();

  return { success: true, balance: user.walletBalance };
}

module.exports = {
  addBalance,
  deductBalance,
};
