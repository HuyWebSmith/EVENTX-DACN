const express = require("express");
const router = express.Router();
const { addBalance, deductBalance } = require("../services/walletService");

// Nạp tiền
router.post("/add", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    console.log("REQ:", req.body);

    const result = await addBalance(userId, amount);
    console.log("RESULT:", result);

    return res.json(result);
  } catch (err) {
    console.error("WALLET ADD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server lỗi" });
  }
});

// Trừ tiền
router.post("/deduct", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const result = await deductBalance(userId, amount);
    if (!result.success)
      return res.status(400).json({ message: result.message });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server internal" });
  }
});

module.exports = router;
