import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { axiosJWT, updateUser } from "../../services/UserService";
import { notification } from "antd";
import { updateWalletBalance } from "../../redux/slides/userSlide";
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const holdId = location.state?.holdId;
  const checkoutData = location.state?.checkoutData;
  const dispatch = useDispatch();
  const orderState = useSelector((state) => state.order);
  const { selectedQuantities, totalQuantity, totalPrice, tickets } = orderState;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    paymentMethod: "COD",
  });
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.user);
  const walletBalance = currentUser?.walletBalance || 0;

  const customerInfo = {
    userId: currentUser.id || "guest",
    fullName: form.fullName,
    email: form.email,
    phoneNumber: form.phoneNumber,
    address: form.address,
  };

  // Xử lý dữ liệu từ location, redux, hoặc localStorage
  const saved = JSON.parse(localStorage.getItem("ticketBill")) || {};

  const finalTickets =
    checkoutData?.tickets?.length > 0
      ? checkoutData.tickets
      : tickets?.length > 0
      ? tickets
      : saved.tickets || [];

  const finalSelectedQuantities =
    checkoutData?.selectedQuantities &&
    Object.keys(checkoutData.selectedQuantities).length > 0
      ? checkoutData.selectedQuantities
      : selectedQuantities && Object.keys(selectedQuantities).length > 0
      ? selectedQuantities
      : saved.selectedQuantities || {};

  const finalTotalQuantity =
    checkoutData?.totalQuantity > 0
      ? checkoutData.totalQuantity
      : totalQuantity > 0
      ? totalQuantity
      : saved.totalQuantity || 0;

  const finalTotalPrice =
    checkoutData?.totalPrice > 0
      ? checkoutData.totalPrice
      : totalPrice > 0
      ? totalPrice
      : saved.totalPrice || 0;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const selectedTicketsList = finalTickets.filter(
    (t) => (finalSelectedQuantities?.[t._id] || 0) > 0
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleApprove = async (orderID) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/orders/create-paypal",
        {
          holdId,
          selectedQuantities: finalSelectedQuantities,
          totalPrice: finalTotalPrice,
          totalQuantity: finalTotalQuantity,
          customerInfo,
          paypalOrderId: orderID,
          orderStatus: "Completed",
        }
      );

      // Hiện notification
      notification.success({
        message: "Thanh toán thành công",
        description: "Giao dịch đã được thực hiện.",
        placement: "topRight",
        duration: 3,
      });

      // Xóa localStorage trước
      localStorage.removeItem("ticketBill");

      // Delay 0.5s để notification hiện trước khi navigate
      setTimeout(() => {
        navigate(`/order-success/${res.data.orderId}`);
      }, 500);
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      notification.error({
        message: "Thanh toán thất bại",
        description: "Thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < finalTotalPrice) {
      notification.error({
        message: "Thanh toán thất bại",
        description: "Số dư không đủ để thanh toán.",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/api/orders/pay-wallet",
        {
          holdId,
          selectedQuantities: finalSelectedQuantities,
          totalPrice: finalTotalPrice,
          totalQuantity: finalTotalQuantity,
          customerInfo,
          orderStatus: "Completed",
          userId: currentUser.id,
        }
      );

      if (res.data.success || res.data.status === "success") {
        // **Cập nhật ngay số dư trong Redux**
        dispatch(updateWalletBalance(res.data.balance));

        // Xóa localStorage trước khi navigate
        localStorage.removeItem("ticketBill");

        // Hiện notification thành công
        notification.success({
          message: "Thanh toán thành công",
          description: "Ví của bạn đã bị trừ số tiền tương ứng.",
          placement: "topRight",
          duration: 3,
        });

        // Delay nhỏ để notification kịp hiện trước khi chuyển trang
        setTimeout(() => {
          navigate(`/order-success/${res.data.orderId}`);
        }, 500);
      } else {
        notification.error({
          message: "Thanh toán thất bại",
          description: res.data.message || "Có lỗi xảy ra, thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (err) {
      console.error("Wallet payment error:", err.response?.data || err.message);
      notification.error({
        message: "Thanh toán thất bại",
        description: err.response?.data?.message || "Có lỗi xảy ra, thử lại.",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "3rem auto",
        padding: "2rem",
        borderRadius: "1rem",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Xác nhận Thanh toán
      </h2>
      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Form nhập thông tin */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {["fullName", "email", "phoneNumber", "address"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={
                field === "fullName"
                  ? "Họ tên"
                  : field === "email"
                  ? "Email"
                  : field === "phoneNumber"
                  ? "Số điện thoại"
                  : "Địa chỉ"
              }
              value={form[field]}
              onChange={handleChange}
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
              }}
            />
          ))}

          <div style={{ marginTop: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>
              Phương thức thanh toán:
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              {["COD", "VnPay", "PayPal", "Wallet"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: method })}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border:
                      form.paymentMethod === method
                        ? "2px solid #2dc275"
                        : "1px solid #ccc",
                    background:
                      form.paymentMethod === method ? "#e7f9ef" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            {form.paymentMethod === "PayPal" && (
              <div style={{ marginTop: "10px" }}>
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
                    onApprove={async (data, actions) => {
                      await actions.order.capture();
                      handleApprove(data.orderID);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}
            {form.paymentMethod === "Wallet" && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#f1f5f9",
                }}
              >
                <p style={{ marginBottom: "8px" }}>
                  Số dư hiện tại:{" "}
                  <strong style={{ color: "#16a34a" }}>
                    {formatCurrency(walletBalance)}
                  </strong>
                </p>

                {walletBalance < finalTotalPrice ? (
                  <p style={{ color: "#dc2626", fontWeight: "600" }}>
                    ❌ Số dư không đủ để thanh toán.
                  </p>
                ) : (
                  <button
                    onClick={handleWalletPayment}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      width: "100%",
                    }}
                  >
                    Thanh toán bằng Ví
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <p
              style={{
                color: "#ef4444",
                backgroundColor: "#fee2e2",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginTop: "1rem",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* BILL */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "0.5rem",
            }}
          >
            Chi tiết Đơn hàng
          </h3>
          {selectedTicketsList.length > 0 ? (
            selectedTicketsList.map((ticket) => {
              const qty = finalSelectedQuantities?.[ticket._id] ?? 0;
              if (!qty) return null;
              return (
                <div
                  key={ticket._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.25rem 0",
                  }}
                >
                  <span>
                    {ticket.name} x {qty}
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    {formatCurrency(ticket.price * qty)}
                  </span>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: "0.875rem", color: "#ef4444" }}>
              ❌ Không có vé nào được chọn.
            </p>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "800",
              fontSize: "1.1rem",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "2px solid #e5e7eb",
            }}
          >
            <span>Tổng cộng ({finalTotalQuantity} vé):</span>
            <span>{formatCurrency(finalTotalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
