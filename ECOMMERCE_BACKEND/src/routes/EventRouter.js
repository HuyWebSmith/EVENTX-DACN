const express = require("express");
const router = express.Router();
const EventController = require("../controllers/EventController");
const { authMiddleWare } = require("../middleware/authMiddleware");
const Event = require("../models/EventModel");
const mongoose = require("mongoose");
const { getTrendingEvents } = require("../controllers/EventController");
// Các route CRUD
router.post("/create", EventController.createEvent);
router.put("/update/:id", authMiddleWare, EventController.updateEvent);
router.delete("/delete/:id", authMiddleWare, EventController.deleteEvent);
router.get("/get-all", EventController.getAllEvent);
router.get("/get-details/:id", EventController.getDetailEvent);
router.get("/delete-many", authMiddleWare, EventController.deleteMany);
router.get(
  "/get-by-organizer/:organizerId",
  EventController.getEventsByOrganizer
);

// Update status route
router.put("/update-status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const event = await Event.findByIdAndUpdate(id, { status }, { new: true });
    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });

    // Realtime update
    if (global._io) {
      global._io.emit("event-status-updated", {
        id: event._id,
        status: event.status,
      });
    }

    res.json({ message: "Cập nhật trạng thái thành công", data: event });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ status: "ERR", message: err.message });
  }
});

router.get("/search-suggest", async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();
    if (!keyword) return res.json([]);

    const events = await Event.find({
      title: { $regex: keyword, $options: "i" },
    })
      .limit(10)
      .select("title");

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/get-multiple", async (req, res) => {
  try {
    const { eventIds } = req.body; // mảng eventId
    if (!eventIds || !Array.isArray(eventIds))
      return res.status(400).json({ message: "Thiếu eventIds" });

    const events = await Event.find({ _id: { $in: eventIds } });
    res.json({ data: events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
router.get("/trending", getTrendingEvents);
module.exports = router;
