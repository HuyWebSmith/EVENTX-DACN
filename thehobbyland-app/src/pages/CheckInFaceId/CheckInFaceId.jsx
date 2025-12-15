import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Tag,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Button,
} from "antd";
import { useParams } from "react-router-dom";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import * as faceapi from "face-api.js";

const CheckInFaceId = () => {
  const { eventId } = useParams();

  const [tickets, setTickets] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const videoRef = useRef < HTMLVideoElement > null;

  // ==============================
  // LOAD FACE API
  // ==============================
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  // ==============================
  // FETCH TICKETS
  // ==============================
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
          location: loc
            ? `${loc.address}, ${loc.ward || ""}, ${loc.district}, ${loc.city}`
            : "—",
        });
      }

      const mapped = data.map((item) => {
        const o = item.orderDetailId;
        const t = item.orderDetailId?.ticketId;

        return {
          ticketCode: item.ticketCode,
          isCheckedIn: item.isCheckedIn,
          checkinTime: item.checkinTime,
          seat: item.seatId?.seatNumber || "Không có",

          buyer: o?.orderId?.fullName || "",
          email: o?.orderId?.email || "",
          phone: o?.orderId?.phoneNumber || "",

          ticketName: t?.type,
          price: t?.price || 0,
        };
      });

      setTickets(mapped);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách vé!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  // ==============================
  // MỞ CAMERA KHI MODAL
  // ==============================
  useEffect(() => {
    const startVideo = async () => {
      if (modalVisible && currentTicket) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch (err) {
          console.error("Không thể mở camera:", err);
          message.error("Không thể truy cập camera!");
          setModalVisible(false);
        }
      } else {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
      }
    };
    startVideo();
  }, [modalVisible, currentTicket]);

  // ==============================
  // HANDLE CHECK-IN FACE
  // ==============================
  const handleFaceCheckin = async () => {
    const videoEl = videoRef.current;
    if (!videoEl || videoEl.readyState < 2) {
      message.warning("⚠️ Camera chưa sẵn sàng, vui lòng thử lại!");
      return;
    }

    // Tạo canvas
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx?.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    // Thông báo loading
    const key = "faceCheckin";
    message.loading({ content: "⏳ Đang check-in...", key, duration: 0 });

    try {
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        message.warning({ content: "⚠️ Không phát hiện gương mặt!", key });
        return;
      }

      const faceDescriptor = Array.from(detection.descriptor);

      const res = await axiosJWT.post(
        "http://localhost:3000/api/orders/checkin-face",
        {
          ticketCode: currentTicket?.ticketCode,
          faceDescriptor,
        }
      );

      if (res.data.success) {
        message.success({ content: "✅ Check-in thành công!", key });
      } else {
        message.error({ content: "❌ " + res.data.message, key });
      }

      fetchTickets();
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error({ content: "❌ Check-in thất bại!", key });
    }
  };

  // ==============================
  // TABLE COLUMNS
  // ==============================
  const columns = [
    { title: "Mã vé", dataIndex: "ticketCode" },
    { title: "Tên vé", dataIndex: "ticketName" },
    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => `${v.toLocaleString()} VND`,
    },
    { title: "Người mua", dataIndex: "buyer" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Check-in",
      dataIndex: "isCheckedIn",
      render: (v) =>
        v ? (
          <Tag color="green">Đã Check-in</Tag>
        ) : (
          <Tag color="orange">Chưa Check-in</Tag>
        ),
    },
    {
      title: "Thời gian check-in",
      dataIndex: "checkinTime",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Face ID",
      key: "face",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setCurrentTicket(record);
            setModalVisible(true);
          }}
        >
          Check-in Face
        </Button>
      ),
    },
  ];

  const totalTickets = tickets.length;
  const checkedInTickets = tickets.filter((t) => t.isCheckedIn).length;
  const revenue = tickets.reduce((sum, t) => sum + t.price, 0);

  return (
    <div style={{ padding: 20 }}>
      {/* Event Info */}
      {eventInfo && (
        <Card
          style={{
            marginBottom: 20,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>{eventInfo.title}</h2>
          <p style={{ margin: 0 }}>📅 {eventInfo.date}</p>
          <p style={{ margin: 0 }}>📍 {eventInfo.location}</p>
        </Card>
      )}

      {/* Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Tổng số vé"
              value={totalTickets}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Số vé đã check-in"
              value={checkedInTickets}
              valueStyle={{ fontSize: 28, color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Doanh thu dự kiến"
              value={revenue}
              prefix="₫"
              valueStyle={{ fontSize: 28, color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tickets Table */}
      <Table
        dataSource={tickets}
        columns={columns}
        loading={loading}
        rowKey="ticketCode"
        pagination={{ pageSize: 20 }}
        style={{ borderRadius: 12, overflow: "hidden" }}
      />

      {/* Modal Face ID */}
      <Modal
        title={`Check-in Face - ${currentTicket?.ticketCode || ""}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="checkin" type="primary" onClick={handleFaceCheckin}>
            Xác nhận Check-in
          </Button>,
        ]}
      >
        <video ref={videoRef} width="100%" height="auto" autoPlay muted />
      </Modal>
    </div>
  );
};

export default CheckInFaceId;
