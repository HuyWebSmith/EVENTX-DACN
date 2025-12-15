const QRCode = require("qrcode");
const IssuedTicket = require("../models/IssuedTicket");
const Ticket = require("../models/TicketModel");
const Order = require("../models/OrderProduct");
const OrderDetail = require("../models/OrderDetail");
const Event = require("../models/EventModel");
const sendEmailService = require("../services/EmailService");

const sendMailForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ status: "ERR", message: "Order không tồn tại" });
    }

    const event = await Event.findById(order.eventId); // đảm bảo order có eventId

    // Lấy OrderDetail và populate ticket
    const orderDetails = await OrderDetail.find({ orderId }).populate(
      "ticketId"
    );
    if (!orderDetails || orderDetails.length === 0) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Không có OrderDetail" });
    }

    // Lấy tất cả IssuedTicket liên quan
    const issuedTickets = await IssuedTicket.find({
      orderDetailId: { $in: orderDetails.map((d) => d._id) },
    });

    let ticketsHtml = "";
    let attachments = [];

    for (const ticket of issuedTickets) {
      const od = orderDetails.find(
        (d) => d._id.toString() === ticket.orderDetailId.toString()
      );
      const ticketInfo = od.ticketId;

      const ticketPrice = ticket.price || od.price;

      const qrBase64 = await QRCode.toDataURL(ticket.ticketCode);
      const qrImage = qrBase64.split(",")[1];
      const cid = `qr_${ticket.ticketCode}@eventx`;

      attachments.push({
        filename: `${ticket.ticketCode}.png`,
        content: Buffer.from(qrImage, "base64"),
        cid,
      });

      ticketsHtml += `
        <tr style="vertical-align: middle;">
          <td style="padding: 12px; border: 1px solid #cbd5e1;">${
            ticketInfo.type
          }</td>
          <td style="padding: 12px; border: 1px solid #cbd5e1; text-align:center;">
            <img src="cid:${cid}" width="130" height="130" style="display:block; margin:0 auto;"/>
            <div style="font-size: 12px; color: #555; margin-top:5px;">${
              ticket.ticketCode
            }</div>
          </td>
          <td style="padding: 12px; border: 1px solid #cbd5e1; text-align:right;">
            ${ticketPrice.toLocaleString()} VND
          </td>
        </tr>
      `;
    }

    // Tin nhắn người mua từ Event
    const buyerMessageHtml =
      event && event.buyerMessage
        ? `<div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6;">
           <p style="margin: 0;"><strong>📝 Tin nhắn của bạn:</strong> ${event.buyerMessage}</p>
         </div>`
        : "";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 0; margin: 0;">
        <div style="background: linear-gradient(90deg, #4f46e5, #6d28d9); padding: 20px; text-align: center; color: white; border-radius: 6px 6px 0 0;">
          <h1 style="margin: 0; font-size: 26px;">EventX - Vé Sự Kiện Của Bạn</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #111; margin-top: 0;">Xin chào ${
            order.fullName
          },</h2>
          <p>Cảm ơn bạn đã đặt vé tại <strong>EventX</strong>.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; color: #1e293b;">🧾 Thông tin đơn hàng</h3>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Tổng tiền:</strong> 
              <span style="color:#16a34a; font-weight:bold;">
                ${order.totalAmount.toLocaleString()} VND
              </span>
            </p>
          </div>

          ${buyerMessageHtml}

          <h3 style="color: #1e293b; margin-top: 25px;">🎟 Vé của bạn</h3>
          <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 10px;">
            <tr style="background: #e2e8f0;">
              <th style="padding: 12px; border: 1px solid #cbd5e1; text-align:left;">Tên vé</th>
              <th style="padding: 12px; border: 1px solid #cbd5e1;">QR Code</th>
              <th style="padding: 12px; border: 1px solid #cbd5e1; text-align:right;">Giá</th>
            </tr>
            ${ticketsHtml}
          </table>
          <div style="margin-top: 30px; padding: 15px; background: #fefce8; border-left: 4px solid #facc15;">
            <p style="margin: 0;">⚠️ <strong>Lưu ý:</strong> Vui lòng dùng QR Code để check-in tại sự kiện.</p>
          </div>
          <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Cảm ơn bạn đã sử dụng EventX ❤️</p>
          </div>
        </div>
      </div>
    `;

    await sendEmailService({
      to: order.email,
      subject: "🎟 Vé sự kiện của bạn (QR Code)",
      html: htmlContent,
      attachments,
    });

    order.isEmailSent = true;
    await order.save();

    return res
      .status(200)
      .json({ status: "OK", message: "Gửi email thành công" });
  } catch (e) {
    console.error("email error:", e);
    return res
      .status(500)
      .json({ status: "ERR", message: "Gửi email thất bại" });
  }
};

module.exports = { sendMailForOrder };
