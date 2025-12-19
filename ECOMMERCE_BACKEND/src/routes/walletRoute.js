const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const { authUserMiddleWare } = require("../middleware/authMiddleware");
const walletService = require("../services/walletService");
const { updateWalletStatus } = require("../services/walletService");

const WalletTransaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
// Nạp tiền

router.post("/add", authUserMiddleWare, async (req, res) => {
  try {
    const { amount } = req.body;

    const userId = req.user.id;
    const result = await walletService.addBalance(userId, amount);
    await updateWalletStatus(userId);
    return res.json(result);
  } catch (err) {
    console.error("WALLET ADD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server lỗi" });
  }
});

// Trừ tiền
router.post("/deduct", authUserMiddleWare, async (req, res) => {
  try {
    const { amount, password } = req.body;
    const userId = req.user.id;

    const result = await walletService.deductBalance(userId, amount, password);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Trả về số dư mới
    res.json({
      status: "OK",
      success: true,
      newBalance: result.newBalance,
      message: result.message || "Rút tiền thành công",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server internal" });
  }
});

router.get("/history", authUserMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await WalletTransaction.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: history });
  } catch (err) {
    console.error("WALLET HISTORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server lỗi" });
  }
});

router.get("/:userId", authUserMiddleWare, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    res.json({ success: true, wallet });
  } catch (err) {
    console.error("WALLET GET ERROR:", err);
    res.status(500).json({ success: false, message: "Server lỗi" });
  }
});
router.get("/update-status/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await walletService.updateWalletStatus(userId);
  if (!result) return res.status(404).json({ message: "Wallet không tồn tại" });

  res.json(result); // { wallet, missions }
});

module.exports = router;
