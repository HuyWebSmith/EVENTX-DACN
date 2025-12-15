const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByEvent,
} = require("../controllers/commentController");
const { authUserMiddleWare } = require("../middleware/authMiddleware");

router.get("/:eventId", getCommentsByEvent);
router.post("/", authUserMiddleWare, createComment);

module.exports = router;
