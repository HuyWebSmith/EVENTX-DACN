import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Ticket, User, MapPin } from "lucide-react";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/orders/${orderId}`
        );
        console.log("Dữ liệu nhận được:", res.data);
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) return <div style={styles.loading}>Đang tải hóa đơn...</div>;
  if (!order) return <div style={styles.error}>Không tìm thấy đơn hàng.</div>;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  return (
    <div style={styles.container}>
      <div style={styles.successHeader}>
        <div style={styles.iconCircle}>
          <CheckCircle2 size={48} color="#fff" />
        </div>
        <h2 style={styles.title}>Thanh toán thành công!</h2>
        <p style={styles.subTitle}>
          Mã đơn hàng: #{order._id?.slice(-8).toUpperCase()}
        </p>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.infoSection}>
          <h4 style={styles.sectionTitle}>
            <User size={18} /> Thông tin khách hàng
          </h4>
          <div style={styles.infoGrid}>
            <p>
              <strong>Họ tên:</strong> {order.fullName}
            </p>
            <p>
              <strong>Email:</strong> {order.email}
            </p>
            <p>
              <strong>SĐT:</strong> {order.phoneNumber}
            </p>
            <p>
              <strong>Thanh toán:</strong> {order.paymentMethod}
            </p>
          </div>
        </div>

        <div style={styles.receiptSection}>
          <h4 style={styles.sectionTitle}>
            <Ticket size={18} /> Chi tiết vé
          </h4>
          <div style={styles.ticketList}>
            {order.orderDetails && order.orderDetails.length > 0 ? (
              order.orderDetails.map((item) => (
                <div key={item._id} style={styles.ticketItemNew}>
                  <div style={styles.ticketInfo}>
                    <div style={styles.ticketIndicator} />
                    <div>
                      <span style={styles.ticketName}>{item.ticketName}</span>
                      <span
                        style={styles.ticketType}
                        dangerouslySetInnerHTML={{ __html: item.ticketType }}
                      ></span>
                    </div>
                  </div>
                  <div style={styles.ticketPriceGroup}>
                    <span style={styles.ticketQty}>x{item.quantity}</span>
                    <span style={styles.itemTotal}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyTickets}>
                <p>Không tìm thấy thông tin vé chi tiết.</p>
              </div>
            )}
          </div>
          <div style={styles.divider}></div>
          <div style={styles.totalRow}>
            <span>Tổng cộng</span>
            <span style={styles.finalAmount}>
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button onClick={() => navigate("/")} style={styles.btnHome}>
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

// ... Copy lại phần const styles từ các câu trả lời trước của bạn ...
const styles = {
  container: {
    maxWidth: "900px",
    margin: "2rem auto",
    padding: "0 1rem",
    fontFamily: "'Inter', sans-serif",
  },
  loading: { textAlign: "center", padding: "50px", color: "#64748b" },
  error: { textAlign: "center", padding: "50px", color: "red" },
  successHeader: { textAlign: "center", marginBottom: "3rem" },
  iconCircle: {
    width: "80px",
    height: "80px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
  },
  title: { fontSize: "2.2rem", fontWeight: "800", color: "#1e293b" },
  subTitle: { color: "#64748b" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem" },
  infoSection: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "1rem",
    border: "1px solid #e2e8f0",
  },
  receiptSection: {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "1rem",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "10px",
  },
  ticketItemNew: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  ticketIndicator: {
    width: "4px",
    height: "30px",
    backgroundColor: "#10b981",
    marginRight: "10px",
  },
  ticketInfo: { display: "flex", alignItems: "center" },
  ticketName: { display: "block", fontWeight: "bold" },
  ticketType: { fontSize: "0.8rem", color: "#94a3b8" },
  ticketPriceGroup: { textAlign: "right" },
  ticketQty: { fontSize: "0.8rem", marginRight: "10px" },
  itemTotal: { fontWeight: "bold" },
  divider: { borderTop: "1px dashed #e2e8f0", margin: "1rem 0" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
  },
  finalAmount: { fontSize: "1.4rem", color: "#10b981" },
  buttonGroup: { marginTop: "2rem", textAlign: "center" },
  btnHome: {
    padding: "10px 30px",
    backgroundColor: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default OrderSuccessPage;
