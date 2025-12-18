import React, { useState, useEffect, useRef } from "react";
import { Menu, Table, Tag, message, Modal, Button } from "antd";
import {
  CalendarOutlined,
  AccountBookOutlined,
  HeartOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import UserEvent from "../../components/UserEvent/UserEvent";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import "./UserPage.css";
import * as faceapi from "face-api.js";
import { useSelector } from "react-redux";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import { Typography } from "antd";
import { useLocation } from "react-router-dom";
const { Text } = Typography;
const menuItems = [
  { key: "event", icon: <CalendarOutlined />, label: "Sự kiện của tôi" },
  { key: "ticket", icon: <AccountBookOutlined />, label: "Vé đã mua" },
  { key: "favorite", icon: <HeartOutlined />, label: "Yêu thích" },
];
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const UserPage = () => {
  const [selectedKey, setSelectedKey] = useState("event");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const currentUser = useSelector((state) => state.user);
  // ==== Face Modal ====
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [faceAction, setFaceAction] = useState("register"); // "register" | "checkin"
  const videoRef = useRef();
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLocation, setMapLocation] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [faceMessage, setFaceMessage] = useState(null);
  const [faceMessageType, setFaceMessageType] = useState("success");
  const location1 = useLocation();
  const queryParams = new URLSearchParams(location1.search);
  const tabFromQuery = queryParams.get("tab");
  useEffect(() => {
    if (tabFromQuery) {
      setSelectedKey(tabFromQuery);
    }
  }, [tabFromQuery]);
  const openMapModal = (location) => {
    setMapLocation(location);
    setMapModalVisible(true);
  };
  const closeMapModal = () => {
    setMapModalVisible(false);
    setMapLocation("");
  };
  const openFaceModal = (ticket, action) => {
    setCurrentTicket(ticket);
    setFaceAction(action);
    setFaceMessage(null);
    setFaceModalVisible(true);
  };

  const closeFaceModal = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setFaceModalVisible(false);
  };
  const handleRefundRequest = (ticket) => {
    modal.confirm({
      title: "Yêu cầu hoàn vé",
      content: `Gửi yêu cầu hoàn vé ${ticket.ticketCode}?`,
      okText: "Gửi yêu cầu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axiosJWT.post(
            "http://localhost:3000/api/orders/request-refund",
            { ticketCode: ticket.ticketCode }
          );
          message.success("📨 Đã gửi yêu cầu hoàn vé");
          fetchUserTickets();
        } catch {
          message.error("❌ Gửi yêu cầu thất bại");
        }
      },
    });
  };
  const getMapSrc = (location) => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      location
    )}&output=embed`;
  };
  const handleRefund = (ticket) => {
    modal.confirm({
      title: "Xác nhận hoàn vé",
      content: `Bạn chắc chắn muốn hoàn vé ${ticket.ticketCode}?`,
      okText: "Hoàn vé",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const key = "refund";
        message.loading({ content: "⏳ Đang hoàn vé...", key, duration: 0 });

        try {
          const res = await axiosJWT.post(
            "http://localhost:3000/api/orders/refund-ticket",
            { ticketCode: ticket.ticketCode }
          );
          console.log(ticket.ticketCode);
          if (res.data.success) {
            message.success({ content: "✅ Hoàn vé thành công", key });
            fetchUserTickets();
          } else {
            message.error({ content: "❌ " + res.data.message, key });
          }
        } catch (err) {
          message.error({ content: "❌ Hoàn vé thất bại", key });
        }
      },
    });
  };

  const handleFaceConfirm = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      setFaceMessage("Không tìm thấy thiết bị camera!");
      setFaceMessageType("error");
      return;
    }

    // Bắt đầu quá trình
    setFaceMessage("Đang quét khuôn mặt...");
    setFaceMessageType("success");

    try {
      // 1. Kiểm tra nhận diện gương mặt từ Stream Video
      const detections = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      // LỖI: Không tìm thấy khuôn mặt
      if (!detections) {
        setFaceMessage(
          "❌ Không tìm thấy khuôn mặt! Hãy nhìn thẳng và đủ sáng."
        );
        setFaceMessageType("error");
        return;
      }

      // 2. Nếu tìm thấy mặt, lấy descriptor
      const faceDescriptor = Array.from(detections.descriptor);
      setFaceMessage("Đang gửi dữ liệu xác thực...");

      // 3. Gọi API
      let res;
      if (faceAction === "register") {
        res = await axiosJWT.post(
          "http://localhost:3000/api/checkin-order/register-face",
          {
            ticketCode: currentTicket.ticketCode,
            faceDescriptor,
          }
        );
      } else {
        res = await axiosJWT.post(
          "http://localhost:3000/api/checkin-order/checkin-face",
          {
            ticketCode: currentTicket.ticketCode,
            faceDescriptor,
          }
        );
      }

      // 4. Xử lý kết quả từ Server
      if (res.data && (res.data.success || res.status === 200)) {
        setFaceMessage(
          faceAction === "register"
            ? "✅ Thiết lập Face ID hoàn tất!"
            : "✅ Xác thực thành công!"
        );
        setFaceMessageType("success");

        // Load lại danh sách vé để cập nhật trạng thái (ví dụ nút Thiết lập biến mất)
        fetchUserTickets();

        // Đợi 2 giây để user thấy thông báo thành công rồi mới đóng
        setTimeout(() => {
          closeFaceModal();
        }, 2000);
      } else {
        // LỖI: Server trả về thất bại (Ví dụ: Vé đã dùng, hoặc Face ID không khớp)
        setFaceMessage(`❌ ${res.data.message || "Thao tác thất bại"}`);
        setFaceMessageType("error");
      }
    } catch (err) {
      // LỖI: Kết nối server hoặc lỗi crash code
      console.error("Face ID Error:", err);
      setFaceMessage("❌ Lỗi hệ thống! Vui lòng thử lại sau.");
      setFaceMessageType("error");
    }
  };
  const fetchFavoriteEvents = async () => {
    if (!currentUser?.favorites || currentUser.favorites.length === 0) {
      setFavoriteEvents([]);
      return;
    }

    try {
      setLoadingFavorites(true);
      const res = await axiosJWT.post(
        "http://localhost:3000/api/event/get-multiple",
        { eventIds: currentUser.favorites }
      );
      setFavoriteEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải sự kiện yêu thích!");
    } finally {
      setLoadingFavorites(false);
    }
  };
  const activeTickets = tickets.filter(
    (t) =>
      t.refundStatus !== "REFUNDED" &&
      (!t.eventDateRaw || dayjs(t.eventDateRaw).isSameOrAfter(dayjs(), "day"))
  );
  const expiredTickets = tickets.filter(
    (t) =>
      t.refundStatus !== "REFUNDED" &&
      t.eventDateRaw &&
      dayjs(t.eventDateRaw).isBefore(dayjs(), "day")
  );

  const refundedTickets = tickets.filter((t) => t.refundStatus === "REFUNDED");
  // ==============================
  // FETCH VÉ CỦA USER
  // ==============================
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await axiosJWT.get(
        "http://localhost:3001/api/issued-tickets2/get-all-by-user",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res?.data?.data || [];
      const mapped = data.map((item) => {
        const o = item.orderDetailId;
        const t = item.orderDetailId?.ticketId;
        const ev = t?.eventId;
        const loc = ev?.locations?.[0];

        return {
          ticketCode: item.ticketCode,
          isCheckedIn: item.isCheckedIn,
          refundStatus: item.refundStatus,
          status: item.status,
          checkinTime: item.checkinTime,
          seat: item.seatId?.seatNumber || "Không có",
          buyer: o?.orderId?.fullName || "",
          email: o?.orderId?.email || "",
          phone: o?.orderId?.phoneNumber || "",
          ticketName: t?.type,
          price: t?.price || 0,
          eventTitle: ev?.title || "—",
          eventDateRaw: ev?.eventDate || null, // giữ raw date
          eventDate: ev?.eventDate
            ? dayjs(ev.eventDate).format("DD/MM/YYYY")
            : "—",
          eventTime: ev?.eventStartTime
            ? `${dayjs(ev.eventStartTime).format("HH:mm")} - ${dayjs(
                ev.eventEndTime
              ).format("HH:mm")}`
            : "—",
          eventLocation: loc
            ? `${loc.address}, ${loc.ward || ""}, ${loc.district}, ${loc.city}`
            : "—",
          soldDate: item.soldDate
            ? dayjs(item.soldDate).format("DD/MM/YYYY HH:mm")
            : "—",
        };
      });

      setTickets(mapped);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải vé của bạn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);
  useEffect(() => {
    if (selectedKey === "favorite") {
      fetchFavoriteEvents();
    }
  }, [selectedKey, currentUser?.favorites]);
  useEffect(() => {
    if (selectedKey === "ticket") fetchUserTickets();
  }, [selectedKey]);
  // Bên trong UserPage component
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
        // stop video khi đóng modal
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
      }
    };

    startVideo();
  }, [faceModalVisible]);
  const favoriteColumns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>Tên sự kiện</span>
      ),
      dataIndex: "title",
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#333" }}>{text}</span>
      ),
    },
    {
      title: <span style={{ fontWeight: 600, color: "#1890ff" }}>Ngày</span>,
      dataIndex: "eventDate",
      render: (d) => (
        <span style={{ color: "#555" }}>
          {d ? dayjs(d).format("DD/MM/YYYY") : "—"}
        </span>
      ),
    },
    {
      title: <span style={{ fontWeight: 600, color: "#1890ff" }}>Giờ</span>,
      dataIndex: "eventStartTime",
      render: (_, record) =>
        record.eventStartTime && record.eventEndTime ? (
          <span style={{ color: "#555" }}>
            {`${dayjs(record.eventStartTime).format("HH:mm")} - ${dayjs(
              record.eventEndTime
            ).format("HH:mm")}`}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>Địa điểm</span>
      ),
      dataIndex: "location",
      render: (text) => (
        <span style={{ color: "#1890ff", cursor: "pointer" }}>{text}</span>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>Hành động</span>
      ),
      render: (_, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => (window.location.href = `/event/${record._id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const ticketColumns = [
    {
      title: "Sự kiện",
      dataIndex: "eventTitle",
      render: (text) => <strong style={{ color: "#1a3353" }}>{text}</strong>,
    },
    { title: "Loại vé", dataIndex: "ticketName" },
    { title: "Ngày", dataIndex: "eventDate" },
    {
      title: "Địa điểm",
      dataIndex: "eventLocation",
      width: 250,
      render: (text) => (
        <span
          className="map-link"
          style={{ color: "#1890ff", cursor: "pointer", fontSize: "13px" }}
          onClick={() => openMapModal(text)}
        >
          📍 {text}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_, record) => {
        if (record.refundStatus === "REFUNDED")
          return <Tag color="error">Đã hoàn tiền</Tag>;
        if (record.isCheckedIn) return <Tag color="success">Đã sử dụng</Tag>;
        return <Tag color="processing">Sẵn sàng</Tag>;
      },
    },
    {
      title: "Face ID",
      render: (_, record) =>
        !record.isCheckedIn && (
          <Button
            type="primary"
            ghost
            size="small"
            onClick={() => openFaceModal(record, "register")}
          >
            {record.faceRegistered ? "Cập nhật FaceID" : "Thiết lập FaceID"}
          </Button>
        ),
    },
    {
      title: "Thao tác",
      render: (_, record) => {
        if (!record.isCheckedIn && record.refundStatus === "NONE") {
          return (
            <Button
              type="link"
              danger
              onClick={() => handleRefundRequest(record)}
            >
              Hoàn vé
            </Button>
          );
        }
        return <small style={{ color: "#ccc" }}>N/A</small>;
      },
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "event":
        return (
          <>
            <h2 className="content-title">Sự kiện của tôi</h2>
            <UserEvent />
          </>
        );
      case "ticket":
        return (
          <>
            <h2 className="content-title">Vé đã mua</h2>
            <Tabs defaultActiveKey="active">
              <Tabs.TabPane tab="Còn hiệu lực" key="active">
                <Table
                  dataSource={activeTickets}
                  columns={ticketColumns}
                  loading={loading}
                  rowKey="ticketCode"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đã hết hạn" key="expired">
                <Table
                  dataSource={expiredTickets}
                  columns={ticketColumns}
                  loading={loading}
                  rowKey="ticketCode"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đã hoàn" key="refunded">
                <Table
                  dataSource={refundedTickets}
                  columns={ticketColumns}
                  loading={loading}
                  rowKey="ticketCode"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
            </Tabs>
          </>
        );

      case "favorite":
        return (
          <>
            <h2 className="content-title">Sự kiện yêu thích</h2>
            {favoriteEvents.length === 0 ? (
              <div className="placeholder-card">
                <p>Những sự kiện bạn đã lưu sẽ xuất hiện ở đây</p>
              </div>
            ) : (
              <Table
                dataSource={favoriteEvents}
                columns={favoriteColumns}
                rowKey="_id"
                loading={loadingFavorites}
                pagination={{ pageSize: 10 }}
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-page-container">
      {contextHolder}
      <HeaderComponent isHiddenSearch isHiddenCart />

      <div className="user-page-wrapper">
        {/* Sidebar */}
        <div className={`user-sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-toggle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
            items={menuItems}
          />
        </div>

        {/* Content Area */}
        <div className="user-main-content">{renderContent()}</div>
      </div>

      {/* Modal Face ID - Nâng cấp giao diện Modal */}
      <Modal
        open={faceModalVisible}
        title={
          faceAction === "register"
            ? "📸 Thiết lập Face ID"
            : "🔍 Xác thực khuôn mặt"
        }
        onCancel={closeFaceModal}
        onOk={handleFaceConfirm}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
        destroyOnClose
        width={450}
      >
        <style>{`
    .video-box { 
      border-radius: 12px; 
      overflow: hidden; 
      background: #000; 
      position: relative; 
      border: 4px solid #fff;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .scan-overlay { 
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
      width: 200px; height: 200px; border: 2px solid #1890ff; border-radius: 50%; 
      box-shadow: 0 0 0 1000px rgba(0,0,0,0.6); 
    }
    .scan-line {
      position: absolute; top: 0; left: 0; width: 100%; height: 2px;
      background: #1890ff; box-shadow: 0 0 15px #1890ff;
      animation: scan 2s linear infinite;
    }
    @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
  `}</style>

        <div className="video-box">
          <video
            ref={videoRef}
            width="100%"
            autoPlay
            muted
            playsInline
            style={{ transform: "scaleX(-1)" }} // Lật gương cho khách dễ căn chỉnh
          />
          <div className="scan-overlay">
            <div className="scan-line"></div>
          </div>
        </div>

        {faceMessage && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Text
              strong
              type={faceMessageType === "success" ? "success" : "danger"}
            >
              {faceMessageType === "success" ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )}{" "}
              {faceMessage}
            </Text>
          </div>
        )}
      </Modal>

      {/* Modal Map */}
      <Modal
        open={mapModalVisible}
        title="📍 Vị trí sự kiện"
        onCancel={closeMapModal}
        footer={null}
        width={800}
        centered
      >
        {mapLocation && (
          <iframe
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: "8px" }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              mapLocation
            )}&output=embed`}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserPage;
