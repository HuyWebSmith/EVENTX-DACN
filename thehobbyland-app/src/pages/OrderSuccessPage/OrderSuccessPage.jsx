import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/orders/${orderId}`
        );
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError("Không tìm thấy đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading)
    return <p style={{ textAlign: "center" }}>Đang tải đơn hàng...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "3rem auto",
        padding: "2rem 3rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "1rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          color: "#2DC275",
          fontSize: "2rem",
        }}
      >
        🎉 Thanh toán thành công!
      </h2>

      <div style={{ lineHeight: "1.8rem", fontSize: "1rem" }}>
        <p>
          <strong>Mã đơn hàng:</strong>
          <span style={{ color: "#2DC275" }}>{order._id}</span>
        </p>
        <p>
          <strong>Họ tên:</strong> {order.fullName}
        </p>
        <p>
          <strong>Email:</strong> {order.email || "—"}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {order.phoneNumber || "—"}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {order.address || "—"}
        </p>
        <p>
          <strong>Tổng tiền:</strong>
          <span style={{ color: "#2DC275", fontWeight: "bold" }}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(order.totalAmount)}
          </span>
        </p>
        <p>
          <strong>Phương thức thanh toán:</strong> {order.paymentMethod}
        </p>
      </div>

      <h3 style={{ marginTop: "2.5rem", marginBottom: "1rem", color: "#333" }}>
        Danh sách vé đã mua:
      </h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {order.orderDetails?.map((detail) => (
          <li
            key={detail._id}
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
              backgroundColor: "#fff",
              borderRadius: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #f0f0f0",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            }}
          >
            <span>
              {detail.ticketName} ({detail.ticketType}) x {detail.quantity}
            </span>
            <span style={{ fontWeight: "bold", color: "#2DC275" }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(detail.price * detail.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "2.5rem",
            padding: "12px 25px",
            backgroundColor: "#2DC275",
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#27b568")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2DC275")
          }
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
