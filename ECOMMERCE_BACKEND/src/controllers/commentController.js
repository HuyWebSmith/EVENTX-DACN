const Comment = require("../models/Comment");
const User = require("../models/UserModel");

exports.createComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { eventId, rating, content } = req.body;
    if (!eventId || !rating || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(req.user.id);

    const comment = await Comment.create({
      eventId,
      userId: req.user.id,
      userName: user.fullName || "Unknown",
      userAvatar: user.avatarUrl || "",
      rating,
      content,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCommentsByEvent = async (req, res) => {
  try {
    const comments = await Comment.find({
      eventId: req.params.eventId,
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
