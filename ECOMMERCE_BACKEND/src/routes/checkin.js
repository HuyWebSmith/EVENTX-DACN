const express = require("express");
const router = express.Router();
const IssuedTicket = require("../models/IssuedTicket");

router.post("/scan", async (req, res) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode)
      return res.json({ success: false, message: "Thiếu ticketCode" });

    // Tìm vé theo mã
    const ticket = await IssuedTicket.findOne({ ticketCode })
      .populate({
        path: "orderDetailId",
        populate: { path: "ticketId", model: "Ticket" },
      })
      .lean();

    if (!ticket)
      return res.json({
        success: false,
        status: "Invalid",
        message: "Vé không tồn tại",
      });

    // Check đã check-in
    if (ticket.isCheckedIn)
      return res.json({
        success: false,
        status: "CheckedIn",
        message: "Vé này đã check-in!",
        data: ticket,
      });

    // Check-in thành công
    await IssuedTicket.updateOne(
      { ticketCode },
      { isCheckedIn: true, status: "CheckedIn", checkinTime: new Date() }
    );

    return res.json({
      success: true,
      status: "CheckedIn",
      message: "Check-in thành công!",
      data: ticket,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
router.post("/checkin-face", async (req, res) => {
  try {
    const { ticketCode, faceDescriptor } = req.body;

    if (!ticketCode || !faceDescriptor)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });

    const ticket = await IssuedTicket.findOne({ ticketCode });
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Vé không tồn tại" });

    if (ticket.isCheckedIn)
      return res.json({ success: false, message: "Vé đã check-in!" });

    // So sánh faceDescriptor với stored faceDescriptor
    const savedDescriptor = ticket.faceDescriptor; // array
    if (!savedDescriptor || savedDescriptor.length === 0)
      return res.json({ success: false, message: "Vé chưa đăng ký Face ID" });

    // Chúng ta dùng Euclidean distance để so sánh
    const distance = faceDescriptor.reduce(
      (acc, val, i) => acc + Math.pow(val - savedDescriptor[i], 2),
      0
    );
    const euclidean = Math.sqrt(distance);

    // Ngưỡng cho phép: 0.6 (face-api.js thường dùng)
    if (euclidean > 0.6)
      return res.json({ success: false, message: "Face ID không khớp" });

    // Thành công → cập nhật check-in
    ticket.isCheckedIn = true;
    ticket.status = "CheckedIn";
    ticket.checkinTime = new Date();
    await ticket.save();

    res.json({ success: true, message: "Check-in bằng Face ID thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/register-face", async (req, res) => {
  try {
    const { ticketCode, faceDescriptor } = req.body;

    if (!ticketCode || !faceDescriptor)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });

    const ticket = await IssuedTicket.findOne({ ticketCode });
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Vé không tồn tại" });

    // Lưu faceDescriptor vào vé
    ticket.faceDescriptor = faceDescriptor;
    await ticket.save();

    res.json({ success: true, message: "Đăng ký Face ID thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
