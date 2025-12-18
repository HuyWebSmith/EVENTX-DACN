import React from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, creditCard } from "lucide-react"; // Thêm icon cho đẹp nếu muốn

const BillSummary = ({ tickets, selectedQuantities, onHold }) => {
  const navigate = useNavigate();

  if (
    !tickets ||
    !Array.isArray(tickets) ||
    tickets.length === 0 ||
    !selectedQuantities
  ) {
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

  const handlePlaceOrder = () => {
    if (totalQuantity > 0 && onHold) {
      onHold();
    }
  };

  return (
    <div
      style={{
        position: "sticky",
        top: "2rem",
        width: "350px",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        border: "1px solid #f1f5f9",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>
          Hóa đơn vé
        </h3>
      </div>

      <div
        style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}
      >
        {selectedTickets.length > 0 ? (
          selectedTickets.map((ticket) => {
            const qty = selectedQuantities[ticket._id];
            return (
              <div
                key={ticket._id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px dashed #e2e8f0",
                }}
              >
                {/* Dòng 1: Tên vé và Loại vé */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      color: "#1e293b",
                    }}
                  >
                    {ticket.name || ticket.type}
                  </span>
                  <span style={{ fontWeight: "700", color: "#10b981" }}>
                    x{qty}
                  </span>
                </div>

                {/* Dòng 2: Chi tiết giá đơn vị */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "#64748b",
                  }}
                >
                  <span>Đơn giá: {formatCurrency(ticket.price)}</span>
                  <span>{formatCurrency(ticket.price * qty)}</span>
                </div>

                {/* Dòng 3: Khu vực (nếu có) */}
                {ticket.zoneName && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#3b82f6",
                      marginTop: "4px",
                    }}
                  >
                    Khu vực: {ticket.zoneName}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div
            style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}
          >
            <p style={{ fontSize: "0.9rem" }}>Chưa có vé nào được chọn</p>
          </div>
        )}
      </div>

      {/* Phần tổng kết */}
      <div
        style={{
          marginTop: "0.5rem",
          borderTop: "2px solid #f1f5f9",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Tổng số lượng:</span>
          <span style={{ fontWeight: "600" }}>{totalQuantity} vé</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "800",
            fontSize: "1.2rem",
            color: "#ef4444",
          }}
        >
          <span>TỔNG TIỀN:</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={totalQuantity === 0}
        style={{
          padding: "1rem",
          fontWeight: "bold",
          borderRadius: "0.75rem",
          backgroundColor: totalQuantity > 0 ? "#10b981" : "#cbd5e1",
          color: "black",
          border: "none",
          cursor: totalQuantity > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          fontSize: "1rem",
        }}
        onMouseOver={(e) =>
          totalQuantity > 0 && (e.target.style.backgroundColor = "#1C9EEF")
        }
        onMouseOut={(e) =>
          totalQuantity > 0 && (e.target.style.backgroundColor = "#8FD5FF")
        }
      >
        Tiếp tục thanh toán
      </button>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#94a3b8",
          textAlign: "center",
          margin: 0,
        }}
      >
        Bằng cách nhấn nút, bạn đồng ý với các quy định đặt vé của chúng tôi.
      </p>
    </div>
  );
};

export default BillSummary;
