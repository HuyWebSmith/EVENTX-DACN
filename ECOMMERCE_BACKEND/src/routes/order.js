const express = require("express");
const router = express.Router();
const Order = require("../models/OrderProduct");
const OrderDetail = require("../models/OrderDetail");
const IssuedTicket = require("../models/IssuedTicket");
const Ticket = require("../models/TicketModel"); // sửa đường dẫn nếu cần
const HeldTicket = require("../models/HeldTicket");
const User = require("../models/UserModel");
const RefundLog = require("../models/RefundLog");
const dayjs = require("dayjs");
const { nanoid } = require("nanoid");
// POST /api/orders/create-paypal
router.post("/create-paypal", async (req, res) => {
  try {
    const {
      holdId,
      selectedQuantities,
      totalPrice,
      totalQuantity,
      customerInfo,
      paypalOrderId,
    } = req.body;

    // Kiểm tra dữ liệu cơ bản
    if (!holdId) return res.status(400).json({ message: "Thiếu holdId" });
    if (!selectedQuantities || Object.keys(selectedQuantities).length === 0)
      return res.status(400).json({ message: "Không có vé nào được chọn" });
    if (!totalPrice || totalPrice <= 0)
      return res.status(400).json({ message: "Tổng tiền không hợp lệ" });
    console.log("customerInfo", customerInfo);
    // 1️⃣ Tạo Order
    const newOrder = await Order.create({
      userId: customerInfo?.userId,
      totalAmount: totalPrice,
      fullName: customerInfo?.fullName || "Khách vãng lai",
      email: customerInfo?.email || "",
      phoneNumber: customerInfo?.phoneNumber || "",
      address: customerInfo?.address || "",
      orderStatus: "Completed",
      paymentMethod: "PayPal",
      paypalOrderId: paypalOrderId || "",
    });

    console.log("Order created:", newOrder._id);

    // 2️⃣ Tạo OrderDetail và IssuedTicket
    for (const [ticketId, quantity] of Object.entries(selectedQuantities)) {
      if (quantity <= 0) continue;

      const price = 100000; // Hoặc lấy từ DB ticket
      const orderDetail = await OrderDetail.create({
        orderId: newOrder._id,
        ticketId,
        quantity,
        price,
      });
      const ticket = await Ticket.findById(ticketId);
      for (let i = 0; i < quantity; i++) {
        await IssuedTicket.create({
          ticketCode: `${ticketId}-${ticket.type}-${nanoid(10)}`,
          orderDetailId: orderDetail._id,

          userId: customerInfo.userId || "guest",
          soldDate: new Date(),
        });
      }
      await Ticket.findByIdAndUpdate(ticketId, { $inc: { sold: quantity } });
    }
    console.log(holdId);

    await HeldTicket.deleteMany({
      userId: customerInfo.userId,
      ticketId: { $in: Object.keys(selectedQuantities) },
    });
    res.status(200).json({ orderId: newOrder._id });
  } catch (err) {
    console.error("Lỗi create-paypal:", err);
    res
      .status(500)
      .json({ message: "Tạo đơn hàng thất bại", error: err.message });
  }
});
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "orderDetails",
        populate: { path: "ticketId", model: "Ticket" },
      })
      .lean(); // xóa populate nếu ko cần
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    order.orderDetails = order.orderDetails.map((detail) => ({
      _id: detail._id,
      ticketName: detail.ticketId?.type || "Vé",
      ticketType: detail.ticketId?.description || "Vé",
      price: detail.price,
      quantity: detail.quantity,
    }));
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/get-by-event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Lấy tất cả ticketId của event
    const tickets = await Ticket.find({ eventId });
    const ticketIds = tickets.map((t) => t._id);

    // Lấy tất cả OrderDetail theo ticketId
    const orderDetails = await OrderDetail.find({
      ticketId: { $in: ticketIds },
    })
      .populate("orderId")
      .populate("ticketId")
      .lean({ virtuals: true });

    if (!orderDetails.length) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Map ra thông tin cần thiết
    const orders = orderDetails.map((od) => ({
      orderId: od.orderId._id,
      ticketName: od.ticketId?.type || "Vé",
      ticketDescription: od.ticketId?.description || "",
      quantity: od.quantity,
      price: od.price,
      buyer: od.orderId?.fullName,
      email: od.orderId?.email,
      status: od.orderId?.orderStatus,
      createdAt: od.orderId?.createdAt,
      isEmailSent: od.orderId?.isEmailSent ?? false,
    }));

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
router.get("/get-by-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy tất cả orderDetail của order
    const orderDetails = await OrderDetail.find({ orderId });

    if (!orderDetails.length) {
      return res.status(404).json({ message: "Không tìm thấy orderDetail" });
    }

    const orderDetailIds = orderDetails.map((od) => od._id);

    // Lấy tất cả issued ticket liên quan
    const issuedTickets = await IssuedTicket.find({
      orderDetailId: { $in: orderDetailIds },
    })
      .populate({
        path: "orderDetailId", // từ IssuedTicket tới OrderDetail
        populate: { path: "ticketId", model: "Ticket" }, // từ OrderDetail tới Ticket
      })
      .lean();
    const result = issuedTickets.map((t) => ({
      ticketCode: t.ticketCode,
      ticketName: t.orderDetailId.ticketId?.type || "Vé",
      ticketDescription: t.orderDetailId.ticketId?.description || "",
      quantity: t.orderDetailId.quantity,
      price: t.orderDetailId.price,
      isCheckedIn: t.isCheckedIn,
      checkinTime: t.checkinTime,
    }));
    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// POST /api/orders/pay-wallet
router.post("/pay-wallet", async (req, res) => {
  try {
    const {
      holdId,
      selectedQuantities,
      totalPrice,
      totalQuantity,
      customerInfo,
    } = req.body;

    if (!customerInfo?.userId)
      return res.status(400).json({ message: "Thiếu userId" });

    const user = await User.findById(customerInfo.userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Check số dư ví
    if (user.walletBalance < totalPrice) {
      return res.status(400).json({ message: "Số dư ví không đủ" });
    }

    // Trừ tiền trong ví
    user.walletBalance -= totalPrice;

    await user.save();

    // Tạo đơn hàng
    const newOrder = await Order.create({
      userId: customerInfo.userId,
      totalAmount: totalPrice,
      fullName: customerInfo.fullName || "Khách",
      email: customerInfo.email || "",
      phoneNumber: customerInfo.phoneNumber || "",
      address: customerInfo.address || "",
      orderStatus: "Completed",
      paymentMethod: "Wallet",
    });

    // Tạo OrderDetail + IssuedTicket
    for (const [ticketId, quantity] of Object.entries(selectedQuantities)) {
      if (quantity <= 0) continue;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) continue;

      const orderDetail = await OrderDetail.create({
        orderId: newOrder._id,
        ticketId,
        quantity,
        price: ticket.price,
      });

      for (let i = 0; i < quantity; i++) {
        await IssuedTicket.create({
          ticketCode: `${ticketId}-${ticket.type}-${nanoid(10)}`,
          orderDetailId: orderDetail._id,
          userId: customerInfo.userId,
          soldDate: new Date(),
        });
      }

      await Ticket.findByIdAndUpdate(ticketId, {
        $inc: { sold: quantity },
      });
    }

    // Xóa vé đang Hold
    await HeldTicket.deleteMany({
      userId: customerInfo.userId,
      ticketId: { $in: Object.keys(selectedQuantities) },
    });

    res.status(200).json({
      success: true, // thêm success
      message: "Thanh toán bằng ví thành công",
      orderId: newOrder._id,
      balance: user.walletBalance, // gửi luôn số dư mới
    });
  } catch (err) {
    console.error("Lỗi pay-wallet:", err);
    res
      .status(500)
      .json({ message: "Thanh toán ví thất bại", error: err.message });
  }
});
// POST /api/orders/refund-ticket
router.post("/request-refund", async (req, res) => {
  const { ticketCode } = req.body;

  const ticket = await IssuedTicket.findOne({ ticketCode }).populate({
    path: "orderDetailId",
    populate: [{ path: "ticketId", populate: "eventId" }],
  });

  if (!ticket)
    return res.json({ success: false, message: "Không tìm thấy vé" });

  if (ticket.isCheckedIn)
    return res.json({ success: false, message: "Vé đã check-in" });

  if (ticket.refundStatus === "REQUESTED")
    return res.json({ success: false, message: "Đã yêu cầu hoàn vé" });

  const eventDate = ticket.orderDetailId.ticketId.eventId.eventDate;
  if (dayjs().isAfter(eventDate))
    return res.json({ success: false, message: "Sự kiện đã diễn ra" });

  ticket.refundStatus = "REQUESTED";
  await ticket.save();

  res.json({ success: true, message: "Đã gửi yêu cầu hoàn vé" });
});
router.post("/refunds/approve", async (req, res) => {
  const { ticketCode } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await IssuedTicket.findOne({ ticketCode })
      .populate({
        path: "orderDetailId",
        populate: [{ path: "ticketId" }, { path: "orderId" }],
      })
      .session(session);

    if (!ticket || ticket.refundStatus !== "REQUESTED") {
      await session.abortTransaction();
      return res.json({ success: false, message: "Vé không hợp lệ" });
    }

    const user = await User.findById(
      ticket.orderDetailId.orderId.userId
    ).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.json({ success: false, message: "Không tìm thấy user" });
    }

    const refundAmount = ticket.orderDetailId.ticketId.price;

    // 1️⃣ Cộng tiền về ví người dùng
    user.walletBalance += refundAmount;
    await user.save();

    // 2️⃣ Cập nhật trạng thái vé
    ticket.refundStatus = "REFUNDED";
    ticket.status = "Invalid";
    ticket.refundTime = new Date();
    await ticket.save();

    // 3️⃣ Trừ doanh thu nếu có trường revenue trong Event
    const event = await Ticket.findById(ticket.orderDetailId.ticketId._id)
      .populate("eventId")
      .session(session);
    if (event.eventId) {
      event.eventId.revenue = (event.eventId.revenue || 0) - refundAmount;
      await event.eventId.save();
    }

    // 4️⃣ Ghi log hoàn vé
    await RefundLog.create(
      [
        {
          ticketCode,
          eventId: ticket.orderDetailId.ticketId.eventId,
          userId: ticket.orderDetailId.orderId.userId,
          refundAmount,
          status: "APPROVED",
          refundedAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Đã duyệt hoàn vé" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Hoàn vé thất bại",
      error: err.message,
    });
  }
});

router.post("/refunds/reject", async (req, res) => {
  const { ticketCode } = req.body;
  const ticket = await IssuedTicket.findOne({ ticketCode });

  if (!ticket || ticket.refundStatus !== "REQUESTED") {
    return res.json({ success: false, message: "Vé không hợp lệ" });
  }

  ticket.refundStatus = "REJECTED";
  await ticket.save();

  // Ghi log từ chối
  await RefundLog.create({
    ticketCode,
    eventId: ticket.orderDetailId.ticketId.eventId,
    userId: ticket.orderDetailId.orderId.userId,
    refundAmount: 0,
    status: "REJECTED",
    refundedAt: new Date(),
  });

  res.json({ success: true, message: "Đã từ chối hoàn vé" });
});

module.exports = router;
