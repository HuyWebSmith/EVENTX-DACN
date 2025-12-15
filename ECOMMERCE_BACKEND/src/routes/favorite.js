// routes/favorite.js
const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const Event = require("../models/EventModel");

// Thêm yêu thích

router.post("/addFavorite", async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    if (!event) return res.status(404).json({ message: "Event không tồn tại" });

    if (!user.favorites.includes(eventId)) {
      user.favorites.push(eventId);
      await user.save();
    }
    res.status(200).json({ message: "Đã thêm vào yêu thích" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Xóa yêu thích
router.post("/removeFavorite", async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    const user = await User.findById(userId);
    user.favorites = user.favorites.filter((id) => id.toString() !== eventId);
    await user.save();
    res.status(200).json({ message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy danh sách yêu thích
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("favorites");
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
