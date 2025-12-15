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
} from "antd";
import { useParams } from "react-router-dom";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import * as faceapi from "face-api.js";

const EventDashboardPage = () => {
  const { eventId } = useParams();

  const [tickets, setTickets] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faceMessage, setFaceMessage] = useState(null);
  const [faceMessageType, setFaceMessageType] = useState("success"); // success | error

  // ===== Face ID =====
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const videoRef = useRef();
  const approveRefund = async (ticket) => {
    try {
      const res = await axiosJWT.post(
        "http://localhost:3000/api/orders/refunds/approve",
        {
          ticketCode: ticket.ticketCode,
        }
      );

      if (res.data.success) {
        message.success("Đã duyệt hoàn vé");
        fetchTickets();
      } else {
        message.error(res.data.message || "Duyệt hoàn vé thất bại");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi duyệt hoàn vé");
    }
  };

  const rejectRefund = async (ticket) => {
    try {
      const res = await axiosJWT.post(
        "http://localhost:3000/api/orders/refunds/reject",
        {
          ticketCode: ticket.ticketCode,
        }
      );

      if (res.data.success) {
        message.success("Đã từ chối hoàn vé");
        fetchTickets();
      } else {
        message.error(res.data.message || "Từ chối hoàn vé thất bại");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi từ chối hoàn vé");
    }
  };

  const openFaceModal = (ticket) => {
    setCurrentTicket(ticket);
    setFaceModalVisible(true);
  };

  const closeFaceModal = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setFaceModalVisible(false);
  };

  const handleFaceConfirm = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const detections = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detections) {
      message.error("Không phát hiện gương mặt!");
      return;
    }

    const faceDescriptor = Array.from(detections.descriptor);

    try {
      const res = await axiosJWT.post(
        "http://localhost:3000/api/orders/checkin-face",
        {
          ticketCode: currentTicket.ticketCode,
          faceDescriptor,
        }
      );
      console.log("API response:", res.data);

      if (res.data.success) message.success(res.data.message);
      else message.error(res.data.message);
      setFaceMessage(res.data.message);
      setFaceMessageType(res.data.success ? "success" : "error");
      fetchTickets(); // reload danh sách vé
    } catch (err) {
      console.error(err);
      message.error("Check-in thất bại!");
    }
  };

  // ===================

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
          refundStatus: item.refundStatus,
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
    message.config({
      top: 100, // cách top 100px
      duration: 3,
    });
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  // Load Face API models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  // Open/close camera
  useEffect(() => {
    const startVideo = async () => {
      if (faceModalVisible) {
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
          setFaceModalVisible(false);
        }
      } else {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
      }
    };
    startVideo();
  }, [faceModalVisible]);

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
      render: (_, record) => {
        if (record.isCheckedIn) {
          return (
            <>
              <Tag color="green">Đã Check-in</Tag>
              <div style={{ fontSize: 12, color: "#888" }}>
                {record.checkinTime
                  ? dayjs(record.checkinTime).format("DD/MM HH:mm")
                  : ""}
              </div>
            </>
          );
        }

        return (
          <Button type="primary" onClick={() => openFaceModal(record)}>
            Check-in Face ID
          </Button>
        );
      },
    },

    {
      title: "Thời gian check-in",
      dataIndex: "checkinTime",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Hoàn vé",
      render: (_, record) => {
        if (record.isCheckedIn) {
          return <Tag color="blue">Đã check-in</Tag>;
        }

        if (record.refundStatus === "REQUESTED") {
          return (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => approveRefund(record)}
              >
                Duyệt
              </Button>

              <Button
                danger
                size="small"
                style={{ marginLeft: 8 }}
                onClick={() => rejectRefund(record)}
              >
                Từ chối
              </Button>
            </>
          );
        }

        if (record.refundStatus === "REFUNDED") {
          return <Tag color="green">Đã hoàn</Tag>;
        }

        if (record.refundStatus === "REJECTED") {
          return <Tag color="red">Đã từ chối</Tag>;
        }

        return <Tag color="default">—</Tag>;
      },
    },

    // {
    //   title: "Face ID",
    //   render: (_, record) =>
    //     record.isCheckedIn ? (
    //       <Tag color="green">Đã Check-in</Tag>
    //     ) : (
    //       <Button onClick={() => openFaceModal(record)}>
    //         Check-in Face ID
    //       </Button>
    //     ),
    // },
  ];

  // Thêm các biến thống kê
  const totalTickets = tickets.length;
  const checkedInTickets = tickets.filter((t) => t.isCheckedIn).length;
  const refundedTickets = tickets.filter(
    (t) => t.refundStatus === "REFUNDED"
  ).length;
  const refundRate =
    totalTickets > 0 ? ((refundedTickets / totalTickets) * 100).toFixed(1) : 0;
  const actualRevenue = tickets
    .filter((t) => t.refundStatus !== "REFUNDED")
    .reduce((sum, t) => sum + t.price, 0);

  return (
    <div style={{ padding: 20 }}>
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

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8} lg={4.8}>
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

        <Col xs={24} sm={12} md={8} lg={4.8}>
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

        <Col xs={24} sm={12} md={8} lg={4.8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Doanh thu thực tế"
              value={actualRevenue}
              prefix="₫"
              valueStyle={{ fontSize: 28, color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4.8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Số vé đã hoàn"
              value={refundedTickets}
              valueStyle={{ fontSize: 28, color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4.8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="% vé hoàn"
              value={refundRate}
              suffix="%"
              valueStyle={{ fontSize: 28, color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

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
        visible={faceModalVisible}
        title="Check-in Face ID"
        onCancel={closeFaceModal}
        onOk={handleFaceConfirm}
      >
        <video ref={videoRef} width="100%" height="auto" />
        {faceMessage && (
          <p
            style={{
              marginTop: 10,
              color: faceMessageType === "success" ? "green" : "red",
            }}
          >
            {faceMessage}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default EventDashboardPage;
