import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { notification, Tag, Divider, Input, Modal } from "antd";
import { updateWalletBalance } from "../../redux/slides/userSlide";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Wallet as WalletIcon,
  Ticket,
  Receipt,
  CheckCircle2,
  Lock,
  Timer,
} from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const holdId = location.state?.holdId;
  const checkoutData = location.state?.checkoutData;
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();

  const orderState = useSelector((state) => state.order);
  const currentUser = useSelector((state) => state.user);

  // States cho UI/Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // States cho Countdown
  const [timeLeft, setTimeLeft] = useState(null);

  const { selectedQuantities, totalQuantity, totalPrice, tickets } = orderState;

  // Fallback data
  const saved = JSON.parse(localStorage.getItem("ticketBill")) || {};
  const finalTickets = checkoutData?.items || tickets || saved.tickets || [];
  const finalSelectedQuantities =
    checkoutData?.selectedQuantities ||
    selectedQuantities ||
    saved.selectedQuantities ||
    {};
  const finalTotalQuantity =
    checkoutData?.totalQuantity || totalQuantity || saved.totalQuantity || 0;
  const finalTotalPrice =
    checkoutData?.totalPrice || totalPrice || saved.totalPrice || 0;
  const walletBalance = currentUser?.walletBalance || 0;

  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phoneNumber: currentUser?.phone || "",
    address: currentUser?.address || "",
    paymentMethod: "Wallet",
  });

  useEffect(() => {
    const countdownDuration = 15 * 60; // 10 giây để test
    const now = Math.floor(Date.now() / 1000);
    const storageKey = `checkout_expiry_${holdId}`;

    // ÉP BUỘC TẠO MỚI (Chỉ dùng khi test)
    const expiryTime = now + countdownDuration;
    localStorage.setItem(storageKey, expiryTime);

    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const remaining = expiryTime - currentTime;

      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        setIsTimeoutModalOpen(true); // Nó sẽ bật cái Modal Hết giờ lên
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [holdId]);

  const formatTime = (seconds) => {
    if (seconds === null) return "15:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- LOGIC XỬ LÝ THANH TOÁN ---
  const getOrderPayload = (method, pass = "") => ({
    holdId: holdId,
    paymentMethod: method,
    password: pass,
    customerInfo: {
      userId: currentUser?.id || "guest",
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      address: form.address,
    },
    selectedQuantities: finalSelectedQuantities,
    totalPrice: finalTotalPrice,
  });

  const processOrder = async (payload) => {
    if (timeLeft <= 0) {
      setIsTimeoutModalOpen(true);
      return;
    }

    try {
      setIsVerifying(true);
      const res = await axios.post(
        "http://localhost:3001/api/orders/create",
        payload
      );

      if (res.data.status === "OK") {
        if (payload.paymentMethod === "Wallet") {
          const newBalance = walletBalance - finalTotalPrice;
          dispatch(updateWalletBalance(newBalance));
        }

        localStorage.removeItem(`checkout_expiry_${holdId}`);
        notification.success({ message: "Giao dịch thành công!" });

        setTimeout(() => {
          navigate(`/order-success/${res.data.orderId}`);
        }, 1500);
      }
    } catch (err) {
      api.error({
        message: "Thanh toán thất bại",
        description: err.response?.data?.message || "Lỗi hệ thống",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenWalletModal = () => {
    if (timeLeft <= 0) return setIsTimeoutModalOpen(true);
    if (walletBalance < finalTotalPrice) {
      notification.error({ message: "Số dư không đủ" });
      return;
    }
    setIsPasswordModalOpen(true);
  };

  const handleConfirmPasswordPayment = () => {
    const payload = getOrderPayload("Wallet", confirmPassword);
    processOrder(payload);
  };

  const handlePayPalApprove = (data) => {
    const payload = getOrderPayload("PayPal");
    payload.paypalOrderId = data.orderID;
    processOrder(payload);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={styles.container}>
      {contextHolder}

      {/* HEADER */}
      <div style={styles.headerSection}>
        <h2 style={styles.mainTitle}>Xác nhận & Thanh toán</h2>
        <p style={styles.subTitle}>
          Vui lòng hoàn tất trong vòng 15 phút để giữ chỗ
        </p>
      </div>

      {/* MODAL MẬT KHẨU VÍ */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={20} color="#10b981" />
            <span>Xác nhận mật khẩu thanh toán</span>
          </div>
        }
        open={isPasswordModalOpen}
        onOk={handleConfirmPasswordPayment}
        onCancel={() => setIsPasswordModalOpen(false)}
        confirmLoading={isVerifying}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: "#10b981" } }}
      >
        <div style={{ padding: "10px 0" }}>
          <p>
            Nhập mật khẩu để thanh toán{" "}
            <strong>{formatCurrency(finalTotalPrice)}</strong>
          </p>
          <Input.Password
            placeholder="Mật khẩu tài khoản"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPressEnter={handleConfirmPasswordPayment}
            autoFocus
          />
        </div>
      </Modal>

      {/* MODAL HẾT GIỜ */}
      <Modal
        title="Hết thời gian thanh toán"
        open={isTimeoutModalOpen}
        closable={false}
        maskClosable={false}
        footer={[
          <button
            key="home"
            onClick={() => navigate("/")}
            style={styles.btnPrimary}
          >
            Quay về trang chủ
          </button>,
        ]}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Timer size={48} color="#ef4444" style={{ marginBottom: "15px" }} />
          <p>
            Phiên giao dịch của bạn đã hết hạn (15 phút). Ghế bạn chọn đã được
            giải phóng, vui lòng thực hiện lại quy trình.
          </p>
        </div>
      </Modal>

      <div style={styles.mainGrid}>
        {/* CỘT TRÁI: THÔNG TIN */}
        <div style={styles.leftColumn}>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <User size={18} /> Thông tin người mua
            </h3>
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <User style={styles.inputIcon} size={16} />
                <input
                  name="fullName"
                  placeholder="Họ và tên"
                  value={form.fullName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={16} />
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputWrapper}>
                <Phone style={styles.inputIcon} size={16} />
                <input
                  name="phoneNumber"
                  placeholder="Số điện thoại"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputWrapper}>
                <MapPin style={styles.inputIcon} size={16} />
                <input
                  name="address"
                  placeholder="Địa chỉ"
                  value={form.address}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <CreditCard size={18} /> Phương thức thanh toán
            </h3>
            <div style={styles.paymentGrid}>
              {[
                {
                  id: "Wallet",
                  label: "Ví EventX",
                  icon: <WalletIcon size={20} />,
                },
                {
                  id: "PayPal",
                  label: "PayPal",
                  icon: <CreditCard size={20} />,
                },
                { id: "VnPay", label: "VnPay", icon: <Receipt size={20} /> },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setForm({ ...form, paymentMethod: m.id })}
                  style={{
                    ...styles.paymentCard,
                    borderColor:
                      form.paymentMethod === m.id ? "#10b981" : "#e5e7eb",
                    backgroundColor:
                      form.paymentMethod === m.id ? "#f0fdf4" : "#fff",
                  }}
                >
                  {m.icon}
                  <span style={{ fontWeight: "600" }}>{m.label}</span>
                  {form.paymentMethod === m.id && (
                    <CheckCircle2
                      size={16}
                      style={{ color: "#10b981", marginLeft: "auto" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={styles.paymentDetail}>
              {form.paymentMethod === "Wallet" && (
                <div style={styles.walletBox}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Số dư ví:</span>
                    <strong style={{ color: "#059669" }}>
                      {formatCurrency(walletBalance)}
                    </strong>
                  </div>
                  <Divider style={{ margin: "10px 0" }} />
                  {walletBalance < finalTotalPrice ? (
                    <Tag color="error">Số dư không đủ</Tag>
                  ) : (
                    <button
                      onClick={handleOpenWalletModal}
                      style={styles.btnPrimary}
                    >
                      Xác nhận thanh toán từ Ví
                    </button>
                  )}
                </div>
              )}

              {form.paymentMethod === "PayPal" && (
                <PayPalScriptProvider
                  options={{ "client-id": "YOUR_CLIENT_ID", currency: "USD" }}
                >
                  <PayPalButtons
                    disabled={timeLeft <= 0}
                    createOrder={(data, actions) =>
                      actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: (finalTotalPrice / 23000).toFixed(2),
                            },
                          },
                        ],
                      })
                    }
                    onApprove={handlePayPalApprove}
                  />
                </PayPalScriptProvider>
              )}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: ĐỒNG HỒ & HÓA ĐƠN */}
        <div style={styles.rightColumn}>
          {/* BỘ ĐẾM NGƯỢC */}
          <div
            style={{
              ...styles.ticketCard,
              marginBottom: "1rem",
              padding: "1rem",
              textAlign: "center",
              border: timeLeft < 60 ? "2px solid #ef4444" : "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                color: timeLeft < 60 ? "#ef4444" : "#64748b",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <Timer size={14} /> Thời gian thanh toán còn lại:
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "800",
                color: timeLeft < 60 ? "#ef4444" : "#1e293b",
              }}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          <div style={styles.ticketCard}>
            <div style={styles.ticketHeader}>
              <Ticket size={20} />
              <h3 style={{ margin: 0, color: "#fff" }}>Chi tiết vé</h3>
            </div>
            <div style={styles.ticketList}>
              {finalTickets.map((ticket, index) => {
                const qty =
                  finalSelectedQuantities[ticket._id || ticket.id] ||
                  ticket.quantity;
                if (!qty) return null;
                return (
                  <div key={ticket._id || index} style={styles.ticketItem}>
                    <div style={styles.ticketMainInfo}>
                      <span>{ticket.name || ticket.type}</span>
                      <span style={styles.ticketPrice}>
                        {formatCurrency(ticket.price)}
                      </span>
                    </div>
                    <div style={styles.ticketSubInfo}>
                      <span>SL: {qty}</span>
                      <span>{formatCurrency(ticket.price * qty)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={styles.billFooter}>
              <div style={styles.footerRow}>
                <span>Tổng cộng:</span>
                <span
                  style={{
                    fontSize: "1.25rem",
                    color: "#ef4444",
                    fontWeight: "800",
                  }}
                >
                  {formatCurrency(finalTotalPrice)}
                </span>
              </div>
            </div>
            <div style={styles.guarantee}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Giữ chỗ trong thời gian thanh toán</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES (Giữ nguyên các style cũ của bạn và cập nhật thêm) ---
const styles = {
  container: {
    maxWidth: "1100px",
    margin: "2rem auto",
    padding: "0 1rem",
    fontFamily: "'Inter', sans-serif",
  },
  headerSection: { textAlign: "center", marginBottom: "2.5rem" },
  mainTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
  },
  subTitle: { color: "#64748b", marginTop: "0.5rem" },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "2rem",
    alignItems: "start",
  },
  section: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
    border: "1px solid #f1f5f9",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "1.25rem",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "0.75rem",
  },
  inputGroup: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "12px", color: "#94a3b8" },
  input: {
    width: "100%",
    padding: "0.75rem 0.75rem 0.75rem 2.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
    outline: "none",
  },
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },
  paymentCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "1rem",
    border: "2px solid",
    borderRadius: "0.75rem",
    cursor: "pointer",
  },
  paymentDetail: { marginTop: "1.5rem" },
  walletBox: {
    padding: "1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "0.75rem",
    border: "1px solid #e2e8f0",
  },
  btnPrimary: {
    width: "100%",
    padding: "0.85rem",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: "1.25rem",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  ticketHeader: {
    backgroundColor: "#1e293b",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  ticketList: { padding: "1.5rem" },
  ticketItem: {
    paddingBottom: "1rem",
    marginBottom: "1rem",
    borderBottom: "1px dashed #e2e8f0",
  },
  ticketMainInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "700",
  },
  ticketSubInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#64748b",
  },
  ticketPrice: { color: "#059669" },
  billFooter: { padding: "0 1.5rem 1.5rem" },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "600",
  },
  guarantee: {
    backgroundColor: "#f0fdf4",
    padding: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "0.8rem",
    color: "#16a34a",
    fontWeight: "600",
  },
};

export default CheckoutPage;
