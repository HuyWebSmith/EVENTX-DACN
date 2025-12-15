import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Typography, message, Tag, Modal } from "antd";
import dayjs from "dayjs";
import { axiosJWT } from "../../services/UserService";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EventOrdersPage = () => {
  const { eventId } = useParams();

  const [orders, setOrders] = useState([]);
  const [eventInfo, setEventInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [mailSuccessModal, setMailSuccessModal] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [visible, setVisible] = useState(false);

  // ================================
  // FETCH ORDERS THEO EVENT ID
  // ================================
  const fetchEventOrders = async (eventId) => {
    setLoading(true);
    try {
      const res = await axiosJWT.get(
        `http://localhost:3001/api/orders/get-by-event/${eventId}`
      );

      const data = res.data.data || [];

      if (data.length > 0) {
        setEventInfo({
          title: data[0].ticketId?.eventTitle || "Sự kiện",
          description: data[0].ticketId?.eventDescription || "",
          date: data[0].ticketId?.eventDate || "",
        });
      }

      const mapped = data.map((o) => ({
        ...o,
        phoneNumber: o.phoneNumber || "Chưa có",
        totalAmount: o.quantity * o.price,
        createdAt: o.createdAt,
        isEmailSent: o.isEmailSent,
      }));

      setOrders(mapped);
      return mapped;
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Lỗi khi tải dữ liệu đơn hàng");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // USEEFFECT LOAD ORDER
  // ================================
  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchEventOrders(eventId);
    };

    loadOrders();
  }, [eventId]);

  // ================================
  // MỞ MODAL XEM VÉ
  // ================================
  const openModal = async (order) => {
    try {
      const res = await axiosJWT.get(
        `http://localhost:3001/api/issued-tickets/get-by-order/${order.orderId}`
      );

      setSelectedOrder({
        ...order,
        issuedTickets: res.data.data,
      });

      setModalVisible(true);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải vé đã phát hành");
    }
  };

  // ================================
  // GỬI MAIL
  // ================================
  const sendMail = async (order) => {
    try {
      await axiosJWT.post(
        `http://localhost:3001/api/email/send-mail/${order.orderId}`
      );

      setMailSuccessModal(true);
      message.success({
        content: "📨 Gửi email thành công!",
        style: {
          fontSize: "16px",
          fontWeight: 600,
        },
        duration: 2,
      });

      // Cập nhật trực tiếp trạng thái isEmailSent
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId ? { ...o, isEmailSent: true } : o
        )
      );
    } catch (err) {
      console.error(err);
      message.error("Gửi email thất bại");
    }
  };

  // ================================
  // CỘT BẢNG ORDER
  // ================================
  const orderColumns = [
    { title: "Tên người mua", dataIndex: "buyer", key: "buyer" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => `${v?.toLocaleString() ?? 0} VND`,
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Completed"
            ? "green"
            : status === "Pending"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Email",
      dataIndex: "isEmailSent",
      key: "isEmailSent",
      render: (value) =>
        value ? (
          <Tag color="green">Đã gửi</Tag>
        ) : (
          <Tag color="red">Chưa gửi</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => openModal(record)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "blue",
              cursor: "pointer",
            }}
          >
            Xem vé
          </button>

          <button
            disabled={record.isEmailSent}
            onClick={() => !record.isEmailSent && sendMail(record)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: record.isEmailSent ? "green" : "blue",
              cursor: record.isEmailSent ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {record.isEmailSent ? "Đã gửi" : "Gửi mail"}
          </button>
        </div>
      ),
    },
  ];

  // ================================
  // CỘT BẢNG VÉ
  // ================================
  const ticketColumns = [
    {
      title: "Mã vé",
      dataIndex: "ticketCode",
      key: "ticketCode",
      render: (text) => (
        <span>
          {visible ? text : "••••••••"}
          <span
            style={{ marginLeft: 8, cursor: "pointer" }}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </span>
        </span>
      ),
    },
    { title: "Tên vé", dataIndex: "ticketName", key: "ticketName" },
    { title: "Giá", dataIndex: "price", key: "price" },
    { title: "Check-in", dataIndex: "isCheckedIn", key: "isCheckedIn" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>{eventInfo.title}</Title>

      <button
        onClick={() => (window.location.href = `/check-in/${eventId}`)}
        style={{
          padding: "10px 20px",
          marginBottom: 20,
          background: "linear-gradient(135deg, #1677ff, #2DC275)",
          border: "none",
          borderRadius: 10,
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "15px",
          boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
          transition: "all 0.25s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 16px rgba(22, 119, 255, 0.4)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(22, 119, 255, 0.3)";
        }}
      >
        🚀 Đi tới trang Check-in
      </button>

      <button
        onClick={() => (window.location.href = `/event/${eventId}/tickets`)}
        style={{
          padding: "10px 20px",
          marginLeft: 10,
          background: "#722ed1",
          border: "none",
          borderRadius: 10,
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        🎟️ Quản lý tất cả vé
      </button>

      <Table
        dataSource={orders}
        columns={orderColumns}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        visible={modalVisible}
        title={`Chi tiết đơn hàng: ${selectedOrder?.buyer}`}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Table
          dataSource={selectedOrder?.issuedTickets || []}
          columns={ticketColumns}
          rowKey="ticketCode"
        />
      </Modal>
      <Modal
        open={mailSuccessModal}
        footer={null}
        onCancel={() => setMailSuccessModal(false)}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: 50, color: "#52c41a", marginBottom: 10 }}>
            ✓
          </div>
          <h2 style={{ fontWeight: 700, marginBottom: 10 }}>
            Gửi Email Thành Công!
          </h2>
          <p style={{ fontSize: 16, opacity: 0.8 }}>
            Tất cả vé đã được gửi đến email của khách hàng.
          </p>

          <button
            onClick={() => setMailSuccessModal(false)}
            style={{
              marginTop: 20,
              padding: "8px 20px",
              background: "#1677ff",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EventOrdersPage;
