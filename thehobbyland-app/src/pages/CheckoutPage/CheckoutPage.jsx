import React, { useState } from "react";
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { selectedQuantities, totalQuantity, totalPrice, tickets } = orderState;

  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phoneNumber: currentUser?.phone || "",
    address: currentUser?.address || "",
    paymentMethod: "Wallet",
  });

  const walletBalance = currentUser?.walletBalance || 0;

  // Logic lấy dữ liệu an toàn (Fallback)
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
  const handleOpenWalletModal = () => {
    if (walletBalance < finalTotalPrice) {
      notification.error({ message: "Số dư không đủ" });
      return;
    }
    setIsPasswordModalOpen(true);
  };
  const customerInfo = {
    userId: currentUser?._id || "guest",
    fullName: form.fullName,
    email: form.email,
    phoneNumber: form.phoneNumber,
    address: form.address,
  };
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
    try {
      setIsVerifying(true);
      const res = await axios.post(
        "http://localhost:3001/api/orders/create",
        payload
      );

      if (res.data.status === "OK") {
        if (payload.paymentMethod === "Wallet") {
          // Tính số dư mới: Số dư hiện tại - Tổng tiền vừa thanh toán
          const newBalance = walletBalance - finalTotalPrice;

          dispatch(updateWalletBalance(newBalance));
        }
        notification.success({
          message: "Giao dịch thành công!",
          description: "Tiền đã được trừ vào ví của bạn.",
        });
        setIsPasswordModalOpen(false);
        // Chuyển hướng sang trang thành công
        setTimeout(() => {
          navigate(`/order-success/${res.data.orderId}`);
        }, 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Lỗi hệ thống khi tạo đơn";
      api.error({
        message: "Thanh toán thất bại",
        description: errorMsg,
      });
      setConfirmPassword("");
    } finally {
      setIsVerifying(false);
    }
  };
  const handleConfirmPasswordPayment = () => {
    const payload = getOrderPayload("Wallet", confirmPassword);
    processOrder(payload);
  };
  const handlePayPalApprove = (data) => {
    const payload = getOrderPayload("PayPal");
    // Có thể đính kèm thêm paypalOrderId vào payload nếu backend cần lưu đối soát
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

  const handleApprove = async (paypalOrderID) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/orders/create",
        {
          holdId: holdId,
          paypalOrderId: paypalOrderID,
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address,
          paymentMethod: "PayPal",
        }
      );

      if (response.data.status === "OK") {
        navigate(`/order-success/${response.data.orderId}`);
      }
    } catch (err) {
      console.error("Lỗi PayPal:", err);
      notification.error({ message: "Lỗi lưu đơn hàng PayPal" });
    }
  };
  const handleWalletPayment = async () => {
    try {
      const walletRes = await axios.post("/api/users/pay-wallet", {
        amount: totalPrice,
        password: confirmPassword,
      });

      if (walletRes.data.success) {
        const response = await axios.post("/api/orders/create", {
          holdId: holdId,
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phoneNumber: customerInfo.phoneNumber,
          address: customerInfo.address,
          paymentMethod: "Wallet",
        });

        // Bước 3: Chuyển hướng sang trang thành công với orderId vừa nhận được
        if (response.data.status === "OK") {
          navigate(`/order-success/${response.data.orderId}`);
        }
      }
    } catch (err) {
      alert("Thanh toán ví thất bại: " + err.response?.data?.message);
    }
  };

  return (
    <div style={styles.container}>
      {contextHolder}
      <div style={styles.headerSection}>
        <h2 style={styles.mainTitle}>Xác nhận & Thanh toán</h2>
        <p style={styles.subTitle}>
          Vui lòng kiểm tra lại thông tin và chọn phương thức thanh toán
        </p>
      </div>
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
            Để bảo mật, vui lòng nhập mật khẩu tài khoản của bạn để hoàn tất
            giao dịch
            <strong> {formatCurrency(finalTotalPrice)}</strong>
          </p>
          <Input.Password
            placeholder="Nhập mật khẩu của bạn"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPressEnter={handleConfirmPasswordPayment}
            autoFocus
          />
        </div>
      </Modal>
      <div style={styles.mainGrid}>
        {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG */}
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
                  placeholder="Địa chỉ giao vé (nếu có)"
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

            {/* Chi tiết cho từng loại thanh toán */}
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
                    <Tag color="error">
                      Số dư không đủ. Vui lòng nạp thêm tiền.
                    </Tag>
                  ) : (
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      style={styles.btnPrimary}
                    >
                      Xác nhận thanh toán từ Ví
                    </button>
                  )}
                </div>
              )}

              {form.paymentMethod === "PayPal" && (
                <PayPalScriptProvider
                  options={{
                    "client-id":
                      "AbEmAsz_VTEaZy89MnNUgeH_NERJoWZmP_zhLQhFOvTa9nRtMf53AcxZEszYEIobMWPFA66LxN_ijotm",
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
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
                    onApprove={(data) => handlePayPalApprove(data)}
                  />
                </PayPalScriptProvider>
              )}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: CHI TIẾT VÉ (Bản nâng cấp) */}
        <div style={styles.rightColumn}>
          <div style={styles.ticketCard}>
            <div style={styles.ticketHeader}>
              <Ticket size={20} />
              <h3 style={{ margin: 0 }}>Chi tiết vé đã chọn</h3>
            </div>

            <div style={styles.ticketList}>
              {finalTickets.map((ticket, index) => {
                // ticket có thể là object từ server hoặc từ redux
                const qty =
                  finalSelectedQuantities[ticket._id || ticket.id] ||
                  ticket.quantity;
                if (!qty) return null;

                return (
                  <div key={ticket._id || index} style={styles.ticketItem}>
                    <div style={styles.ticketMainInfo}>
                      <span style={styles.ticketName}>
                        {ticket.name || ticket.type}
                      </span>
                      <span style={styles.ticketPrice}>
                        {formatCurrency(ticket.price)}
                      </span>
                    </div>
                    <div style={styles.ticketSubInfo}>
                      <span>Số lượng: {qty}</span>
                      <span style={styles.ticketSubtotal}>
                        {formatCurrency(ticket.price * qty)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.billFooter}>
              <div style={styles.footerRow}>
                <span>Tổng số vé:</span>
                <span>{finalTotalQuantity} vé</span>
              </div>
              <div
                style={{
                  ...styles.footerRow,
                  fontSize: "1.25rem",
                  color: "#ef4444",
                  fontWeight: "800",
                }}
              >
                <span>TỔNG CỘNG:</span>
                <span>{formatCurrency(finalTotalPrice)}</span>
              </div>
            </div>

            <div style={styles.guarantee}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Đảm bảo giữ chỗ trong thời gian thanh toán</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
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
    fontSize: "0.95rem",
    transition: "all 0.2s",
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
    transition: "0.2s",
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
    marginTop: "10px",
  },

  /* TICKET BILL STYLES */
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: "1.25rem",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  ticketHeader: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  ticketList: { padding: "1.5rem", backgroundColor: "#fff" },
  ticketItem: {
    paddingBottom: "1rem",
    marginBottom: "1rem",
    borderBottom: "1px dashed #e2e8f0",
  },
  ticketMainInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
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
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#334155",
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
