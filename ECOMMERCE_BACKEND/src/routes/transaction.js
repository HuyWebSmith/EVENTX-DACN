const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { authUserMiddleWare } = require("../middleware/authMiddleware");

router.get("/me", authUserMiddleWare.authUserMiddleWare, async (req, res) => {
  const userId = req.user._id;

  const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

  res.json(list);
});

module.exports = router;
