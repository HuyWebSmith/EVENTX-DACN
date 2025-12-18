import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import {
  Table,
  Typography,
  message,
  Tag,
  Modal,
  Button,
  Space,
  Card,
  Row,
  Col,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { axiosJWT } from "../../services/UserService";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRef } from "react";

const { Title, Text } = Typography;

const EventOrdersPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [eventInfo, setEventInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [mailSuccessModal, setMailSuccessModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ticketCodesVisible, setTicketCodesVisible] = useState(false);
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [faceMessage, setFaceMessage] = useState("Vui lòng nhìn vào camera");
  const [faceMessageType, setFaceMessageType] = useState("success");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef();
  const scanningInterval = useRef(null);
  // ================================
  // FETCH ORDERS THEO EVENT ID
  // ================================
  const fetchEventOrders = async (id) => {
    setLoading(true);
    try {
      const res = await axiosJWT.get(
        `http://localhost:3001/api/orders/get-by-event/${id}`
      );
      const data = res.data.data || [];
      if (data.length > 0) {
        setEventInfo({
          title: data[0].ticketId?.eventTitle || "Sự kiện",
          date: data[0].ticketId?.eventDate || "",
        });
      }
      const mapped = data.map((o) => ({
        ...o,
        phoneNumber: o.phoneNumber || "Chưa có",
        totalAmount: o.quantity * o.price,
        isEmailSent: o.isEmailSent,
      }));
      setOrders(mapped);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu đơn hàng");
    } finally {
      setLoading(false);
    }
  };
  const openGlobalCheckin = () => {
    setFaceMessage("Vui lòng nhìn vào camera để điểm danh");
    setFaceMessageType("success");
    setFaceModalVisible(true);
  };
  const handleGlobalFaceCheckin = async () => {
    if (!videoRef.current || isScanning) return;

    setIsScanning(true);
    try {
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detections) {
        setFaceMessage("Đang tìm gương mặt...");
        setIsScanning(false);
        return;
      }

      setFaceMessage("🔍 Đang đối soát dữ liệu...");
      const faceDescriptor = Array.from(detections.descriptor);

      const res = await axiosJWT.post(
        "http://localhost:3000/api/checkin-order/event-face-checkin",
        {
          eventId, // Quan trọng: Chỉ dò trong phạm vi sự kiện này
          faceDescriptor,
        }
      );

      if (res.data.success) {
        setFaceMessage(`✅ CHẤP NHẬN: ${res.data.buyerName.toUpperCase()}`);
        setFaceMessageType("success");
        message.success(`Check-in: ${res.data.buyerName}`);

        fetchEventOrders(eventId); // Load lại bảng để thấy trạng thái "Đã gửi" cập nhật

        // Tạm dừng 3 giây để hiển thị lời chào, sau đó tiếp tục quét người mới
        setTimeout(() => {
          setFaceMessage("Mời người kế tiếp...");
          setIsScanning(false);
        }, 3000);
      } else {
        setFaceMessage(res.data.message || "❌ Không tìm thấy vé!");
        setFaceMessageType("error");
        setTimeout(() => setIsScanning(false), 2000);
      }
    } catch (err) {
      setFaceMessage("❌ Lỗi kết nối hệ thống!");
      setFaceMessageType("error");
      setIsScanning(false);
    }
  };
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Kế nối AI thành công!");
      } catch (err) {
        console.error("Lỗi tải model AI:", err);
      }
    };
    loadModels();
  }, []);
  useEffect(() => {
    if (faceModalVisible) {
      // 1. Mở camera
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => message.error("Không thể mở camera!"));

      // 2. Thiết lập vòng lặp quét tự động
      scanningInterval.current = setInterval(() => {
        handleGlobalFaceCheckin();
      }, 1500);
    } else {
      // Dọn dẹp khi đóng modal
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (scanningInterval.current) clearInterval(scanningInterval.current);
    }
    return () => {
      if (scanningInterval.current) clearInterval(scanningInterval.current);
    };
  }, [faceModalVisible, isScanning]);
  useEffect(() => {
    fetchEventOrders(eventId);
  }, [eventId]);

  const openModal = async (order) => {
    try {
      const res = await axiosJWT.get(
        `http://localhost:3001/api/issued-tickets/get-by-order/${order.orderId}`
      );
      setSelectedOrder({ ...order, issuedTickets: res.data.data });
      setModalVisible(true);
    } catch (err) {
      message.error("Lỗi khi tải vé");
    }
  };

  const sendMail = async (order) => {
    try {
      await axiosJWT.post(
        `http://localhost:3001/api/email/send-mail/${order.orderId}`
      );
      setMailSuccessModal(true);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId ? { ...o, isEmailSent: true } : o
        )
      );
    } catch (err) {
      message.error("Gửi email thất bại");
    }
  };

  const orderColumns = [
    {
      title: "Người mua",
      dataIndex: "buyer",
      key: "buyer",
      render: (t) => (
        <Text strong style={{ color: "#1890ff" }}>
          {t}
        </Text>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => (
        <Text type="danger" strong>
          {v?.toLocaleString()} đ
        </Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "status",
      render: (s) => (
        <Tag
          color={s === "Completed" ? "green" : "orange"}
          style={{ borderRadius: 4, fontWeight: 600 }}
        >
          {s?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Vé",
      dataIndex: "isEmailSent",
      render: (sent) => (
        <Tag
          icon={sent ? <CheckCircleOutlined /> : null}
          color={sent ? "blue" : "default"}
        >
          {sent ? "Đã gửi" : "Chưa gửi"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết vé">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            disabled={record.isEmailSent}
            icon={<MailOutlined />}
            onClick={() => sendMail(record)}
          >
            Gửi mail
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="event-page-wrapper">
      {/* NHÚNG CSS TRỰC TIẾP */}
      <style>{`
        .event-page-wrapper {
          padding: 30px;
          background: #f0f2f5;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }
        .glass-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.05);
          margin-bottom: 24px;
          border: 1px solid #e8e8e8;
        }
        .action-btn {
          border-radius: 8px !important;
          height: 40px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
        }
        .ant-table-wrapper {
          background: white;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 700 !important;
        }
        .success-modal-content {
          text-align: center;
          padding: 20px 0;
        }
        .ticket-code-box {
          font-family: monospace;
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
          @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>

      {/* HEADER */}
      <div className="glass-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <div
                style={{
                  background: "#e6f7ff",
                  padding: "12px",
                  borderRadius: "12px",
                }}
              >
                <ShoppingOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {eventInfo.title}
                </Title>
                <Text type="secondary">
                  Quản lý danh sách khách hàng và đơn hàng
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="small">
              <Button
                type="primary"
                className="action-btn"
                icon={<UserOutlined />}
                style={{ background: "#722ed1", borderColor: "#722ed1" }}
                onClick={openGlobalCheckin}
              >
                Quét Face ID Tổng
              </Button>
              <Button
                type="primary"
                className="action-btn"
                icon={<QrcodeOutlined />}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => navigate(`/check-in/${eventId}`)}
              >
                Trang Check-in
              </Button>
              <Button
                icon={<SettingOutlined />}
                className="action-btn"
                onClick={() => navigate(`/event/${eventId}/tickets`)}
              >
                Cài đặt vé
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* TABLE */}
      <Table
        dataSource={orders}
        columns={orderColumns}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
        }}
      />

      {/* MODAL CHI TIẾT VÉ */}
      <Modal
        open={modalVisible}
        title={<Title level={4}>🎫 Chi tiết vé: {selectedOrder?.buyer}</Title>}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button
            type="link"
            icon={
              ticketCodesVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />
            }
            onClick={() => setTicketCodesVisible(!ticketCodesVisible)}
          >
            {ticketCodesVisible ? "Ẩn mã bí mật" : "Hiện mã vé"}
          </Button>
        </div>
        <Table
          dataSource={selectedOrder?.issuedTickets || []}
          pagination={false}
          rowKey="ticketCode"
          columns={[
            {
              title: "Mã vé",
              dataIndex: "ticketCode",
              render: (text) => (
                <span className="ticket-code-box">
                  {ticketCodesVisible ? text : "••••••••"}
                </span>
              ),
            },
            { title: "Tên vé", dataIndex: "ticketName" },
            {
              title: "Trạng thái",
              dataIndex: "isCheckedIn",
              render: (val) =>
                val ? (
                  <Tag color="green">Đã Check-in</Tag>
                ) : (
                  <Tag color="default">Chưa dùng</Tag>
                ),
            },
          ]}
        />
      </Modal>

      {/* MODAL THÀNH CÔNG */}
      <Modal
        open={mailSuccessModal}
        footer={null}
        onCancel={() => setMailSuccessModal(false)}
        centered
        width={400}
      >
        <div className="success-modal-content">
          <CheckCircleOutlined
            style={{ fontSize: 64, color: "#52c41a", marginBottom: 20 }}
          />
          <Title level={3}>Gửi thành công!</Title>
          <Text type="secondary">
            Vé điện tử đã được gửi đến email của khách hàng.
          </Text>
          <Button
            type="primary"
            block
            style={{ marginTop: 30, height: 45, borderRadius: 8 }}
            onClick={() => setMailSuccessModal(false)}
          >
            Đóng cửa sổ
          </Button>
        </div>
      </Modal>
      <Modal
        open={faceModalVisible}
        title="Trạm Điểm Danh Khuôn Mặt Tự Động"
        onCancel={() => setFaceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFaceModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="scan"
            type="primary"
            loading={isScanning}
            onClick={handleGlobalFaceCheckin}
          >
            Quét ngay
          </Button>,
        ]}
        centered
        width={500}
      >
        <div
          className="video-box"
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            background: "#000",
          }}
        >
          <video
            ref={videoRef}
            width="100%"
            autoPlay
            muted
            playsInline
            style={{ transform: "scaleX(-1)" }}
          />
          <div
            className="scan-line"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "2px",
              background: "#52c41a",
              boxShadow: "0 0 15px #52c41a",
              animation: "scan 2s linear infinite",
            }}
          ></div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", minHeight: "40px" }}>
          <Text
            strong
            type={faceMessageType === "success" ? "success" : "danger"}
          >
            {faceMessage}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default EventOrdersPage;
