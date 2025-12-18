const express = require("express");
const router = express.Router();
const Order = require("../models/OrderProduct");
const OrderDetail = require("../models/OrderDetail");
const IssuedTicket = require("../models/IssuedTicket");
const Ticket = require("../models/TicketModel"); // sửa đường dẫn nếu cần
const HeldTicket = require("../models/HeldTicket");
const User = require("../models/UserModel");
const RefundLog = require("../models/RefundLog");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
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
// routes/order.js
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate({
      path: "orderDetails",
      model: "OrderDetail", // <--- Quan trọng: tên model phải khớp với mongoose.model("OrderDetail",...)
      populate: {
        path: "ticketId",
        model: "Ticket",
      },
    });

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const orderData = order.toJSON();

    // Map lại cấu trúc để FE dễ dùng
    const formattedOrder = {
      ...orderData,
      orderDetails: (orderData.orderDetails || []).map((d) => ({
        _id: d._id,
        ticketName: d.ticketId?.type || "Vé sự kiện",
        ticketType: d.ticketId?.description || "Tiêu chuẩn",
        price: d.price,
        quantity: d.quantity,
      })),
    };

    res.json(formattedOrder);
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
router.post("/create", async (req, res) => {
  try {
    const {
      holdId,
      paymentMethod,
      password, // Chỉ dùng cho Wallet
      customerInfo,
      selectedQuantities, // Object: { "id_ve": so_luong }
      totalPrice,
      paypalOrderId, // Lưu lại mã PayPal nếu có để đối soát
    } = req.body;

    if (!customerInfo?.userId)
      return res.status(400).json({ message: "Thiếu userId" });
    if (!selectedQuantities || Object.keys(selectedQuantities).length === 0) {
      return res.status(400).json({ message: "Danh sách vé rỗng" });
    }

    if (paymentMethod === "Wallet") {
      const user = await User.findById(customerInfo.userId);
      if (!user) return res.status(404).json({ message: "User không tồn tại" });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch)
        return res
          .status(400)
          .json({ status: "ERROR", message: "Mật khẩu ví không chính xác!" });

      if (user.walletBalance < totalPrice) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "Số dư ví không đủ" });
      }

      user.walletBalance -= totalPrice;
      await user.save();
    }

    // --- 3. TẠO ORDER CHUNG ---
    const newOrder = await Order.create({
      userId: customerInfo.userId,
      totalAmount: totalPrice,
      fullName: customerInfo.fullName || "Khách hàng",
      email: customerInfo.email || "",
      phoneNumber: customerInfo.phoneNumber || "",
      address: customerInfo.address || "",
      orderStatus: "Completed",
      paymentMethod: paymentMethod,
      paypalOrderId: paypalOrderId || "",
    });

    const ticketEntries = Object.entries(selectedQuantities);

    for (const [ticketId, quantity] of ticketEntries) {
      if (quantity <= 0) continue;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) continue;

      // Tạo chi tiết đơn hàng
      const orderDetail = await OrderDetail.create({
        orderId: newOrder._id,
        ticketId: ticketId,
        quantity: quantity,
        price: ticket.price,
      });

      // Tạo mã vé IssuedTicket cho từng số lượng
      const ticketPromises = [];
      for (let i = 0; i < quantity; i++) {
        ticketPromises.push(
          IssuedTicket.create({
            ticketCode: `EVENTX-${ticketId.slice(-4)}-${nanoid(
              8
            ).toUpperCase()}`,
            orderDetailId: orderDetail._id,
            userId: customerInfo.userId,
            soldDate: new Date(),
          })
        );
      }
      await Promise.all(ticketPromises);

      // Cập nhật số lượng đã bán vào kho vé
      await Ticket.findByIdAndUpdate(ticketId, { $inc: { sold: quantity } });
    }

    // --- 5. DỌN DẸP VÉ ĐANG GIỮ (HOLD) ---
    // Xóa theo userId và danh sách ticketId đã mua thành công
    await HeldTicket.deleteMany({
      userId: customerInfo.userId,
      ticketId: { $in: Object.keys(selectedQuantities) },
    });

    res.status(200).json({
      status: "OK",
      success: true,
      orderId: newOrder._id,
      message: "Giao dịch hoàn tất thành công!",
    });
  } catch (err) {
    console.error("Lỗi tạo đơn tổng hợp:", err);
    res.status(500).json({ status: "ERROR", message: err.message });
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

    const userId = ticket.orderDetailId?.orderId?.userId;
    const refundAmount = ticket.orderDetailId?.ticketId?.price;

    if (!userId || refundAmount == null) {
      await session.abortTransaction();
      return res.json({ success: false, message: "Dữ liệu vé không hợp lệ" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.json({ success: false, message: "Không tìm thấy user" });
    }

    user.walletBalance = (user.walletBalance || 0) + refundAmount;
    await user.save({ session });

    ticket.refundStatus = "REFUNDED";
    ticket.status = "Invalid";
    ticket.refundTime = new Date();
    await ticket.save({ session });

    const event = await Ticket.findById(ticket.orderDetailId.ticketId._id)
      .populate("eventId")
      .session(session);

    if (event && event.eventId) {
      event.eventId.revenue = (event.eventId.revenue || 0) - refundAmount;
      await event.eventId.save({ session });
    }

    await RefundLog.create(
      [
        {
          ticketCode,
          eventId: ticket.orderDetailId.ticketId.eventId,
          userId,
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
