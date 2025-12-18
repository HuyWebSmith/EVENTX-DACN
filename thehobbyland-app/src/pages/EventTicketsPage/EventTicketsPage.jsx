import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Tag,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Typography,
  Space,
} from "antd";
import { useParams } from "react-router-dom";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import * as faceapi from "face-api.js";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ScanOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const EventDashboardPage = () => {
  const { eventId } = useParams();

  const [tickets, setTickets] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faceMessage, setFaceMessage] = useState(null);
  const [faceMessageType, setFaceMessageType] = useState("warning");
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef();
  const scanningInterval = useRef(null);

  // 1. Tải danh sách vé và thông tin sự kiện
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axiosJWT.get(
        `http://localhost:3001/api/issued-tickets2/get-all-by-event/${eventId}`
      );
      const data = res?.data?.data || [];

      if (data.length > 0) {
        const ev = data[0]?.orderDetailId?.ticketId?.eventId;
        const loc = ev?.locations?.[0];
        setEventInfo({
          title: ev?.title || "Không xác định",
          date: ev?.eventDate ? dayjs(ev.eventDate).format("DD/MM/YYYY") : "—",
          location: loc ? `${loc.address}, ${loc.district}, ${loc.city}` : "—",
        });
      }

      const mapped = data.map((item) => ({
        ticketCode: item.ticketCode,
        isCheckedIn: item.isCheckedIn,
        checkinTime: item.checkinTime,
        refundStatus: item.refundStatus,
        buyer: item.orderDetailId?.orderId?.fullName || "Khách ẩn danh",
        email: item.orderDetailId?.orderId?.email || "—",
        phone: item.orderDetailId?.orderId?.phoneNumber || "—",
        ticketName: item.orderDetailId?.ticketId?.type || "—",
        price: item.orderDetailId?.ticketId?.price || 0,
      }));
      setTickets(mapped);
    } catch (err) {
      message.error("Không thể tải danh sách vé!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic nhận diện khuôn mặt (QUÉT TỔNG)
  const handleFaceConfirm = async () => {
    const videoEl = videoRef.current;

    // Chặn nếu: đang xử lý, video chưa sẵn sàng, hoặc modal đang đóng
    if (
      isProcessing ||
      !videoEl ||
      videoEl.readyState !== 4 ||
      !faceModalVisible
    )
      return;

    setIsProcessing(true);
    try {
      const detections = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detections) {
        setFaceMessage("🔍 Đang chờ khách hàng đứng trước camera...");
        setFaceMessageType("warning");
        setIsProcessing(false);
        return;
      }

      setFaceMessage("⚙️ Đang đối soát dữ liệu...");
      const faceDescriptor = Array.from(detections.descriptor);

      const res = await axiosJWT.post(
        "http://localhost:3001/api/checkin-order/event-face-checkin",
        { eventId, faceDescriptor }
      );

      if (res.data.success) {
        setFaceMessage(`✅ XIN CHÀO: ${res.data.buyerName.toUpperCase()}`);
        setFaceMessageType("success");
        fetchTickets(); // Cập nhật bảng ngay lập tức

        // Đợi 3 giây để người cũ đi qua trước khi cho phép quét người mới
        setTimeout(() => {
          setIsProcessing(false);
          setFaceMessage("🔍 Sẵn sàng cho khách tiếp theo...");
          setFaceMessageType("warning");
        }, 3000);
      } else if (res.data.isAlreadyCheckedIn) {
        // Trường hợp 2: Nhận diện đúng người nhưng họ đã vào rồi
        setFaceMessage(`⚠️ ĐÃ VÀO CỬA: ${res.data.buyerName.toUpperCase()}`);
        setFaceMessageType("warning"); // Hiện màu vàng cảnh báo
        message.warning("Vé này đã được sử dụng!");
      } else {
        setFaceMessage(`❌ ${res.data.message || "Không khớp dữ liệu"}`);
        setFaceMessageType("error");
        // Đợi 1.5 giây để thử lại
        setTimeout(() => setIsProcessing(false), 1500);
      }
    } catch (err) {
      console.error("Lỗi AI:", err);
      setIsProcessing(false);
    }
  };

  // 3. Load AI Models khi trang được mở
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
      } catch (e) {
        message.error("Lỗi tải model AI!");
      }
    };
    loadModels();
    fetchTickets();
  }, [eventId]);

  // 4. Quản lý Camera và Vòng lặp quét
  useEffect(() => {
    let timer = null;

    if (faceModalVisible) {
      console.log("--- Modal mở: Bắt đầu khởi động Camera ---");

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log("--- Camera đã sẵn sàng ---");

            // Đợi video thực sự phát rồi mới quét
            videoRef.current.onloadedmetadata = () => {
              console.log(
                "--- Metadata video đã tải: Bắt đầu vòng lặp quét ---"
              );
              timer = setInterval(() => {
                // Log này PHẢI hiện trong Console nếu máy đang quét
                console.log("AI đang phân tích khung hình...");
                handleFaceConfirm();
              }, 1000);
            };
          }
        })
        .catch((err) => console.error("Lỗi mở camera:", err));
    } else {
      console.log("--- Modal đóng: Dừng quét ---");
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [faceModalVisible]);

  // --- Thống kê ---
  const totalTickets = tickets.length;
  const checkedInTickets = tickets.filter((t) => t.isCheckedIn).length;
  const actualRevenue = tickets
    .filter((t) => t.refundStatus !== "REFUNDED")
    .reduce((sum, t) => sum + (Number(t.price) || 0), 0);

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { padding: 24px; background: #f0f2f5; min-height: 100vh; }
        .header-card { border-radius: 12px; margin-bottom: 24px; }
        .stat-card { border-radius: 12px; text-align: center; }
        .video-box { border-radius: 12px; overflow: hidden; background: #000; position: relative; border: 4px solid #fff; }
        .scan-overlay { 
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
          width: 200px; height: 200px; border: 2px solid #52c41a; border-radius: 50%; 
          box-shadow: 0 0 0 1000px rgba(0,0,0,0.6); 
        }
      `}</style>

      {eventInfo && (
        <Card className="header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3}>{eventInfo.title}</Title>
              <Space>
                <Text type="secondary">
                  <CalendarOutlined /> {eventInfo.date}
                </Text>
                <Text type="secondary">
                  <EnvironmentOutlined /> {eventInfo.location}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button onClick={fetchTickets} icon={<BarChartOutlined />}>
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card className="stat-card">
            <Statistic
              title="Tổng vé"
              value={totalTickets}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card">
            <Statistic
              title="Đã Check-in"
              value={checkedInTickets}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card">
            <Statistic
              title="Doanh thu thực"
              value={actualRevenue}
              prefix="₫"
            />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={tickets}
        rowKey="ticketCode"
        loading={loading}
        columns={[
          {
            title: "Mã vé",
            dataIndex: "ticketCode",
            render: (v) => <b>{v}</b>,
          },
          { title: "Người mua", dataIndex: "buyer" },
          { title: "Loại vé", dataIndex: "ticketName" },
          {
            title: "Trạng thái",
            render: (_, r) =>
              r.isCheckedIn ? (
                <Tag color="success">
                  Đã vào ({dayjs(r.checkinTime).format("HH:mm")})
                </Tag>
              ) : (
                <Tag color="default">Chưa check-in</Tag>
              ),
          },
        ]}
      />

      <Modal
        open={faceModalVisible}
        title="Hệ thống nhận diện AI tự động"
        onCancel={() => setFaceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFaceModalVisible(false)}>
            Đóng máy quét
          </Button>,
        ]}
        centered
        width={600}
      >
        <div className="video-box">
          <video
            ref={videoRef}
            width="100%"
            autoPlay
            muted
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="scan-overlay" />
        </div>
        <div style={{ marginTop: 20, textAlign: "center", minHeight: "40px" }}>
          <Text
            strong
            style={{ fontSize: "16px" }}
            type={
              faceMessageType === "success"
                ? "success"
                : faceMessageType === "error"
                ? "danger"
                : "secondary"
            }
          >
            {faceMessage || "Đang khởi động camera..."}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default EventDashboardPage;
