import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BillSummary = ({ tickets, selectedQuantities, onHold }) => {
  const navigate = useNavigate();
  const [isModalVisible, setModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);

  const selectedTickets =
    tickets?.filter((t) => (selectedQuantities?.[t._id] || 0) > 0) || [];

  const totalQuantity = selectedTickets.reduce(
    (sum, t) => sum + (selectedQuantities?.[t._id] || 0),
    0
  );

  const totalPrice = selectedTickets.reduce(
    (sum, t) => sum + t.price * (selectedQuantities?.[t._id] || 0),
    0
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handlePlaceOrder = () => {
    if (totalQuantity === 0) return;
    setCountdown(8);
    setModalVisible(true);
  };

  const handleOk = () => {
    setModalVisible(false);
    onHold && onHold();
  };

  // Countdown logic
  useEffect(() => {
    if (!isModalVisible) return;
    if (countdown <= 0) {
      setModalVisible(false);
      onHold && onHold();
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isModalVisible, onHold]);

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
      <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>
        Hóa đơn vé
      </h3>

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
          <p
            style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}
          >
            Chưa có vé nào được chọn
          </p>
        )}
      </div>

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
          fontSize: "1rem",
        }}
      >
        Tiếp tục thanh toán
      </button>

      {isModalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "25px 30px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ marginBottom: 10 }}>Bạn đang giữ vé</h2>
            <p>
              Vui lòng thanh toán trong <b>15 phút</b>. Không thoát hoặc làm mới
              trang, nếu làm sẽ mất lượt giữ vé.
            </p>

            <div style={{ marginTop: 15 }}>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(countdown / 8) * 100}%`,
                    height: "100%",
                    backgroundColor: "#3b82f6",
                    transition: "width 1s linear",
                  }}
                />
              </div>
              <p style={{ textAlign: "center", marginTop: 5 }}>{countdown}s</p>
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setModalVisible(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginRight: "5px",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleOk}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                OK, tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillSummary;
