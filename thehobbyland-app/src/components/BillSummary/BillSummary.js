import { useNavigate } from "react-router-dom";

// Sửa đổi: Thêm onHold vào danh sách props
const BillSummary = ({ tickets, selectedQuantities, onHold }) => {
  const navigate = useNavigate();
  const ticketName = tickets.find((t) => t._id === tickets.id)?.name;

  // 🛡 SAFETY CHECK – tránh crash khi tickets chưa load
  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    return null;
  }

  if (!selectedQuantities) {
    return null;
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const selectedTickets = tickets.filter(
    (t) => (selectedQuantities?.[t._id] || 0) > 0
  );

  const totalQuantity = selectedTickets.reduce(
    (sum, t) => sum + (selectedQuantities?.[t._id] || 0),
    0
  );

  const totalPrice = selectedTickets.reduce(
    (sum, t) => sum + t.price * (selectedQuantities?.[t._id] || 0),
    0
  );

  // Xóa hàm handleCheckout cũ. Thay thế bằng việc gọi onHold từ prop
  const handlePlaceOrder = () => {
    // 1. Kiểm tra nếu totalQuantity > 0, gọi hàm onHold được truyền từ component cha
    // onHold chính là hàm handleHoldAllTickets từ TicketBookingPage
    if (totalQuantity > 0 && onHold) {
      onHold(); // <-- ĐÂY LÀ HÀM handleHoldAllTickets
    } else {
      // Nếu không có vé, chỉ hiển thị thông báo
      console.warn("Chưa chọn vé nào để tiến hành giữ chỗ.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: "2rem",
        top: "10rem",
        width: "320px",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Hóa đơn</h3>

      {selectedTickets.length > 0 ? (
        selectedTickets.map((ticket) => {
          const qty = selectedQuantities?.[ticket._id] ?? 0;

          return (
            <div
              key={ticket._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.95rem",
                padding: "0.25rem 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <span>
                {ticketName} x {qty}
              </span>
              <span>{formatCurrency(ticket.price * qty)}</span>
            </div>
          );
        })
      ) : (
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Chưa chọn vé nào
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "700",
          fontSize: "1.1rem",
          marginTop: "0.5rem",
        }}
      >
        <span>Tổng:</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>

      <button
        // Sửa đổi: Thay handleCheckout bằng handlePlaceOrder mới
        onClick={handlePlaceOrder}
        disabled={totalQuantity === 0}
        style={{
          padding: "0.75rem",
          fontWeight: "bold",
          borderRadius: "0.5rem",
          backgroundColor: totalQuantity > 0 ? "#2DC275" : "#9ca3af",
          color: "white",
          border: "none",
          cursor: totalQuantity > 0 ? "pointer" : "not-allowed",
          marginTop: "1rem",
        }}
      >
        Đặt vé và Thanh toán
      </button>
    </div>
  );
};

export default BillSummary;
